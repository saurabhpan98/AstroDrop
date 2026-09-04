import React, { useState } from 'react';
import { Wifi, KeyRound, Send, ArrowRight, Radio, Compass, Orbit } from 'lucide-react';

export default function DiscoveryPanel({ nearbyPeers, onConnectNearby, onConnectCode, selfCode }) {
  const [remoteCode, setRemoteCode] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto my-8 px-4">
      {/* Planetary Orbit Discovery */}
      <div className="cosmic-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-lg">Planetary Orbit</h3>
                <p className="text-xs text-sky-400/80">Local Wi-Fi Discovery</p>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Continuously sweeping active local subnet frequencies for adjacent spacefarers.
          </p>

          <div className="space-y-3 min-h-[160px]">
            {nearbyPeers.length === 0 ? (
              <div className="relative h-40 border border-dashed border-sky-500/20 rounded-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none" />
                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                  <div className="absolute inset-0 border border-sky-500/20 rounded-full radar-spinner border-t-sky-400/80" />
                  <Radio className="w-6 h-6 text-sky-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-400 font-mono">Radar active. Waiting for local beacons...</p>
              </div>
            ) : (
              nearbyPeers.map((peer) => (
                <div 
                  key={peer.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl border border-sky-500/20 bg-slate-900/40 hover:bg-sky-950/30 transition-all shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{peer.profile?.avatar}</span>
                    <div>
                      <span className="font-semibold text-slate-200 text-sm block">{peer.profile?.username}</span>
                      <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest">{peer.code}</span>
                    </div>
                  </div>
                  <button
                    disabled={peer.busy}
                    onClick={() => onConnectNearby(peer.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)] transition disabled:opacity-40 flex items-center space-x-1"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Deep Space Cosmic Code */}
      <div className="cosmic-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Quantum Warp Key</h3>
              <p className="text-xs text-indigo-400/80">Remote Cross-Network Mesh</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Link with remote nodes anywhere across the galaxy using ephemeral cryptographic tokens.
          </p>

          <div className="p-4 bg-slate-900/60 border border-indigo-500/30 rounded-xl mb-5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 block mb-1">Your Frequency Beacon</span>
            <span className="text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-cyan-300 tracking-widest select-all">
              {selfCode}
            </span>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              maxLength={6}
              value={remoteCode}
              onChange={(e) => setRemoteCode(e.target.value.toUpperCase())}
              placeholder="ENTER WARP CODE"
              className="flex-1 px-4 py-2.5 text-center text-sm font-mono tracking-widest uppercase rounded-xl border border-slate-700/80 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-slate-900/60 text-slate-100 placeholder-slate-600"
            />
            <button
              onClick={() => onConnectCode(remoteCode)}
              disabled={remoteCode.length !== 6}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-xl text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.3)] transition disabled:opacity-40 flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
              <span>Jump</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}