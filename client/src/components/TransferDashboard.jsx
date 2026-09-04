import React, { useRef } from 'react';
import { UploadCloud, File, Download, XCircle, ShieldCheck, Zap } from 'lucide-react';

export default function TransferDashboard({ onSendFile, receivedFiles, transferProgress, onDisconnect, peerName }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="cosmic-card rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-sky-500/20 gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Wormhole Active: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">{peerName}</span>
            </h2>
            <span className="flex items-center text-[10px] text-emerald-400 font-mono tracking-wider">
              <ShieldCheck className="w-3 h-3 mr-1" /> DIRECT DATACHANNEL STREAM • END-TO-END
            </span>
          </div>
        </div>

        <button
          onClick={onDisconnect}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/50 hover:border-rose-500 transition"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Sever Wormhole</span>
        </button>
      </div>

      {/* Cyber File Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 border-2 border-dashed border-sky-500/30 hover:border-sky-400 bg-slate-900/30 hover:bg-sky-950/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <div className="p-4 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.4)] group-hover:scale-110 transition-transform duration-300 mb-3">
          <UploadCloud className="w-8 h-8" />
        </div>
        <p className="font-bold text-slate-200 text-sm">Deploy Payload Across Cosmos</p>
        <p className="text-xs text-slate-400 mt-1 font-mono">Stream directly from memory • No file size boundaries</p>
      </div>

      {/* Dynamic Transfer Progress */}
      {transferProgress !== null && (
        <div className="mt-5 bg-slate-900/80 border border-sky-500/30 p-4 rounded-xl">
          <div className="flex justify-between text-xs font-mono text-sky-300 mb-1.5">
            <span className="flex items-center"><Zap className="w-3.5 h-3.5 mr-1 animate-bounce text-amber-400" /> Beam Transporting...</span>
            <span className="font-bold">{transferProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-teal-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.7)] transition-all duration-150"
              style={{ width: `${transferProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Received Downloads List */}
      {receivedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Intercepted Payloads</h4>
          <div className="space-y-2">
            {receivedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/60 border border-sky-500/20 rounded-xl">
                <div className="flex items-center space-x-2.5 truncate">
                  <File className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-200 truncate">{file.name}</span>
                </div>
                <a
                  href={file.url}
                  download={file.name}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-[0_0_10px_rgba(14,165,233,0.3)] transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Extract</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}