export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';

export type JourneyStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'EMERGENCY';

export type ContactPriority = 1 | 2 | 3;

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  priority: ContactPriority;
  status: 'VERIFIED' | 'PENDING';
  notifyVia: ('SMS' | 'WHATSAPP' | 'CALL')[];
}

export interface BreadcrumbPoint extends LatLng {
  timestamp: string;
  speedKmH?: number;
  batteryPercent?: number;
}

export interface RiskFactor {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
}

export interface Journey {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  originName: string;
  originCoords: LatLng;
  destinationName: string;
  destinationCoords: LatLng;
  currentCoords: LatLng;
  mode: 'CAB' | 'METRO' | 'AUTO' | 'WALKING' | 'SOLO_DRIVE';
  vehicleDetails?: {
    driverName?: string;
    vehicleNumber?: string;
    appProvider?: string;
  };
  checkinIntervalMins: number;
  lastCheckinTime: string;
  nextCheckinDue: string;
  status: JourneyStatus;
  startedAt: string;
  estimatedArrival: string;
  completedAt?: string;
  batteryPercent: number;
  breadcrumbs: BreadcrumbPoint[];
  corridorPolyline: LatLng[];
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  authorizedContactIds: string[];
  notes?: string;
}

export interface EmergencyAlert {
  id: string;
  journeyId?: string;
  userId: string;
  userName: string;
  userPhone: string;
  triggeredAt: string;
  currentCoords: LatLng;
  addressApprox: string;
  batteryPercent: number;
  audioRecordingUrl?: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'CANCELLED' | 'RESOLVED';
  triggerType: 'MANUAL_SOS' | 'STEALTH_DISGUISE' | 'MISSED_CHECKIN' | 'CORRIDOR_DEVIATION' | 'PROLONGED_STOP';
  acknowledgedBy?: {
    contactId: string;
    contactName: string;
    acknowledgedAt: string;
    actionNote: string;
  }[];
  escalationTier: number; // 1 = Priority 1 contacts, 2 = Priority 2 contacts, 3 = Local Authorities Integration
  escalationDueAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface SafePlace {
  id: string;
  name: string;
  type: 'POLICE' | 'HOSPITAL' | 'WOMEN_DESK' | 'METRO_STATION';
  address: string;
  phone: string;
  coords: LatLng;
  distanceKm: number;
  isOpen24x7: boolean;
}

