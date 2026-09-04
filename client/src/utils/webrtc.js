import { CHUNK_SIZE } from './constants';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ]
};

// Maximum buffered amount (16MB) before pausing chunk transmission
const MAX_BUFFERED_AMOUNT = 16 * 1024 * 1024;

export class PeerConnectionManager {
  constructor({ onSignal, onDataChannelOpen, onDataChannelClose, onMessage, onProgress }) {
    this.onSignal = onSignal;
    this.onDataChannelOpen = onDataChannelOpen;
    this.onDataChannelClose = onDataChannelClose;
    this.onMessage = onMessage;
    this.onProgress = onProgress;

    this.pc = null;
    this.dc = null;
  }

  initiate(isInitiator) {
    this.pc = new RTCPeerConnection(ICE_SERVERS);

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.onSignal({ candidate: event.candidate });
      }
    };

    if (isInitiator) {
      const channel = this.pc.createDataChannel('astro-stream', {
        ordered: true
      });
      this.bindDataChannel(channel);
    } else {
      this.pc.ondatachannel = (event) => {
        this.bindDataChannel(event.channel);
      };
    }
  }

  bindDataChannel(channel) {
    this.dc = channel;
    this.dc.binaryType = 'arraybuffer';

    this.dc.onopen = () => {
      if (this.onDataChannelOpen) this.onDataChannelOpen();
    };

    this.dc.onclose = () => {
      if (this.onDataChannelClose) this.onDataChannelClose();
    };

    this.dc.onmessage = (event) => {
      if (this.onMessage) this.onMessage(event.data);
    };
  }

  async createOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.onSignal(this.pc.localDescription);
  }

  async handleSignal(signal) {
    if (!this.pc) return;

    if (signal.type === 'offer') {
      await this.pc.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.onSignal(this.pc.localDescription);
    } else if (signal.type === 'answer') {
      await this.pc.setRemoteDescription(new RTCSessionDescription(signal));
    } else if (signal.candidate) {
      await this.pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  }

  sendPayload(data) {
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  async streamFile(file) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Cosmic data channel offline.');
    }

    // Announce metadata header
    this.sendPayload({
      type: 'file-header',
      name: file.name,
      size: file.size,
      mime: file.type || 'application/octet-stream'
    });

    let offset = 0;

    const readSlice = (start) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const slice = file.slice(start, start + CHUNK_SIZE);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(slice);
      });
    };

    while (offset < file.size) {
      // Check channel buffer threshold to avoid memory overflow
      if (this.dc.bufferedAmount > MAX_BUFFERED_AMOUNT) {
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }

      const chunk = await readSlice(offset);
      this.dc.send(chunk);
      offset += chunk.byteLength;

      if (this.onProgress) {
        this.onProgress(Math.min(100, Math.round((offset / file.size) * 100)));
      }
    }

    if (this.onProgress) this.onProgress(null);
  }

  close() {
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}