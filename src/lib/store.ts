import { Journey, TrustedContact, EmergencyAlert, LatLng } from './types';
import { DEMO_ROUTES } from './demoRoutes';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  pin: string; // Safety cancellation PIN (default "1234")
  medicalNotes: string;
  emergencyMessage: string;
  autoAudioRecord: boolean;
  stealthModeEnabled: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_ananya_01',
  name: 'Ananya Sharma',
  phone: '+91 98765 43210',
  email: 'ananya.s@example.com',
  pin: '1234',
  medicalNotes: 'Asthma inhaler in handbag. Blood Group O+',
  emergencyMessage: 'EMERGENCY: I need immediate help. Here is my live SAATHI tracking link with GPS coordinates.',
  autoAudioRecord: true,
  stealthModeEnabled: true,
};

const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'ct_1',
    name: 'Priya Sharma',
    phone: '+91 98111 22334',
    relation: 'Mother',
    priority: 1,
    status: 'VERIFIED',
    notifyVia: ['SMS', 'WHATSAPP', 'CALL'],
  },
  {
    id: 'ct_2',
    name: 'Rohan Verma',
    phone: '+91 98222 33445',
    relation: 'Partner',
    priority: 1,
    status: 'VERIFIED',
    notifyVia: ['SMS', 'WHATSAPP'],
  },
  {
    id: 'ct_3',
    name: 'Sneha Patel',
    phone: '+91 98333 44556',
    relation: 'Roommate',
    priority: 2,
    status: 'VERIFIED',
    notifyVia: ['SMS', 'WHATSAPP'],
  },
  {
    id: 'ct_4',
    name: 'Security Desk / Warden',
    phone: '+91 98444 55667',
    relation: 'Hostel Warden',
    priority: 3,
    status: 'VERIFIED',
    notifyVia: ['SMS'],
  },
];

// In-memory server store for API routes
interface ServerStore {
  user: UserProfile;
  contacts: TrustedContact[];
  journeys: Journey[];
  activeJourneyId: string | null;
  alerts: EmergencyAlert[];
}

// Global server storage singleton
const globalStore = globalThis as unknown as { __saathi_store?: ServerStore };

if (!globalStore.__saathi_store) {
  const initialRoute = DEMO_ROUTES[0];
  const now = new Date();
  const nextCheckin = new Date(now.getTime() + 15 * 60 * 1000);
  const eta = new Date(now.getTime() + 45 * 60 * 1000);

  const defaultJourney: Journey = {
    id: 'journey_active_demo',
    userId: DEFAULT_USER.id,
    userName: DEFAULT_USER.name,
    userPhone: DEFAULT_USER.phone,
    originName: initialRoute.originName,
    originCoords: initialRoute.originCoords,
    destinationName: initialRoute.destinationName,
    destinationCoords: initialRoute.destinationCoords,
    currentCoords: initialRoute.originCoords,
    mode: initialRoute.mode,
    vehicleDetails: {
      driverName: initialRoute.cabInfo.driver,
      vehicleNumber: initialRoute.cabInfo.vehicle,
      appProvider: initialRoute.cabInfo.app,
    },
    checkinIntervalMins: 15,
    lastCheckinTime: now.toISOString(),
    nextCheckinDue: nextCheckin.toISOString(),
    status: 'ACTIVE',
    startedAt: now.toISOString(),
    estimatedArrival: eta.toISOString(),
    batteryPercent: 84,
    breadcrumbs: [
      {
        ...initialRoute.originCoords,
        timestamp: now.toISOString(),
        speedKmH: 28,
        batteryPercent: 84,
      },
    ],
    corridorPolyline: initialRoute.corridor,
    riskLevel: 'LOW',
    riskFactors: [],
    authorizedContactIds: ['ct_1', 'ct_2', 'ct_3'],
    notes: 'Late night cab ride from office dinner.',
  };

  globalStore.__saathi_store = {
    user: DEFAULT_USER,
    contacts: DEFAULT_CONTACTS,
    journeys: [defaultJourney],
    activeJourneyId: defaultJourney.id,
    alerts: [],
  };
}

export function getServerStore(): ServerStore {
  return globalStore.__saathi_store!;
}

// Client-side helper for localStorage
export const STORAGE_KEYS = {
  USER: 'saathi_user',
  CONTACTS: 'saathi_contacts',
  ACTIVE_JOURNEY: 'saathi_active_journey',
  JOURNEY_HISTORY: 'saathi_journey_history',
  ACTIVE_ALERT: 'saathi_active_alert',
};

export function getClientUser(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.USER);
    return val ? JSON.parse(val) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function setClientUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getClientContacts(): TrustedContact[] {
  if (typeof window === 'undefined') return DEFAULT_CONTACTS;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return val ? JSON.parse(val) : DEFAULT_CONTACTS;
  } catch {
    return DEFAULT_CONTACTS;
  }
}

export function setClientContacts(contacts: TrustedContact[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

