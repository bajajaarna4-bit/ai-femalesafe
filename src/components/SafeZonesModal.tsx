'use client';

import { X, Phone, Navigation, Shield, HeartPulse, Building2, ExternalLink } from 'lucide-react';
import { SAFE_PLACES_DATABASE } from '@/lib/demoRoutes';
import { SafePlace } from '@/lib/types';

interface SafeZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  safePlaces?: SafePlace[];
}

export default function SafeZonesModal({
  isOpen,
  onClose,
  safePlaces = SAFE_PLACES_DATABASE,
}: SafeZonesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Nearby 24/7 Verified Safe Zones
              </h3>
              <p className="text-xs text-slate-500">
                Police stations, Pink Help Booths & Emergency Trauma Centers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Safe Zones */}
        <div className="p-5 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {safePlaces.map(place => {
            const isPolice = place.type === 'POLICE' || place.type === 'WOMEN_DESK';
            return (
              <div key={place.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isPolice
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                      }`}
                    >
                      {isPolice ? <Building2 className="w-4 h-4" /> : <HeartPulse className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {place.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full">
                          24/7 Open
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {place.address}
                      </p>
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
                        ~{place.distanceKm} km away from your location
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1 pl-10">
                  <a
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    <Phone className="w-3 h-3" /> Call {place.phone}
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${place.coords.lat},${place.coords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold"
                  >
                    <Navigation className="w-3 h-3" /> Get Directions
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          In an active threat situation, proceed directly to the nearest staffed kiosk or call 112 immediately.
        </div>
      </div>
    </div>
  );
}

