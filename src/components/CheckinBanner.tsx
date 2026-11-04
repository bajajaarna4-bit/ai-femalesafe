'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface CheckinBannerProps {
  nextCheckinDue: string;
  onConfirmCheckin: () => void;
  onCheckinMissed: () => void;
}

export default function CheckinBanner({
  nextCheckinDue,
  onConfirmCheckin,
  onCheckinMissed,
}: CheckinBannerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [hasNotifiedMissed, setHasNotifiedMissed] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const due = new Date(nextCheckinDue).getTime();
      const diffSec = Math.floor((due - now) / 1000);

      // We show warning if diffSec <= 60
      setSecondsRemaining(diffSec);

      if (diffSec <= 0 && !hasNotifiedMissed) {
        setHasNotifiedMissed(true);
        sounds.playWarningChime();
        onCheckinMissed();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextCheckinDue, hasNotifiedMissed, onCheckinMissed]);

  const handleConfirm = () => {
    sounds.playCheckinChime();
    setHasNotifiedMissed(false);
    onConfirmCheckin();
  };

  // Only display banner if check-in is due within 2 minutes or overdue
  if (secondsRemaining > 120) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-3 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Next scheduled safety check-in in {Math.round(secondsRemaining / 60)} mins</span>
        </div>
        <button
          onClick={handleConfirm}
          className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
        >
          Check-in Now
        </button>
      </div>
    );
  }

  const isOverdue = secondsRemaining <= 0;

  return (
    <div
      className={`rounded-2xl p-4 border shadow-md transition-all ${
        isOverdue
          ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 animate-pulse'
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isOverdue ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">
              {isOverdue ? 'Safety Check-in Overdue!' : 'Scheduled Safety Check-in'}
            </h4>
            <p className="text-xs opacity-80">
              {isOverdue
                ? 'Contacts will be notified if unconfirmed.'
                : `Please confirm your status within ${Math.max(0, secondsRemaining)}s.`}
            </p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <CheckCircle className="w-4 h-4" />
          <span>I am Safe & Ok</span>
        </button>
      </div>
    </div>
  );
}

