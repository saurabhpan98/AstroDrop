import React, { useState, useRef } from 'react';
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
    <div className="cosmic-card rounded-2xl sm:rounded-3xl flex flex-col h-[340px] sm:h-[420px] shadow-sm overflow-hidden">
      <div className="bg-slate-50/95 border-b border-slate-100 px-3.5 py-2.5 sm:py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase truncate max-w-[170px] sm:max-w-none">
            Chat // {peerName}
          </h3>
        </div>
        {isPeerTyping && (
          <div className="flex items-center space-x-1 text-[11px] font-mono text-sky-600">
            <span>typing</span>
            <span className="inline-flex space-x-0.5">
              <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-white/40">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400 text-center px-4">
            {isConnected ? 'Direct channel open. Say hi!' : 'Session closed.'}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.isSelf ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words ${
                  m.isSelf
                    ? 'bg-sky-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-slate-100 bg-white flex space-x-2 shrink-0">
        <input
          type="text"
          disabled={!isConnected}
          value={text}
          onChange={handleInputChange}
          placeholder={isConnected ? "Message..." : "Channel offline"}
          className="flex-1 px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!isConnected || !text.trim()}
          className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-xs transition disabled:opacity-40 shrink-0 active:scale-95"
        >
          <SendHorizonal className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}