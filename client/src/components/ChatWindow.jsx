import React, { useState } from 'react';
import { SendHorizonal } from 'lucide-react';

export default function ChatWindow({ messages, onSendMessage, peerName }) {
  const [text, setText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-80 shadow-xl overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <h3 className="text-xs font-bold tracking-wider text-slate-600 uppercase">
          Ephemeral Intercom ({peerName})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.isSelf ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
              m.isSelf 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-slate-100 flex space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Transmit message..."
          className="flex-1 px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <SendHorizonal className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}