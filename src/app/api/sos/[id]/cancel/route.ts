import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/store';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = getServerStore();
    const alert = store.alerts.find(a => a.id === params.id);

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const body = await req.json();
    const { pin, reason } = body;

    if (pin !== store.user.pin) {
      return NextResponse.json({ error: 'Invalid Safety PIN. Cancellation rejected.' }, { status: 401 });
    }

    alert.status = 'CANCELLED';
    alert.cancelledAt = new Date().toISOString();
    alert.cancellationReason = reason || 'User authenticated cancellation.';

    // Reset journey status if it was in emergency
    const activeJourney = store.journeys.find(j => j.id === store.activeJourneyId);
    if (activeJourney && activeJourney.status === 'EMERGENCY') {
      activeJourney.status = 'ACTIVE';
      activeJourney.riskLevel = 'LOW';
    }

    return NextResponse.json({
      success: true,
      alert,
      message: 'Emergency SOS successfully cancelled. Guardians notified of safety status.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Cancellation failed' }, { status: 500 });
  }
}

