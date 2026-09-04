import React from 'react';
import { Orbit, Sparkles } from 'lucide-react';

export default function Header({ userProfile, userCode }) {
  return (
    <header className="w-full bg-white/70 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-md shadow-sky-500/20">
            <Orbit className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent">
              AstroDrop
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200">
              P2P WebRTC
            </span>
          </div>
        </div>

        {userProfile && (
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-sm font-medium text-slate-700">{userProfile.avatar}</span>
            <span className="text-sm font-semibold text-slate-900 border-l pl-2.5 border-slate-200">{userProfile.username}</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-mono font-bold tracking-wide">
              {userCode}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}