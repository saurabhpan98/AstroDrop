import React, { useState } from 'react';
import { Wifi, KeyRound, Send, ArrowRight, UserCheck } from 'lucide-react';

export default function DiscoveryPanel({ 
  nearbyPeers, 
  onConnectNearby, 
  onConnectCode,
  selfCode
}) {
  const [remoteCode, setRemoteCode] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto my-6 px-4">
      {/* Local Orbit Discovery */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Local Planetary Orbit</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Detecting active nodes connected to your current Wi-Fi or gateway network.
          </p>
          
          <div className="space-y-2.5 min-h-[140px]">
            {nearbyPeers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                Scanning orbital vicinity for beacons...
              </div>
            ) : (
              nearbyPeers.map((peer) => (
                <div key={peer.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-sky-50/50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{peer.profile?.avatar}</span>
                    <span className="font-semibold text-slate-700 text-sm">{peer.profile?.username}</span>
                  </div>
                  <button
                    disabled={peer.busy}
                    onClick={() => onConnectNearby(peer.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Deep Space Code Relay */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Cosmic Code Transmission</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Bridge devices across foreign networks via secure signaling code.
          </p>

          <div className="p-3 bg-indigo-50/60 rounded-xl mb-4 text-center">
            <span className="text-xs uppercase font-bold text-indigo-500 block mb-1">Your Celestial Key</span>
            <span className="text-2xl font-mono font-black text-indigo-950 tracking-wider select-all">{selfCode}</span>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              maxLength={6}
              value={remoteCode}
              onChange={(e) => setRemoteCode(e.target.value.toUpperCase())}
              placeholder="ENTER 6-DIGIT CODE"
              className="flex-1 px-4 py-2 text-center text-sm font-mono tracking-widest uppercase rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
            />
            <button
              onClick={() => onConnectCode(remoteCode)}
              disabled={remoteCode.length !== 6}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
              <span>Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}