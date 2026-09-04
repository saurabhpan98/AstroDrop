import React from 'react';
import { ShieldCheck, Orbit } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-center sm:text-left">
        <div className="flex items-center space-x-2">
          <Orbit className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: '20s' }} />
          <p className="text-xs font-mono font-medium text-slate-500">
            AstroDrop P2P Relay
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <span>Engineered by</span>
          <span className="font-semibold text-slate-700">Saurabh Panchal</span>[cite: 1]
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> RAM Chunks
          </span>
          <span>•</span>
          <span>Zero Trace</span>
        </div>
      </div>
    </footer>
  );
}