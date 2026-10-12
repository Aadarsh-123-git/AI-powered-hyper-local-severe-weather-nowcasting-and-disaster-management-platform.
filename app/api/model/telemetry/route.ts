import { NextRequest, NextResponse } from 'next/server';
import { MOCK_MODEL_TELEMETRY } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: MOCK_MODEL_TELEMETRY,
    error: null,
  });
}
