'use client';

import { useEffect, useRef } from 'react';
import { LatLng, SafePlace } from '@/lib/types';
import { SAFE_PLACES_DATABASE } from '@/lib/demoRoutes';
import { useTheme } from './ThemeProvider';

interface MapComponentProps {
  currentCoords: LatLng;
  originCoords?: LatLng;
  destinationCoords?: LatLng;
  corridor?: LatLng[];
  breadcrumbs?: LatLng[];
  safePlaces?: SafePlace[];
  riskLevel?: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  showSafePlaces?: boolean;
  className?: string;
}

export default function MapComponent({
  currentCoords,
  originCoords,
  destinationCoords,
  corridor = [],
  breadcrumbs = [],
  safePlaces = SAFE_PLACES_DATABASE,
  riskLevel = 'LOW',
  showSafePlaces = true,
  className = 'h-full w-full',
}: MapComponentProps) {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const corridorLayerRef = useRef<any>(null);
  const breadcrumbLayerRef = useRef<any>(null);
  const safePlacesLayerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Ensure Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Initialize map instance if not existing
      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true,
        }).setView([currentCoords.lat, currentCoords.lng], 14);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Update or switch tile layer depending on dark vs light theme
      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      const tiles = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
      tileLayerRef.current = tiles;

      // Draw corridor polyline (Safe Planned Corridor)
      if (corridorLayerRef.current) {
        map.removeLayer(corridorLayerRef.current);
      }

      if (corridor && corridor.length > 1) {
        const latLngs = corridor.map(c => [c.lat, c.lng] as [number, number]);
        const poly = L.polyline(latLngs, {
          color: theme === 'dark' ? '#38bdf8' : '#0284c7',
          weight: 5,
          opacity: 0.8,
          dashArray: '6, 8',
          lineCap: 'round',
        }).addTo(map);
        corridorLayerRef.current = poly;
      }

      // Draw historical breadcrumbs
      if (breadcrumbLayerRef.current) {
        map.removeLayer(breadcrumbLayerRef.current);
      }
      if (breadcrumbs && breadcrumbs.length > 1) {
        const bLatLngs = breadcrumbs.map(b => [b.lat, b.lng] as [number, number]);
        const bPoly = L.polyline(bLatLngs, {
          color: riskLevel === 'CRITICAL' ? '#e11d48' : '#f43f5e',
          weight: 3.5,
          opacity: 0.9,
        }).addTo(map);
        breadcrumbLayerRef.current = bPoly;
      }

      // Draw destination pin if provided
      if (destinationMarkerRef.current) {
        map.removeLayer(destinationMarkerRef.current);
      }
      if (destinationCoords) {
        const destHtml = `
          <div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:#059669;color:#fff;border-radius:9999px;box-shadow:0 4px 12px rgba(5,150,105,0.4);border:2px solid #fff;font-size:12px;font-weight:bold;">
            🏁
          </div>
        `;
        const destIcon = L.divIcon({
          html: destHtml,
          className: 'dest-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const destMarker = L.marker([destinationCoords.lat, destinationCoords.lng], { icon: destIcon }).addTo(map);
        destMarker.bindPopup('<strong style="font-size:12px;">Planned Destination</strong>');
        destinationMarkerRef.current = destMarker;
      }

      // Safe places pins (Police, Hospital, Women desk)
      if (safePlacesLayerRef.current) {
        map.removeLayer(safePlacesLayerRef.current);
      }

      if (showSafePlaces && safePlaces) {
        const group = L.layerGroup();
        safePlaces.forEach(sp => {
          const badgeBg = sp.type === 'POLICE' ? '#2563eb' : sp.type === 'HOSPITAL' ? '#059669' : '#7c3aed';
          const symbol = sp.type === 'POLICE' ? '👮' : sp.type === 'HOSPITAL' ? '🏥' : '🛡️';

          const iconHtml = `
            <div style="background:${badgeBg};color:white;width:26px;height:26px;border-radius:9999px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;" title="${sp.name}">
              ${symbol}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-safe-pin',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([sp.coords.lat, sp.coords.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="font-family:system-ui,-apple-system,sans-serif;font-size:12px;line-height:1.4;color:#0f172a;max-width:210px;">
              <strong style="color:#0f172a;font-size:13px;">${sp.name}</strong><br/>
              <span style="color:#64748b;font-size:11px;">${sp.address}</span><br/>
              <div style="margin-top:6px;">
                <a href="tel:${sp.phone}" style="background:#2563eb;color:#fff;padding:3px 8px;border-radius:6px;text-decoration:none;font-size:11px;font-weight:600;display:inline-block;">📞 Call: ${sp.phone}</a>
              </div>
            </div>
          `);
          group.addLayer(marker);
        });
        group.addTo(map);
        safePlacesLayerRef.current = group;
      }

      // Update User Pulse Marker
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      const isAlert = riskLevel === 'CRITICAL' || riskLevel === 'ELEVATED';
      const userDotColor = isAlert ? '#e11d48' : '#f43f5e';

      const userHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:32px;height:32px;border-radius:9999px;background:${userDotColor};opacity:0.35;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:relative;width:18px;height:18px;border-radius:9999px;background:${userDotColor};border:2.5px solid #ffffff;box-shadow:0 2px 10px rgba(0,0,0,0.35);"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-pulse-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([currentCoords.lat, currentCoords.lng], { icon: userIcon }).addTo(map);
      userMarkerRef.current = userMarker;

      // Smooth pan to coordinates
      map.panTo([currentCoords.lat, currentCoords.lng], { animate: true, duration: 0.6 });
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [currentCoords, corridor, breadcrumbs, riskLevel, showSafePlaces, theme, destinationCoords]);

  return (
    <div className={`relative ${className} overflow-hidden rounded-2xl border border-stone-200 dark:border-slate-800 shadow-sm transition-colors`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-200/90 dark:border-slate-800/90 text-[11px] shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
          <span className="font-medium text-stone-800 dark:text-slate-200">Live Vehicle GPS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-0.5 border-t-2 border-dashed border-sky-500 inline-block"></span>
          <span className="text-stone-600 dark:text-slate-400">Planned Corridor</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span>👮 🏥 🛡️</span>
          <span className="text-stone-500 dark:text-slate-400">Safe Havens</span>
        </div>
      </div>
    </div>
  );
}
