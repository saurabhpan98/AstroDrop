import React from 'react';
import { Orbit, Radio } from 'lucide-react';
import { renderAvatarIcon } from '../utils/constants';

export default function Header({ userProfile, userCode }) {
  return (
    <header className="w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 overflow-hidden">
        {/* Logo & Tag */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-200">
            <Orbit className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-[spin_12s_linear_infinite]" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              AstroDrop
            </span>
            <span className="hidden md:flex items-center text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/70">
              <Radio className="w-2.5 h-2.5 mr-1 text-sky-500 animate-pulse" /> P2P Relay
            </span>
          </div>
        </div>

        {/* User Identity Chip */}
        {userProfile && (
          <div className="flex items-center space-x-2 sm:space-x-2.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 shadow-xs shrink-0">
            <div className="p-1 rounded-full bg-sky-100/70 text-sky-600">
              {renderAvatarIcon(userProfile.avatar?.icon, "w-3.5 h-3.5 sm:w-4 sm:h-4")}
            </div>
            <span className="text-xs font-semibold text-slate-700 border-l pl-2 border-slate-200 max-w-[100px] sm:max-w-none truncate">
              {userProfile.username}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}