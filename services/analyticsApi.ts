import { apiFetch } from './api';
import {
  RainfallDataPoint,
  IwvTrendDataPoint,
  InstabilityTrendDataPoint,
  RiskTrendDataPoint,
  ModelTelemetry,
} from '@/lib/types';
import { generateDistrictHazardAnalytics } from '@/lib/analyticsDataGenerator';

export interface AnalyticsData {
  rainfallTrend: RainfallDataPoint[];
  iwvTrend?: IwvTrendDataPoint[];
  instabilityTrend?: InstabilityTrendDataPoint[];
  riskTrend: RiskTrendDataPoint[];
  hazardEvents: { type: string; count: number; critical: number; resolved: number }[];
  alertPerformance: {
    totalAlertsGenerated: number;
    confirmedEvents: number;
    falseAlerts: number;
    missedEvents: number;
    precisionPct: number;
    recallPct: number;
    averageLeadTimeHours: number;
  };
  modelInfo: ModelTelemetry;
  timestamp: string;
}

export async function getAnalyticsData(
  district: string = 'all',
  hazard: string = 'all',
  period: string = '7d'
): Promise<AnalyticsData> {
  try {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (hazard) params.append('hazard', hazard);
    if (period) params.append('period', period);

    const queryString = params.toString();
    const endpoint = queryString ? `/api/analytics?${queryString}` : '/api/analytics';

    return await apiFetch<AnalyticsData>(endpoint);
  } catch {
    return generateDistrictHazardAnalytics(district, hazard, period);
  }
}
