import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/store';
import { EmergencyAlert } from '@/lib/types';

export async function GET() {
  const store = getServerStore();
  const activeAlert = store.alerts.find(a => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED');
  return NextResponse.json({
    activeAlert: activeAlert || null,
    alerts: store.alerts,
  });
}

export async function POST(req: Request) {
  try {
    const store = getServerStore();
    const body = await req.json();

    const activeJourney = store.journeys.find(j => j.id === store.activeJourneyId);
    if (activeJourney) {
      activeJourney.status = 'EMERGENCY';
      activeJourney.riskLevel = 'CRITICAL';
    }

    const currentCoords = body.coords || (activeJourney ? activeJourney.currentCoords : { lat: 28.5670, lng: 77.1850 });

    const newAlert: EmergencyAlert = {
      id: `alert_${Date.now()}`,
      journeyId: activeJourney?.id,
      userId: store.user.id,
      userName: store.user.name,
      userPhone: store.user.phone,
      triggeredAt: new Date().toISOString(),
      currentCoords,
      addressApprox: body.addressApprox || 'Near Ring Road & Dhaula Kuan Junction, New Delhi',
      batteryPercent: body.batteryPercent || (activeJourney ? activeJourney.batteryPercent : 80),
      status: 'ACTIVE',
      triggerType: body.triggerType || 'MANUAL_SOS',
      escalationTier: 1,
      escalationDueAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 min escalation to tier 2
      acknowledgedBy: [],
      audioRecordingUrl: body.audioRecordingUrl,
    };

    store.alerts.unshift(newAlert);

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'SOS Alert dispatched to Priority 1 contacts (SMS, WhatsApp simulated notification).',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to dispatch SOS' }, { status: 500 });
  }
}

