'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Volume2, UserCheck, Shield } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FakeCallModal({ isOpen, onClose }: FakeCallModalProps) {
  const [callerName, setCallerName] = useState('Papa (Home)');
  const [callState, setCallState] = useState<'RINGING' | 'IN_CALL' | 'ENDED'>('RINGING');
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCallState('RINGING');
      setCallSeconds(0);
      sounds.startPhoneRingtone();
    } else {
      sounds.stopPhoneRingtone();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (callState === 'IN_CALL') {
      interval = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleAnswer = () => {
    sounds.stopPhoneRingtone();
    setCallState('IN_CALL');
    sounds.speakFakeCaller(
      `Beta, where is your cab right now? We are standing outside the society gate with security. Send me your live link again.`
    );
  };

  const handleDecline = () => {
    sounds.stopPhoneRingtone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('ENDED');
    onClose();
  };

  const triggerVoicePrompt = (text: string) => {
    sounds.speakFakeCaller(text);
  };

  if (!isOpen) return null;

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-black text-white rounded-[40px] shadow-2xl border-4 border-slate-800 p-7 flex flex-col justify-between min-h-[580px] relative overflow-hidden">
        
        {/* Top subtle notch */}
        <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4"></div>

        {/* Caller Avatar & Info */}
        <div className="text-center space-y-4 my-auto">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-4xl shadow-xl mx-auto">
              👨‍👧
            </div>
            {callState === 'RINGING' && (
              <span className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-50"></span>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold tracking-tight">{callerName}</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
              {callState === 'RINGING' ? 'Incoming Cellular Call...' : `In Call • ${formatCallTime(callSeconds)}`}
            </p>
          </div>

          {/* Quick presets for caller persona */}
          {callState === 'RINGING' && (
            <div className="flex justify-center gap-2 pt-2">
              {['Papa (Home)', 'Rohan (Partner)', 'Bhaiya'].map(name => (
                <button
                  key={name}
                  onClick={() => setCallerName(name)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                    callerName === name
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Call Voice Prompts */}
        {callState === 'IN_CALL' && (
          <div className="space-y-2 py-4 border-t border-b border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Tap to replay simulated guardian voice:
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() =>
                  triggerVoicePrompt(
                    'Hey, Dad and I are waiting right at the main gate. How far is the cab driver now?'
                  )
                }
                className="w-full text-left text-xs bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 flex items-center gap-2"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">"Dad and I are waiting at the gate..."</span>
              </button>
              <button
                onClick={() =>
                  triggerVoicePrompt(
                    'Did you send the cab vehicle number? I am sharing it with our local police helpline.'
                  )
                }
                className="w-full text-left text-xs bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 flex items-center gap-2"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">"Did you send the cab license plate?"</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4">
          {callState === 'RINGING' ? (
            <div className="flex items-center justify-around">
              {/* Decline button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleDecline}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/40 transition-transform active:scale-95"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-xs text-slate-400 font-medium">Decline</span>
              </div>

              {/* Answer button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleAnswer}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/40 animate-bounce transition-transform active:scale-95"
                >
                  <Phone className="w-7 h-7" />
                </button>
                <span className="text-xs text-emerald-400 font-medium">Answer</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleDecline}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/40 transition-transform active:scale-95"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs text-slate-400 font-medium">End Call</span>
            </div>
          )}
        </div>

        {/* Discreet Tip */}
        <div className="text-[10px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-rose-500" />
          <span>Simulated distraction call for discreet exit</span>
        </div>
      </div>
    </div>
  );
}

