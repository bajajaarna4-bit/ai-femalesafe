import { LatLng, SafePlace } from './types';

export interface RoutePreset {
  id: string;
  name: string;
  city: string;
  originName: string;
  destinationName: string;
  originCoords: LatLng;
  destinationCoords: LatLng;
  corridor: LatLng[];
  deviationWaypoint: LatLng; // coordinates for triggering intentional off-route test
  distanceKm: number;
  durationMins: number;
  mode: 'CAB' | 'METRO' | 'AUTO' | 'WALKING';
  cabInfo: {
    driver: string;
    vehicle: string;
    app: string;
  };
}

export const DEMO_ROUTES: RoutePreset[] = [
  {
    id: 'delhi-ncr-late-night',
    name: 'Cyber City to Indirapuram (Late Night Cab)',
    city: 'Delhi-NCR',
    originName: 'DLF CyberHub, Gurugram',
    destinationName: 'Shipra Mall, Indirapuram',
    originCoords: { lat: 28.4952, lng: 77.0894 },
    destinationCoords: { lat: 28.6366, lng: 77.3712 },
    distanceKm: 38.5,
    durationMins: 45,
    mode: 'CAB',
    cabInfo: {
      driver: 'Rameshwar Kumar (4.9 ★)',
      vehicle: 'DL-1ZA-4821 (White Dzire)',
      app: 'Uber Premier',
    },
    corridor: [
      { lat: 28.4952, lng: 77.0894 }, // CyberHub
      { lat: 28.5135, lng: 77.1021 }, // Shankar Chowk
      { lat: 28.5355, lng: 77.1350 }, // Mahipalpur Flyover
      { lat: 28.5670, lng: 77.1850 }, // Dhaula Kuan
      { lat: 28.5900, lng: 77.2210 }, // AIIMS / Ring Road
      { lat: 28.6140, lng: 77.2790 }, // Akshardham Flyover
      { lat: 28.6280, lng: 77.3320 }, // NH24 / Ghazipur
      { lat: 28.6366, lng: 77.3712 }, // Indirapuram Destination
    ],
    // A point far south into an isolated industrial belt to demonstrate AI deviation detection
    deviationWaypoint: { lat: 28.5420, lng: 77.2950 },
  },
  {
    id: 'bengaluru-tech-commute',
    name: 'Koramangala to Indiranagar (Evening Auto)',
    city: 'Bengaluru',
    originName: 'Sony World Signal, Koramangala',
    destinationName: '100ft Road Metro, Indiranagar',
    originCoords: { lat: 12.9352, lng: 77.6245 },
    destinationCoords: { lat: 12.9719, lng: 77.6412 },
    distanceKm: 6.2,
    durationMins: 22,
    mode: 'AUTO',
    cabInfo: {
      driver: 'Manjunath Swamy (4.8 ★)',
      vehicle: 'KA-01-EQ-9321 (Bajaj RE Auto)',
      app: 'Namma Yatri',
    },
    corridor: [
      { lat: 12.9352, lng: 77.6245 },
      { lat: 12.9440, lng: 77.6280 },
      { lat: 12.9555, lng: 77.6335 },
      { lat: 12.9640, lng: 77.6375 },
      { lat: 12.9719, lng: 77.6412 },
    ],
    deviationWaypoint: { lat: 12.9200, lng: 77.6600 },
  },
  {
    id: 'mumbai-suburban-transit',
    name: 'Bandra BKC to Andheri West (Solo Cab)',
    city: 'Mumbai',
    originName: 'BKC Complex, Bandra East',
    destinationName: 'Lokhandwala Market, Andheri West',
    originCoords: { lat: 19.0657, lng: 77.8682 }, // approximate BKC
    destinationCoords: { lat: 19.1363, lng: 72.8277 },
    distanceKm: 14.8,
    durationMins: 35,
    mode: 'CAB',
    cabInfo: {
      driver: 'Sachin Patil (4.95 ★)',
      vehicle: 'MH-02-EE-1108 (Silver WagonR)',
      app: 'Ola Prime',
    },
    corridor: [
      { lat: 19.0657, lng: 72.8682 },
      { lat: 19.0880, lng: 72.8520 },
      { lat: 19.1020, lng: 72.8430 },
      { lat: 19.1210, lng: 72.8360 },
      { lat: 19.1363, lng: 72.8277 },
    ],
    deviationWaypoint: { lat: 19.0950, lng: 72.9100 },
  },
];

export const SAFE_PLACES_DATABASE: SafePlace[] = [
  {
    id: 'sp_1',
    name: 'South Extension 24x7 Women Police Station',
    type: 'POLICE',
    address: 'Ring Road, Near Metro Gate 2, New Delhi',
    phone: '011-26258000',
    coords: { lat: 28.5729, lng: 77.2185 },
    distanceKm: 0.8,
    isOpen24x7: true,
  },
  {
    id: 'sp_2',
    name: 'AIIMS Emergency & Trauma Centre',
    type: 'HOSPITAL',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    phone: '011-26594405',
    coords: { lat: 28.5672, lng: 77.2100 },
    distanceKm: 1.4,
    isOpen24x7: true,
  },
  {
    id: 'sp_3',
    name: 'Dhaula Kuan Pink Police Booth (Women Help Desk)',
    type: 'WOMEN_DESK',
    address: 'Dhaula Kuan Interchange Junction, New Delhi',
    phone: '1091',
    coords: { lat: 28.5912, lng: 77.1610 },
    distanceKm: 2.1,
    isOpen24x7: true,
  },
  {
    id: 'sp_4',
    name: 'Rajiv Chowk Metro Station - Security Post',
    type: 'METRO_STATION',
    address: 'Connaught Place Central Concourse, New Delhi',
    phone: '011-23417910',
    coords: { lat: 28.6328, lng: 77.2197 },
    distanceKm: 3.5,
    isOpen24x7: true,
  },
  {
    id: 'sp_5',
    name: 'Indiranagar 100ft Road Police Station',
    type: 'POLICE',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
    phone: '080-22942544',
    coords: { lat: 12.9702, lng: 77.6430 },
    distanceKm: 0.9,
    isOpen24x7: true,
  },
  {
    id: 'sp_6',
    name: 'Manipal Hospital 24/7 Emergency Wing',
    type: 'HOSPITAL',
    address: '98 HAL Old Airport Rd, Kodihalli, Bengaluru',
    phone: '080-25024444',
    coords: { lat: 12.9582, lng: 77.6482 },
    distanceKm: 1.8,
    isOpen24x7: true,
  },
];

