import React from 'react';
import { ShieldCheck, Sparkles, Orbit } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-sky-500/20 bg-slate-950/70 backdrop-blur-xl mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Orbit className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '15s' }} />
          <p className="text-xs font-mono font-medium text-slate-400">
            AstroDrop: Zero-Trace P2P Galaxy Relay
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <span>Engineered with cosmic precision by</span>
          <span className="font-bold text-sky-400 tracking-wide">Saurabh Panchal</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
          <span className="flex items-center text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Memory Chunks Only
          </span>
          <span>•</span>
          <span>Zero Server Footprint</span>
        </div>
      </div>
    </footer>
  );
}