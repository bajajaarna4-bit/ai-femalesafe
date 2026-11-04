import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/store';
import { TrustedContact } from '@/lib/types';

export async function GET() {
  const store = getServerStore();
  return NextResponse.json({ contacts: store.contacts });
}

export async function POST(req: Request) {
  try {
    const store = getServerStore();
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const newContact: TrustedContact = {
      id: `ct_${Date.now()}`,
      name: body.name,
      phone: body.phone,
      relation: body.relation || 'Friend',
      priority: (body.priority as 1 | 2 | 3) || 2,
      status: 'VERIFIED',
      notifyVia: body.notifyVia || ['SMS', 'WHATSAPP'],
    };

    store.contacts.push(newContact);
    return NextResponse.json({ success: true, contact: newContact }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add contact' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const store = getServerStore();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }

    store.contacts = store.contacts.filter(c => c.id !== id);
    return NextResponse.json({ success: true, contacts: store.contacts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete contact' }, { status: 500 });
  }
}

