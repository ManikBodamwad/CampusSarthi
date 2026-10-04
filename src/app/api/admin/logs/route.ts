import { NextRequest, NextResponse } from 'next/server';
import { getQueriesLogs, getAdminAnalytics } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');

    if (mode === 'analytics') {
      const analytics = await getAdminAnalytics();
      return NextResponse.json({ analytics });
    }

    const limit = Number(searchParams.get('limit')) || 100;
    const logs = await getQueriesLogs(limit);
    const analytics = await getAdminAnalytics();

    return NextResponse.json({ logs, analytics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
