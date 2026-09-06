import React, { useState, useEffect } from 'react';
import { KeyRound, Send, ArrowRight, Compass, Wifi, Globe, Info, X, ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { renderAvatarIcon, REVIEWS } from '../utils/constants';

export default function DiscoveryPanel({ nearbyPeers, onConnectNearby, onConnectCode, selfCode }) {
  const [remoteCode, setRemoteCode] = useState('');
  const [activeTab, setActiveTab] = useState('orbit');
  const [infoModal, setInfoModal] = useState(null); // 'orbit' | 'warp' | null

  // 1. Fast changing digit cipher animation while code is pending
  const [scrambleCode, setScrambleCode] = useState('A8X3Q9');
  const isCodePending = !selfCode || selfCode === '------';

  useEffect(() => {
    if (!isCodePending) return;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const interval = setInterval(() => {
      let rand = '';
      for (let i = 0; i < 6; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setScrambleCode(rand);
    }, 65);
    return () => clearInterval(interval);
  }, [isCodePending]);

  // 4. Reviews Carousel Autoplay
  const [reviewIdx, setReviewIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setReviewIdx((prev) => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="max-w-5xl w-full mx-auto my-3 sm:my-6 px-1 sm:px-4">
      {/* Mobile Segmented Switcher */}
      <div className="flex md:hidden p-1 bg-slate-200/70 backdrop-blur-md rounded-2xl mb-4 border border-slate-300/50 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('orbit')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orbit'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Planetary Orbit</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('warp')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'warp'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Quantum Warp</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Planetary Orbit Discovery */}
        <div
          className={`cosmic-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative flex flex-col justify-between ${
            activeTab !== 'orbit' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ animationDuration: '20s' }} />
                </div>
                <div className="flex items-center space-x-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Planetary Orbit</h3>
                    <p className="text-[11px] sm:text-xs text-sky-600 font-medium">Local Wi-Fi Network</p>
                  </div>
                  {/* Info 'i' Button */}
                  <button
                    type="button"
                    onClick={() => setInfoModal('orbit')}
                    title="How to use Planetary Orbit"
                    className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
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
                  <div className="relative w-36 h-36 flex items-center justify-center mb-2">
                    <div 
                      className="absolute inset-0 rounded-full border-2 border-sky-500/60 bg-sky-400/10 animate-ping" 
                      style={{ animationDuration: '3s' }}
                    />
                    <div 
                      className="absolute -inset-2 rounded-full border border-sky-600/35 animate-ping" 
                      style={{ animationDuration: '3s', animationDelay: '1.2s' }}
                    />
                    <div className="absolute inset-0 rounded-full border border-sky-400/50 bg-sky-100/30" />
                    <div className="absolute inset-3 rounded-full border border-sky-500/60 bg-sky-200/25 shadow-inner" />
                    <div className="absolute inset-7 rounded-full border border-sky-600/70 bg-sky-300/20" />
                    <div className="absolute inset-0 radar-spinner" style={{ animationDuration: '3.5s' }}>
                      <div className="w-3 h-3 rounded-full bg-sky-600 shadow-[0_0_12px_rgba(2,132,199,0.95)] absolute -top-1.5 left-1/2 -translate-x-1/2 ring-2 ring-white" />
                    </div>
                    <div className="relative z-10 w-11 h-11 rounded-full bg-white shadow-lg shadow-sky-200/80 border-2 border-sky-400/80 flex items-center justify-center">
                      <span className="text-base select-none">📡</span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-slate-700 tracking-wide">Scanning local frequencies...</p>
                  </div>
                </div>
              ) : (
                nearbyPeers.map((peer) => (
                  <div
                    key={peer.id}
                    className="flex items-center justify-between p-3 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:border-sky-200 transition-all shadow-xs gap-2"
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3 truncate">
                      <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                        {renderAvatarIcon(peer.profile?.avatar?.icon, "w-5 h-5")}
                      </div>
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
        <div
          className={`cosmic-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative flex flex-col justify-between ${
            activeTab !== 'warp' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div>
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center space-x-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">Quantum Warp Key</h3>
                  <p className="text-[11px] sm:text-xs text-indigo-600 font-medium">Anywhere on Internet</p>
                </div>
                {/* Info 'i' Button */}
                <button
                  type="button"
                  onClick={() => setInfoModal('warp')}
                  title="How to use Quantum Warp Key"
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Link with remote nodes anywhere on the internet using an ephemeral 6-character token.
            </p>
            
            {/* Beacon Code with Scrambler Animation */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-indigo-50/70 to-sky-50/40 border border-indigo-100 rounded-xl sm:rounded-2xl mb-5 sm:mb-6 text-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-500 block mb-1">
                Your Beacon Code
              </span>
              <span className={`text-2xl sm:text-3xl font-mono font-black tracking-widest select-all ${isCodePending ? 'text-indigo-400 animate-pulse' : 'text-slate-800'}`}>
                {isCodePending ? scrambleCode : selfCode}
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

      {/* 4. Elegant User Reviews Carousel */}
      <div 
        className="mt-6 sm:mt-10 cosmic-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Quote className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Voyager Transmission Logs</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setReviewIdx((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition active:scale-95"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReviewIdx((prev) => (prev + 1) % REVIEWS.length)}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition active:scale-95"
              aria-label="Next review"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="min-h-[90px] flex flex-col justify-between transition-all duration-300">
          <p className="text-xs sm:text-sm text-slate-700 italic font-medium leading-relaxed">
            "{REVIEWS[reviewIdx].comment}"
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div>
              <span className="font-bold text-xs text-slate-800 block">{REVIEWS[reviewIdx].name}</span>
              <span className="text-[11px] text-slate-400 font-medium">{REVIEWS[reviewIdx].role}</span>
            </div>
            <div className="flex space-x-0.5">
              {[...Array(REVIEWS[reviewIdx].rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div className="flex justify-center space-x-1.5 mt-3">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => setReviewIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === reviewIdx ? 'w-5 bg-sky-500' : 'w-1.5 bg-slate-200'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 3. Clean Info Step-by-Step Modals */}
      {infoModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setInfoModal(null)}
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                {infoModal === 'orbit' ? (
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                    <Compass className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <KeyRound className="w-4 h-4" />
                  </div>
                )}
                <h4 className="font-bold text-slate-800 text-sm">
                  {infoModal === 'orbit' ? 'How Planetary Orbit Works' : 'How Quantum Warp Key Works'}
                </h4>
              </div>
              <button 
                onClick={() => setInfoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {infoModal === 'orbit' ? (
              <ol className="space-y-3 text-xs text-slate-600 leading-relaxed list-decimal list-inside">
                <li><strong className="text-slate-800 font-semibold">Same Wi-Fi Network:</strong> Ensure both devices are connected to the identical local Wi-Fi router or hotspot.</li>
                <li><strong className="text-slate-800 font-semibold">Open AstroDrop:</strong> Have the second device visit AstroDrop in their browser.</li>
                <li><strong className="text-slate-800 font-semibold">Automatic Detection:</strong> The other device will pop up in the Planetary Orbit radar list with its unique avatar.</li>
                <li><strong className="text-slate-800 font-semibold">Connect & Stream:</strong> Click <em>Connect</em>. Once accepted, drag-and-drop any files directly without limits.</li>
              </ol>
            ) : (
              <ol className="space-y-3 text-xs text-slate-600 leading-relaxed list-decimal list-inside">
                <li><strong className="text-slate-800 font-semibold">Anywhere Across Internet:</strong> Works even if one device is on 4G/5G mobile data and the other is on home broadband.</li>
                <li><strong className="text-slate-800 font-semibold">Share Your Code:</strong> Read your 6-character <em>Beacon Code</em> or ask the recipient for theirs.</li>
                <li><strong className="text-slate-800 font-semibold">Enter & Link:</strong> Type their 6-digit code in the field and tap <em>Link</em>.</li>
                <li><strong className="text-slate-800 font-semibold">Encrypted Wormhole:</strong> When they press <em>Accept</em>, an encrypted peer-to-peer data tunnel opens instantly.</li>
              </ol>
            )}

            <button
              onClick={() => setInfoModal(null)}
              className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}