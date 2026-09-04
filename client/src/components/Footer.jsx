import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-sky-100 bg-white/60 backdrop-blur-md mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <p className="text-sm font-medium text-slate-600">
            AstroDrop: Zero-Trace P2P Galaxy Relay
          </p>
        </div>

        <div className="flex items-center space-x-1 text-sm text-slate-500">
          <span>Engineered with cosmic precision by</span>
          <span className="font-bold text-slate-900 ml-1">Saurabh Panchal</span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" /> AES-GCM Transport</span>
          <span>•</span>
          <span>Zero Server Storage</span>
        </div>
      </div>
    </footer>
  );
}