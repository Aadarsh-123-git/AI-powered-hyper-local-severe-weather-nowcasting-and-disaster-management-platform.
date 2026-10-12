import { apiFetch } from './api';
import { RiskPrediction } from '@/lib/types';
import { MOCK_PREDICTIONS } from '@/lib/mockData';

export interface RiskMapFilters {
  hazard?: string;
  riskLevel?: string;
  district?: string;
  timeWindow?: string;
}

export async function getRiskMapData(filters?: RiskMapFilters): Promise<RiskPrediction[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.hazard && filters.hazard !== 'all') params.append('hazard', filters.hazard);
    if (filters?.riskLevel && filters.riskLevel !== 'all') params.append('riskLevel', filters.riskLevel);
    if (filters?.district && filters.district !== 'all') params.append('district', filters.district);

    const query = params.toString();
    const endpoint = `/api/risk-map${query ? `?${query}` : ''}`;
    return await apiFetch<RiskPrediction[]>(endpoint);
  } catch {
    let list = [...MOCK_PREDICTIONS];
    if (filters?.hazard && filters.hazard !== 'all') {
      list = list.filter((p) => p.hazardType === filters.hazard);
    }
    if (filters?.riskLevel && filters.riskLevel !== 'all') {
      list = list.filter((p) => p.riskLevel.toLowerCase() === filters.riskLevel!.toLowerCase());
    }
    if (filters?.district && filters.district !== 'all') {
      list = list.filter((p) => p.district.toLowerCase().includes(filters.district!.toLowerCase()));
    }
    return list;
  }
}

export async function getRiskDetails(locationId: string): Promise<RiskPrediction | null> {
  const all = await getRiskMapData();
  return all.find((p) => p.locationId === locationId || p.id === locationId) || null;
}
