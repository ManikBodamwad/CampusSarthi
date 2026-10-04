import { NextRequest, NextResponse } from 'next/server';
import { getEscalations, updateEscalationStatus } from '@/lib/db';

export async function GET() {
  try {
    const escalations = await getEscalations();
    return NextResponse.json({ escalations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    await updateEscalationStatus(id, status, admin_notes);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
