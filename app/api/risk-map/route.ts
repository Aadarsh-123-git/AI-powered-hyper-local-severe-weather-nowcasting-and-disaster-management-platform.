import { NextRequest, NextResponse } from 'next/server';
import { getLiveTelemetryData } from '@/services/telemetryService';
import { matchesDistrict, matchesHazard } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hazard = searchParams.get('hazard');
  const riskLevel = searchParams.get('riskLevel');
  const district = searchParams.get('district');

  const telemetry = await getLiveTelemetryData();
  let filtered = [...telemetry.predictions];

  if (hazard && hazard !== 'all') {
    filtered = filtered.filter((p) => matchesHazard(p.hazardType, hazard));
  }
  if (riskLevel && riskLevel !== 'all') {
    filtered = filtered.filter((p) => p.riskLevel.toLowerCase() === riskLevel.toLowerCase());
  }
  if (district && district !== 'all') {
    filtered = filtered.filter((p) => matchesDistrict(p.district, district));
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
    error: null,
  });
}
