const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Map: socketId -> { id, networkIp, code, connectedWith, profile }
const peers = new Map();

function generateCosmicCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  const networkIp = forwarded ? forwarded.split(',')[0].trim() : socket.handshake.address;

  let userCode = generateCosmicCode();
  // Ensure unique code
  let isUnique = false;
  while (!isUnique) {
    let clash = false;
    for (const [, p] of peers) {
      if (p.code === userCode) { clash = true; break; }
    }
    if (!clash) isUnique = true;
    else userCode = generateCosmicCode();
  }

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

  // Connect via 6-digit Code
  socket.on('connect-by-code', ({ targetCode }) => {
    const cleanCode = (targetCode || '').trim().toUpperCase();
    let targetSocketId = null;

    for (const [id, p] of peers) {
      if (p.code === cleanCode) {
        targetSocketId = id;
        break;
      }
    }

    if (!targetSocketId) {
      socket.emit('connect-error', { message: 'Cosmic code not found in current sector.' });
      return;
    }

    if (targetSocketId === socket.id) {
      socket.emit('connect-error', { message: 'Cannot connect to self frequency.' });
      return;
    }

    const targetPeer = peers.get(targetSocketId);
    if (targetPeer && targetPeer.connectedWith) {
      socket.emit('connect-error', { message: 'Target voyager is currently occupied.' });
      return;
    }

    const sender = peers.get(socket.id);
    io.to(targetSocketId).emit('connection-request', {
      fromId: socket.id,
      fromProfile: sender?.profile,
      fromCode: sender?.code
    });
  });

  // Connect nearby
  socket.on('request-peer-connect', ({ targetId }) => {
    const targetPeer = peers.get(targetId);
    if (!targetPeer || targetPeer.connectedWith) {
      socket.emit('connect-error', { message: 'Peer unavailable or occupied.' });
      return;
    }

    const sender = peers.get(socket.id);
    io.to(targetId).emit('connection-request', {
      fromId: socket.id,
      fromProfile: sender?.profile,
      fromCode: sender?.code
    });
  });

  // Connection accepted/rejected
  socket.on('respond-connection-request', ({ fromId, accepted }) => {
    const sender = peers.get(fromId);
    const receiver = peers.get(socket.id);

    if (!sender || !receiver) {
      socket.emit('connect-error', { message: 'Peer disconnected before handshake.' });
      return;
    }

    if (!accepted) {
      io.to(fromId).emit('connection-rejected', { byProfile: receiver.profile });
      return;
    }

    sender.connectedWith = socket.id;
    receiver.connectedWith = fromId;

    // Trigger receiver FIRST so its RTCPeerConnection and listeners are mounted
    io.to(socket.id).emit('start-webrtc-negotiation', {
      targetId: fromId,
      initiator: false,
      peerProfile: sender.profile
    });

    // Then trigger initiator to create offer
    setTimeout(() => {
      io.to(fromId).emit('start-webrtc-negotiation', {
        targetId: socket.id,
        initiator: true,
        peerProfile: receiver.profile
      });
    }, 150);
  });

  // Signal exchange (Offer, Answer, Candidate)
  socket.on('signal', ({ targetId, signalData }) => {
    io.to(targetId).emit('signal-received', {
      fromId: socket.id,
      signalData
    });
  });

  // Disconnect handler
  const handleTeardown = () => {
    const current = peers.get(socket.id);
    if (!current) return;

    if (current.connectedWith) {
      io.to(current.connectedWith).emit('peer-disconnected');
      const partner = peers.get(current.connectedWith);
      if (partner) partner.connectedWith = null;
    }

    const ip = current.networkIp;
    peers.delete(socket.id);
    broadcastLocalPeers(ip);
  };

  socket.on('disconnect-peer', handleTeardown);
  socket.on('disconnect', handleTeardown);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`AstroDrop server running on port ${PORT}`);
});