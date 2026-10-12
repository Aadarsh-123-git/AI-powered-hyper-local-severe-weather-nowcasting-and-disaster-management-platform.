import { AlertItem, FieldReport, DashboardSummary, RiskPrediction } from './types';
import { MOCK_ALERTS, MOCK_REPORTS } from './mockData';
import { getLiveTelemetryData } from '@/services/telemetryService';

// Shared in-memory store for manual additions/modifications (e.g. user acknowledged/resolved)
let alertsStore: AlertItem[] = [...MOCK_ALERTS];
let reportsStore: FieldReport[] = [...MOCK_REPORTS];
let userModifiedAlerts: Record<string, { status?: AlertItem['status']; acknowledgedBy?: string; acknowledgedAt?: string; resolvedAt?: string }> = {};

export function matchesDistrict(itemDistrict: string, targetDistrict?: string): boolean {
  if (!targetDistrict || targetDistrict === 'all') return true;
  const itemNorm = itemDistrict.toLowerCase();
  const targetNorm = targetDistrict.toLowerCase();
  return (
    itemNorm.includes(targetNorm) ||
    targetNorm.includes(itemNorm) ||
    (targetNorm.includes('imphal') && itemNorm.includes('noney')) ||
    (targetNorm.includes('noney') && itemNorm.includes('imphal'))
  );
}

export function matchesHazard(itemHazard: string, targetHazard?: string): boolean {
  if (!targetHazard || targetHazard === 'all') return true;
  const itemNorm = itemHazard.toLowerCase().replace(/_/g, ' ');
  const targetNorm = targetHazard.toLowerCase().replace(/_/g, ' ');
  return itemNorm.includes(targetNorm) || targetNorm.includes(itemNorm);
}

// DYNAMIC ALERTS STORE FUNCTIONS (Merges Live Telemetry + Base Operational Alerts + User Actions)
export async function getAlertsStoreAsync(filters?: {
  district?: string;
  hazard?: string;
  severity?: string;
  status?: string;
  query?: string;
  simulated?: boolean;
}): Promise<AlertItem[]> {
  const telemetry = await getLiveTelemetryData();
  
  const alertMap = new Map<string, AlertItem>();
  // 1. Initial base operational alerts
  MOCK_ALERTS.forEach((a) => alertMap.set(a.id, a));
  // 2. Telemetry alerts
  telemetry.alerts.forEach((a) => alertMap.set(a.id, a));
  // 3. Store alerts (includes new user created/simulated alerts)
  alertsStore.forEach((a) => alertMap.set(a.id, a));

  let list = Array.from(alertMap.values());

  // Apply user-initiated overrides (acknowledgements/resolutions)
  list = list.map((item) => {
    const override = userModifiedAlerts[item.id];
    if (override) {
      return { ...item, ...override };
    }
    return item;
  });

  if (filters?.simulated !== undefined) {
    list = list.filter((a) => !!a.isSimulated === filters.simulated);
  }
  if (filters?.district && filters.district !== 'all') {
    list = list.filter((a) => matchesDistrict(a.district, filters.district));
  }
  if (filters?.hazard && filters.hazard !== 'all') {
    list = list.filter((a) => matchesHazard(a.hazardType, filters.hazard));
  }
  if (filters?.severity && filters.severity !== 'all') {
    list = list.filter((a) => a.severity.toLowerCase() === filters.severity!.toLowerCase());
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((a) => a.status.toLowerCase() === filters.status!.toLowerCase());
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q)
    );
  }
  return list;
}

// Synchronous fallback for legacy calls
export function getAlertsStore(filters?: {
  district?: string;
  hazard?: string;
  severity?: string;
  status?: string;
  query?: string;
  simulated?: boolean;
}): AlertItem[] {
  const alertMap = new Map<string, AlertItem>();
  MOCK_ALERTS.forEach((a) => alertMap.set(a.id, a));
  alertsStore.forEach((a) => alertMap.set(a.id, a));

  let list = Array.from(alertMap.values());
  list = list.map((item) => {
    const override = userModifiedAlerts[item.id];
    if (override) {
      return { ...item, ...override };
    }
    return item;
  });

  if (filters?.simulated !== undefined) {
    list = list.filter((a) => !!a.isSimulated === filters.simulated);
  }
  if (filters?.district && filters.district !== 'all') {
    list = list.filter((a) => matchesDistrict(a.district, filters.district));
  }
  if (filters?.hazard && filters.hazard !== 'all') {
    list = list.filter((a) => matchesHazard(a.hazardType, filters.hazard));
  }
  if (filters?.severity && filters.severity !== 'all') {
    list = list.filter((a) => a.severity.toLowerCase() === filters.severity!.toLowerCase());
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((a) => a.status.toLowerCase() === filters.status!.toLowerCase());
  }
  return list;
}

export function addAlertToStore(alert: AlertItem): AlertItem {
  alertsStore.unshift(alert);
  return alert;
}

export function acknowledgeAlertInStore(alertId: string, officerName?: string): AlertItem {
  userModifiedAlerts[alertId] = {
    status: 'ACKNOWLEDGED',
    acknowledgedBy: officerName || 'District Officer (DEOC)',
    acknowledgedAt: new Date().toISOString(),
  };

  const idx = alertsStore.findIndex((a) => a.id === alertId);
  if (idx !== -1) {
    alertsStore[idx] = {
      ...alertsStore[idx],
      ...userModifiedAlerts[alertId],
    };
    return alertsStore[idx];
  }
  return {
    id: alertId,
    severity: 'WARNING',
    title: 'Acknowledged Alert',
    location: 'NER Region',
    district: 'NER',
    state: 'NER',
    locationId: 'loc-001',
    hazardType: 'landslide',
    riskScore: 60,
    probability: 0.6,
    forecastWindow: 'Next 6 hours',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'ACKNOWLEDGED',
    acknowledgedBy: officerName || 'District Officer (DEOC)',
    acknowledgedAt: new Date().toISOString(),
    factors: ['Acknowledged by Duty Officer'],
    recommendedAction: 'Monitor status',
    modelVersion: 'NER-v2.1',
    recipientGroup: 'DEOC Teams',
  };
}

export function resolveAlertInStore(alertId: string): AlertItem {
  userModifiedAlerts[alertId] = {
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
  };

  const idx = alertsStore.findIndex((a) => a.id === alertId);
  if (idx !== -1) {
    alertsStore[idx] = {
      ...alertsStore[idx],
      ...userModifiedAlerts[alertId],
    };
    return alertsStore[idx];
  }
  return {
    id: alertId,
    severity: 'INFORMATION',
    title: 'Resolved Alert',
    location: 'NER Region',
    district: 'NER',
    state: 'NER',
    locationId: 'loc-001',
    hazardType: 'landslide',
    riskScore: 20,
    probability: 0.2,
    forecastWindow: 'Clear',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
    factors: ['Conditions clear'],
    recommendedAction: 'Resume normal operations',
    modelVersion: 'NER-v2.1',
    recipientGroup: 'DEOC Teams',
  };
}

// REPORTS STORE FUNCTIONS
export function getReportsStore(filters?: {
  district?: string;
  type?: string;
  status?: string;
  query?: string;
}): FieldReport[] {
  let list = [...reportsStore];

  if (filters?.district && filters.district !== 'all') {
    list = list.filter((r) => matchesDistrict(r.district, filters.district));
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((r) => r.verificationStatus.toLowerCase() === filters.status!.toLowerCase());
  }
  if (filters?.type && filters.type !== 'all') {
    list = list.filter((r) => matchesHazard(r.reportType, filters.type));
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }
  return list;
}

export function addReportToStore(report: FieldReport): FieldReport {
  reportsStore.unshift(report);
  return report;
}

export function verifyReportInStore(reportId: string, verifiedBy?: string): FieldReport {
  const idx = reportsStore.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    reportsStore[idx] = {
      ...reportsStore[idx],
      verificationStatus: 'verified',
      verifiedBy: verifiedBy || 'Senior District Geologist (DEOC)',
      verifiedAt: new Date().toISOString(),
    };
    return reportsStore[idx];
  }
  const mockReport = MOCK_REPORTS.find((r) => r.id === reportId);
  if (mockReport) {
    const updated: FieldReport = {
      ...mockReport,
      verificationStatus: 'verified',
      verifiedBy: verifiedBy || 'Senior District Geologist (DEOC)',
      verifiedAt: new Date().toISOString(),
    };
    reportsStore.unshift(updated);
    return updated;
  }
  return {
    id: reportId,
    reportType: 'landslide',
    title: 'Verified Field Report',
    location: 'NER Region',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.2702,
    longitude: 91.7323,
    timestamp: new Date().toISOString(),
    description: 'Verified field observation report',
    mediaUrl: 'https://picsum.photos/seed/ner_field_report/640/420',
    reporterType: 'field_official',
    reporterName: 'Ground Observer',
    verificationStatus: 'verified',
    verifiedBy: verifiedBy || 'Senior District Geologist (DEOC)',
    verifiedAt: new Date().toISOString(),
  };
}

export function rejectReportInStore(reportId: string, verifiedBy?: string): FieldReport {
  const idx = reportsStore.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    reportsStore[idx] = {
      ...reportsStore[idx],
      verificationStatus: 'rejected',
      verifiedBy: verifiedBy || 'Executive Magistrate / DEOC',
      verifiedAt: new Date().toISOString(),
    };
    return reportsStore[idx];
  }
  const mockReport = MOCK_REPORTS.find((r) => r.id === reportId);
  if (mockReport) {
    const updated: FieldReport = {
      ...mockReport,
      verificationStatus: 'rejected',
      verifiedBy: verifiedBy || 'Executive Magistrate / DEOC',
      verifiedAt: new Date().toISOString(),
    };
    reportsStore.unshift(updated);
    return updated;
  }
  return {
    id: reportId,
    reportType: 'landslide',
    title: 'Rejected Field Report',
    location: 'NER Region',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.2702,
    longitude: 91.7323,
    timestamp: new Date().toISOString(),
    description: 'Report marked invalid or duplicate',
    mediaUrl: 'https://picsum.photos/seed/ner_field_report/640/420',
    reporterType: 'field_official',
    reporterName: 'Ground Observer',
    verificationStatus: 'rejected',
    verifiedBy: verifiedBy || 'Executive Magistrate / DEOC',
    verifiedAt: new Date().toISOString(),
  };
}

// DYNAMIC DASHBOARD SUMMARY COMPUTATION FROM LIVE TELEMETRY
export async function getDynamicDashboardSummaryAsync(
  district: string = 'all',
  hazard: string = 'all'
): Promise<DashboardSummary> {
  const telemetry = await getLiveTelemetryData();
  const districtAlerts = await getAlertsStoreAsync({ district, hazard });
  const districtReports = getReportsStore({ district, type: hazard });

  const districtPredictions = telemetry.predictions.filter(
    (p) => matchesDistrict(p.district, district) && matchesHazard(p.hazardType, hazard)
  );

  const activeCriticalAlerts = districtAlerts.filter(
    (a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE'
  ).length;

  const highRiskZones = districtPredictions.filter(
    (p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH'
  ).length;

  const atRiskRoads = districtAlerts.filter((a) => a.status === 'ACTIVE').length;

  const pendingFieldReports = districtReports.filter(
    (r) => r.verificationStatus === 'pending'
  ).length;

  return {
    activeCriticalAlerts,
    highRiskZones,
    atRiskRoads,
    pendingFieldReports,
    lastUpdated: new Date().toISOString(),
    dataFreshness: `Live Open-Meteo Telemetry (${district === 'all' ? 'All NER Districts' : district})`,
  };
}

export function getDynamicDashboardSummary(district: string = 'all', hazard: string = 'all'): DashboardSummary {
  const districtAlerts = getAlertsStore({ district, hazard });
  const districtReports = getReportsStore({ district, type: hazard });
  
  const activeCriticalAlerts = districtAlerts.filter(
    (a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE'
  ).length;
  const highRiskZones = districtAlerts.filter(
    (a) => (a.severity === 'CRITICAL' || a.severity === 'WARNING') && a.status === 'ACTIVE'
  ).length;
  const atRiskRoads = districtAlerts.filter((a) => a.status === 'ACTIVE').length;

  return {
    activeCriticalAlerts,
    highRiskZones,
    atRiskRoads,
    pendingFieldReports: districtReports.filter((r) => r.verificationStatus === 'pending').length,
    lastUpdated: new Date().toISOString(),
    dataFreshness: `Live Telemetry Synchronized (${district === 'all' ? 'All NER Districts' : district})`,
  };
}
