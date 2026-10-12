import { NextResponse } from 'next/server';
import { MOCK_DATA_SOURCES, MOCK_SYSTEM_SERVICES, MOCK_MODEL_TELEMETRY } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'operational',
      database: 'operational',
      weatherProvider: 'operational',
      earthquakeProvider: 'operational',
      riskEngine: 'operational',
      scheduler: 'operational',
      services: MOCK_SYSTEM_SERVICES,
      dataSources: MOCK_DATA_SOURCES,
      model: MOCK_MODEL_TELEMETRY,
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
}
