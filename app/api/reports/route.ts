import { NextRequest, NextResponse } from 'next/server';
import {
  getReportsStore,
  addReportToStore,
  verifyReportInStore,
  rejectReportInStore,
} from '@/lib/store';
import { FieldReport } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const district = searchParams.get('district');
  const query = searchParams.get('q');

  const results = getReportsStore({
    status: status || undefined,
    type: type || undefined,
    district: district || undefined,
    query: query || undefined,
  });

  return NextResponse.json({
    success: true,
    data: results,
    total: results.length,
    error: null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, reportId, verifiedBy, reportData } = body;

    // Action 1: Verify
    if (action === 'verify' && reportId) {
      const updated = verifyReportInStore(reportId, verifiedBy);
      return NextResponse.json({ success: true, data: updated, error: null });
    }

    // Action 2: Reject
    if (action === 'reject' && reportId) {
      const updated = rejectReportInStore(reportId, verifiedBy);
      return NextResponse.json({ success: true, data: updated, error: null });
    }

    // Action 3: Create new report
    if (!action || action === 'create' || reportData) {
      const payload = reportData || body;
      const newReport: FieldReport = {
        id: `rep-${Date.now()}`,
        reportType: payload.reportType || 'landslide',
        title: payload.title || 'Field observation report',
        location: payload.location || 'North Eastern Region Location',
        district: payload.district || 'East Sikkim',
        state: payload.state || 'Sikkim',
        latitude: parseFloat(payload.latitude) || 27.3314,
        longitude: parseFloat(payload.longitude) || 88.6138,
        timestamp: new Date().toISOString(),
        description: payload.description || '',
        mediaUrl: payload.mediaUrl || 'https://picsum.photos/seed/ner_field_report/640/420',
        reporterType: payload.reporterType || 'field_official',
        reporterName: payload.reporterName || 'Ground Observer',
        reporterPhone: payload.reporterPhone || '',
        verificationStatus: 'pending',
        aiAdvisoryAnalysis: 'Advisory: Automated feature extraction completed. Awaiting mandatory officer physical inspection and confirmation.',
        roadAffected: payload.roadAffected || undefined,
      };

      const created = addReportToStore(newReport);
      return NextResponse.json({ success: true, data: created, error: null }, { status: 201 });
    }

    return NextResponse.json(
      { success: false, data: null, error: { code: 'UNKNOWN_ACTION', message: 'Action not supported' } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'SERVER_ERROR', message: err?.message || 'Failed to process report request' } },
      { status: 500 }
    );
  }
}
