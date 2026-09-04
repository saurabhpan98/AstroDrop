import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import DiscoveryPanel from './components/DiscoveryPanel';
import TransferDashboard from './components/TransferDashboard';
import ChatWindow from './components/ChatWindow';
import Footer from './components/Footer';
import { AVATARS, RANDOM_NAMES, CHUNK_SIZE } from './utils/constants';
import { storeFileLocally, purgeLocalArtifacts } from './utils/storage';

// Replace with your Render URL (e.g., https://astrodrop-server.onrender.com)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

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
  const activeIncomingFile = useRef({ info: null, chunks: [], receivedBytes: 0 });

  useEffect(() => {
    const socket = io(BACKEND_URL);
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
      alert('Request declined by remote voyager.');
    });

    socket.on('start-webrtc-negotiation', async ({ targetId, initiator }) => {
      initiateWebRTC(targetId, initiator);
    });

    socket.on('signal-received', async ({ signalData }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (signalData.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal', { targetId: connectedPeer?.id, signalData: answer });
      } else if (signalData.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData));
      } else if (signalData.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
      }
    });

    socket.on('peer-disconnected', () => {
      handleTeardownSession();
    });

    return () => socket.disconnect();
  }, [connectedPeer]);

  const initiateWebRTC = async (targetId, isInitiator) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('signal', { targetId, signalData: { candidate: event.candidate } });
      }
    };

    if (isInitiator) {
      const dc = pc.createDataChannel('astro-channel');
      setupDataChannel(dc);
      dataChannelRef.current = dc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('signal', { targetId, signalData: offer });
    } else {
      pc.ondatachannel = (e) => {
        setupDataChannel(e.channel);
        dataChannelRef.current = e.channel;
      };
    }
  };

  const setupDataChannel = (dc) => {
    dc.binaryType = 'arraybuffer';
    dc.onopen = () => {
      setConnectedPeer({ id: dc.label, profile: incomingRequest?.fromProfile || { username: 'Cosmic Node' } });
      setIncomingRequest(null);
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
        // Binary Chunk Stream
        const { info, chunks } = activeIncomingFile.current;
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

    // Send Header Info
    dc.send(JSON.stringify({
      type: 'file-header',
      name: file.name,
      size: file.size,
      mime: file.type
    }));

    // Stream Sliced Slices
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
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    setConnectedPeer(null);
    setShowCleanupModal(true);

    // Auto-wipe browser staged files after 1 hour (3600000ms)
    setTimeout(() => {
      purgeLocalArtifacts();
    }, 3600000);
  };

  return (
    <div className="min-h-screen flex flex-col space-canvas relative selection:bg-sky-200">
      <Header userProfile={profile} userCode={selfCode} />

      {/* Incoming Session Prompt Modal */}
      {incomingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-sky-100 shadow-2xl text-center">
            <h3 className="font-bold text-slate-800 text-lg mb-1">Incoming Transmission</h3>
            <p className="text-sm text-slate-500 mb-6">
              Node <span className="font-bold text-indigo-600">{incomingRequest.fromProfile?.username}</span> requests wormhole access.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  socketRef.current.emit('respond-connection-request', { fromId: incomingRequest.fromId, accepted: false });
                  setIncomingRequest(null);
                }}
                className="flex-1 py-2 text-sm font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                Refuse
              </button>
              <button
                onClick={() => {
                  socketRef.current.emit('respond-connection-request', { fromId: incomingRequest.fromId, accepted: true });
                }}
                className="flex-1 py-2 text-sm font-semibold rounded-xl bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/20 transition"
              >
                Establish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnection Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Session Severed</h3>
            <p className="text-sm text-slate-600 mb-6">
              Would you like to purge received files and transmission logs immediately? If left untouched, browser staged data will auto-delete in 1 hour.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCleanupModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Preserve (1h Autokill)
              </button>
              <button
                onClick={() => {
                  purgeLocalArtifacts();
                  setMessages([]);
                  setReceivedFiles([]);
                  setShowCleanupModal(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                Clear Everything Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Cosmos Display */}
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
                peerName={connectedPeer.profile.username}
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
                peerName={connectedPeer.profile.username}
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