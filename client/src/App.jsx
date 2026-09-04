import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
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
  const [incomingRequest, setIncomingRequest] = useState(null);

  const [messages, setMessages] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [transferProgress, setTransferProgress] = useState(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const targetIdRef = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const activeIncomingFile = useRef({ info: null, chunks: [], receivedBytes: 0 });

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Signal Nexus Connected');
    });

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

    // Both parties are notified by the server once accepted
    socket.on('start-webrtc-negotiation', async ({ targetId, initiator, peerProfile }) => {
      targetIdRef.current = targetId;
      await preparePeerConnection(targetId, initiator, peerProfile);
    });

    socket.on('signal-received', async ({ fromId, signalData }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      try {
        if (signalData.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          
          // Flush any early-queued ICE candidates
          while (iceCandidatesQueue.current.length) {
            const candidate = iceCandidatesQueue.current.shift();
            await pc.addIceCandidate(candidate);
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit('signal', { targetId: fromId, signalData: answer });
        } else if (signalData.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          
          while (iceCandidatesQueue.current.length) {
            const candidate = iceCandidatesQueue.current.shift();
            await pc.addIceCandidate(candidate);
          }
        } else if (signalData.candidate) {
          const candidate = new RTCIceCandidate(signalData.candidate);
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(candidate);
          } else {
            iceCandidatesQueue.current.push(candidate);
          }
        }
      } catch (err) {
        console.error('WebRTC Handshake Error:', err);
      }
    });

    socket.on('peer-disconnected', () => {
      handleTeardownSession();
    });

    return () => socket.disconnect();
  }, [profile]);

  const preparePeerConnection = async (targetId, isInitiator, peerProfile) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;
    iceCandidatesQueue.current = [];

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('signal', {
          targetId,
          signalData: { candidate: event.candidate }
        });
      }
    };

    if (isInitiator) {
      const dc = pc.createDataChannel('astro-channel');
      attachDataChannel(dc, peerProfile);
      dataChannelRef.current = dc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('signal', { targetId, signalData: offer });
    } else {
      pc.ondatachannel = (e) => {
        attachDataChannel(e.channel, peerProfile);
        dataChannelRef.current = e.channel;
      };
    }
  };

  const attachDataChannel = (dc, peerProfile) => {
    dc.binaryType = 'arraybuffer';

    dc.onopen = () => {
      setConnectedPeer({
        id: targetIdRef.current,
        profile: peerProfile || { username: 'Cosmic Node' }
      });
      setIncomingRequest(null);
    };

    dc.onclose = () => {
      handleTeardownSession();
    };

    dc.onmessage = (e) => {
      if (typeof e.data === 'string') {
        const payload = JSON.parse(e.data);
        if (payload.type === 'chat') {
          setMessages((prev) => [...prev, { text: payload.message, isSelf: false }]);
        } else if (payload.type === 'file-header') {
          activeIncomingFile.current = { info: payload, chunks: [], receivedBytes: 0 };
          setTransferProgress(0);
        }
      } else {
        const { info, chunks } = activeIncomingFile.current;
        if (!info) return;

        chunks.push(e.data);
        activeIncomingFile.current.receivedBytes += e.data.byteLength;
        setTransferProgress(Math.round((activeIncomingFile.current.receivedBytes / info.size) * 100));

        if (activeIncomingFile.current.receivedBytes >= info.size) {
          const completeBlob = new Blob(chunks, { type: info.mime });
          const downloadUrl = URL.createObjectURL(completeBlob);
          const fileRecord = { name: info.name, url: downloadUrl };

          setReceivedFiles((prev) => [...prev, fileRecord]);
          storeFileLocally(Date.now(), completeBlob, info.name, info.mime);
          setTransferProgress(null);
        }
      }
    };
  };

  const sendFilePayload = async (file) => {
    const dc = dataChannelRef.current;
    if (!dc || dc.readyState !== 'open') return;

    dc.send(JSON.stringify({
      type: 'file-header',
      name: file.name,
      size: file.size,
      mime: file.type
    }));

    const reader = new FileReader();
    let offset = 0;

    const readNextChunk = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = (e) => {
      if (dc.bufferedAmount > 8 * 1024 * 1024) {
        setTimeout(() => reader.onload(e), 50);
        return;
      }

      dc.send(e.target.result);
      offset += e.target.result.byteLength;
      setTransferProgress(Math.round((offset / file.size) * 100));

      if (offset < file.size) {
        readNextChunk();
      } else {
        setTransferProgress(null);
      }
    };

    readNextChunk();
  };

  const sendMessagePayload = (msg) => {
    const dc = dataChannelRef.current;
    if (dc && dc.readyState === 'open') {
      dc.send(JSON.stringify({ type: 'chat', message: msg }));
      setMessages((prev) => [...prev, { text: msg, isSelf: true }]);
    }
  };

  const handleTeardownSession = () => {
    if (dataChannelRef.current) dataChannelRef.current.close();
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    dataChannelRef.current = null;
    peerConnectionRef.current = null;
    targetIdRef.current = null;
    setConnectedPeer(null);
    setShowCleanupModal(true);

    setTimeout(() => {
      purgeLocalArtifacts();
    }, 3600000);
  };

  return (
    <div className="min-h-screen flex flex-col deep-cosmos relative selection:bg-sky-500/30 selection:text-sky-200">
      <Header userProfile={profile} userCode={selfCode} />

      {/* Incoming Connection Request Modal */}
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
                  // Direct acceptance emit triggers negotiation instantaneously on both peers
                  socketRef.current.emit('respond-connection-request', { fromId: incomingRequest.fromId, accepted: true });
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

      {/* Disconnect Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cosmic-card rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-lg mb-2">Wormhole Severed</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Purge ephemeral in-browser staging data and transmission history immediately? Otherwise, background auto-wipe will scrub client memory in 1 hour.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCleanupModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Keep (1hr Auto-Purge)
              </button>
              <button
                onClick={() => {
                  purgeLocalArtifacts();
                  setMessages([]);
                  setReceivedFiles([]);
                  setShowCleanupModal(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              >
                Scrub All Now
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col justify-center">
        {!connectedPeer ? (
          <DiscoveryPanel
            nearbyPeers={nearbyPeers}
            selfCode={selfCode}
            onConnectNearby={(targetId) => socketRef.current.emit('request-peer-connect', { targetId })}
            onConnectCode={(targetCode) => socketRef.current.emit('connect-by-code', { targetCode })}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransferDashboard
                peerName={connectedPeer.profile?.username}
                onSendFile={sendFilePayload}
                receivedFiles={receivedFiles}
                transferProgress={transferProgress}
                onDisconnect={() => {
                  socketRef.current.emit('disconnect-peer');
                  handleTeardownSession();
                }}
              />
            </div>
            <div>
              <ChatWindow
                peerName={connectedPeer.profile?.username}
                messages={messages}
                onSendMessage={sendMessagePayload}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}