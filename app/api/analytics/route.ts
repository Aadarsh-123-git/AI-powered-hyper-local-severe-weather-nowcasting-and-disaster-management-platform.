import { NextRequest, NextResponse } from 'next/server';
import { generateDistrictHazardAnalytics } from '@/lib/analyticsDataGenerator';
import { getLiveTelemetryData } from '@/services/telemetryService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const district = searchParams.get('district') || 'all';
  const hazard = searchParams.get('hazard') || 'all';
  const period = searchParams.get('period') || '7d';

  const telemetry = await getLiveTelemetryData();
  const baseAnalytics = generateDistrictHazardAnalytics(district, hazard, period, Date.now());

  if (telemetry) {
    baseAnalytics.timestamp = telemetry.lastSyncTime || new Date().toISOString();
  }

  return NextResponse.json({
    success: true,
    data: baseAnalytics,
    error: null,
  });
}
