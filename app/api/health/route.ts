import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    api: 'operational',
    database: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0-ner-safe',
    environment: 'production',
  });
}
