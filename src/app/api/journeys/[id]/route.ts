import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/store';
import { evaluateJourneyRisk } from '@/lib/riskEngine';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const store = getServerStore();
  const journey = store.journeys.find(j => j.id === params.id);

  if (!journey) {
    return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
  }

  return NextResponse.json({ journey });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = getServerStore();
    const journey = store.journeys.find(j => j.id === params.id);

    if (!journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    const body = await req.json();

    // Update coordinates & breadcrumbs
    if (body.coords) {
      journey.currentCoords = body.coords;
      journey.breadcrumbs.push({
        ...body.coords,
        timestamp: new Date().toISOString(),
        speedKmH: body.speedKmH || 30,
        batteryPercent: body.batteryPercent ?? journey.batteryPercent,
      });
    }

    if (body.batteryPercent !== undefined) {
      journey.batteryPercent = body.batteryPercent;
    }

    if (body.status) {
      journey.status = body.status;
      if (body.status === 'COMPLETED') {
        journey.completedAt = new Date().toISOString();
        if (store.activeJourneyId === journey.id) {
          store.activeJourneyId = null;
        }
      }
    }

    // Safety check-in confirmed
    if (body.action === 'CONFIRM_CHECKIN') {
      const now = new Date();
      journey.lastCheckinTime = now.toISOString();
      journey.nextCheckinDue = new Date(now.getTime() + journey.checkinIntervalMins * 60 * 1000).toISOString();
    }

    // Recalculate Contextual Risk Detection
    const riskEval = evaluateJourneyRisk({
      currentCoords: journey.currentCoords,
      corridor: journey.corridorPolyline,
      nextCheckinDue: journey.nextCheckinDue,
      batteryPercent: journey.batteryPercent,
      stoppedDurationMins: body.stoppedDurationMins || 0,
      currentSpeedKmH: body.speedKmH,
    });

    journey.riskLevel = riskEval.level;
    journey.riskFactors = riskEval.factors;

    return NextResponse.json({ success: true, journey, riskEval });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}

