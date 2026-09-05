# 🪐 AstroDrop — Hyperspeed P2P Orbit Relay

> **Hyperspeed peer-to-peer data transport across the digital cosmos.**  
> Stream any file directly between devices with zero size limits, zero server persistence, and end-to-end transport encryption.

---

## 🌌 Introduction & The Core Idea

In an era where everyday file sharing typically relies on cloud intermediaries, cloud-storage links, or messaging applications, sharing files often incurs significant drawbacks:
* Files are uploaded to third-party data centers, creating digital footprints.
* Strict bandwidth or file-size caps (e.g., 25MB–2GB) frequently block large payloads.
* Cloud servers compress media, stripping original quality.
* Uploading to a cloud server and then downloading back down creates redundant network round-trips.

**AstroDrop** bypasses central file storage altogether. Designed around an ambient celestial aesthetic, AstroDrop turns every web browser into an autonomous peer node. By combining **WebSockets (Socket.io)** for rapid signaling with direct **WebRTC DataChannels**, devices create direct browser-to-browser tunnels ("wormholes"). Files stream directly from sender memory to receiver memory in small, indexed binary chunks—meaning **zero bytes of your files or private conversations ever touch our servers**.

---

## 🛠️ Tech Stack & Architecture

### **Client (Frontend)**
* **Framework:** React 18 (Bootstrapped with Vite)
* **Styling:** Tailwind CSS (Custom Cosmic Light/Clean Orbit theme)
* **Icons:** Lucide React
* **Client Ephemeral Cache:** IndexedDB API (Structured file assembly & local storage)
* **Real-time Engine:** WebRTC (`RTCPeerConnection`, `RTCDataChannel`) & `socket.io-client`
* **Hosting:** GitHub Pages (Automated via GitHub Actions CI/CD)

### **Server (Signaling Nexus)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Signaling Relay:** Socket.io
* **Buffer Support:** Configured for memory-chunk fallback relay
* **Hosting:** Render

---

## 🛰️ Key Features

* **Subnet Planetary Radar:** Automatically detects other devices running AstroDrop on the same Wi-Fi or gateway network.
* **Quantum Warp Key:** Cross-network peer discovery via random, ephemeral 6-character beacon codes.
* **No File Size or Type Boundaries:** Send `.iso`, `.zip`, `.mp4`, raw `.raw` photos, executables, or directories packed into archives. AstroDrop streams memory slices via standard `ArrayBuffer` pipelines.
* **Live In-Transit Progress:** Real-time percentage indicator tracking memory byte transfer.
* **Bi-Directional Payloads List:**
  * **Intercepted Payloads:** Instant extraction/download buttons for received files.
  * **Dispatched Payloads:** Live confirmation checkmarks with formatted file sizes for sent items.
* **Ephemeral Sub-Space Intercom:** Low-latency end-to-end text chat between connected voyagers with live typing indicators.
* **Smart Purge & 1-Hour Ephemeral Timer:**
  * If a session closes, staged files and chat logs remain in the browser for **1 hour** before being scrubbed by an automated garbage-collection interval.
  * Clicking **"Orbit View"** immediately wipes local IndexedDB artifacts and memory, returning the user to discovery mode.
* **Adaptive Light Space Theme:** Polished cosmic UI with animated radar sweeps, celestial avatars, responsive cards, and zero eye fatigue.

---

## 🔒 Security, Privacy & Zero-Trace Architecture

AstroDrop was engineered from the ground up prioritizing data privacy:

### 1. Zero Server Storage
Unlike traditional cloud transfer tools, AstroDrop does not have an upload storage bucket (no S3, no disks, no databases). The server acts exclusively as an SDP/ICE exchange switchboard. Once the WebRTC DataChannel opens, file packets move directly between the two client endpoints.

### 2. End-to-End Cryptographic Security
WebRTC enforces **DTLS (Datagram Transport Layer Security)** and **SRTP (Secure Real-Time Transport Protocol)** at the browser level. All data in transit is encrypted using authenticated **AES-GCM (Galois/Counter Mode)** or **ChaCha20-Poly1305** cipher suites. No intermediate network observer, ISP, or signaling server can inspect payloads.

### 3. In-Browser Memory Staging & Auto-Kill
Received files are staged locally within the client’s browser memory via the `IndexedDB` API. Once a connection terminates:
* The user can exit to **Orbit View**, which runs `purgeLocalArtifacts()` and deletes all active blobs and chat states.
* If left untouched, an automated 3,600-second (1-hour) timeout executes an internal purge, ensuring shared items never persist indefinitely on shared workstations.

---

## 🚀 How It Works Under the Hood
```

[Voyager Node A]                                  [Signaling Server]                                  [Voyager Node B]
│                                                   │                                                  │
│────── 1. Connect & Announce Cosmic Code ─────────>│<────── 1. Connect & Announce Cosmic Code ────────│
│                                                   │                                                  │
│────── 2. Request Connection (Nearby or Code) ────>│                                                  │
│                                                   │────── 3. Prompt Incoming Transmission ──────────>│
│                                                   │<───── 4. Accept Connection Request ──────────────│
│                                                   │                                                  │
│<───── 5. Trigger WebRTC Negotiation (SDP Offer) ──│────── 5. Initialize RTCPeerConnection ──────────>│
│────── 6. Emit SDP Offer & ICE Candidates ────────>│                                                  │
│                                                   │────── 7. Forward Offer & ICE Candidates ────────>│
│                                                   │<───── 8. Emit SDP Answer & ICE Candidates ───────│
│<───── 9. Forward Answer & Final Handshake ────────│                                                  │
│                                                   │                                                  │
│══════════════════ 10. DIRECT ENCRYPTED WebRTC DATA CHANNEL OPENED ═══════════════════════════════════│
│                                                                                                      │
│  ─── Ephemeral Chat Messages (JSON) ──────────────────────────────────────────────────────────────>  │
│  ─── Binary Stream: [64KB Chunks via ArrayBuffer] ────────────────────────────────────────────────>  │
│                                                                                                      │
```

1. **Discovery:** Nodes obtain an ephemeral code and send their random celestial identity to the signaling nexus.
2. **Handshake:** Connection requests can be triggered via Local Wi-Fi subnet detection or by supplying the target node's 6-character Quantum Warp Key.
3. **P2P Channel Establishment:** The two browsers exchange Session Description Protocol (SDP) records and ICE candidates.
4. **Transport:** Files are sliced using the `FileReader` API into standard `64 KB` chunks and streamed sequentially through the binary `RTCDataChannel`.
5. **Reassembly:** The receiving browser reassembles the `ArrayBuffer` slices into a memory `Blob` and generates a local `blob:` download URL.

---

## 📂 Project Structure

```text
astrodrop/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Automated GitHub Pages CI/CD workflow
├── server/
│   ├── package.json                # Server-side dependencies
│   └── index.js                    # Express + Socket.io Signaling & Memory Relay Nexus
└── client/
    ├── package.json                # Client-side dependencies & scripts
    ├── vite.config.js              # Vite build setup & base path configuration
    ├── tailwind.config.js          # Tailored Tailwind color palette & utilities
    ├── postcss.config.js           # PostCSS configuration
    ├── index.html                  # HTML entry point with cosmic metadata
    └── src/
        ├── index.css               # Clean cosmic styling, radars, animations
        ├── main.jsx                # React root mount
        ├── App.jsx                 # Core orchestration, WebRTC logic & state engine
        ├── components/
        │   ├── Header.jsx          # Top navigation, celestial brand & user chip
        │   ├── DiscoveryPanel.jsx  # Local Wi-Fi radar & Quantum Warp Code input
        │   ├── TransferDashboard.jsx # File dropzone, progress bar, sent/received logs
        │   ├── ChatWindow.jsx      # Sub-space intercom with live typing indicator
        │   └── Footer.jsx          # Security status and developer credits
        └── utils/
            ├── constants.js        # Avatars, random name arrays & chunk size constants
            ├── storage.js          # Ephemeral IndexedDB wrapper & purge utilities
            └── webrtc.js           # Low-level WebRTC DataChannel connection manager

```

## 💻 Local Development Setup
### Prerequisites
  * **Node.js:** v18.0.0 or higher
  * **npm:** v9.0.0 or higher
  * **Git** installed on your system

### 1. Clone the Repository
```
git clone [https://github.com/](https://github.com/)<your-username>/astrodrop.git
cd astrodrop
```

### 2. Start the Signaling Server
```
cd server
npm install
npm start
```
*The signaling nexus will bind to `http://localhost:4000` .*

### 3. Start the Client
Open a new terminal window:
```
cd client
npm install
npm run dev
```

*Open `http://localhost:5173` in two different browser tabs, windows, or across two devices on the same Wi-Fi network.*

## 🚢 Production Deployment Playbook
### Backend (Render)
1. Push your repository to GitHub.
2. Log into Render.com and click **New + > Web Service**.
3. Select your repository.
4. Set **Root Directory** to `server`.
5. Set **Build Command** to `npm install`.
6. Set **Start Command** to `node index.js`.
7. Copy your deployed service URL (e.g., `https://astrodrop-server.onrender.com`).

### Frontend (GitHub Pages via GitHub Actions)
1. In `client/.env.production`, set your live Render URL:
```
VITE_BACKEND_URL=[https://astrodrop-server.onrender.com](https://astrodrop-server.onrender.com)
```

2. In `client/vite.config.js`, ensure the `base` path matches your repository name:
```
base: process.env.NODE_ENV === 'production' ? '/<repo-name>/' : '/'
```

3. In your GitHub repository settings:
 * Navigate to **Settings > Pages**.
 * Under **Build and deployment > Source**, select **GitHub Actions**.

4. Push your commit to the `main` branch. GitHub Actions will automatically install dependencies, build the distribution, and deploy AstroDrop to GitHub Pages.

## 📖 User Guide
1. **Launch AstroDrop:** Upon loading, an avatar, temporary voyager handle, and a 6-character Cosmic Code are assigned to you.
2. **Connect via Local Orbit:** If the target device is on the same Wi-Fi network, locate their avatar in the Planetary Orbit panel and click Connect.
3. **Connect via Remote Code:** If the target device is on cellular data or an external network, enter their 6-character code into the Quantum Warp Key field and click Link.
4. **Accept Connection:** The receiving voyager will see an incoming transmission prompt. Click Accept.
5. T**ransmit Data:**
     * Drag and drop or browse for any file in the payload zone.
     * Type real-time messages in the Sub-Space Radio chat window.
6. **Disconnect:** Click Disconnect when done.
     * Staged files remain accessible for up to 1 hour with a live countdown timer
     * Click Orbit View to immediately purge all browser memory and return to the main radar.
 
## 👨‍💻 Developer & Credits
 * Lead Architect & Developer: **Saurabh Panchal**
 * Project Mission: Pioneering friction-free, high-speed, zero-compromise peer-to-peer data sharing.

## 📄 License
This project is licensed under the MIT License.
