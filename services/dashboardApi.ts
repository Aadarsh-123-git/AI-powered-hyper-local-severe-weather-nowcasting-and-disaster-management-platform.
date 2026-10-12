import { apiFetch } from './api';
import {
  DashboardSummary,
  RiskPrediction,
  PriorityAction,
  RainfallDataPoint,
  RiskTrendDataPoint,
} from '@/lib/types';
import {
  MOCK_PREDICTIONS,
  MOCK_PRIORITY_ACTIONS,
} from '@/lib/mockData';
import { generateDistrictHazardAnalytics } from '@/lib/analyticsDataGenerator';

export interface DashboardData {
  summary: DashboardSummary;
  risk: RiskPrediction[];
  priorityActions: PriorityAction[];
  rainfallTrend: RainfallDataPoint[];
  riskTrend: RiskTrendDataPoint[];
  updatedAt: string;
  dataFreshness: string;
}

export async function getDashboardSummary(
  district: string = 'all',
  hazard: string = 'all'
): Promise<DashboardData> {
  try {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (hazard) params.append('hazard', hazard);
    const queryString = params.toString();
    const endpoint = queryString ? `/api/dashboard/summary?${queryString}` : '/api/dashboard/summary';

    return await apiFetch<DashboardData>(endpoint);
  } catch {
    const analytics = generateDistrictHazardAnalytics(district, hazard, '24h');
    return {
      summary: {
        activeCriticalAlerts: 2,
        highRiskZones: 5,
        atRiskRoads: 3,
        pendingFieldReports: 2,
        lastUpdated: new Date().toISOString(),
        dataFreshness: 'Offline fallback mode active',
      },
      risk: MOCK_PREDICTIONS,
      priorityActions: MOCK_PRIORITY_ACTIONS,
      rainfallTrend: analytics.rainfallTrend,
      riskTrend: analytics.riskTrend,
      updatedAt: new Date().toISOString(),
      dataFreshness: 'Offline fallback (Sample data)',
    };
  }
}

