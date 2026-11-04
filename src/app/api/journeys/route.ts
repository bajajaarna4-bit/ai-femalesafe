import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/store';
import { Journey } from '@/lib/types';

export async function GET() {
  const store = getServerStore();
  const activeJourney = store.journeys.find(j => j.id === store.activeJourneyId);
  return NextResponse.json({
    activeJourney: activeJourney || null,
    allJourneys: store.journeys,
  });
}

export async function POST(req: Request) {
  try {
    const store = getServerStore();
    const body = await req.json();

    const newJourney: Journey = {
      id: `journey_${Date.now()}`,
      userId: store.user.id,
      userName: store.user.name,
      userPhone: store.user.phone,
      originName: body.originName || 'Current Location',
      originCoords: body.originCoords || { lat: 28.4952, lng: 77.0894 },
      destinationName: body.destinationName,
      destinationCoords: body.destinationCoords,
      currentCoords: body.originCoords || { lat: 28.4952, lng: 77.0894 },
      mode: body.mode || 'CAB',
      vehicleDetails: body.vehicleDetails,
      checkinIntervalMins: body.checkinIntervalMins || 15,
      lastCheckinTime: new Date().toISOString(),
      nextCheckinDue: new Date(Date.now() + (body.checkinIntervalMins || 15) * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      estimatedArrival: body.estimatedArrival || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      batteryPercent: body.batteryPercent || 85,
      breadcrumbs: [
        {
          ...(body.originCoords || { lat: 28.4952, lng: 77.0894 }),
          timestamp: new Date().toISOString(),
          speedKmH: 0,
          batteryPercent: body.batteryPercent || 85,
        },
      ],
      corridorPolyline: body.corridorPolyline || [body.originCoords, body.destinationCoords],
      riskLevel: 'LOW',
      riskFactors: [],
      authorizedContactIds: body.authorizedContactIds || store.contacts.map(c => c.id),
      notes: body.notes,
    };

    store.journeys.unshift(newJourney);
    store.activeJourneyId = newJourney.id;

    return NextResponse.json({ success: true, journey: newJourney }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create journey' }, { status: 500 });
  }
}

