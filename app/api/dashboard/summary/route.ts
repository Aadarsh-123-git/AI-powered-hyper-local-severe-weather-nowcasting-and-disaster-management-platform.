import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRIORITY_ACTIONS } from '@/lib/mockData';
import { getDynamicDashboardSummaryAsync, matchesDistrict, matchesHazard } from '@/lib/store';
import { getLiveTelemetryData } from '@/services/telemetryService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const district = searchParams.get('district') || 'all';
  const hazard = searchParams.get('hazard') || 'all';

  const telemetry = await getLiveTelemetryData();
  const summary = await getDynamicDashboardSummaryAsync(district, hazard);

  const filteredPredictions = telemetry.predictions.filter((p) => {
    return matchesDistrict(p.district, district) && matchesHazard(p.hazardType, hazard);
  });

  return NextResponse.json({
    success: true,
    data: {
      summary,
      risk: filteredPredictions.length > 0 ? filteredPredictions : telemetry.predictions,
      priorityActions: MOCK_PRIORITY_ACTIONS,
      rainfallTrend: telemetry.rainfallTrend,
      riskTrend: telemetry.riskTrend,
      updatedAt: new Date().toISOString(),
      dataFreshness: `Live Open-Meteo & USGS Telemetry (${district === 'all' ? 'All NER Districts' : district})`,
    },
    error: null,
  });
}
