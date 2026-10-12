import { apiFetch } from './api';
import { FieldReport } from '@/lib/types';
import { getReportsStore, addReportToStore, verifyReportInStore, rejectReportInStore } from '@/lib/store';

export interface ReportFilters {
  status?: string;
  type?: string;
  district?: string;
  search?: string;
}

export async function getReports(filters?: ReportFilters): Promise<FieldReport[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.district && filters.district !== 'all') params.append('district', filters.district);
    if (filters?.search) params.append('q', filters.search);

    const query = params.toString();
    const endpoint = `/api/reports${query ? `?${query}` : ''}`;
    return await apiFetch<FieldReport[]>(endpoint);
  } catch {
    return getReportsStore({
      status: filters?.status,
      type: filters?.type,
      district: filters?.district,
      query: filters?.search,
    });
  }
}

export async function getReport(reportId: string): Promise<FieldReport | null> {
  const all = await getReports();
  return all.find((r) => r.id === reportId) || null;
}

export async function createReport(payload: Partial<FieldReport>): Promise<FieldReport> {
  try {
    return await apiFetch<FieldReport>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', reportData: payload }),
    });
  } catch {
    const newReport: FieldReport = {
      id: `rep-${Date.now()}`,
      reportType: payload.reportType || 'landslide',
      title: payload.title || 'Field Observation Report',
      location: payload.location || 'North Eastern Region Location',
      district: payload.district || 'East Sikkim',
      state: payload.state || 'Sikkim',
      latitude: payload.latitude || 27.3314,
      longitude: payload.longitude || 88.6138,
      timestamp: new Date().toISOString(),
      description: payload.description || '',
      mediaUrl: payload.mediaUrl || 'https://picsum.photos/seed/ner_field_report/640/420',
      reporterType: payload.reporterType || 'field_official',
      reporterName: payload.reporterName || 'Ground Observer',
      reporterPhone: payload.reporterPhone || '',
      verificationStatus: 'pending',
      aiAdvisoryAnalysis: 'Advisory: Observation uploaded. Awaiting physical ground verification.',
      roadAffected: payload.roadAffected || undefined,
    };
    return addReportToStore(newReport);
  }
}

export async function verifyReport(reportId: string, officerName?: string): Promise<FieldReport> {
  try {
    return await apiFetch<FieldReport>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', reportId, verifiedBy: officerName }),
    });
  } catch {
    return verifyReportInStore(reportId, officerName);
  }
}

export async function rejectReport(reportId: string, officerName?: string): Promise<FieldReport> {
  try {
    return await apiFetch<FieldReport>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', reportId, verifiedBy: officerName }),
    });
  } catch {
    return rejectReportInStore(reportId, officerName);
  }
}
