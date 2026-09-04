import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Trash2, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import Header from './components/Header';
import DiscoveryPanel from './components/DiscoveryPanel';
import TransferDashboard from './components/TransferDashboard';
import ChatWindow from './components/ChatWindow';
import Footer from './components/Footer';
import { AVATARS, RANDOM_NAMES, CHUNK_SIZE } from './utils/constants';
import { storeFileLocally, purgeLocalArtifacts } from './utils/storage';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function App() {
  const [profile] = useState({
    username: RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)],
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)]
  });

  const [selfCode, setSelfCode] = useState('------');
  const [nearbyPeers, setNearbyPeers] = useState([]);
  const [connectedPeer, setConnectedPeer] = useState(null);
  const [lastPeerName, setLastPeerName] = useState('Cosmic Node');
  const [incomingRequest, setIncomingRequest] = useState(null);

  // File & Chat States
  const [messages, setMessages] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [transferProgress, setTransferProgress] = useState(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Ephemeral countdown
  const [sessionTerminated, setSessionTerminated] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const targetIdRef = useRef(null);
  const useRelayFallback = useRef(false);
  const activeIncomingFile = useRef({ info: null, chunks: [], receivedBytes: 0 });
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('assigned-identity', ({ code }) => {
      setSelfCode(code);
      socket.emit('register-profile', profile);
    });

    socket.on('nearby-peers-updated', (peers) => {
      setNearbyPeers(peers);
    });

    socket.on('connection-request', (data) => {
      setIncomingRequest(data);
    });

    socket.on('connection-rejected', () => {
      alert('Transmission link declined by remote voyager.');
    });

    socket.on('connect-error', (data) => {
      alert(data.message || 'Signal link failed.');
    });

    // Session Established - Instantly switch view & negotiate channel
    socket.on('session-established', async ({ targetId, peerProfile, initiator }) => {
      targetIdRef.current = targetId;
      setLastPeerName(peerProfile?.username || 'Cosmic Node');
      setConnectedPeer({
        id: targetId,
        profile: peerProfile || { username: 'Cosmic Node' }
      });
      setIncomingRequest(null);
      setSessionTerminated(false);

      initiatePeerHandshake(targetId, initiator);
    });

    // WebRTC Signaling
    socket.on('signal-received', async ({ fromId, signalData }) => {
      const pc = pcRef.current;
      if (!pc) return;

      try {
        if (signalData.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit('signal', { targetId: fromId, signalData: answer });
        } else if (signalData.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
        } else if (signalData.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
          } catch (e) {
            // Safe ignore candidate race
          }
        }
      } catch (err) {
        console.warn('WebRTC signal fallback engaged:', err);
      }
    });

    // Relay Ingestion (When WebRTC is traversing strict NAT)
    socket.on('relay-data', ({ payload }) => {
      handleIncomingData(payload);
    });

    socket.on('relay-binary', (chunk) => {
      handleIncomingChunk(chunk);
    });

    socket.on('peer-disconnected', () => {
      handleTeardownSession();
    });

    return () => socket.disconnect();
  }, [profile]);

  // 1-hour expiry timer
  useEffect(() => {
    if (sessionTerminated && (receivedFiles.length > 0 || messages.length > 0)) {
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleManualPurge();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [sessionTerminated, receivedFiles, messages]);

  const initiatePeerHandshake = async (targetId, isInitiator) => {
    if (pcRef.current) pcRef.current.close();

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    useRelayFallback.current = false;

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('signal', { targetId, signalData: { candidate: e.candidate } });
      }
    };

    if (isInitiator) {
      const dc = pc.createDataChannel('astro-stream');
      dcRef.current = dc;
      bindDataChannel(dc);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('signal', { targetId, signalData: offer });
      } catch (e) {
        console.warn('Offer creation failed, falling to relay');
      }
    } else {
      pc.ondatachannel = (e) => {
        dcRef.current = e.channel;
        bindDataChannel(e.channel);
      };
    }

    // Auto fallback trigger: if DataChannel takes >2s, use socket memory relay
    setTimeout(() => {
      if (!dcRef.current || dcRef.current.readyState !== 'open') {
        useRelayFallback.current = true;
      }
    }, 2000);
  };

  const bindDataChannel = (dc) => {
    dc.binaryType = 'arraybuffer';
    dc.onopen = () => {
      useRelayFallback.current = false;
    };
    dc.onmessage = (e) => {
      if (typeof e.data === 'string') {
        handleIncomingData(JSON.parse(e.data));
      } else {
        handleIncomingChunk(e.data);
      }
    };
  };

  const handleIncomingData = (payload) => {
    if (payload.type === 'chat') {
      setMessages((prev) => [...prev, { text: payload.message, isSelf: false }]);
      setIsPeerTyping(false);
    } else if (payload.type === 'typing') {
      setIsPeerTyping(payload.isTyping);
    } else if (payload.type === 'file-header') {
      activeIncomingFile.current = { info: payload, chunks: [], receivedBytes: 0 };
      setTransferProgress(0);
    }
  };

  const handleIncomingChunk = (chunk) => {
    const { info, chunks } = activeIncomingFile.current;
    if (!info) return;

    chunks.push(chunk);
    activeIncomingFile.current.receivedBytes += chunk.byteLength;
    setTransferProgress(Math.round((activeIncomingFile.current.receivedBytes / info.size) * 100));

    if (activeIncomingFile.current.receivedBytes >= info.size) {
      const completeBlob = new Blob(chunks, { type: info.mime });
      const downloadUrl = URL.createObjectURL(completeBlob);
      const fileRecord = { name: info.name, size: info.size, url: downloadUrl };

      setReceivedFiles((prev) => [...prev, fileRecord]);
      storeFileLocally(Date.now(), completeBlob, info.name, info.mime);
      setTransferProgress(null);
    }
  };

  // Send payload via WebRTC if open, otherwise seamless fallback
  const sendPayload = (data) => {
    const dc = dcRef.current;
    if (dc && dc.readyState === 'open' && !useRelayFallback.current) {
      dc.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else if (socketRef.current && targetIdRef.current) {
      socketRef.current.emit('relay-data', {
        targetId: targetIdRef.current,
        payload: data
      });
    }
  };

  const sendFilePayload = async (file) => {
    sendPayload({
      type: 'file-header',
      name: file.name,
      size: file.size,
      mime: file.type
    });

    const reader = new FileReader();
    let offset = 0;

    const readNext = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = (e) => {
      const chunk = e.target.result;
      const dc = dcRef.current;

      if (dc && dc.readyState === 'open' && !useRelayFallback.current) {
        if (dc.bufferedAmount > 8 * 1024 * 1024) {
          setTimeout(() => reader.onload(e), 50);
          return;
        }
        dc.send(chunk);
      } else if (socketRef.current && targetIdRef.current) {
        socketRef.current.emit('relay-binary', {
          targetId: targetIdRef.current,
          chunk
        });
      }

      offset += chunk.byteLength;
      setTransferProgress(Math.round((offset / file.size) * 100));

      if (offset < file.size) {
        readNext();
      } else {
        setTransferProgress(null);
        setSentFiles((prev) => [...prev, { name: file.name, size: file.size, time: Date.now() }]);
      }
    };

    readNext();
  };

  const sendMessagePayload = (msg) => {
    sendPayload({ type: 'chat', message: msg });
    setMessages((prev) => [...prev, { text: msg, isSelf: true }]);
  };

  const sendTypingStatus = (isTyping) => {
    sendPayload({ type: 'typing', isTyping });
  };

  const handleTeardownSession = () => {
    if (dcRef.current) dcRef.current.close();
    if (pcRef.current) pcRef.current.close();
    dcRef.current = null;
    pcRef.current = null;
    targetIdRef.current = null;
    setConnectedPeer(null);
    setIsPeerTyping(false);
    setSessionTerminated(true);
    setRemainingSeconds(3600);

    setTimeout(() => {
      handleManualPurge();
    }, 3600000);
  };

  const handleManualPurge = () => {
    purgeLocalArtifacts();
    setMessages([]);
    setReceivedFiles([]);
    setSentFiles([]);
    setSessionTerminated(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="min-h-screen flex flex-col deep-cosmos relative selection:bg-sky-500/30 selection:text-sky-200">
      <Header userProfile={profile} userCode={selfCode} />

      {/* Disconnection Banner with Countdown & Delete Option */}
      {sessionTerminated && (receivedFiles.length > 0 || messages.length > 0) && (
        <div className="w-full bg-slate-900/95 border-b border-amber-500/30 backdrop-blur-lg px-4 py-3 sticky top-16 z-40 shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-xs">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200">Connection Severed.</span>
                <span className="text-slate-400 ml-1.5 hidden md:inline">
                  Files staged in memory. Auto-purge in:
                </span>
                <span className="ml-2 font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatCountdown(remainingSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSessionTerminated(false);
                  setConnectedPeer(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Orbit View</span>
              </button>
              <button
                onClick={handleManualPurge}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-[0_0_12px_rgba(244,63,94,0.3)] transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Request Modal */}
      {incomingRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cosmic-card rounded-2xl p-6 max-w-sm w-full border border-sky-500/40 shadow-[0_0_40px_rgba(56,189,248,0.3)] text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-2xl">{incomingRequest.fromProfile?.avatar || '🛸'}</span>
            </div>
            <h3 className="font-bold text-slate-100 text-lg mb-1">Incoming Transmission</h3>
            <p className="text-xs text-slate-400 mb-6">
              Node <span className="font-bold text-sky-400">{incomingRequest.fromProfile?.username}</span> requests wormhole link.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  socketRef.current.emit('respond-connection-request', { fromId: incomingRequest.fromId, accepted: false });
                  setIncomingRequest(null);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  // Instant response, no waiting or freezing
                  socketRef.current.emit('respond-connection-request', {
                    fromId: incomingRequest.fromId,
                    accepted: true
                  });
                  setIncomingRequest(null);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:brightness-110 transition"
              >
                Establish
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col justify-center">
        {!connectedPeer && !sessionTerminated ? (
          <DiscoveryPanel
            nearbyPeers={nearbyPeers}
            selfCode={selfCode}
            onConnectNearby={(targetId) => {
              socketRef.current.emit('request-peer-connect', { targetId });
            }}
            onConnectCode={(targetCode) => {
              socketRef.current.emit('connect-by-code', { targetCode });
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransferDashboard
                peerName={connectedPeer ? connectedPeer.profile?.username : lastPeerName}
                isConnected={!!connectedPeer}
                onSendFile={sendFilePayload}
                receivedFiles={receivedFiles}
                sentFiles={sentFiles}
                transferProgress={transferProgress}
                onDisconnect={() => {
                  socketRef.current.emit('disconnect-peer');
                  handleTeardownSession();
                }}
              />
            </div>
            <div>
              <ChatWindow
                peerName={connectedPeer ? connectedPeer.profile?.username : lastPeerName}
                isConnected={!!connectedPeer}
                messages={messages}
                onSendMessage={sendMessagePayload}
                onTyping={sendTypingStatus}
                isPeerTyping={isPeerTyping}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}