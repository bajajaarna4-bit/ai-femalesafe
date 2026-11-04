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
    const contactId = body.contactId || 'ct_1';
    const contactName = body.contactName || 'Priya Sharma (Mother)';
    const actionNote = body.actionNote || 'Acknowledged alert. Reaching out right now.';

    alert.status = 'ACKNOWLEDGED';
    if (!alert.acknowledgedBy) {
      alert.acknowledgedBy = [];
    }

    alert.acknowledgedBy.push({
      contactId,
      contactName,
      acknowledgedAt: new Date().toISOString(),
      actionNote,
    });

    return NextResponse.json({
      success: true,
      alert,
      message: `${contactName} has acknowledged the emergency alert.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to acknowledge alert' }, { status: 500 });
  }
}

