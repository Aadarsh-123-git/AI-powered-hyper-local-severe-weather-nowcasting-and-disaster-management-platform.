import { NextResponse } from 'next/server';
import { MOCK_LOCATIONS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_LOCATIONS,
    total: MOCK_LOCATIONS.length,
    error: null,
  });
}
