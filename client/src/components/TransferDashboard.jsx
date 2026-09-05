import React, { useRef } from 'react';
import { UploadCloud, File, Download, XCircle, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

export default function TransferDashboard({
  onSendFile,
  receivedFiles,
  sentFiles = [],
  transferProgress,
  onDisconnect,
  peerName,
  isConnected = true
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="cosmic-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 relative overflow-hidden mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Concentric Centered Status Indicator */}
          <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inset-0 inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-xs"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            )}
          </div>
          <div className="truncate min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">
              {isConnected ? (
                <>Connected: <span className="text-sky-600">{peerName}</span></>
              ) : (
                <span className="text-amber-700">Wormhole Terminated</span>
              )}
            </h2>
            <span className="flex items-center text-[10px] text-emerald-600 font-mono font-medium tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 shrink-0" /> RAM CHUNKS ONLY • ZERO TRACE
            </span>
          </div>
        </div>
        {isConnected && (
          <button
            onClick={onDisconnect}
            className="w-full sm:w-auto justify-center flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 hover:bg-rose-100 transition shadow-xs active:scale-95 shrink-0"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        )}
      </div>

      {/* File Dropzone */}
      {isConnected && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 sm:mt-6 border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50/70 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group active:scale-[0.99]"
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <div className="p-3.5 sm:p-4 bg-sky-600 text-white rounded-2xl shadow-md shadow-sky-200 group-hover:scale-105 group-hover:bg-sky-500 transition-all duration-200 mb-2 sm:mb-3">
            <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <p className="font-bold text-slate-800 text-xs sm:text-sm text-center">Tap or Drop to send file</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono text-center">Direct stream memory transfer</p>
        </div>
      )}

      {/* Transfer Progress */}
      {transferProgress !== null && (
        <div className="mt-4 sm:mt-5 bg-slate-50 border border-slate-200/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
          <div className="flex justify-between text-xs font-mono text-slate-700 mb-1.5">
            <span className="flex items-center font-medium">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-500 animate-pulse" />
              Streaming...
            </span>
            <span className="font-bold text-sky-600">{transferProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-150"
              style={{ width: `${transferProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Received Downloads List */}
      {receivedFiles.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center">
            <Download className="w-3.5 h-3.5 mr-1 text-sky-600" />
            Received Files ({receivedFiles.length})
          </h4>
          <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {receivedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs gap-2">
                <div className="flex items-center space-x-2 truncate">
                  <File className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 truncate">{file.name}</span>
                </div>
                <a
                  href={file.url}
                  download={file.name}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition shrink-0 active:scale-95"
                >
                  <Download className="w-3 h-3" />
                  <span>Get</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Payloads List */}
      {sentFiles.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Sent Files ({sentFiles.length})
          </h4>
          <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {sentFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl gap-2">
                <div className="flex items-center space-x-2 truncate">
                  <File className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-700 truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">({formatFileSize(file.size)})</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                  Delivered
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}