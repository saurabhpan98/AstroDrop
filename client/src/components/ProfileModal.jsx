import React, { useState } from 'react';
import { X, Check, Edit2 } from 'lucide-react';
import { AVATARS, renderAvatarIcon } from '../utils/constants';

export default function ProfileModal({ isOpen, onClose, currentProfile, onSave }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState(currentProfile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile.avatar);

  const handleSave = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    onSave({ username: username.trim(), avatar: selectedAvatar });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600">
              <Edit2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Customize Voyager Identity</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Voyager Handle
            </label>
            <input
              type="text"
              maxLength={24}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
              placeholder="Enter unique handle"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Vector Insignia
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar.id === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-200 scale-105 ring-2 ring-sky-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                    title={av.name}
                  >
                    {renderAvatarIcon(av.icon, "w-5 h-5")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}