'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SOSModal from '@/components/SOSModal';
import ProfileModal from '@/components/ProfileModal';
import { Journey, EmergencyAlert } from '@/lib/types';
import { UserProfile, getClientUser, setClientUser } from '@/lib/store';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Car,
  ShieldAlert,
} from 'lucide-react';

export default function HistoryPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getClientUser());
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      try {
        const [jRes, aRes] = await Promise.all([
          fetch('/api/journeys'),
          fetch('/api/sos'),
        ]);
        const jData = await jRes.json();
        const aData = await aRes.json();
        setJourneys(jData.allJourneys || []);
        setAlerts(aData.alerts || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <Navbar
        onTriggerSOS={() => setSosModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-stone-700 dark:text-slate-300" />
            <span>Transit & Emergency Audit Logs</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
            Immutable audit record of verified journey corridors, check-in confirmations, and emergency dispatches.
          </p>
        </div>

        {/* Safety Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-stone-400 text-[10px] uppercase font-semibold">TRIPS MONITORED</div>
            <div className="text-xl font-bold text-stone-900 dark:text-white">
              {journeys.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">100% Consent Logged</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-stone-400 text-[10px] uppercase font-semibold">SAFETY RATING</div>
            <div className="text-xl font-bold text-emerald-600">
              98 / 100
            </div>
            <div className="text-[11px] text-stone-400">Low corridor risk</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-stone-400 text-[10px] uppercase font-semibold">DISPATCHED ALERTS</div>
            <div className="text-xl font-bold text-rose-600">
              {alerts.length}
            </div>
            <div className="text-[11px] text-stone-400">Prompt guardian sync</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-stone-400 text-[10px] uppercase font-semibold">CHECK-IN CONFIRMATION</div>
            <div className="text-xl font-bold text-sky-600">
              99.4%
            </div>
            <div className="text-[11px] text-stone-400">Timely confirmations</div>
          </div>
        </div>

        {/* Emergency SOS History */}
        {alerts.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h2 className="font-bold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
                Emergency Crisis Dispatch History
              </h2>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-slate-800 text-xs">
              {alerts.map(a => (
                <div key={a.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 dark:text-white">
                        {a.triggerType.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        a.status === 'CANCELLED'
                          ? 'bg-stone-100 dark:bg-slate-800 text-stone-600'
                          : a.status === 'ACKNOWLEDGED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-stone-400 text-[11px] mt-0.5">
                      Triggered {new Date(a.triggeredAt).toLocaleString()} • {a.addressApprox}
                    </p>
                    {a.cancellationReason && (
                      <p className="text-emerald-600 text-[11px] mt-0.5">
                        Resolution: {a.cancellationReason}
                      </p>
                    )}
                  </div>

                  {a.acknowledgedBy && a.acknowledgedBy.length > 0 && (
                    <div className="text-[11px] text-stone-500 sm:text-right">
                      Acknowledged by: <strong className="text-stone-700 dark:text-slate-300">{a.acknowledgedBy[0].contactName}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitored Journey Records */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
              Monitored Journeys
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            {journeys.map(j => (
              <div
                key={j.id}
                className="p-3.5 rounded-2xl border border-stone-100 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-800/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 dark:text-white text-xs">
                      {j.originName} → {j.destinationName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-200/80 dark:bg-slate-700 text-stone-700 dark:text-slate-300">
                      {j.mode}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    j.status === 'COMPLETED'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : j.status === 'ACTIVE'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 animate-pulse'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-600'
                  }`}>
                    {j.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-500 text-[11px]">
                  <div>
                    <span>Started: </span>
                    <strong className="text-stone-700 dark:text-slate-300">
                      {new Date(j.startedAt).toLocaleTimeString()}
                    </strong>
                  </div>
                  <div>
                    <span>Driver: </span>
                    <strong className="text-stone-700 dark:text-slate-300">
                      {j.vehicleDetails?.driverName || 'Cab Driver'}
                    </strong>
                  </div>
                  <div>
                    <span>Check-ins: </span>
                    <strong className="text-stone-700 dark:text-slate-300">
                      Every {j.checkinIntervalMins}m
                    </strong>
                  </div>
                  <div>
                    <span>Risk Level: </span>
                    <strong className="text-emerald-600">
                      {j.riskLevel}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        contacts={[]}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={userProfile}
        onUpdateUser={updated => {
          setUserProfile(updated);
          setClientUser(updated);
        }}
      />
    </div>
  );
}
