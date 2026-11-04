'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SOSModal from '@/components/SOSModal';
import FakeCallModal from '@/components/FakeCallModal';
import SafeZonesModal from '@/components/SafeZonesModal';
import ProfileModal from '@/components/ProfileModal';
import { sounds } from '@/lib/sound';
import { Journey, TrustedContact } from '@/lib/types';
import { UserProfile, getClientUser, setClientUser } from '@/lib/store';
import { DEMO_ROUTES } from '@/lib/demoRoutes';
import {
  Shield,
  MapPin,
  AlertTriangle,
  PhoneCall,
  Volume2,
  VolumeX,
  EyeOff,
  Users,
  Navigation,
  Clock,
  Battery,
  Car,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getClientUser());
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [fakeCallOpen, setFakeCallOpen] = useState(false);
  const [safeZonesOpen, setSafeZonesOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [jRes, cRes] = await Promise.all([
          fetch('/api/journeys'),
          fetch('/api/contacts'),
        ]);
        const jData = await jRes.json();
        const cData = await cRes.json();

        setActiveJourney(jData.activeJourney);
        setContacts(cData.contacts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    setClientUser(updated);
  };

  const handleToggleSiren = () => {
    if (sirenPlaying) {
      sounds.stopSiren();
      setSirenPlaying(false);
    } else {
      sounds.startSiren();
      setSirenPlaying(true);
    }
  };

  const handleEndJourney = async () => {
    if (!activeJourney) return;
    if (confirm('Mark this journey as safely completed? Guardians will be notified.')) {
      await fetch(`/api/journeys/${activeJourney.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      setActiveJourney(null);
    }
  };

  const startPresetJourney = async (presetId: string) => {
    const route = DEMO_ROUTES.find(r => r.id === presetId) || DEMO_ROUTES[0];
    const res = await fetch('/api/journeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originName: route.originName,
        originCoords: route.originCoords,
        destinationName: route.destinationName,
        destinationCoords: route.destinationCoords,
        mode: route.mode,
        vehicleDetails: {
          driverName: route.cabInfo.driver,
          vehicleNumber: route.cabInfo.vehicle,
          appProvider: route.cabInfo.app,
        },
        corridorPolyline: route.corridor,
        checkinIntervalMins: 15,
        estimatedArrival: new Date(Date.now() + route.durationMins * 60 * 1000).toISOString(),
      }),
    });
    const data = await res.json();
    if (data.journey) {
      setActiveJourney(data.journey);
      window.location.href = '/journey';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar
        onTriggerSOS={() => setSosModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        activeJourney={Boolean(activeJourney)}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Safety Status & Crisis Action Strip */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Monitoring Core Active • {contacts.length} Guardians Verified</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Emergency Crisis Response
            </h1>
            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
              Dispatches live GPS coordinates, vehicle registration, and emergency medical notes to your Tier 1 circle with simulated cellular alerts and 3-minute automatic escalation.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => setSosModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Trigger Emergency SOS</span>
            </button>
          </div>
        </section>

        {/* Active Journey Card or Start Journey Options */}
        {activeJourney ? (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-200 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Active Monitored Transit
                </span>
                <span className="text-xs text-stone-400 dark:text-slate-500">• {activeJourney.mode}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Battery className="w-3.5 h-3.5 text-emerald-500" />
                  {activeJourney.batteryPercent}%
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  Check-in due in 12m
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs">
                  <div className="flex flex-col items-center mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-slate-600"></span>
                    <span className="w-0.5 h-7 bg-stone-200 dark:bg-slate-700 my-0.5"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">Origin</div>
                      <div className="font-semibold text-stone-800 dark:text-slate-200">
                        {activeJourney.originName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">Destination</div>
                      <div className="font-semibold text-stone-800 dark:text-slate-200">
                        {activeJourney.destinationName}
                      </div>
                    </div>
                  </div>
                </div>

                {activeJourney.vehicleDetails && (
                  <div className="p-3 bg-stone-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between border border-stone-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-stone-500" />
                      <div>
                        <div className="font-semibold text-stone-800 dark:text-slate-200">
                          {activeJourney.vehicleDetails.driverName}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-slate-400">
                          {activeJourney.vehicleDetails.vehicleNumber} ({activeJourney.vehicleDetails.appProvider})
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-3 bg-stone-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-stone-200/60 dark:border-slate-700/60 text-xs">
                <div>
                  <h4 className="font-bold text-stone-800 dark:text-slate-200">
                    Guardians In The Loop
                  </h4>
                  <p className="text-stone-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Live GPS corridor streaming. Deviations over 350m automatically prompt safety confirmation.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link
                    href="/journey"
                    className="flex-1 py-2 px-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-semibold text-center flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open Live Map</span>
                  </Link>
                  <button
                    onClick={handleEndJourney}
                    className="py-2 px-3 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-slate-700 text-center"
                  >
                    Mark Safely Arrived
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-white">
                  Initiate Monitored Transit
                </h2>
                <p className="text-xs text-stone-500 dark:text-slate-400">
                  Select a preset transit corridor or launch custom destination tracking.
                </p>
              </div>

              <Link
                href="/journey"
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 flex items-center gap-1"
              >
                <span>Custom Route</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {DEMO_ROUTES.map(route => (
                <div
                  key={route.id}
                  className="p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-800/30 hover:border-stone-400 dark:hover:border-slate-600 transition-all space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold px-2 py-0.5 rounded bg-stone-200/60 dark:bg-slate-700 text-stone-700 dark:text-slate-300 text-[10px]">
                      {route.city}
                    </span>
                    <span className="text-stone-400">{route.durationMins} mins</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
                      {route.name}
                    </h3>
                    <p className="text-stone-500 text-[11px] truncate mt-0.5">
                      {route.originName} → {route.destinationName}
                    </p>
                  </div>

                  <button
                    onClick={() => startPresetJourney(route.id)}
                    className="w-full py-2 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl font-semibold text-stone-800 dark:text-slate-200 hover:bg-stone-50 dark:hover:bg-slate-700 flex items-center justify-center gap-1"
                  >
                    <span>Launch Monitoring</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Safety Toolkit & Countermeasures */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Discreet Safety Instruments
            </h2>
            <Link href="/toolkit" className="text-xs font-semibold text-stone-600 dark:text-slate-400 hover:underline">
              All tools →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Fake Call Generator */}
            <button
              onClick={() => setFakeCallOpen(true)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 hover:border-stone-400 dark:hover:border-slate-600 text-left space-y-2.5 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-stone-900 dark:text-white">
                  Simulate Fake Call
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Realistic ringtone & guardian voice excuse
                </p>
              </div>
            </button>

            {/* Loud Siren Toggle */}
            <button
              onClick={handleToggleSiren}
              className={`p-4 rounded-2xl border text-left space-y-2.5 transition-all shadow-sm ${
                sirenPlaying
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 hover:border-stone-400 dark:hover:border-slate-600'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                sirenPlaying ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
              }`}>
                {sirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <h3 className={`font-semibold text-xs ${sirenPlaying ? 'text-white' : 'text-stone-900 dark:text-white'}`}>
                  {sirenPlaying ? 'Stop Audio Siren' : 'Audio Siren Alarm'}
                </h3>
                <p className={`text-[11px] mt-0.5 ${sirenPlaying ? 'text-amber-100' : 'text-stone-500'}`}>
                  Synthesized high-pitch alarm
                </p>
              </div>
            </button>

            {/* Nearby Safe Havens */}
            <button
              onClick={() => setSafeZonesOpen(true)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 hover:border-stone-400 dark:hover:border-slate-600 text-left space-y-2.5 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-stone-900 dark:text-white">
                  Safe Havens Nearby
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  24/7 Police, Women Desks & Hospitals
                </p>
              </div>
            </button>

            {/* Stealth Calculator Mask */}
            <Link
              href="/stealth"
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 hover:border-stone-400 dark:hover:border-slate-600 text-left space-y-2.5 transition-all shadow-sm block"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-stone-900 dark:text-white">
                  Stealth Mask
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Calculator disguise with secret SOS (`112 =`)
                </p>
              </div>
            </Link>

          </div>
        </section>

        {/* Guardians & Emergency Hotlines Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Guardians summary */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-700 dark:text-slate-300" />
                <h3 className="font-bold text-stone-900 dark:text-white">
                  Emergency Guardian Ring
                </h3>
              </div>
              <Link href="/contacts" className="font-semibold text-stone-600 dark:text-slate-400 hover:underline">
                Manage ({contacts.length}) →
              </Link>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-slate-800">
              {contacts.slice(0, 3).map(c => (
                <div key={c.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-stone-800 dark:text-slate-200">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-stone-400">{c.relation} • {c.phone}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
                    Tier {c.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Hotlines */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-700 dark:text-slate-300" />
                <h3 className="font-bold text-stone-900 dark:text-white">
                  National Emergency Helplines
                </h3>
              </div>
              <span className="text-[10px] text-stone-400">Cellular Direct Dial</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:112"
                className="p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-stone-900 dark:text-white">112</div>
                  <div className="text-[10px] text-stone-400">National All-in-One</div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
              </a>

              <a
                href="tel:1091"
                className="p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-stone-900 dark:text-white">1091</div>
                  <div className="text-[10px] text-stone-400">Women Helpline</div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
              </a>

              <a
                href="tel:181"
                className="p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-stone-900 dark:text-white">181</div>
                  <div className="text-[10px] text-stone-400">Domestic Abuse</div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
              </a>

              <a
                href="tel:1930"
                className="p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-stone-900 dark:text-white">1930</div>
                  <div className="text-[10px] text-stone-400">Cyber Safety</div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
              </a>
            </div>
          </div>

        </section>

      </main>

      {/* Modals */}
      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        contacts={contacts}
        currentCoords={activeJourney?.currentCoords}
        journeyId={activeJourney?.id}
      />

      <FakeCallModal
        isOpen={fakeCallOpen}
        onClose={() => setFakeCallOpen(false)}
      />

      <SafeZonesModal
        isOpen={safeZonesOpen}
        onClose={() => setSafeZonesOpen(false)}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={userProfile}
        onUpdateUser={handleUpdateProfile}
      />
    </div>
  );
}
