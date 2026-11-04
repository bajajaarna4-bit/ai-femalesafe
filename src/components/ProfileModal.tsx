'use client';

import { useState } from 'react';
import { X, Shield, KeyRound, Phone, User, FileText, Check, RotateCcw } from 'lucide-react';
import { UserProfile } from '@/lib/store';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser }: ProfileModalProps) {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-stone-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-stone-700 dark:text-slate-300">
              <Shield className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                Safety Profile & Credentials
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-slate-400">
                Identity, emergency medical notes, and cancellation PIN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 dark:text-slate-300 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-stone-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 dark:text-slate-300 mb-1">
                Cellular Phone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-stone-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-slate-300 mb-1">
                False Alarm PIN
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={formData.pin}
                  onChange={e => setFormData({ ...formData, pin: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-stone-400 outline-none font-mono"
                  title="4-digit PIN required to cancel active SOS"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-slate-300 mb-1">
              Emergency Medical Notes (Dispatched with SOS)
            </label>
            <textarea
              rows={2}
              value={formData.medicalNotes}
              onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-stone-400 outline-none resize-none"
              placeholder="e.g. Asthma inhaler in bag. Blood Group O+"
            />
          </div>

          <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoAudioRecord}
                onChange={e => setFormData({ ...formData, autoAudioRecord: e.target.checked })}
                className="rounded text-stone-800 focus:ring-stone-400"
              />
              <span className="text-stone-700 dark:text-slate-300">
                Automatically package ambient audio during emergency SOS
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.stealthModeEnabled}
                onChange={e => setFormData({ ...formData, stealthModeEnabled: e.target.checked })}
                className="rounded text-stone-800 focus:ring-stone-400"
              />
              <span className="text-stone-700 dark:text-slate-300">
                Enable calculator stealth mask trigger (`112 =`)
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-stone-400">
              PIN default: <strong>1234</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold hover:opacity-90 flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : null}
                <span>{savedSuccess ? 'Saved' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

