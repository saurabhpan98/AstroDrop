import React, { useState } from 'react';
import { KeyRound, Send, ArrowRight, Compass } from 'lucide-react';

export default function DiscoveryPanel({ nearbyPeers, onConnectNearby, onConnectCode, selfCode }) {
  const [remoteCode, setRemoteCode] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto my-3 sm:my-6 px-1 sm:px-4">
      {/* Planetary Orbit Discovery */}
      <div className="cosmic-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Planetary Orbit</h3>
                <p className="text-[11px] sm:text-xs text-sky-600 font-medium">Local Wi-Fi Network</p>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Sweeping active local network devices for fast zero-configuration p2p streaming.
          </p>

          <div className="space-y-2.5 min-h-[160px]">
            {nearbyPeers.length === 0 ? (
              <div className="relative h-48 border border-dashed border-sky-200/90 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-sky-50/50 via-white to-sky-50/20 overflow-hidden">
                {/* Clean Radar without blue circular arc */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                  {/* Subtle Expanding Outer Waves */}
                  <div className="absolute inset-0 rounded-full border border-sky-300/40 animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-2 rounded-full border border-sky-200/60 bg-sky-50/30"></div>
                  <div className="absolute inset-5 rounded-full border border-slate-200/70"></div>

                  {/* Clean Orbiting Satellite Blue Dot */}
                  <div className="absolute inset-0 radar-spinner" style={{ animationDuration: '3.5s' }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)] absolute -top-1 left-1/2 -translate-x-1/2 ring-2 ring-white"></div>
                  </div>

                  {/* Center Node Hub */}
                  <div className="relative z-10 w-11 h-11 rounded-full bg-white shadow-md shadow-sky-100 border border-sky-100 flex items-center justify-center">
                    <span className="text-base select-none">🛰️</span>
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-xs font-semibold text-slate-700 tracking-wide">Scanning local frequencies...</p>
                  <p className="text-[11px] text-sky-600/80 font-mono mt-0.5">Looking for adjacent peers</p>
                </div>
              </div>
            ) : (
              nearbyPeers.map((peer) => (
                <div
                  key={peer.id}
                  className="flex items-center justify-between p-3 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:border-sky-200 transition-all shadow-xs gap-2"
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-3 truncate">
                    <span className="text-xl sm:text-2xl">{peer.profile?.avatar?.split(' ')[0] || '🛰️'}</span>
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm block truncate">{peer.profile?.username}</span>
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-widest">{peer.code}</span>
                    </div>
                  </div>
                  <button
                    disabled={peer.busy}
                    onClick={() => onConnectNearby(peer.id)}
                    className="px-3 sm:px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition disabled:opacity-40 flex items-center space-x-1 shrink-0 active:scale-95"
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

      {/* Deep Space Cosmic Code */}
      <div className="cosmic-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Quantum Warp Key</h3>
              <p className="text-[11px] sm:text-xs text-indigo-600 font-medium">Anywhere on Internet</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Link with remote nodes anywhere on the internet using an ephemeral 6-character token.
          </p>

          <div className="p-4 sm:p-5 bg-gradient-to-b from-indigo-50/70 to-sky-50/40 border border-indigo-100 rounded-xl sm:rounded-2xl mb-5 sm:mb-6 text-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-500 block mb-1">
              Your Beacon Code
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-slate-800 tracking-widest select-all">
              {selfCode}
            </span>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              maxLength={6}
              value={remoteCode}
              onChange={(e) => setRemoteCode(e.target.value.toUpperCase())}
              placeholder="ENTER 6-DIGIT CODE"
              className="flex-1 px-3.5 sm:px-4 py-2.5 text-center text-sm font-mono tracking-widest uppercase rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-500 bg-white text-slate-800 placeholder-slate-400 shadow-xs"
            />
            <button
              onClick={() => onConnectCode(remoteCode)}
              disabled={remoteCode.length !== 6}
              className="px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold tracking-wide shadow-xs transition disabled:opacity-40 flex items-center space-x-1.5 shrink-0 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}