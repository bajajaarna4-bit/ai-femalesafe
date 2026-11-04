import { LatLng, RiskFactor, RiskLevel } from './types';

// Haversine formula to calculate distance between two coordinates in meters
export function calculateDistanceMeters(p1: LatLng, p2: LatLng): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Minimum distance from a point to a polyline segment
export function getDistanceToCorridorMeters(point: LatLng, corridor: LatLng[]): number {
  if (!corridor || corridor.length === 0) return 0;
  if (corridor.length === 1) return calculateDistanceMeters(point, corridor[0]);

  let minDistance = Infinity;
  for (let i = 0; i < corridor.length - 1; i++) {
    const dist = calculateDistanceMeters(point, corridor[i]);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}

export interface RiskEvaluationParams {
  currentCoords: LatLng;
  corridor: LatLng[];
  nextCheckinDue: string;
  batteryPercent: number;
  stoppedDurationMins: number;
  currentSpeedKmH?: number;
  currentTime?: Date;
}

export function evaluateJourneyRisk(params: RiskEvaluationParams): {
  level: RiskLevel;
  score: number; // 0 to 100
  factors: RiskFactor[];
} {
  const factors: RiskFactor[] = [];
  let score = 5; // Baseline safe score
  const now = params.currentTime || new Date();

  // 1. Check Corridor Deviation
  const deviationMeters = getDistanceToCorridorMeters(params.currentCoords, params.corridor);
  if (deviationMeters > 900) {
    score += 45;
    factors.push({
      id: 'dev_critical',
      title: 'Significant Route Deviation',
      description: `Current vehicle location is ${Math.round(deviationMeters)}m away from planned safe corridor.`,
      severity: 'high',
      detectedAt: now.toISOString(),
    });
  } else if (deviationMeters > 350) {
    score += 25;
    factors.push({
      id: 'dev_moderate',
      title: 'Off-Route Warning',
      description: `Vehicle deviated ${Math.round(deviationMeters)}m from expected route.`,
      severity: 'medium',
      detectedAt: now.toISOString(),
    });
  }

  // 2. Check Prolonged Unexpected Stop
  if (params.stoppedDurationMins >= 6) {
    score += 40;
    factors.push({
      id: 'stop_prolonged',
      title: 'Unplanned Prolonged Stop',
      description: `Stationary for ${Math.round(params.stoppedDurationMins)} minutes in an unscheduled area.`,
      severity: 'high',
      detectedAt: now.toISOString(),
    });
  } else if (params.stoppedDurationMins >= 3) {
    score += 15;
    factors.push({
      id: 'stop_mild',
      title: 'Stationary Vehicle',
      description: `Vehicle has been stopped for over ${Math.round(params.stoppedDurationMins)} minutes.`,
      severity: 'medium',
      detectedAt: now.toISOString(),
    });
  }

  // 3. Check Scheduled Safety Check-in
  if (params.nextCheckinDue) {
    const dueTime = new Date(params.nextCheckinDue).getTime();
    const diffSec = (now.getTime() - dueTime) / 1000;
    if (diffSec > 60) {
      score += 35;
      factors.push({
        id: 'checkin_missed',
        title: 'Safety Check-in Overdue',
        description: `User did not confirm status within the 60-second reminder window.`,
        severity: 'high',
        detectedAt: now.toISOString(),
      });
    }
  }

  // 4. Low Battery Risk
  if (params.batteryPercent <= 10) {
    score += 20;
    factors.push({
      id: 'battery_critical',
      title: 'Critically Low Battery',
      description: `Device battery is at ${params.batteryPercent}%. Location tracking could be interrupted soon.`,
      severity: 'high',
      detectedAt: now.toISOString(),
    });
  } else if (params.batteryPercent <= 18) {
    score += 10;
    factors.push({
      id: 'battery_low',
      title: 'Low Battery Advisory',
      description: `Device battery at ${params.batteryPercent}%. Guardians notified of low battery status.`,
      severity: 'low',
      detectedAt: now.toISOString(),
    });
  }

  // 5. Late Night / Off-hours contextual flag
  const hour = now.getHours();
  if (hour >= 23 || hour < 5) {
    score += 15;
    factors.push({
      id: 'late_hours',
      title: 'Late Night Transit Window',
      description: `Journey active during vulnerable hours (${hour}:00). Active guardian monitoring recommended.`,
      severity: 'low',
      detectedAt: now.toISOString(),
    });
  }

  // Determine categorical Risk Level
  let level: RiskLevel = 'LOW';
  if (score >= 70) {
    level = 'CRITICAL';
  } else if (score >= 40) {
    level = 'ELEVATED';
  } else if (score >= 20) {
    level = 'MODERATE';
  }

  return {
    level,
    score: Math.min(100, score),
    factors,
  };
}

