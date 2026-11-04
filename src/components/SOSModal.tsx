'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Volume2, VolumeX, X, ShieldAlert, CheckCircle2, Phone, Share2, KeyRound } from 'lucide-react';
import { sounds } from '@/lib/sound';
import { EmergencyAlert, TrustedContact } from '@/lib/types';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: TrustedContact[];
  currentCoords?: { lat: number; lng: number };
  journeyId?: string;
}

export default function SOSModal({ isOpen, onClose, contacts, currentCoords, journeyId }: SOSModalProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sirenActive, setSirenActive] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState<EmergencyAlert | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [showCancelPin, setShowCancelPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [cancelReason, setCancelReason] = useState('Accidental trigger / User confirmed safe');
  const [errorMsg, setErrorMsg] = useState('');
  const [escalationSeconds, setEscalationSeconds] = useState(180);

  useEffect(() => {
    if (isOpen && !alertDispatched) {
      setCountdown(5);
      sounds.playWarningChime();
    } else if (!isOpen) {
      setCountdown(null);
      setSirenActive(false);
      sounds.stopSiren();
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown === null || alertDispatched) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        sounds.playBeep(700, 0.1);
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      triggerEmergencyDispatch();
    }
  }, [countdown, alertDispatched]);

  useEffect(() => {
    if (!alertDispatched || alertDispatched.status === 'CANCELLED') return;
    const interval = setInterval(() => {
      setEscalationSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [alertDispatched]);

  const toggleSiren = () => {
    if (sirenActive) {
      sounds.stopSiren();
      setSirenActive(false);
    } else {
      sounds.startSiren();
      setSirenActive(true);
    }
  };

  const cancelCountdown = () => {
    sounds.stopSiren();
    setSirenActive(false);
    setCountdown(null);
    onClose();
  };

  const triggerEmergencyDispatch = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journeyId,
          coords: currentCoords,
          triggerType: 'MANUAL_SOS',
          addressApprox: 'Active Transit Route (Live Coordinates Recorded)',
        }),
      });
      const data = await res.json();
      if (data.alert) {
        setAlertDispatched(data.alert);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCancelSOSWithPin = async () => {
    if (!alertDispatched) return;
    setErrorMsg('');
    try {
      const res = await fetch(`/api/sos/${alertDispatched.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pinInput,
          reason: cancelReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid PIN');
        return;
      }
      sounds.stopSiren();
      setSirenActive(false);
      setAlertDispatched(null);
      setShowCancelPin(false);
      setPinInput('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Cancellation error');
    }
  };

  if (!isOpen) return null;

  const guardianUrl = typeof window !== 'undefined' && alertDispatched
    ? `${window.location.origin}/guardian/${alertDispatched.journeyId || 'journey_active_demo'}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header Banner - Calm, purposeful emergency visual */}
        <div className="bg-rose-600 dark:bg-rose-700 p-5 text-white text-center relative">
          <button
            onClick={cancelCountdown}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/15 mx-auto flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Crisis Assistance Protocol</h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Real-time coordinates dispatch to verified guardians
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          
          {/* Phase 1: 5-Second Tactile Countdown Screen */}
          {countdown !== null && countdown > 0 && !alertDispatched && (
            <div className="text-center space-y-5">
              <div className="space-y-1">
                <span className="text-5xl font-black text-rose-600 dark:text-rose-500 font-mono">
                  00:0{countdown}
                </span>
                <p className="text-stone-600 dark:text-slate-300 font-medium text-xs">
                  Transmitting emergency dispatch in {countdown} seconds...
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={toggleSiren}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-medium text-xs transition-colors ${
                    sirenActive
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sirenActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{sirenActive ? 'Mute Siren' : 'Trigger Audio Siren'}</span>
                </button>

                <button
                  onClick={cancelCountdown}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-white hover:bg-stone-300 dark:hover:bg-slate-600"
                >
                  Cancel (Accidental Press)
                </button>
              </div>

              <p className="text-[11px] text-stone-400">
                Cancel immediately if tapped accidentally. No notification will be sent.
              </p>
            </div>
          )}

          {/* Phase 2: Active Dispatched Screen */}
          {alertDispatched && !showCancelPin && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/40">
                <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-rose-950 dark:text-rose-200 text-xs">
                    Distress Signal Active & Broadcasting
                  </h4>
                  <p className="text-[11px] text-rose-800 dark:text-rose-300">
                    Live GPS stream shared with {contacts.length} emergency contacts.
                  </p>
                </div>
              </div>

              {/* Tier 2 Escalation countdown bar */}
              <div className="bg-stone-50 dark:bg-slate-800/80 p-3 rounded-xl border border-stone-200 dark:border-slate-700 text-xs flex justify-between items-center text-stone-700 dark:text-slate-300">
                <span className="text-[11px]">Tier 2 Auto-Escalation window:</span>
                <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                  {Math.floor(escalationSeconds / 60)}:{(escalationSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Notified Contacts Status List */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Contact Dispatch Status
                </div>
                <div className="divide-y divide-stone-100 dark:divide-slate-800 max-h-36 overflow-y-auto">
                  {contacts.map(c => (
                    <div key={c.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-stone-800 dark:text-slate-200">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-stone-400 ml-1">({c.relation})</span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Sent
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Guardian Live Link */}
              <div className="bg-stone-50 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs border border-stone-200/80 dark:border-slate-700/60">
                <div className="truncate font-mono text-[11px] text-stone-600 dark:text-slate-300">
                  {guardianUrl}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(guardianUrl);
                    alert('Guardian Live Tracking link copied!');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 text-[11px] font-semibold hover:bg-stone-50 flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" /> Copy
                </button>
              </div>

              {/* Emergency Hotline Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-1.5 py-2 bg-stone-900 dark:bg-slate-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Police (112)
                </a>
                <a
                  href="tel:1091"
                  className="flex items-center justify-center gap-1.5 py-2 bg-stone-800 dark:bg-slate-200 text-white dark:text-stone-900 rounded-xl text-xs font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" /> Women Desk (1091)
                </a>
              </div>

              {/* False alarm cancellation button */}
              <div className="pt-1">
                <button
                  onClick={() => setShowCancelPin(true)}
                  className="w-full py-2 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Cancel SOS (Requires Safety PIN)</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase 3: Cancel SOS with Security PIN */}
          {showCancelPin && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-bold text-stone-800 dark:text-slate-100 text-sm">
                  Verify Cancellation PIN
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Enter your 4-digit PIN to authenticate that you are safe. (Default: 1234)
                </p>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2.5">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="PIN"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full text-center text-xl tracking-widest font-mono py-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-1 focus:ring-stone-400"
                />

                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Accidental button trigger">Accidental button trigger</option>
                  <option value="Driver explained safe alternate route">Driver explained safe alternate route</option>
                  <option value="Reached destination safely with family">Reached destination safely with family</option>
                  <option value="Situation safely resolved">Situation safely resolved</option>
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowCancelPin(false)}
                  className="flex-1 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300"
                >
                  Back
                </button>
                <button
                  onClick={handleCancelSOSWithPin}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Confirm I Am Safe
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
