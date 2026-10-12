import { NextRequest, NextResponse } from 'next/server';
import {
  getAlertsStoreAsync,
  addAlertToStore,
  acknowledgeAlertInStore,
  resolveAlertInStore,
} from '@/lib/store';
import { AlertItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');
  const query = searchParams.get('q');
  const simulated = searchParams.get('simulated');
  const district = searchParams.get('district');
  const hazard = searchParams.get('hazard');

  const results = await getAlertsStoreAsync({
    severity: severity || undefined,
    status: status || undefined,
    query: query || undefined,
    simulated: simulated === 'true' ? true : simulated === 'false' ? false : undefined,
    district: district || undefined,
    hazard: hazard || undefined,
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
    const { action, alertId, user, alertData } = body;

    // Create new alert (e.g. from AI simulator or broadcast)
    if (!action || action === 'create' || alertData) {
      const payload: Partial<AlertItem> = alertData || body;
      const newAlert: AlertItem = {
        id: payload.id || `alt-sim-${Date.now()}`,
        predictionId: payload.predictionId,
        severity: payload.severity || 'WARNING',
        title: payload.title || '[AI SIMULATION] Landslide & Slope Hazard Drill',
        location: payload.location || 'East Sikkim Corridor',
        district: payload.district || 'East Sikkim',
        state: payload.state || 'Sikkim',
        locationId: payload.locationId || 'loc-001',
        hazardType: payload.hazardType || 'landslide',
        riskScore: payload.riskScore ?? 75,
        probability: payload.probability ?? 0.75,
        forecastWindow: payload.forecastWindow || 'Next 4 hours (Simulation)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        factors: payload.factors || ['Simulated extreme rainfall', 'Simulated pore pressure spike'],
        recommendedAction: payload.recommendedAction || 'Evacuate vulnerable slope corridors.',
        modelVersion: payload.modelVersion || 'NER-RF-v1.4 (Simulator)',
        recipientGroup: payload.recipientGroup || 'DEOC Officers, BRO Road Crews, SDRF Teams',
        isSimulated: payload.isSimulated ?? true,
        simulationVariables: payload.simulationVariables,
      };

      const created = addAlertToStore(newAlert);
      return NextResponse.json(
        {
          success: true,
          data: created,
          error: null,
        },
        { status: 201 }
      );
    }

    if (action === 'acknowledge' && alertId) {
      const updated = acknowledgeAlertInStore(alertId, user);
      return NextResponse.json({
        success: true,
        data: updated,
        error: null,
      });
    }

    if (action === 'resolve' && alertId) {
      const updated = resolveAlertInStore(alertId);
      return NextResponse.json({
        success: true,
        data: updated,
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Action or Alert not found' } },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'SERVER_ERROR', message: err?.message || 'Failed to process alert action' } },
      { status: 400 }
    );
  }
}
