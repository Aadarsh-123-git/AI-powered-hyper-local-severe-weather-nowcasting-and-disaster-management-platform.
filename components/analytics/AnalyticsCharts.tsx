'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { AnalyticsData } from '@/services/analyticsApi';
import { generateDistrictHazardAnalytics } from '@/lib/analyticsDataGenerator';
import {
  BarChart3,
  CloudRain,
  TrendingUp,
  Cpu,
  Target,
  Zap,
  RefreshCw,
  Radio,
  Sparkles,
} from 'lucide-react';

interface AnalyticsChartsProps {
  data: AnalyticsData;
  selectedDistrict?: string;
  onDistrictChange?: (district: string) => void;
  selectedHazard?: string;
  onHazardChange?: (hazard: string) => void;
}

const DISTRICT_METADATA: Record<string, { basin: string; terrain: string; warningNote: string }> = {
  'Central Delhi': {
    basin: 'Yamuna Floodplain & Najafgarh',
    terrain: 'Urban Heat Island / Alluvial Lowland (Elev: 216m)',
    warningNote: 'Explosive convective CAPE with strong inversion cap breakdown.',
  },
  'East Khasi Hills': {
    basin: 'Sohra Escarpment & Shella Basin',
    terrain: 'Funnel Plateau / Deep Sandstone Gorges (Elev: 1,430m)',
    warningNote: 'World-record orographic lift; continuous moisture column > 65 kg/m².',
  },
  'North Sikkim': {
    basin: 'Upper Teesta Glacial Gorge',
    terrain: 'Steep Alpine Glaciated Slopes (Elev: 2,100m, Slope 44°)',
    warningNote: 'Sudden debris flow & glacial cloudburst trigger with rapid 2h onset.',
  },
  'Uttarkashi': {
    basin: 'Bhagirathi Upper Himalayan Valley',
    terrain: 'Deep Mountain Escarpment (Elev: 1,352m, Slope 39°)',
    warningNote: 'Funneled valley convection triggering torrential runoff spikes.',
  },
  'Mumbai Suburban': {
    basin: 'Mithi River Estuary & Coastal Drain',
    terrain: 'Coastal Estuarine Plain (Elev: 8m, Tidal Lock Risk)',
    warningNote: 'Marine boundary moisture flux with tidal flooding compounding.',
  },
  'Kamrup Metropolitan': {
    basin: 'Bharalu Stream & Deepor Beel',
    terrain: 'Brahmaputra Valley Trough (Elev: 55m)',
    warningNote: 'High alluvial moisture stagnation and severe urban flash floods.',
  },
  'Noney / Imphal West': {
    basin: 'Ijei River Hydro-Catchment',
    terrain: 'V-shaped Rugged Cuttings (Elev: 780m, Slope 37°)',
    warningNote: 'Landslide damming and riverbed flash surge sensitivity.',
  },
  'Chennai': {
    basin: 'Adyar & Cooum Coastal Catchment',
    terrain: 'Maritime Coastal Lowland (Elev: 6m)',
    warningNote: 'Bay of Bengal convective squalls and urban inundation.',
  },
  'all': {
    basin: 'National Multi-Basin Composite Grid',
    terrain: 'Aggregated Monitoring Stations & Hydrologic Basins',
    warningNote: 'Weighted national multi-hazard risk synthesis.',
  },
};

export default function AnalyticsCharts({
  data,
  selectedDistrict: externalDistrict,
  onDistrictChange,
  selectedHazard: externalHazard,
  onHazardChange,
}: AnalyticsChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [prevExternalDistrict, setPrevExternalDistrict] = useState(externalDistrict);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(externalDistrict || 'all');
  const [prevExternalHazard, setPrevExternalHazard] = useState(externalHazard);
  const [selectedHazard, setSelectedHazard] = useState<string>(externalHazard || 'all');

  // Real-time telemetry simulation state
  const [liveSeed, setLiveSeed] = useState<number>(() => Date.now());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncSeconds, setLastSyncSeconds] = useState<number>(4);

  // Sync with external parent selections
  if (externalDistrict !== undefined && externalDistrict !== prevExternalDistrict) {
    setPrevExternalDistrict(externalDistrict);
    setSelectedDistrict(externalDistrict);
  }

  if (externalHazard !== undefined && externalHazard !== prevExternalHazard) {
    setPrevExternalHazard(externalHazard);
    setSelectedHazard(externalHazard);
  }

  // Periodic heartbeat simulating real-time telemetry updates
  useEffect(() => {
    const secTimer = setInterval(() => {
      setLastSyncSeconds((s) => s + 1);
    }, 1000);

    const streamTimer = setInterval(() => {
      setLiveSeed((prev) => prev + 1);
      setLastSyncSeconds(0);
    }, 30000);

    return () => {
      clearInterval(secTimer);
      clearInterval(streamTimer);
    };
  }, []);

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setLiveSeed((prev) => prev + 1);
    if (onDistrictChange) {
      onDistrictChange(district);
    }
  };

  const handleHazardSelect = (hazard: string) => {
    setSelectedHazard(hazard);
    setLiveSeed((prev) => prev + 1);
    if (onHazardChange) {
      onHazardChange(hazard);
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLiveSeed(Date.now());
      setLastSyncSeconds(0);
      setIsSyncing(false);
    }, 500);
  };

  // Dynamically compute dataset for selected district, hazard, time period, and live stream seed
  const activeAnalytics = useMemo(() => {
    return generateDistrictHazardAnalytics(selectedDistrict, selectedHazard, selectedPeriod, liveSeed);
  }, [selectedDistrict, selectedHazard, selectedPeriod, liveSeed]);

  const { iwvTrend, instabilityTrend, riskTrend, hazardEvents, alertPerformance, modelInfo } = activeAnalytics;
  const currentMeta = DISTRICT_METADATA[selectedDistrict] || DISTRICT_METADATA['all'];

  return (
    <div className="space-y-4">
      {/* Top Controller & Real-Time Status Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h2 className="font-bold text-sm text-slate-900 tracking-tight">
                Atmospheric Analytics & MTL Transformer Evaluation
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                Live Telemetry Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Integrated Water Vapor (IWV), CAPE/CIN thermodynamic soundings, and Spatiotemporal Transformer nowcast heads
            </p>
          </div>

          {/* Sync Trigger and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Re-ingest latest MOSDAC sounding and run MTL inference"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              {isSyncing ? 'Syncing...' : 'Sync Live Feeds'}
            </button>

            {/* Station Dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictSelect(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs cursor-pointer"
            >
              <option value="all">All Stations / Basins</option>
              <option value="East Khasi Hills">East Khasi Hills (Cherrapunji)</option>
              <option value="North Sikkim">North Sikkim (Mangan)</option>
              <option value="Uttarkashi">Uttarkashi (Bhagirathi)</option>
              <option value="Mumbai Suburban">Mumbai Suburban (Mithi)</option>
              <option value="Kamrup Metropolitan">Guwahati (Bharalu Basin)</option>
              <option value="Central Delhi">Central Delhi (Yamuna)</option>
              <option value="Noney / Imphal West">Noney (Ijei River)</option>
              <option value="Chennai">Chennai Coastal Plain</option>
            </select>

            {/* Hazard Dropdown */}
            <select
              value={selectedHazard}
              onChange={(e) => handleHazardSelect(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs cursor-pointer"
            >
              <option value="all">All Severe Hazards</option>
              <option value="cloudburst">Cloudbursts</option>
              <option value="flash_flood">Flash Floods</option>
              <option value="severe_thunderstorm">Severe Thunderstorms</option>
            </select>

            {/* Time Period Filter */}
            <div className="flex rounded-md border border-slate-300 bg-slate-100 p-0.5">
              {(['24h', '7d', '30d'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry Fingerprint Banner */}
        <div className="bg-slate-50 rounded-md border border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
              {currentMeta.basin}
            </span>
            <span className="text-slate-600 font-medium">
              &bull; {currentMeta.terrain}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 font-mono text-[10px]">
            <span className="flex items-center">
              <Radio className="w-3 h-3 text-emerald-600 mr-1" />
              MOSDAC INSAT-3D Doppler Stream: <strong>Updated {lastSyncSeconds}s ago</strong>
            </span>
            <span className="flex items-center">
              <Sparkles className="w-3 h-3 text-blue-600 mr-1" />
              AI Predictability Confidence: <strong className="text-slate-900 ml-1">{(modelInfo.f1Score * 100).toFixed(1)}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Sections 1 & 2: IWV Column Moisture Trend & CAPE/CIN Instability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: IWV Trend */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-xs text-slate-900">
                1. Integrated Water Vapor (IWV) Column Load (kg/m²)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">INSAT-3D WV + IMDAA</span>
          </div>

          <p className="text-[10px] text-slate-500 mb-2">
            Observed ground-truth AWS stream up to Current &bull; Cyan/blue band shows MTL Transformer 2-6h forecast envelope.
          </p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={iwvTrend || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[20, 80]} tick={{ fontSize: 10, fill: '#64748b' }} unit="k" />
                <Tooltip
                  formatter={(value: any, name?: any): any => {
                    if (value === null || value === undefined) return ['N/A', name ?? ''];
                    return [`${value} kg/m²`, name ?? ''];
                  }}
                  contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: '#e2e8f0' }}
                />
                <ReferenceLine
                  y={55}
                  stroke="#dc2626"
                  strokeDasharray="3 3"
                  label={{ value: 'Cloudburst Threshold (55 kg/m²)', fill: '#dc2626', fontSize: 9, position: 'insideTopLeft' }}
                />
                <Area
                  type="monotone"
                  dataKey="forecastIwvKgM2"
                  name="Forecast IWV"
                  stroke="#0284c7"
                  fill="#38bdf8"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="observedIwvKgM2"
                  name="Observed IWV"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  connectNulls={false}
                  dot={{ r: 3, fill: '#2563eb' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 2: CAPE/CIN Instability */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-xs text-slate-900">
                2. Thermodynamic Instability (CAPE vs CIN Barrier) (J/kg)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Thermodynamic Sounding</span>
          </div>

          <p className="text-[10px] text-slate-500 mb-2">
            CAPE builds buoyant energy (left axis) while CIN cap erodes to initiate deep vertical convection (right axis).
          </p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={instabilityTrend || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" domain={[500, 3800]} tick={{ fontSize: 10, fill: '#d97706' }} unit="J" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 150]} tick={{ fontSize: 10, fill: '#0284c7' }} unit="J" />
                <Tooltip
                  formatter={(value: any, name?: any): any => [`${value} J/kg`, name ?? '']}
                  contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: '#e2e8f0' }}
                />
                <ReferenceLine
                  yAxisId="left"
                  y={2000}
                  stroke="#d97706"
                  strokeDasharray="3 3"
                  label={{ value: 'Severe CAPE (2000 J/kg)', fill: '#d97706', fontSize: 9, position: 'insideTopLeft' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="capeJkg"
                  name="CAPE (J/kg)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#d97706' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cinJkg"
                  name="CIN (Barrier - J/kg)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#0284c7' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sections 3 & 4: Risk Trajectory & Hazard Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 3: Risk Trajectory */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-xs text-slate-900">
                3. Composite Severe Weather Nowcast Trajectory
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">MTL Transformer Output</span>
          </div>

          <p className="text-[10px] text-slate-500 mb-2">
            Peak sector vulnerability vs regional mean nowcast trajectory. Critical warning triggers at 75%.
          </p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrend || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(value: any, name?: any): any => [`${value}%`, name ?? '']}
                  contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: '#e2e8f0' }}
                />
                <ReferenceLine
                  y={75}
                  stroke="#dc2626"
                  strokeDasharray="3 3"
                  label={{ value: 'Critical Threshold (75%)', fill: '#dc2626', fontSize: 9, position: 'insideTopLeft' }}
                />
                <Line
                  type="monotone"
                  dataKey="peakRisk"
                  name="Peak Sector Vulnerability"
                  stroke="#dc2626"
                  strokeWidth={2.2}
                  dot={{ r: 2.5, fill: '#dc2626' }}
                />
                <Line
                  type="monotone"
                  dataKey="averageRisk"
                  name="Regional Mean Risk"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#0284c7' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 4: Hazard Event Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <h3 className="font-semibold text-xs text-slate-900">
                4. Severe Weather Incident Occurrence Breakdown ({selectedPeriod === '24h' ? 'Past 24 Hours' : selectedPeriod === '7d' ? 'Past 7 Days' : 'Past 30 Days'})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Verified Logs</span>
          </div>

          <p className="text-[10px] text-slate-500 mb-2">
            Incident distribution filtered for {selectedDistrict === 'all' ? 'All Stations' : selectedDistrict} &bull; Scaled to {selectedPeriod.toUpperCase()} timeline.
          </p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hazardEvents || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any, name?: any): any => [`${value} incidents`, name ?? '']}
                  contentStyle={{ fontSize: 11, borderRadius: 6, borderColor: '#e2e8f0' }}
                />
                <Bar dataKey="count" name="Total Incidents" fill="#475569" radius={[3, 3, 0, 0]} />
                <Bar dataKey="critical" name="Critical Surge Triggers" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sections 5 & 6: Alert Performance & MTL Transformer Specification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 5: Alert Performance */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 mb-2.5">
              <Target className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-xs text-slate-900">
                5. Nowcast Accuracy & Verification Matrix ({selectedDistrict === 'all' ? 'National Average' : selectedDistrict})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs mb-3">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total Nowcasts</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {alertPerformance.totalAlertsGenerated}
                </span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block">Confirmed Ground Truth</span>
                <span className="text-base font-bold font-mono text-emerald-800">
                  {alertPerformance.confirmedEvents}
                </span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded border border-amber-200">
                <span className="text-[10px] text-amber-700 block">False Alarms</span>
                <span className="text-base font-bold font-mono text-amber-800">
                  {alertPerformance.falseAlerts}
                </span>
              </div>
              <div className="bg-red-50 p-2.5 rounded border border-red-200">
                <span className="text-[10px] text-red-700 block">Missed Events</span>
                <span className="text-base font-bold font-mono text-red-800">
                  {alertPerformance.missedEvents}
                </span>
              </div>
              <div className="bg-blue-50 p-2.5 rounded border border-blue-200">
                <span className="text-[10px] text-blue-700 block">Precision (PPV)</span>
                <span className="text-base font-bold font-mono text-blue-900">
                  {alertPerformance.precisionPct}%
                </span>
              </div>
              <div className="bg-blue-50 p-2.5 rounded border border-blue-200">
                <span className="text-[10px] text-blue-700 block">Recall Sensitivity</span>
                <span className="text-base font-bold font-mono text-blue-900">
                  {alertPerformance.recallPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Average Predictive Warning Lead Time:</span>
            <strong className="text-slate-900 font-mono text-xs">
              {alertPerformance.averageLeadTimeHours} Hours Advance Notice
            </strong>
          </div>
        </div>

        {/* Section 6: Model Specification & Per-Head Metrics */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 mb-2.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-xs text-slate-900">
                6. Multi-Task Spatiotemporal Transformer Architecture
              </h3>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1.5 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Head:</span>
                <span className="font-semibold text-slate-900">{modelInfo.activeModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Weight Identifier:</span>
                <span className="font-mono text-slate-800">{modelInfo.modelVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">F1 Combined Score:</span>
                <span className="font-mono text-blue-700 font-semibold">{(modelInfo.f1Score * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Per-Head Metrics */}
            {modelInfo.perHeadMetrics && (
              <div>
                <span className="font-semibold text-[11px] text-slate-700 block mb-1.5">
                  Multi-Task Predictive Head Performance Matrix:
                </span>
                <div className="space-y-1 text-[11px]">
                  {modelInfo.perHeadMetrics.map((head) => {
                    const isSelected = selectedHazard === head.hazard || (selectedHazard === 'all');
                    return (
                      <div
                        key={head.hazard}
                        className={`flex items-center justify-between p-1.5 rounded-md border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 text-blue-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="capitalize">{head.hazard.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-3 font-mono text-[10px]">
                          <span>F1: <strong>{(head.f1Score * 100).toFixed(0)}%</strong></span>
                          <span>Lead: <strong className="text-blue-700">{head.leadTimeHoursMedian}h</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-2">
            Fused 3D Swin-Transformer backbone with cross-attention over IMDAA & MOSDAC satellite telemetry.
          </div>
        </div>
      </div>
    </div>
  );
}
