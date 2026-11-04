'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import SOSModal from '@/components/SOSModal';
import RiskAnalysisCard from '@/components/RiskAnalysisCard';
import CheckinBanner from '@/components/CheckinBanner';
import SafeZonesModal from '@/components/SafeZonesModal';
import ProfileModal from '@/components/ProfileModal';
import { Journey, LatLng, TrustedContact } from '@/lib/types';
import { UserProfile, getClientUser, setClientUser } from '@/lib/store';
import { DEMO_ROUTES } from '@/lib/demoRoutes';
import {
  Navigation,
  Play,
  Pause,
  AlertTriangle,
  Battery,
  Clock,
  Car,
  Share2,
  CheckCircle,
  Compass,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-stone-100 dark:bg-slate-800/80 animate-pulse rounded-2xl flex items-center justify-center text-xs text-stone-400">
      Initializing Navigation Map...
    </div>
  ),
});

export default function JourneyPage() {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getClientUser());
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [safeZonesOpen, setSafeZonesOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [simSpeedMs, setSimSpeedMs] = useState(2000);
  const [useRealGPS, setUseRealGPS] = useState(false);
  const [gpsErrorBanner, setGpsErrorBanner] = useState<string | null>(null);
  const [stoppedMins, setStoppedMins] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const simTimerRef = useRef<any>(null);

  const fetchJourney = async () => {
    try {
      const res = await fetch('/api/journeys');
      const data = await res.json();
      if (data.activeJourney) {
        setJourney(data.activeJourney);
      } else {
        const route = DEMO_ROUTES[0];
        const postRes = await fetch('/api/journeys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originName: route.originName,
            originCoords: route.originCoords,
            destinationName: route.destinationName,
            destinationCoords: route.destinationCoords,
            corridorPolyline: route.corridor,
            mode: route.mode,
            vehicleDetails: {
              driverName: route.cabInfo.driver,
              vehicleNumber: route.cabInfo.vehicle,
              appProvider: route.cabInfo.app,
            },
            checkinIntervalMins: 15,
          }),
        });
        const postData = await postRes.json();
        setJourney(postData.journey);
      }

      const cRes = await fetch('/api/contacts');
      const cData = await cRes.json();
      setContacts(cData.contacts || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJourney();
  }, []);

  // Handle Real GPS tracking via navigator.geolocation with graceful error handling
  useEffect(() => {
    if (useRealGPS && typeof window !== 'undefined' && 'geolocation' in navigator) {
      setGpsErrorBanner(null);
      watchIdRef.current = navigator.geolocation.watchPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          updateLocationOnServer(coords, pos.coords.speed ? pos.coords.speed * 3.6 : 28);
        },
        err => {
          console.warn('GPS error', err);
          setGpsErrorBanner('Device location access denied or timed out. Gracefully switched back to Simulated Route Mode.');
          setUseRealGPS(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [useRealGPS]);

  // Simulation movement step interval
  useEffect(() => {
    if (!isSimulating || !journey || journey.corridorPolyline.length === 0) return;

    simTimerRef.current = setInterval(() => {
      setSimStepIndex(prev => {
        const next = (prev + 1) % journey.corridorPolyline.length;
        const nextCoord = journey.corridorPolyline[next];
        updateLocationOnServer(nextCoord, 36);
        return next;
      });
    }, simSpeedMs);

    return () => clearInterval(simTimerRef.current);
  }, [isSimulating, journey, simSpeedMs]);

  const updateLocationOnServer = async (coords: LatLng, speedKmH = 30, extra = {}) => {
    if (!journey) return;
    try {
      const res = await fetch(`/api/journeys/${journey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coords,
          speedKmH,
          stoppedDurationMins: stoppedMins,
          ...extra,
        }),
      });
      const data = await res.json();
      if (data.journey) {
        setJourney(data.journey);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!journey) return;
    const res = await fetch(`/api/journeys/${journey.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CONFIRM_CHECKIN' }),
    });
    const data = await res.json();
    if (data.journey) {
      setJourney(data.journey);
    }
  };

  const handleCheckinMissed = () => {
    if (!journey) return;
    updateLocationOnServer(journey.currentCoords, 0, { action: 'CHECKIN_MISSED' });
  };

  // Hackathon Demonstration Triggers
  const handleTriggerDeviation = () => {
    if (!journey) return;
    setIsSimulating(false);
    const route = DEMO_ROUTES.find(r => r.name === journey.originName) || DEMO_ROUTES[0];
    updateLocationOnServer(route.deviationWaypoint, 20);
  };

  const handleTriggerStop = () => {
    if (!journey) return;
    setIsSimulating(false);
    setStoppedMins(6);
    updateLocationOnServer(journey.currentCoords, 0);
  };

  const handleTriggerLowBattery = () => {
    if (!journey) return;
    updateLocationOnServer(journey.currentCoords, 25, { batteryPercent: 9 });
  };

  const handleResetRisk = () => {
    if (!journey) return;
    setStoppedMins(0);
    const startCoord = journey.corridorPolyline[0] || journey.originCoords;
    setSimStepIndex(0);
    updateLocationOnServer(startCoord, 30, { batteryPercent: 88, status: 'ACTIVE' });
  };

  const handleEndJourney = async () => {
    if (!journey) return;
    if (confirm('Complete this journey? Authorized guardians will be notified that you reached safely.')) {
      await fetch(`/api/journeys/${journey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      window.location.href = '/';
    }
  };

  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-stone-800 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-500 font-medium">Connecting to live tracking...</p>
        </div>
      </div>
    );
  }

  const guardianUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/guardian/${journey.id}`
    : '';

  return (
    <div className="min-h-screen pb-20">
      <Navbar
        onTriggerSOS={() => setSosModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        activeJourney={true}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {/* GPS Error Notification if Geolocation was denied */}
        {gpsErrorBanner && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 rounded-2xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{gpsErrorBanner}</span>
            </div>
            <button
              onClick={() => setGpsErrorBanner(null)}
              className="font-bold underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Safety Checkin Banner */}
        <CheckinBanner
          nextCheckinDue={journey.nextCheckinDue}
          onConfirmCheckin={handleConfirmCheckin}
          onCheckinMissed={handleCheckinMissed}
        />

        {/* Main Grid: Interactive Map + Journey Risk Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Map Column (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Interactive Leaflet Map */}
            <div className="h-[440px] sm:h-[490px] w-full relative">
              <MapComponent
                currentCoords={journey.currentCoords}
                originCoords={journey.originCoords}
                destinationCoords={journey.destinationCoords}
                corridor={journey.corridorPolyline}
                breadcrumbs={journey.breadcrumbs}
                riskLevel={journey.riskLevel}
                showSafePlaces={true}
              />

              {/* Floating Emergency SOS Pill on Map */}
              <button
                onClick={() => setSosModalOpen(true)}
                className="absolute top-3 right-3 z-[400] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-full shadow-md flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 fill-white" />
                <span>SOS Trigger</span>
              </button>
            </div>

            {/* GPS & Simulation Controls Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsSimulating(false);
                    setUseRealGPS(!useRealGPS);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors ${
                    useRealGPS
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{useRealGPS ? 'Device GPS Active' : 'Enable Device GPS'}</span>
                </button>

                {!useRealGPS && (
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors ${
                      isSimulating
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300'
                    }`}
                  >
                    {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isSimulating ? 'Pause Sim' : 'Play Motion Sim'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSafeZonesOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300 text-[11px] font-medium"
                >
                  Safe Havens
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(guardianUrl);
                    alert('Guardian Live link copied!');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" /> Share
                </button>
              </div>
            </div>

            {/* Vehicle & Ride Details */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <div className="text-stone-400 text-[10px] uppercase font-medium">DRIVER</div>
                  <div className="font-semibold text-stone-800 dark:text-slate-200">
                    {journey.vehicleDetails?.driverName || 'Verified Driver'}
                  </div>
                </div>
                <div>
                  <div className="text-stone-400 text-[10px] uppercase font-medium">VEHICLE PLATE</div>
                  <div className="font-semibold text-stone-800 dark:text-slate-200">
                    {journey.vehicleDetails?.vehicleNumber || 'DL-1ZA-4821'}
                  </div>
                </div>
                <div>
                  <div className="text-stone-400 text-[10px] uppercase font-medium">APP / SERVICE</div>
                  <div className="font-semibold text-stone-800 dark:text-slate-200">
                    {journey.vehicleDetails?.appProvider || 'Uber Premier'}
                  </div>
                </div>
                <div>
                  <div className="text-stone-400 text-[10px] uppercase font-medium">BATTERY LEVEL</div>
                  <div className="font-semibold text-emerald-600">
                    {journey.batteryPercent}% Healthy
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Contextual Risk Analysis Card & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <RiskAnalysisCard
              riskLevel={journey.riskLevel}
              factors={journey.riskFactors}
              onTriggerDeviation={handleTriggerDeviation}
              onTriggerStop={handleTriggerStop}
              onTriggerLowBattery={handleTriggerLowBattery}
              onResetRisk={handleResetRisk}
              showSimControls={true}
            />

            {/* Safe Destination Reached Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Arrival Confirmation
                </span>
                <h3 className="font-bold text-stone-900 dark:text-white text-sm mt-0.5">
                  Destination: {journey.destinationName}
                </h3>
                <p className="text-stone-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Confirm arrival to close active GPS tracking and reassure your guardians.
                </p>
              </div>

              <button
                onClick={handleEndJourney}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>I Have Safely Arrived</span>
              </button>
            </div>

            {/* Guardian Live View shortcut */}
            <div className="bg-stone-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-stone-200/60 dark:border-slate-700/60 text-xs space-y-1.5">
              <div className="font-semibold text-stone-800 dark:text-slate-200 flex items-center justify-between">
                <span>Guardian Experience Demo</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <p className="text-stone-500 dark:text-slate-400 text-[11px]">
                Open the Guardian Tracking Portal in another window or incognito tab to test alert recipient acknowledgement.
              </p>
              <a
                href={`/guardian/${journey.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-rose-600 dark:text-rose-400 font-semibold text-xs hover:underline pt-0.5"
              >
                Open Guardian Portal →
              </a>
            </div>

          </div>

        </div>

      </main>

      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        contacts={contacts}
        currentCoords={journey.currentCoords}
        journeyId={journey.id}
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
