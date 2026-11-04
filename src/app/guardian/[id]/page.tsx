'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { Journey, EmergencyAlert } from '@/lib/types';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Phone,
  MessageCircle,
  Battery,
  Clock,
  Car,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Share2,
} from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] bg-stone-100 dark:bg-slate-800/80 animate-pulse rounded-2xl flex items-center justify-center text-xs text-stone-400">
      Loading Guardian Map Stream...
    </div>
  ),
});

export default function GuardianTrackingPage() {
  const params = useParams();
  const journeyId = params.id as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [actionNote, setActionNote] = useState('I am reaching out to her right now.');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchLiveState = async () => {
    try {
      const [jRes, aRes] = await Promise.all([
        fetch(`/api/journeys/${journeyId}`),
        fetch('/api/sos'),
      ]);
      if (jRes.ok) {
        const jData = await jRes.json();
        setJourney(jData.journey);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setActiveAlert(aData.activeAlert);
        if (aData.activeAlert?.status === 'ACKNOWLEDGED') {
          setAcknowledged(true);
        }
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 3000);
    return () => clearInterval(interval);
  }, [journeyId]);

  const handleAcknowledge = async () => {
    if (!activeAlert) return;
    setIsAcknowledging(true);
    try {
      const res = await fetch(`/api/sos/${activeAlert.id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: 'ct_1',
          contactName: 'Priya Sharma (Guardian)',
          actionNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAcknowledged(true);
        setActiveAlert(data.alert);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAcknowledging(false);
    }
  };

  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2 max-w-sm">
          <div className="w-8 h-8 rounded-full border-2 border-stone-800 dark:border-white border-t-transparent animate-spin mx-auto" />
          <h2 className="text-sm font-semibold text-stone-800 dark:text-slate-200">
            Connecting to SAATHI Guardian Stream...
          </h2>
          <p className="text-[11px] text-stone-400">
            Establishing verified GPS telemetry for authorized contact.
          </p>
        </div>
      </div>
    );
  }

  const isEmergency = journey.status === 'EMERGENCY' || Boolean(activeAlert && activeAlert.status !== 'CANCELLED');

  return (
    <div className="min-h-screen pb-16">
      
      {/* Top Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 border-b border-stone-200 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-slate-100 text-white dark:text-stone-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-stone-900 dark:text-white">SAATHI AI</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300">
                  GUARDIAN PORTAL
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-slate-400">
                Tracking: <strong className="text-stone-800 dark:text-slate-200">{journey.userName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] text-stone-400 hidden sm:inline font-mono">
              Synced {lastRefreshed.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchLiveState}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-600 dark:text-slate-300"
              title="Refresh GPS"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-4">
        
        {/* Emergency Alert Banner if Active */}
        {isEmergency && (
          <div className="bg-rose-600 text-white rounded-3xl p-5 shadow-lg space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-white text-rose-700 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-1">
                    SOS CRISIS ACTIVE
                  </span>
                  <h2 className="text-base font-bold">
                    Emergency Alert Triggered by {journey.userName}
                  </h2>
                  <p className="text-xs text-rose-100">
                    Latest GPS broadcasted at {new Date(activeAlert?.triggeredAt || journey.startedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Recipient Acknowledgement Action */}
            {!acknowledged ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 space-y-2.5 border border-white/20 text-xs">
                <div className="font-semibold uppercase tracking-wider text-[11px] text-white">
                  Guardian Action Protocol:
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={actionNote}
                    onChange={e => setActionNote(e.target.value)}
                    className="flex-1 text-xs p-2 rounded-xl bg-white text-stone-900 font-medium"
                  >
                    <option value="I am reaching out to her right now.">
                      I am reaching out to her right now.
                    </option>
                    <option value="I am calling local police assistance (112).">
                      I am calling local police assistance (112).
                    </option>
                    <option value="I am heading to her current GPS coordinates.">
                      I am heading to her current GPS coordinates.
                    </option>
                  </select>

                  <button
                    onClick={handleAcknowledge}
                    disabled={isAcknowledging}
                    className="px-5 py-2 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAcknowledging ? 'Confirming...' : 'Acknowledge Emergency'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-rose-100">
                  * Acknowledging immediately notifies the user that you are responding and resets unacknowledged escalation countdowns.
                </p>
              </div>
            ) : (
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">
                    Alert Acknowledged by You
                  </span>
                  <p className="text-rose-100 text-[11px]">
                    User informed. Other contacts can see that you are coordinating assistance.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Map */}
        <div className="h-[400px] sm:h-[460px] w-full rounded-3xl overflow-hidden shadow-sm border border-stone-200 dark:border-slate-800 relative">
          <MapComponent
            currentCoords={journey.currentCoords}
            originCoords={journey.originCoords}
            destinationCoords={journey.destinationCoords}
            corridor={journey.corridorPolyline}
            breadcrumbs={journey.breadcrumbs}
            riskLevel={journey.riskLevel}
            showSafePlaces={true}
          />

          {/* Quick Contact Controls */}
          <div className="absolute top-3 right-3 z-[400] flex gap-2">
            <a
              href={`tel:${journey.userPhone}`}
              className="bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs py-1.5 px-3 rounded-full shadow-md flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3" /> Call {journey.userName.split(' ')[0]}
            </a>
            <a
              href={`https://wa.me/${journey.userPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-1.5 px-3 rounded-full shadow-md flex items-center gap-1.5"
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Journey Details & Device Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 space-y-1.5">
            <div className="text-stone-400 text-[10px] uppercase font-semibold">ROUTE</div>
            <div className="font-semibold text-stone-800 dark:text-slate-200">
              {journey.originName}
            </div>
            <div className="text-stone-400 text-[10px]">to</div>
            <div className="font-semibold text-stone-800 dark:text-slate-200">
              {journey.destinationName}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 space-y-1.5">
            <div className="text-stone-400 text-[10px] uppercase font-semibold">VEHICLE DETAILS</div>
            <div className="font-semibold text-stone-800 dark:text-slate-200">
              {journey.vehicleDetails?.driverName || 'Cab Driver'}
            </div>
            <div className="text-stone-500 text-[11px]">
              Plate: <strong>{journey.vehicleDetails?.vehicleNumber || 'DL-1ZA-4821'}</strong>
            </div>
            <div className="text-stone-500 text-[11px]">
              App: {journey.vehicleDetails?.appProvider || 'Uber Premier'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 space-y-1.5">
            <div className="text-stone-400 text-[10px] uppercase font-semibold">TELEMETRY</div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Battery className="w-3.5 h-3.5" />
              <span>Battery: {journey.batteryPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Transit Status: <strong>{journey.status}</strong></span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
