import { apiFetch } from './api';
import { AlertItem } from '@/lib/types';
import { getAlertsStore, addAlertToStore, acknowledgeAlertInStore, resolveAlertInStore } from '@/lib/store';

export interface AlertFilters {
  severity?: string;
  status?: string;
  search?: string;
  simulated?: boolean;
  district?: string;
  hazard?: string;
}

export async function getAlerts(filters?: AlertFilters): Promise<AlertItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.severity && filters.severity !== 'all') params.append('severity', filters.severity);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('q', filters.search);
    if (filters?.simulated !== undefined) params.append('simulated', String(filters.simulated));
    if (filters?.district && filters.district !== 'all') params.append('district', filters.district);
    if (filters?.hazard && filters.hazard !== 'all') params.append('hazard', filters.hazard);

    const query = params.toString();
    const endpoint = `/api/alerts${query ? `?${query}` : ''}`;
    return await apiFetch<AlertItem[]>(endpoint);
  } catch {
    return getAlertsStore({
      severity: filters?.severity,
      status: filters?.status,
      query: filters?.search,
      simulated: filters?.simulated,
      district: filters?.district,
      hazard: filters?.hazard,
    });
  }
}

export async function createAlert(alertData: Partial<AlertItem>): Promise<AlertItem> {
  try {
    return await apiFetch<AlertItem>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', alertData }),
    });
  } catch {
    const newAlert: AlertItem = {
      id: alertData.id || `alt-sim-${Date.now()}`,
      severity: alertData.severity || 'WARNING',
      title: alertData.title || '[AI SIMULATION] Geotechnical Alert Drill',
      location: alertData.location || 'East Sikkim Sector',
      district: alertData.district || 'East Sikkim',
      state: alertData.state || 'Sikkim',
      locationId: alertData.locationId || 'loc-001',
      hazardType: alertData.hazardType || 'landslide',
      riskScore: alertData.riskScore ?? 75,
      probability: alertData.probability ?? 0.75,
      forecastWindow: alertData.forecastWindow || 'Next 4 hours (Simulation)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      factors: alertData.factors || ['AI Simulated Hazard Trigger'],
      recommendedAction: alertData.recommendedAction || 'Evacuation Protocol Drill.',
      modelVersion: alertData.modelVersion || 'NER-RF-v1.4 (Simulator)',
      recipientGroup: alertData.recipientGroup || 'DEOC Officers, BRO Crews, SDRF Alpha',
      isSimulated: alertData.isSimulated ?? true,
      simulationVariables: alertData.simulationVariables,
    };
    return addAlertToStore(newAlert);
  }
}

export async function getAlert(alertId: string): Promise<AlertItem | null> {
  const all = await getAlerts();
  return all.find((a) => a.id === alertId) || null;
}

export async function acknowledgeAlert(alertId: string, officerName?: string): Promise<AlertItem> {
  try {
    return await apiFetch<AlertItem>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify({ action: 'acknowledge', alertId, user: officerName }),
    });
  } catch {
    return acknowledgeAlertInStore(alertId, officerName);
  }
}

export async function resolveAlert(alertId: string): Promise<AlertItem> {
  try {
    return await apiFetch<AlertItem>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify({ action: 'resolve', alertId }),
    });
  } catch {
    return resolveAlertInStore(alertId);
  }
}
