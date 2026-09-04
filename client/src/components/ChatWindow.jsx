import React, { useState, useEffect, useRef } from 'react';
import { SendHorizonal, Terminal } from 'lucide-react';

export default function ChatWindow({ messages, onSendMessage, onTyping, isPeerTyping, peerName, isConnected = true }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (onTyping && isConnected) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !isConnected) return;
    if (onTyping) onTyping(false);
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="cosmic-card rounded-2xl flex flex-col h-80 shadow-2xl overflow-hidden">
      <div className="bg-slate-900/80 border-b border-sky-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
            Sub-Space Radio // {peerName}
          </h3>
        </div>
        {isPeerTyping && (
          <div className="flex items-center space-x-1 text-[11px] font-mono text-sky-400 animate-pulse">
            <span>typing</span>
            <span className="inline-flex space-x-0.5">
              <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500 text-center px-4">
            {isConnected ? 'Encrypted channel open. Say hello.' : 'Session closed. Transmission archive.'}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.isSelf ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed font-sans ${
                  m.isSelf
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-none shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-2.5 border-t border-sky-500/20 bg-slate-900/40 flex space-x-2">
        <input
          type="text"
          disabled={!isConnected}
          value={text}
          onChange={handleInputChange}
          placeholder={isConnected ? "Transmit signal..." : "Channel offline"}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-950/70 rounded-xl border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!isConnected || !text.trim()}
          className="p-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl shadow-[0_0_12px_rgba(56,189,248,0.3)] transition disabled:opacity-40"
        >
          <SendHorizonal className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}