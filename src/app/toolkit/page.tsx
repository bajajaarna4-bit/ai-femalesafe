'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import SOSModal from '@/components/SOSModal';
import FakeCallModal from '@/components/FakeCallModal';
import SafeZonesModal from '@/components/SafeZonesModal';
import ProfileModal from '@/components/ProfileModal';
import AudioRecorder from '@/components/AudioRecorder';
import { sounds } from '@/lib/sound';
import { UserProfile, getClientUser, setClientUser } from '@/lib/store';
import {
  Wrench,
  PhoneCall,
  Volume2,
  VolumeX,
  Shield,
  Building2,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

export default function ToolkitPage() {
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [fakeCallOpen, setFakeCallOpen] = useState(false);
  const [safeZonesOpen, setSafeZonesOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(getClientUser());
  const [sirenActive, setSirenActive] = useState(false);

  const toggleSiren = () => {
    if (sirenActive) {
      sounds.stopSiren();
      setSirenActive(false);
    } else {
      sounds.startSiren();
      setSirenActive(true);
    }
  };

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
            <Wrench className="w-5 h-5 text-stone-700 dark:text-slate-300" />
            <span>Safety Toolkit & Utilities</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
            Tactical safety instruments for discreet de-escalation, deterrence, and evidence gathering.
          </p>
        </div>

        {/* Primary Toolkit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Audio Evidence Recorder */}
          <AudioRecorder />

          {/* Fake Call & Loud Siren Card */}
          <div className="space-y-4">

            {/* Fake Call Generator */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white">
                    Simulate Incoming Call
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Tactical distraction phone call with realistic voice audio
                  </p>
                </div>
              </div>

              <p className="text-stone-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Creates an immediate excuse to exit an uncomfortable cab or conversation by simulating an incoming call from family asking for your location.
              </p>

              <button
                onClick={() => setFakeCallOpen(true)}
                className="w-full py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Simulate Call Screen</span>
              </button>
            </div>

            {/* Emergency Siren */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white">
                    Audio Siren Alarm
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    High-pitch synthesized alarm to attract immediate attention
                  </p>
                </div>
              </div>

              <button
                onClick={toggleSiren}
                className={`w-full py-2.5 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors ${sirenActive
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
              >
                {sirenActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{sirenActive ? 'Stop Emergency Siren' : 'Sound Alarm Siren'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Safe Zones & Checklist Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

          {/* Safe Zones Explorer Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white">
                  Safe Havens Directory
                </h3>
                <p className="text-[11px] text-stone-500">
                  24/7 Police stations, pink booths & trauma centers
                </p>
              </div>
            </div>

            <p className="text-stone-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Staffed locations where you can seek physical refuge at any hour, complete with direct phone links and maps directions.
            </p>

            <button
              onClick={() => setSafeZonesOpen(true)}
              className="w-full py-2.5 rounded-xl font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Explore Safe Havens</span>
            </button>
          </div>

          {/* Transit Safety Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-stone-700 dark:text-slate-300">
                <HeartHandshake className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white">
                  Transit Verification Habits
                </h3>
                <p className="text-[11px] text-stone-500">
                  Quick security protocol before boarding rides
                </p>
              </div>
            </div>

            <div className="space-y-2 text-stone-600 dark:text-slate-400 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Verify child-lock is disengaged from rear doors before sitting.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Confirm driver photo and vehicle registration with booking app.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Activate SAATHI Monitored Journey so guardians receive live corridor.</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        contacts={[]}
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
        onUpdateUser={updated => {
          setUserProfile(updated);
          setClientUser(updated);
        }}
      />
    </div>
  );
}
