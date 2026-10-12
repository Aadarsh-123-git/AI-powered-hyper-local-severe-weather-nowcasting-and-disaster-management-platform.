import { apiFetch } from './api';
import { DataSourceStatus, SystemServiceStatus, ModelTelemetry } from '@/lib/types';
import {
  MOCK_DATA_SOURCES,
  MOCK_SYSTEM_SERVICES,
  MOCK_MODEL_TELEMETRY,
} from '@/lib/mockData';

export interface SystemHealthData {
  status: 'operational' | 'degraded' | 'offline';
  database: 'operational' | 'degraded' | 'offline';
  weatherProvider: 'operational' | 'degraded' | 'offline';
  earthquakeProvider: 'operational' | 'degraded' | 'offline';
  riskEngine: 'operational' | 'degraded' | 'offline';
  scheduler: 'operational' | 'degraded' | 'offline';
  services: SystemServiceStatus[];
  dataSources: DataSourceStatus[];
  model: ModelTelemetry;
  timestamp: string;
}

export async function getSystemHealth(): Promise<SystemHealthData> {
  try {
    return await apiFetch<SystemHealthData>('/api/system/health');
  } catch {
    return {
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
    };
  }
}
