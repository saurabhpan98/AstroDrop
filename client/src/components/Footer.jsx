import React from 'react';
import { ShieldCheck, Orbit, Github, Coffee, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full relative mt-auto border-t border-slate-800/80 bg-[#090d16] text-slate-300 overflow-hidden">
      {/* Dynamic Galaxy / Deep Space Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Nebula Glows */}
        <div className="absolute -top-16 left-1/4 w-80 h-40 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-36 bg-purple-600/15 rounded-full blur-3xl"></div>
        {/* Deep Space Star Dust */}
        <div 
          className="absolute inset-0 opacity-25" 
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          {/* Brand Identity & Status */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-sky-950/70 border border-sky-500/30 text-sky-400 shadow-sm">
                <Orbit className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
              </div>
              <span className="font-extrabold text-white tracking-wide text-sm">
                AstroDrop <span className="text-sky-400 font-normal text-xs font-mono">// Relay</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs font-light">
              Ephemeral, direct peer-to-peer browser transmission mesh. Zero data persistence.
            </p>
          </div>

          {/* Action Hub: GitHub & Buy Me a Coffee */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/saurabhpan98/AstroDrop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/70 hover:border-slate-500 text-xs font-semibold shadow-md transition-all duration-150 active:scale-95 group"
            >
              <Github className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
              <span>GitHub Repo</span>
            </a>

            <a
              href="https://buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/15 transition-all duration-150 active:scale-95 group"
            >
              <Coffee className="w-4 h-4 text-slate-950 fill-slate-950 transition-transform group-hover:-rotate-12" />
              <span>Buy me a coffee</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar Details */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 font-medium">
            <span>Engineered by <strong className="text-slate-200 font-semibold">Saurabh Panchal</strong> with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block animate-pulse" />
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> RAM Chunks
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center text-sky-400/90 font-medium">
              <Sparkles className="w-3 h-3 mr-1" /> WebRTC Direct
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Zero Trace</span>
          </div>
        </div>
      </div>
    </footer>
  );
}