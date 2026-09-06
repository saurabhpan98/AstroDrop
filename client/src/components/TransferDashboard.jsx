import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  File, 
  Download, 
  XCircle, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  FolderUp, 
  ClipboardCopy, 
  Send, 
  Check, 
  Folder 
} from 'lucide-react';
import { extractFilesFromDataTransfer } from '../utils/fileHelpers';
import { renderAvatarIcon } from '../utils/constants';

export default function TransferDashboard({
  onSendFile,
  onSendClipboardText,
  receivedFiles,
  sentFiles = [],
  transferProgress,
  transferMetrics, // { speedFormatted, etaFormatted }
  onDisconnect,
  peerName,
  peerAvatar,
  selfAvatar,
  isConnected = true
}) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const [clipboardText, setClipboardText] = useState('');
  const [showClipboardModal, setShowClipboardModal] = useState(false);

  // Drag over state for folder styling
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => onSendFile(file));
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // 1. Recursive Folder Dropper using webkitGetAsEntry
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.items) {
      const files = await extractFilesFromDataTransfer(e.dataTransfer.items);
      files.forEach(file => onSendFile(file));
    } else if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(file => onSendFile(file));
    }
  };

  const submitClipboardSnippet = (e) => {
    e.preventDefault();
    if (!clipboardText.trim()) return;
    onSendClipboardText(clipboardText.trim());
    setClipboardText('');
    setShowClipboardModal(false);
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
              <ShieldCheck className="w-3.5 h-3.5 mr-1 shrink-0" /> RAM CHUNKS ONLY • SHA-256 VERIFIED
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

      {/* 7. Animated File Transfer Trajectory Beam */}
      {transferProgress !== null && (
        <div className="mt-4 p-3 bg-gradient-to-r from-sky-50 via-indigo-50 to-sky-50 border border-sky-100 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-full bg-sky-600 text-white shadow-sm">
                {renderAvatarIcon(selfAvatar?.icon, "w-4 h-4")}
              </div>
              <span className="text-xs font-semibold text-slate-700">You</span>
            </div>

            {/* Glowing Flowing Trajectory Particle Ray */}
            <div className="flex-1 mx-4 relative h-1.5 bg-sky-200/60 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-500 animate-[pulse_1.2s_ease-in-out_infinite]" />
              <div className="absolute top-0 bottom-0 w-8 bg-white/90 rounded-full shadow-[0_0_12px_#38bdf8] animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-700">{peerName}</span>
              <div className="p-1.5 rounded-full bg-indigo-600 text-white shadow-sm">
                {renderAvatarIcon(peerAvatar?.icon, "w-4 h-4")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone with Folder & Clipboard Capabilities */}
      {isConnected && (
        <div className="space-y-3 mt-4 sm:mt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group active:scale-[0.99] ${
              isDragOver 
                ? 'border-sky-500 bg-sky-100/50 scale-[1.01]' 
                : 'border-sky-200 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50/70'
            }`}
          >
            <input 
              type="file" 
              multiple 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            {/* Native Folder Selector Fallback */}
            <input
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              ref={folderInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="p-3.5 sm:p-4 bg-sky-600 text-white rounded-2xl shadow-md shadow-sky-200 group-hover:scale-105 group-hover:bg-sky-500 transition-all duration-200 mb-2 sm:mb-3">
              <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <p className="font-bold text-slate-800 text-xs sm:text-sm text-center">
              Drop files or whole folders here
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono text-center">
              Folder structures preserved • Direct memory streaming
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95"
            >
              <FolderUp className="w-3.5 h-3.5 text-sky-600" />
              <span>Select Folder</span>
            </button>
            <button
              type="button"
              onClick={() => setShowClipboardModal(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95"
            >
              <ClipboardCopy className="w-3.5 h-3.5 text-indigo-600" />
              <span>Beam Text / Password</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Transfer Progress with Speed & ETA Metrics */}
      {transferProgress !== null && (
        <div className="mt-4 sm:mt-5 bg-slate-50 border border-slate-200/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl">
          <div className="flex justify-between text-xs font-mono text-slate-700 mb-1.5">
            <span className="flex items-center font-medium">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-500 animate-pulse" />
              Streaming: <strong className="ml-1 text-slate-900">{transferMetrics?.speedFormatted || '0 B/s'}</strong>
            </span>
            <span className="font-bold text-sky-600">
              {transferProgress}% {transferMetrics?.etaFormatted && `(${transferMetrics.etaFormatted})`}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-150"
              style={{ width: `${transferProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Received Downloads List with SHA-256 Checksum Tag */}
      {receivedFiles.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center">
            <Download className="w-3.5 h-3.5 mr-1 text-sky-600" />
            Received Files ({receivedFiles.length})
          </h4>
          <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {receivedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs gap-2">
                <div className="flex items-center space-x-2 truncate">
                  {file.isFolderItem ? (
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-sky-600 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="text-xs font-medium text-slate-800 truncate block">
                      {file.relativePath || file.name}
                    </span>
                    {/* 4. Integrity Verified Badge */}
                    {file.checksum && (
                      <span className="inline-flex items-center text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                        <Check className="w-2.5 h-2.5 mr-0.5" /> SHA-256 Verified
                      </span>
                    )}
                  </div>
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
                  {file.isFolderItem ? (
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {file.relativePath || file.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                  Delivered
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Send Clipboard Snippet Modal */}
      {showClipboardModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowClipboardModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-100 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-slate-800 text-sm mb-1">Beam Clipboard Snippet</h4>
            <p className="text-xs text-slate-400 mb-3">
              Transmit a code block, URL, or password instantly as a pure memory payload.
            </p>
            <form onSubmit={submitClipboardSnippet} className="space-y-3">
              <textarea
                rows={4}
                required
                value={clipboardText}
                onChange={(e) => setClipboardText(e.target.value)}
                placeholder="Paste code, private note, or link here..."
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowClipboardModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 flex items-center justify-center space-x-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Beam</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}