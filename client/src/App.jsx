import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Clock, AlertTriangle, ArrowLeft, X, AlertCircle } from 'lucide-react';
import Header from './components/Header';
import DiscoveryPanel from './components/DiscoveryPanel';
import TransferDashboard from './components/TransferDashboard';
import ChatWindow from './components/ChatWindow';
import Footer from './components/Footer';
import { AVATARS, RANDOM_NAMES, CHUNK_SIZE, renderAvatarIcon } from './utils/constants';
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
  const [toastMessage, setToastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [transferProgress, setTransferProgress] = useState(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const [sessionTerminated, setSessionTerminated] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const targetIdRef = useRef(null);
  const useRelayFallback = useRef(false);
  const activeIncomingFile = useRef({ info: null, chunks: [], receivedBytes: 0 });
  const countdownIntervalRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const triggerToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('assigned-identity', ({ code }) => {
      setSelfCode(code);
      socket.emit('register-profile', profile);
    });

    socket.on('nearby-peers-updated', (peers) => setNearbyPeers(peers));
    socket.on('connection-request', (data) => setIncomingRequest(data));
    
    socket.on('connection-rejected', () => {
      triggerToast('Transmission declined by remote voyager.');
    });

    socket.on('connect-error', (data) => {
      triggerToast(data.message || 'Transmission signal failed to establish.');
    });

    socket.on('session-established', async ({ targetId, peerProfile, initiator }) => {
      targetIdRef.current = targetId;
      setLastPeerName(peerProfile?.username || 'Cosmic Node');
      setConnectedPeer({ id: targetId, profile: peerProfile || { username: 'Cosmic Node' } });
      setIncomingRequest(null);
      setSessionTerminated(false);
      initiatePeerHandshake(targetId, initiator);
    });

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
          } catch (e) {}
        }
      } catch (err) {
        console.warn('WebRTC signal fallback engaged:', err);
      }
    });

    socket.on('relay-data', ({ payload }) => handleIncomingData(payload));
    socket.on('relay-binary', (chunk) => handleIncomingChunk(chunk));
    socket.on('peer-disconnected', () => handleTeardownSession());

    return () => socket.disconnect();
  }, [profile]);

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

    setTimeout(() => {
      if (!dcRef.current || dcRef.current.readyState !== 'open') {
        useRelayFallback.current = true;
      }
    }, 2000);
  };

  const bindDataChannel = (dc) => {
    dc.binaryType = 'arraybuffer';
    dc.onopen = () => { useRelayFallback.current = false; };
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

  const sendPayload = (data) => {
    const dc = dcRef.current;
    if (dc && dc.readyState === 'open' && !useRelayFallback.current) {
      dc.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else if (socketRef.current && targetIdRef.current) {
      socketRef.current.emit('relay-data', { targetId: targetIdRef.current, payload: data });
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
        socketRef.current.emit('relay-binary', { targetId: targetIdRef.current, chunk });
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

  const sendTypingStatus = (isTyping) => sendPayload({ type: 'typing', isTyping });

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
    setTimeout(() => { handleManualPurge(); }, 3600000);
  };

  const handleManualPurge = () => {
    purgeLocalArtifacts();
    setMessages([]);
    setReceivedFiles([]);
    setSentFiles([]);
    setSessionTerminated(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handleOrbitViewAndPurge = () => {
    handleManualPurge();
    setConnectedPeer(null);
  };

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="min-h-screen flex flex-col deep-cosmos relative text-slate-800 selection:bg-sky-100 selection:text-sky-800">
      <Header userProfile={profile} userCode={selfCode} />

      {/* Floating Modern Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-top-4 duration-250">
          <div className="bg-white/95 backdrop-blur-md border border-rose-200 shadow-xl shadow-rose-500/10 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-700">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      {/* Disconnection Banner with Orbit View Purge */}
      {sessionTerminated && (receivedFiles.length > 0 || messages.length > 0) && (
        <div className="w-full bg-amber-50/95 border-b border-amber-200/80 backdrop-blur-md px-4 py-3 sticky top-16 z-40 shadow-xs transition-all">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-xs">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 border border-amber-300/60 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-amber-900">Session Closed.</span>
                <span className="text-amber-700/80 ml-1.5 hidden md:inline">
                  Staged files auto-purge in:
                </span>
                <span className="ml-2 font-mono font-bold text-amber-800 bg-amber-100 border border-amber-300/70 px-2 py-0.5 rounded">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                  {formatCountdown(remainingSeconds)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleOrbitViewAndPurge}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Orbit View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Incoming Request Modal with SVG Avatar */}
      {incomingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-100 shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-50 to-indigo-50 border border-sky-100 flex items-center justify-center mx-auto mb-3 shadow-sm text-sky-600">
              {renderAvatarIcon(incomingRequest.fromProfile?.avatar?.icon, "w-8 h-8")}
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500 border-2 border-white"></span>
              </span>
            </div>

            <span className="inline-block text-[11px] font-semibold text-sky-600 bg-sky-50 border border-sky-100/80 px-2.5 py-0.5 rounded-full mb-2">
              {incomingRequest.fromProfile?.avatar?.name || 'Voyager'}
            </span>

            <h3 className="font-bold text-slate-800 text-base mb-1">Incoming Transmission</h3>
            <p className="text-xs text-slate-500 mb-6">
              Voyager <strong className="font-semibold text-slate-700">{incomingRequest.fromProfile?.username}</strong> wants to establish a peer link.
            </p>

            <div className="flex space-x-2.5">
              <button
                onClick={() => {
                  socketRef.current.emit('respond-connection-request', { fromId: incomingRequest.fromId, accepted: false });
                  setIncomingRequest(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition active:scale-95"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  socketRef.current.emit('respond-connection-request', { fromId: incomingRequest.fromId, accepted: true });
                  setIncomingRequest(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-200 transition active:scale-95"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {!connectedPeer && !sessionTerminated ? (
          <DiscoveryPanel
            nearbyPeers={nearbyPeers}
            selfCode={selfCode}
            onConnectNearby={(targetId) => socketRef.current.emit('request-peer-connect', { targetId })}
            onConnectCode={(targetCode) => socketRef.current.emit('connect-by-code', { targetCode })}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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