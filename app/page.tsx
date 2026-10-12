'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Sidebar, { ActiveNavTab } from '@/components/layout/Sidebar';
import LocationPanel from '@/components/map/LocationPanel';
import SummaryMetric from '@/components/dashboard/SummaryMetric';
import PriorityActions from '@/components/dashboard/PriorityActions';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import AlertList from '@/components/alerts/AlertList';
import AlertDetailModal from '@/components/alerts/AlertDetailModal';
import ReportList from '@/components/reports/ReportList';
import ReportDetailModal from '@/components/reports/ReportDetailModal';
import NewReportModal from '@/components/reports/NewReportModal';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import SystemStatusView from '@/components/system/SystemStatusView';
import HelpModal from '@/components/layout/HelpModal';
import AiNowcastSimulatorModal from '@/components/analytics/AiNowcastSimulatorModal';
import SmsDispatchModal from '@/components/alerts/SmsDispatchModal';
import IntegrationsHub from '@/components/system/IntegrationsHub';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] bg-slate-100 border border-slate-200 rounded-md flex flex-col items-center justify-center text-slate-500 text-xs">
      <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin mb-2" />
      <span>Loading OpenStreetMap & Satellite GIS Layers...</span>
    </div>
  ),
});

import {
  RiskPrediction,
  AlertItem,
  FieldReport,
  UserRole,
  PriorityAction,
  RiskLevel,
} from '@/lib/types';

import { getDashboardSummary, DashboardData } from '@/services/dashboardApi';
import { getRiskMapData, RiskMapFilters } from '@/services/riskApi';
import { getAlerts, acknowledgeAlert, resolveAlert, createAlert } from '@/services/alertsApi';
import { getReports, createReport, verifyReport, rejectReport } from '@/services/reportsApi';
import { getAnalyticsData, AnalyticsData } from '@/services/analyticsApi';
import { getSystemHealth, SystemHealthData } from '@/services/systemApi';

import {
  MOCK_PREDICTIONS,
  MOCK_ALERTS,
  MOCK_REPORTS,
  MOCK_PRIORITY_ACTIONS,
  MOCK_RAINFALL_TREND,
  MOCK_RISK_TREND,
  MOCK_IWV_TREND,
  MOCK_DATA_SOURCES,
  MOCK_SYSTEM_SERVICES,
  MOCK_MODEL_TELEMETRY,
} from '@/lib/mockData';

const INITIAL_DASHBOARD_DATA: DashboardData = {
  summary: {
    activeCriticalAlerts: 2,
    highRiskZones: 5,
    atRiskRoads: 3,
    pendingFieldReports: 2,
    lastUpdated: new Date().toISOString(),
    dataFreshness: 'Live Telemetry Synchronized',
  },
  risk: MOCK_PREDICTIONS,
  priorityActions: MOCK_PRIORITY_ACTIONS,
  rainfallTrend: MOCK_RAINFALL_TREND,
  riskTrend: MOCK_RISK_TREND,
  updatedAt: new Date().toISOString(),
  dataFreshness: 'Live Telemetry Synchronized',
};

const INITIAL_ANALYTICS_DATA: AnalyticsData = {
  rainfallTrend: MOCK_RAINFALL_TREND,
  riskTrend: MOCK_RISK_TREND,
  iwvTrend: MOCK_IWV_TREND,
  hazardEvents: [
    { type: 'Cloudburst', count: 18, critical: 5, resolved: 11 },
    { type: 'Severe Thunderstorm', count: 24, critical: 8, resolved: 16 },
    { type: 'Flash Flood', count: 14, critical: 4, resolved: 10 },
  ],
  alertPerformance: {
    totalAlertsGenerated: 42,
    confirmedEvents: 37,
    falseAlerts: 4,
    missedEvents: 1,
    precisionPct: 90.2,
    recallPct: 97.3,
    averageLeadTimeHours: 4.2,
  },
  modelInfo: MOCK_MODEL_TELEMETRY,
  timestamp: new Date().toISOString(),
};

const INITIAL_SYSTEM_HEALTH: SystemHealthData = {
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

import {
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  ChevronRight,
  SlidersHorizontal,
  Cpu,
  Radio,
  Zap,
  Sparkles,
  BellRing,
  X,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export default function HomePage() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [userRole, setUserRole] = useState<UserRole>('district_officer');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Modal States
  const [isAiSimulatorOpen, setIsAiSimulatorOpen] = useState<boolean>(false);
  const [isSmsDispatchOpen, setIsSmsDispatchOpen] = useState<boolean>(false);
  const [simulatedToastAlert, setSimulatedToastAlert] = useState<AlertItem | null>(null);

  const [smsDispatchData, setSmsDispatchData] = useState<{
    location: string;
    riskLevel: RiskLevel;
    action: string;
    isSimulated?: boolean;
    simulationVariables?: AlertItem['simulationVariables'];
  }>({
    location: 'Cherrapunji (Sohra Plateau Basin)',
    riskLevel: 'CRITICAL',
    action: 'Flash flood alert for Wah Kaba drainage basin. Evacuate low-lying riverbeds within 2h.',
    isSimulated: false,
  });

  // Data States - Initialized instantly so UI renders immediately
  const [dashboardData, setDashboardData] = useState<DashboardData>(INITIAL_DASHBOARD_DATA);
  const [predictions, setPredictions] = useState<RiskPrediction[]>(MOCK_PREDICTIONS);
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [reports, setReports] = useState<FieldReport[]>(MOCK_REPORTS);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(INITIAL_ANALYTICS_DATA);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData>(INITIAL_SYSTEM_HEALTH);

  // UI Interactive States
  const [selectedPrediction, setSelectedPrediction] = useState<RiskPrediction | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);
  const [isNewReportOpen, setIsNewReportOpen] = useState<boolean>(false);

  // Filter States for Map and Dashboard
  const [hazardFilter, setHazardFilter] = useState<string>('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  const [timeWindowFilter, setTimeWindowFilter] = useState<string>('all');

  // Loading & Sync States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Primary Data Loading Function
  const loadAllData = useCallback(async (isSilent = false) => {
    try {
      if (isSilent) {
        setIsRefreshing(true);
      }
      const [dash, preds, alts, reps, anlyt, health] = await Promise.all([
        getDashboardSummary(selectedDistrict, hazardFilter),
        getRiskMapData({
          hazard: hazardFilter,
          riskLevel: riskLevelFilter,
          district: selectedDistrict,
        }),
        getAlerts({ district: selectedDistrict, hazard: hazardFilter }),
        getReports({ district: selectedDistrict, type: hazardFilter }),
        getAnalyticsData(selectedDistrict, hazardFilter),
        getSystemHealth(),
      ]);

      setErrorState(null);
      setDashboardData(dash);
      setPredictions(preds);
      setAlerts(alts);
      setReports(reps);
      setAnalyticsData(anlyt);
      setSystemHealth(health);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: unknown) {
      console.error('[MEGH-AI] Data fetch error:', err);
      setErrorState('Unable to communicate with early-warning telemetry server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [hazardFilter, riskLevelFilter, selectedDistrict]);

  // Initial fetch
  useEffect(() => {
    let isMounted = true;
    const initializeData = async () => {
      await Promise.resolve();
      if (isMounted) {
        await loadAllData(false);
      }
    };
    initializeData();
    return () => {
      isMounted = false;
    };
  }, [loadAllData]);

  // 45-second Periodic Polling for operational data freshness as specified in contract
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData(true);
    }, 45000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // District & Location Selection Handlers
  const handleDistrictChange = useCallback((district: string) => {
    setSelectedDistrict(district);
    if (district && district !== 'all') {
      const match = predictions.find((p) => p.district === district) || MOCK_PREDICTIONS.find((p) => p.district === district);
      if (match) {
        setSelectedPrediction(match);
      }
    } else {
      setSelectedPrediction(null);
    }
  }, [predictions]);

  const handleLocationSelect = useCallback((pred: RiskPrediction) => {
    setSelectedPrediction(pred);
    setSelectedDistrict(pred.district);
  }, []);

  // Alert Actions
  const handleGenerateSimulatedAlert = async (alertData: Partial<AlertItem>) => {
    try {
      const created = await createAlert(alertData);
      setAlerts((prev) => [created, ...prev]);
      setSimulatedToastAlert(created);
      if (created.district) {
        handleDistrictChange(created.district);
      }
      setDashboardData((prev) => ({
        ...prev,
        summary: {
          ...prev.summary,
          activeCriticalAlerts: created.severity === 'CRITICAL' ? prev.summary.activeCriticalAlerts + 1 : prev.summary.activeCriticalAlerts,
        },
      }));
    } catch (err) {
      console.error('Failed to register simulated alert:', err);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const updated = await acknowledgeAlert(alertId, 'District Duty Officer (DEOC)');
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      if (selectedAlert && selectedAlert.id === alertId) {
        setSelectedAlert(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const updated = await resolveAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      if (selectedAlert && selectedAlert.id === alertId) {
        setSelectedAlert(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Report Actions
  const handleVerifyReport = async (reportId: string) => {
    try {
      const updated = await verifyReport(reportId, 'IMD Duty Observer (DEOC)');
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      const updated = await rejectReport(reportId, 'IMD Duty Observer (DEOC)');
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReport = async (reportData: Partial<FieldReport>) => {
    try {
      const newRep = await createReport(reportData);
      setReports((prev) => [newRep, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // Map Navigation shortcuts
  const handleViewAlertFromLocation = (locationId: string) => {
    const alertMatch = alerts.find((a) => a.locationId === locationId);
    if (alertMatch) {
      setSelectedAlert(alertMatch);
    }
    setActiveTab('alerts');
  };

  const handleViewReportsFromLocation = (locationName: string) => {
    setActiveTab('reports');
  };

  const handleViewOnMapFromAlert = (locationId: string) => {
    const pred = predictions.find((p) => p.locationId === locationId || p.id === locationId);
    if (pred) {
      setSelectedPrediction(pred);
      setSelectedDistrict(pred.district);
    }
    setActiveTab('risk-map');
  };

  const handleViewOnMapFromReport = (lat: number, lng: number) => {
    // Find closest prediction or set active
    const closest = predictions.find(
      (p) => Math.abs(p.latitude - lat) < 0.2 && Math.abs(p.longitude - lng) < 0.2
    );
    if (closest) {
      setSelectedPrediction(closest);
      setSelectedDistrict(closest.district);
    }
    setActiveTab('risk-map');
  };

  const handlePriorityActionClick = (action: PriorityAction) => {
    const match = alerts.find((a) => a.location.toLowerCase().includes(action.location.slice(0, 8).toLowerCase()));
    if (match) {
      setSelectedAlert(match);
      setActiveTab('alerts');
    } else {
      setActiveTab('risk-map');
    }
  };

  // Filtered Predictions for Map view
  const displayPredictions = predictions.filter((p) => {
    if (hazardFilter !== 'all' && p.hazardType !== hazardFilter) return false;
    if (riskLevelFilter !== 'all' && p.riskLevel.toLowerCase() !== riskLevelFilter.toLowerCase()) return false;
    if (selectedDistrict !== 'all' && !p.district.toLowerCase().includes(selectedDistrict.toLowerCase())) return false;
    return true;
  });

  // Calculate active counts
  const activeCriticalAlertCount = alerts.filter(
    (a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE'
  ).length;

  const pendingReportCount = reports.filter(
    (r) => r.verificationStatus === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header */}
      <Header
        selectedDistrict={selectedDistrict}
        onDistrictChange={handleDistrictChange}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        isSystemLive={!errorState}
        onRefreshTelemetry={() => loadAllData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Workspace Layout (Sidebar + Content) */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeAlertCount={activeCriticalAlertCount}
          pendingReportCount={pendingReportCount}
          userRole={userRole}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Content Pane */}
        <main className="flex-1 p-4 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Error Banner if API encounters issues */}
          {errorState && (
            <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{errorState} Operating in localized resilience mode with cached telemetry.</span>
              </div>
              <button
                onClick={() => loadAllData(false)}
                className="px-2.5 py-1 bg-amber-800 text-white rounded font-medium hover:bg-amber-900 cursor-pointer"
              >
                Retry Telemetry Sync
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && !dashboardData && (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-700 mb-2" />
              <p className="font-semibold text-slate-800">Synchronizing MOSDAC Satellite & IMDAA Telemetry...</p>
              <p className="text-slate-400 mt-0.5">Fetching INSAT-3D/3DR WV/TIR channels, CartoDEM, and IMDAA reanalysis grids.</p>
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 1: OPERATIONAL DASHBOARD */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="space-y-4">
              {/* Header Title with Quick Action Buttons strictly conforming to spec */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Dashboard
                  </h2>
                  <p className="text-xs text-slate-500">
                    Severe weather nowcasting &bull; Multi-task 2-6 hour lead time AI prediction
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsAiSimulatorOpen(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run AI Nowcast Simulator</span>
                  </button>

                  <button
                    onClick={() => {
                      setSmsDispatchData({
                        location: 'Cherrapunji (Sohra Plateau Basin)',
                        riskLevel: 'CRITICAL',
                        action: 'Flash flood alert for Wah Kaba drainage basin. Evacuate low-lying riverbeds within 2h.',
                        isSimulated: false,
                      });
                      setIsSmsDispatchOpen(true);
                    }}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>Automated Early Warning Dispatch</span>
                  </button>
                </div>
              </div>

              {/* Top Summary: ONLY four compact metrics conforming to spec */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryMetric
                  label="Active Critical Alerts"
                  count={activeCriticalAlertCount}
                  context="Immediate road closure & evacuation watch"
                  type="critical"
                  onClick={() => setActiveTab('alerts')}
                />
                <SummaryMetric
                  label="High-Risk Zones"
                  count={dashboardData.summary.highRiskZones}
                  context="IWV & CAPE surge sectors (&ge; 75 Index)"
                  type="high"
                  onClick={() => setActiveTab('risk-map')}
                />
                <SummaryMetric
                  label="At-Risk Basins & Roads"
                  count={dashboardData.summary.atRiskRoads}
                  context="Teesta, Brahmaputra, Konkan & NH corridors"
                  type="roads"
                  onClick={() => setActiveTab('risk-map')}
                />
                <SummaryMetric
                  label="Pending Field Reports"
                  count={pendingReportCount}
                  context="Citizen observations awaiting verification"
                  type="reports"
                  onClick={() => setActiveTab('reports')}
                />
              </div>

              {/* Compact Filter Bar above the Map strictly conforming to spec */}
              <div className="bg-white border border-slate-200 rounded-md px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                <div className="flex items-center space-x-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-700">Map Filter:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Hazard Filter */}
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500 text-[11px]">Hazard:</span>
                    <select
                      value={hazardFilter}
                      onChange={(e) => setHazardFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="all">All Hazards</option>
                      <option value="severe_thunderstorm">Severe Thunderstorm</option>
                      <option value="cloudburst">Cloudburst</option>
                      <option value="flash_flood">Flash Flood</option>
                    </select>
                  </div>

                  {/* Risk Level Filter */}
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500 text-[11px]">Risk:</span>
                    <select
                      value={riskLevelFilter}
                      onChange={(e) => setRiskLevelFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="all">All Levels</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="moderate">Moderate</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Time Window Filter */}
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500 text-[11px]">Window:</span>
                    <select
                      value={timeWindowFilter}
                      onChange={(e) => setTimeWindowFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="all">Current Live</option>
                      <option value="2h">Next 2 Hours</option>
                      <option value="4h">Next 4 Hours</option>
                      <option value="6h">Next 6 Hours</option>
                    </select>
                  </div>

                  {/* Clear Filter Button */}
                  {(hazardFilter !== 'all' || riskLevelFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setHazardFilter('all');
                        setRiskLevelFilter('all');
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer ml-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Main Area: The Risk Map is the largest visual element */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-start">
                <div className={`${selectedPrediction ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-2`}>
                  <LeafletMap
                    predictions={displayPredictions}
                    selectedLocationId={selectedPrediction?.id}
                    onSelectLocation={handleLocationSelect}
                    height="460px"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>Active Telemetry: INSAT-3D/3DR TIR & WV + IMDAA Thermodynamic Reanalysis Grid</span>
                    <span className="font-mono">Showing {displayPredictions.length} Monitored Grid Cells</span>
                  </div>
                </div>

                {/* Right Side Location Panel (when location clicked) */}
                {selectedPrediction && (
                  <div className="lg:col-span-1 h-[460px]">
                    <LocationPanel
                      prediction={selectedPrediction}
                      onClose={() => setSelectedPrediction(null)}
                      onViewAlert={handleViewAlertFromLocation}
                      onViewReports={handleViewReportsFromLocation}
                      relatedReports={reports.filter((r) =>
                        r.location.toLowerCase().includes(selectedPrediction.district.toLowerCase())
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Priority Actions: Only 3-5 important actions conforming to spec */}
              <PriorityActions
                actions={dashboardData.priorityActions}
                onActionClick={handlePriorityActionClick}
                onViewAllAlerts={() => setActiveTab('alerts')}
              />

              {/* Bottom: Two compact charts (Rainfall Trend and Risk Trend) */}
              <DashboardCharts
                rainfallData={dashboardData.rainfallTrend}
                riskTrendData={dashboardData.riskTrend}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 2: DEDICATED RISK MAP */}
          {/* ========================================================= */}
          {activeTab === 'risk-map' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Risk Map
                  </h2>
                  <p className="text-xs text-slate-500">
                    Explore nowcast severe weather threat overlays with CartoDEM dynamic elevation shading
                  </p>
                </div>
              </div>

              {/* Map Filter Controls Bar */}
              <div className="bg-white border border-slate-200 rounded-md p-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-2xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 font-medium">Hazard:</span>
                    <select
                      value={hazardFilter}
                      onChange={(e) => setHazardFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs"
                    >
                      <option value="all">All Hazards</option>
                      <option value="severe_thunderstorm">Severe Thunderstorm</option>
                      <option value="cloudburst">Cloudburst</option>
                      <option value="flash_flood">Flash Flood</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 font-medium">Risk Level:</span>
                    <select
                      value={riskLevelFilter}
                      onChange={(e) => setRiskLevelFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs"
                    >
                      <option value="all">All Levels</option>
                      <option value="critical">Critical (&ge;75)</option>
                      <option value="high">High (50-74)</option>
                      <option value="moderate">Moderate (25-49)</option>
                      <option value="low">Low (0-24)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 font-medium">Horizon:</span>
                    <select
                      value={timeWindowFilter}
                      onChange={(e) => setTimeWindowFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs"
                    >
                      <option value="all">Current Forecast</option>
                      <option value="2h">Next 2 Hours</option>
                      <option value="4h">Next 4 Hours</option>
                      <option value="6h">Next 6 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Click any marker to inspect atmospheric predictors & XAI factor attribution
                </div>
              </div>

              {/* Dominant Map Container with Side Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                <div className={`${selectedPrediction ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  <LeafletMap
                    predictions={displayPredictions}
                    selectedLocationId={selectedPrediction?.id}
                    onSelectLocation={handleLocationSelect}
                    height="620px"
                    zoomLevel={5}
                  />
                </div>

                {selectedPrediction ? (
                  <div className="lg:col-span-1 h-[620px]">
                    <LocationPanel
                      prediction={selectedPrediction}
                      onClose={() => setSelectedPrediction(null)}
                      onViewAlert={handleViewAlertFromLocation}
                      onViewReports={handleViewReportsFromLocation}
                      relatedReports={reports.filter((r) =>
                        r.location.toLowerCase().includes(selectedPrediction.district.toLowerCase())
                      )}
                    />
                  </div>
                ) : (
                  <div className="hidden lg:block lg:col-span-1 h-[620px] bg-white border border-slate-200 rounded-md p-4 text-xs text-slate-500 flex flex-col justify-center text-center">
                    <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No Station Selected</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click any active weather cluster marker on the map to inspect live IWV, CAPE/CIN, low-level convergence, CTT drop rate, and XAI feature attributions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 3: OPERATIONAL ALERTS INBOX */}
          {/* ========================================================= */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Alerts
                  </h2>
                  <p className="text-xs text-slate-500">
                    Severe weather early warnings, multi-hazard triggers, and automated CAP / SMS dispatch
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-mono">
                  {alerts.length} Total Registered Alerts
                </span>
              </div>

              <AlertList
                alerts={alerts}
                onSelectAlert={(a) => setSelectedAlert(a)}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onViewOnMap={handleViewOnMapFromAlert}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 4: FIELD REPORTS */}
          {/* ========================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Field Reports
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ground-truth verification queue for citizen weather spotters, field observers, and NDRF teams
                  </p>
                </div>
              </div>

              <ReportList
                reports={reports}
                onSelectReport={(r) => setSelectedReport(r)}
                onOpenNewReportModal={() => setIsNewReportOpen(true)}
                onVerify={handleVerifyReport}
                onReject={handleRejectReport}
                onViewOnMap={handleViewOnMapFromReport}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 5: ANALYTICS */}
          {/* ========================================================= */}
          {activeTab === 'analytics' && analyticsData && (
            <div className="space-y-3">
              <div className="pb-1 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Analytics
                </h2>
                <p className="text-xs text-slate-500">
                  Atmospheric stability metrics, IWV accumulation profiles, and multi-task transformer validation
                </p>
              </div>

              <AnalyticsCharts
                data={analyticsData}
                selectedDistrict={selectedDistrict}
                onDistrictChange={handleDistrictChange}
                selectedHazard={hazardFilter}
                onHazardChange={setHazardFilter}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 6: FEEDS & SENSORS INTEGRATIONS HUB */}
          {/* ========================================================= */}
          {activeTab === 'integrations' && (
            <IntegrationsHub dataSources={systemHealth?.dataSources || MOCK_DATA_SOURCES} />
          )}

          {/* ========================================================= */}
          {/* PAGE 7: SYSTEM HEALTH */}
          {/* ========================================================= */}
          {activeTab === 'system' && systemHealth && (
            <div className="space-y-3">
              <div className="pb-1 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  System
                </h2>
                <p className="text-xs text-slate-500">
                  Infrastructure health, MOSDAC/IMDAA satellite ingestion, and MTL transformer inference performance
                </p>
              </div>

              <SystemStatusView
                healthData={systemHealth}
                onRefresh={() => loadAllData(true)}
                isRefreshing={isRefreshing}
              />
            </div>
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <AiNowcastSimulatorModal
        isOpen={isAiSimulatorOpen}
        onClose={() => setIsAiSimulatorOpen(false)}
        initialDistrict={selectedDistrict !== 'all' ? selectedDistrict : (selectedPrediction?.district || 'East Khasi Hills')}
        onSelectDistrict={handleDistrictChange}
        onGenerateSimulatedAlert={handleGenerateSimulatedAlert}
        onOpenSmsDispatch={(simulated) => {
          setSmsDispatchData({
            location: simulated.location || 'NER Region',
            riskLevel: (simulated.severity === 'CRITICAL' ? 'CRITICAL' : simulated.severity === 'WARNING' ? 'HIGH' : 'MODERATE') as RiskLevel,
            action: simulated.recommendedAction || 'Monitor status',
            isSimulated: simulated.isSimulated,
            simulationVariables: simulated.simulationVariables,
          });
          setIsSmsDispatchOpen(true);
        }}
      />

      <SmsDispatchModal
        isOpen={isSmsDispatchOpen}
        onClose={() => setIsSmsDispatchOpen(false)}
        initialLocation={smsDispatchData.location}
        initialRiskLevel={smsDispatchData.riskLevel}
        initialAction={smsDispatchData.action}
        isSimulated={smsDispatchData.isSimulated}
        simulationVariables={smsDispatchData.simulationVariables}
        onDispatchedAlert={handleGenerateSimulatedAlert}
      />

      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
        onViewOnMap={handleViewOnMapFromAlert}
      />

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onVerify={handleVerifyReport}
        onReject={handleRejectReport}
        onViewOnMap={handleViewOnMapFromReport}
      />

      <NewReportModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        onSubmit={handleCreateReport}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Persistent AI Simulation Alert Popup Toast */}
      {simulatedToastAlert && (
        <aside
          role="region"
          aria-label="Simulation Alert Notification"
          className="fixed bottom-5 right-5 z-[9999] max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Toast Header */}
          <div className="bg-white text-slate-900 border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xs text-slate-900">AI NOWCAST SIMULATED ALERT</span>
                <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                  DRILL ONLY
                </span>
              </div>
            </div>
            <button
              onClick={() => setSimulatedToastAlert(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toast Body */}
          <div className="p-3.5 space-y-2 text-xs text-slate-800 bg-slate-50/50">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{simulatedToastAlert.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium">{simulatedToastAlert.location}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 font-mono ${
                simulatedToastAlert.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
              }`}>
                {simulatedToastAlert.severity}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 text-slate-700 shadow-2xs">
              <div className="flex justify-between font-mono">
                <span>Predicted Risk Index:</span>
                <strong className="text-slate-900 font-bold">{simulatedToastAlert.riskScore}/100</strong>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                <strong>Action:</strong> {simulatedToastAlert.recommendedAction}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedAlert(simulatedToastAlert);
                  setSimulatedToastAlert(null);
                }}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-xs flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Scenario</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('alerts');
                  setSimulatedToastAlert(null);
                }}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-xs flex items-center justify-center space-x-1 border border-slate-300 cursor-pointer"
              >
                <span>View in Alerts Queue</span>
              </button>

              <button
                type="button"
                onClick={() => setSimulatedToastAlert(null)}
                className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

