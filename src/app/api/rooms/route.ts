import { NextRequest, NextResponse } from 'next/server';
import { getRooms } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    const allRooms = await getRooms();

    if (!query) {
      return NextResponse.json({ rooms: allRooms });
    }

    const filtered = allRooms.filter(
      (r) =>
        r.room_name.toLowerCase().includes(query) ||
        r.building.toLowerCase().includes(query) ||
        r.wing.toLowerCase().includes(query) ||
        r.floor.toLowerCase().includes(query)
    );

    return NextResponse.json({ rooms: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
