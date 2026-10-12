export type HazardType = 'severe_thunderstorm' | 'cloudburst' | 'flash_flood' | 'landslide';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AlertSeverity = 'INFORMATION' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'EXPIRED';

export type ReportType =
  | 'heavy_rainfall'
  | 'hailstorm'
  | 'waterlogging'
  | 'flash_flood'
  | 'lightning_damage'
  | 'infrastructure_damage'
  | 'landslide'
  | 'crack'
  | 'other';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'duplicate';

export type ReporterType =
  | 'field_official'
  | 'citizen'
  | 'traffic_police'
  | 'ndrf_sdrf_team'
  | 'imd_observer';

export type UserRole =
  | 'district_officer'
  | 'disaster_management_authority'
  | 'imd_forecaster'
  | 'field_official'
  | 'administrator';

export interface LocationZone {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  demSlopeDegrees: number;
  drainageBasin: string;
  terrainRiskNote: string;
  cloudburstSusceptibilityScore: number; // 0-100
  populationEstimate: number;
  nearbyRoads: string[];
  nearbyVillages: string[];
  infrastructureNotes: string;
}

export interface RiskPrediction {
  id: string;
  locationId: string;
  location: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  hazardType: HazardType;
  riskScore: number; // 0-100
  probability: number; // 0.0 - 1.0
  riskLevel: RiskLevel;
  forecastWindow: string; // e.g. "Next 2-6 hours"
  updatedAt: string; // ISO-8601
  dataFreshness: string;
  factors: string[];
  nearbyInfrastructure: string[];
  nearbyRoads: string[];
  nearbyVillages: string[];

  // Atmospheric Predictor Variables (IMDAA + INSAT-3D/3DR Satellite)
  integratedWaterVaporKgM2: number; // IWV, kg/m^2
  iwvHourlyTrendKgM2: number; // rate of moisture accumulation
  capeJkg: number; // Convective Available Potential Energy
  cinJkg: number; // Convective Inhibition
  lowLevelConvergence: number; // s^-1 negative divergence
  verticalWindShearMs: number; // m/s 0-6km shear
  cttDropRateCPerMin: number; // Cloud Top Temperature drop rate (°C/min)
  qpeRainfallRateMmHr: number; // Satellite QPE mm/hr
  demSlopeDegrees: number; // DEM slope for flash flood routing
  drainageBasin: string; // Hydrologic watershed basin

  modelVersion: string;
  xaiTopDrivers: { factor: string; contributionPct: number }[]; // Explainable AI attribution
}

export interface AlertItem {
  id: string;
  predictionId?: string;
  severity: AlertSeverity;
  title: string;
  location: string;
  district: string;
  state: string;
  locationId: string;
  hazardType: HazardType;
  riskScore: number;
  probability: number;
  forecastWindow: string;
  createdAt: string;
  updatedAt: string;
  status: AlertStatus;
  factors: string[];
  recommendedAction: string;
  modelVersion: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  recipientGroup: string;
  isSimulated?: boolean;
  simulationVariables?: {
    integratedWaterVaporKgM2?: number;
    capeJkg?: number;
    cinJkg?: number;
    lowLevelConvergence?: number;
    verticalWindShearMs?: number;
    cttDropRateCPerMin?: number;
    rainfall24h?: number;
    soilMoisture?: number;
    slopeDegrees?: number;
    porePressure?: number;
    vegetationLoss?: number;
  };
}

export interface FieldReport {
  id: string;
  reportType: ReportType;
  title: string;
  location: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  description: string;
  mediaUrl: string;
  reporterType: ReporterType;
  reporterName: string;
  reporterPhone?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  aiAdvisoryAnalysis?: string;
  roadAffected?: string;
  hazardObserved?: HazardType;
  rainfallEstimateMm?: number;
  hailObserved?: boolean;
}

export interface DashboardSummary {
  activeCriticalAlerts: number;
  highRiskZones: number;
  atRiskRoads: number;
  pendingFieldReports: number;
  floodProneBasinsAtRisk?: number;
  lastUpdated: string;
  dataFreshness: string;
}

export interface PriorityAction {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  title: string;
  location: string;
  timeContext: string;
  actionRequired: string;
  assignedUnit: string;
  status: 'pending' | 'in_progress' | 'dispatched';
}

export interface RainfallDataPoint {
  time: string;
  observedMm: number;
  forecastMm: number;
  thresholdMm: number;
}

export interface IwvTrendDataPoint {
  time: string;
  observedIwvKgM2: number | null;
  forecastIwvKgM2: number;
  thresholdKgM2: number;
}

export interface InstabilityTrendDataPoint {
  time: string;
  capeJkg: number;
  cinJkg: number;
  criticalCapeThreshold: number;
}

export interface RiskTrendDataPoint {
  time: string;
  averageRisk: number;
  peakRisk: number;
  threshold: number;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  provider: string;
  type: 'reanalysis' | 'satellite' | 'precipitation' | 'elevation' | 'station';
  status: 'operational' | 'degraded' | 'offline';
  lastSuccessfulUpdate: string;
  latencyMs: number;
  frequency: string;
  lastError?: string;
  isSimulated?: boolean;
}

export interface SystemServiceStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'offline';
  uptimePct: number;
  latencyMs: number;
  version: string;
  notes?: string;
}

export interface ModelTelemetry {
  activeModel: string;
  modelVersion: string;
  hazardType: string;
  trainedAt: string;
  trainingPeriod: string;
  trainingDatasetSize: string;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  inferenceLatencyMs: number;
  topFeatures: { name: string; importance: number }[];
  perHeadMetrics: {
    hazard: HazardType;
    precision: number;
    recall: number;
    f1Score: number;
    leadTimeHoursMedian: number;
  }[];
}
