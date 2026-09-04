import React, { useRef } from 'react';
import { UploadCloud, File, Download, XCircle, ShieldCheck } from 'lucide-react';

export default function TransferDashboard({
  onSendFile,
  receivedFiles,
  transferProgress,
  onDisconnect,
  peerName
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-lg font-bold text-slate-800">
            Active Wormhole: <span className="text-indigo-600">{peerName}</span>
          </h2>
          <span className="flex items-center text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> End-to-End Encrypted
          </span>
        </div>
        <button
          onClick={onDisconnect}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
        >
          <XCircle className="w-4 h-4" />
          <span>Sever Connection</span>
        </button>
      </div>

      {/* Dynamic File Dropper */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/40 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <div className="p-3 bg-white text-sky-600 rounded-full shadow-md mb-2">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>
        <p className="font-semibold text-slate-700 text-sm">Deploy Payload Across Hyperspace</p>
        <p className="text-xs text-slate-400 mt-1">Direct memory chunking • Infinite payload size • Any format</p>
      </div>

      {/* Real-time Progress Bar */}
      {transferProgress !== null && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Transport Stream Active</span>
            <span>{transferProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-150"
              style={{ width: `${transferProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Ephemeral Staged Downloads */}
      {receivedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Incoming Transmissions</h4>
          <div className="space-y-2">
            {receivedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center space-x-2 truncate">
                  <File className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-800 truncate">{file.name}</span>
                </div>
                <a
                  href={file.url}
                  download={file.name}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
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