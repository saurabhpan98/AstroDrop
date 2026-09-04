import React from 'react';
import { Orbit, Radio, ShieldCheck } from 'lucide-react';

export default function Header({ userProfile, userCode }) {
  return (
    <header className="w-full bg-slate-950/60 backdrop-blur-xl border-b border-sky-500/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-600 shadow-[0_0_20px_rgba(14,165,233,0.5)]">
            <Orbit className="w-6 h-6 text-white animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 rounded-xl bg-sky-400/20 blur-sm" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-wider bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                ASTRODROP
              </span>
              <span className="flex items-center text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-500/30">
                <Radio className="w-2.5 h-2.5 mr-1 text-sky-400 animate-pulse" /> P2P Quantum Relay
              </span>
            </div>
          </div>
        </div>

        {userProfile && (
          <div className="flex items-center space-x-3 bg-slate-900/80 border border-sky-500/30 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
            <span className="text-sm">{userProfile.avatar}</span>
            <span className="text-xs font-semibold text-slate-200 border-l pl-2.5 border-slate-700">
              {userProfile.username}
            </span>
            <span className="text-xs bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-mono font-bold tracking-widest">
              {userCode}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}