const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust to your specific GitHub Pages origin in production
    methods: ['GET', 'POST']
  }
});

// Store connected peers: { socketId: { id, username, avatar, code, networkIp, connectedWith } }
const peers = new Map();

function generateCosmicCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  // Extract client IP address for local network grouping
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  const networkIp = forwarded ? forwarded.split(',')[0].trim() : socket.handshake.address;

  const userCode = generateCosmicCode();
  
  peers.set(socket.id, {
    id: socket.id,
    networkIp,
    code: userCode,
    connectedWith: null,
    profile: null
  });

  socket.emit('assigned-identity', { code: userCode });

  socket.on('register-profile', (profile) => {
    const peer = peers.get(socket.id);
    if (peer) {
      peer.profile = profile;
      broadcastLocalPeers(networkIp);
    }
  });

  // Share nearby peers sharing the same network IP
  function broadcastLocalPeers(ip) {
    const localPeers = [];
    peers.forEach((p) => {
      if (p.networkIp === ip && p.profile) {
        localPeers.push({ id: p.id, profile: p.profile, code: p.code, busy: !!p.connectedWith });
      }
    });
    
    peers.forEach((p) => {
      if (p.networkIp === ip) {
        io.to(p.id).emit('nearby-peers-updated', localPeers.filter(peer => peer.id !== p.id));
      }
    });
  }

  // Direct code match pairing
  socket.on('connect-by-code', ({ targetCode }) => {
    let targetSocketId = null;
    peers.forEach((val, key) => {
      if (val.code === targetCode) targetSocketId = key;
    });

    if (!targetSocketId || targetSocketId === socket.id) {
      socket.emit('connect-error', { message: 'Invalid target cosmic code.' });
      return;
    }

    const targetPeer = peers.get(targetSocketId);
    if (targetPeer.connectedWith) {
      socket.emit('connect-error', { message: 'Target voyager is already engaged.' });
      return;
    }

    io.to(targetSocketId).emit('connection-request', {
      fromId: socket.id,
      fromProfile: peers.get(socket.id)?.profile,
      fromCode: peers.get(socket.id)?.code
    });
  });

  // Nearby discovery request
  socket.on('request-peer-connect', ({ targetId }) => {
    const targetPeer = peers.get(targetId);
    if (!targetPeer || targetPeer.connectedWith) {
      socket.emit('connect-error', { message: 'Peer is unavailable or busy.' });
      return;
    }

    io.to(targetId).emit('connection-request', {
      fromId: socket.id,
      fromProfile: peers.get(socket.id)?.profile,
      fromCode: peers.get(socket.id)?.code
    });
  });

  // Acceptance / Rejection flow
  socket.on('respond-connection-request', ({ fromId, accepted }) => {
    if (!accepted) {
      io.to(fromId).emit('connection-rejected', {
        byProfile: peers.get(socket.id)?.profile
      });
      return;
    }

    const peerA = peers.get(socket.id);
    const peerB = peers.get(fromId);

    if (peerA && peerB) {
      peerA.connectedWith = fromId;
      peerB.connectedWith = socket.id;

      // Notify initiator (Node A)
      io.to(fromId).emit('start-webrtc-negotiation', { 
        targetId: socket.id, 
        initiator: true,
        peerProfile: peerA.profile 
      });

      // Notify receiver (Node B)
      io.to(socket.id).emit('start-webrtc-negotiation', { 
        targetId: fromId, 
        initiator: false,
        peerProfile: peerB.profile 
      });
    }
  });

  // WebRTC Signal Exchange (Offers, Answers, ICE Candidates)
  socket.on('signal', ({ targetId, signalData }) => {
    io.to(targetId).emit('signal-received', { fromId: socket.id, signalData });
  });

  // Graceful teardown
  const handleDisconnectPairing = () => {
    const currentPeer = peers.get(socket.id);
    if (!currentPeer) return;

    if (currentPeer.connectedWith) {
      io.to(currentPeer.connectedWith).emit('peer-disconnected');
      const partner = peers.get(currentPeer.connectedWith);
      if (partner) partner.connectedWith = null;
    }

    const ip = currentPeer.networkIp;
    peers.delete(socket.id);
    broadcastLocalPeers(ip);
  };

  socket.on('disconnect-peer', handleDisconnectPairing);
  socket.on('disconnect', handleDisconnectPairing);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`AstroDrop signaling nexus operational on port ${PORT}`);
});