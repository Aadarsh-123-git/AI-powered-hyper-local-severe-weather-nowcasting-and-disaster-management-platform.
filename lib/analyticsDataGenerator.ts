import { AnalyticsData } from '@/services/analyticsApi';
import {
  RainfallDataPoint,
  IwvTrendDataPoint,
  InstabilityTrendDataPoint,
  RiskTrendDataPoint,
  ModelTelemetry,
} from './types';
import { MOCK_MODEL_TELEMETRY } from './mockData';

interface StationProfile {
  name: string;
  iwvBase: number; // Normal baseline IWV in kg/m²
  iwvRange: number; // Dynamic fluctuation amplitude
  capeBase: number; // Convective energy in J/kg
  capeMax: number;
  cinStart: number; // Capping inversion barrier in J/kg
  cinEnd: number;
  riskBase: number; // 0-100 base vulnerability
  peakRiskAdd: number;
  cloudburstRatio: number;
  flashFloodRatio: number;
  stormRatio: number;
  totalAlertsMonth: number;
  leadTimeHours: number;
  precisionPct: number;
  recallPct: number;
}

const STATION_PROFILES: Record<string, StationProfile> = {
  'Central Delhi': {
    name: 'Central Delhi (Yamuna Basin)',
    iwvBase: 43.5,
    iwvRange: 14.0,
    capeBase: 2950,
    capeMax: 3450,
    cinStart: 92,
    cinEnd: 8,
    riskBase: 68,
    peakRiskAdd: 22,
    cloudburstRatio: 0.12,
    flashFloodRatio: 0.32,
    stormRatio: 0.56,
    totalAlertsMonth: 34,
    leadTimeHours: 4.6,
    precisionPct: 93.8,
    recallPct: 92.4,
  },
  'East Khasi Hills': {
    name: 'East Khasi Hills (Cherrapunji / Sohra)',
    iwvBase: 66.8,
    iwvRange: 9.5,
    capeBase: 2650,
    capeMax: 2980,
    cinStart: 22,
    cinEnd: 4,
    riskBase: 86,
    peakRiskAdd: 12,
    cloudburstRatio: 0.58,
    flashFloodRatio: 0.30,
    stormRatio: 0.12,
    totalAlertsMonth: 68,
    leadTimeHours: 3.2,
    precisionPct: 95.6,
    recallPct: 97.8,
  },
  'North Sikkim': {
    name: 'North Sikkim (Mangan / Teesta Gorge)',
    iwvBase: 47.2,
    iwvRange: 13.5,
    capeBase: 1980,
    capeMax: 2450,
    cinStart: 42,
    cinEnd: 6,
    riskBase: 82,
    peakRiskAdd: 16,
    cloudburstRatio: 0.38,
    flashFloodRatio: 0.54,
    stormRatio: 0.08,
    totalAlertsMonth: 46,
    leadTimeHours: 2.6,
    precisionPct: 89.4,
    recallPct: 94.6,
  },
  'Uttarkashi': {
    name: 'Uttarkashi (Bhagirathi River Escarpment)',
    iwvBase: 54.0,
    iwvRange: 15.0,
    capeBase: 2380,
    capeMax: 2850,
    cinStart: 64,
    cinEnd: 8,
    riskBase: 80,
    peakRiskAdd: 17,
    cloudburstRatio: 0.46,
    flashFloodRatio: 0.40,
    stormRatio: 0.14,
    totalAlertsMonth: 52,
    leadTimeHours: 3.1,
    precisionPct: 91.2,
    recallPct: 95.1,
  },
  'Mumbai Suburban': {
    name: 'Mumbai Suburban (Mithi Coastal Basin)',
    iwvBase: 62.4,
    iwvRange: 10.0,
    capeBase: 2520,
    capeMax: 2950,
    cinStart: 32,
    cinEnd: 6,
    riskBase: 78,
    peakRiskAdd: 19,
    cloudburstRatio: 0.18,
    flashFloodRatio: 0.48,
    stormRatio: 0.34,
    totalAlertsMonth: 58,
    leadTimeHours: 3.7,
    precisionPct: 92.5,
    recallPct: 93.8,
  },
  'Kamrup Metropolitan': {
    name: 'Guwahati (Brahmaputra Valley / Bharalu)',
    iwvBase: 58.2,
    iwvRange: 12.0,
    capeBase: 2420,
    capeMax: 2820,
    cinStart: 46,
    cinEnd: 10,
    riskBase: 74,
    peakRiskAdd: 18,
    cloudburstRatio: 0.20,
    flashFloodRatio: 0.48,
    stormRatio: 0.32,
    totalAlertsMonth: 44,
    leadTimeHours: 3.8,
    precisionPct: 92.1,
    recallPct: 93.0,
  },
  'Noney / Imphal West': {
    name: 'Noney (Ijei River Watershed)',
    iwvBase: 52.6,
    iwvRange: 13.0,
    capeBase: 2180,
    capeMax: 2600,
    cinStart: 50,
    cinEnd: 8,
    riskBase: 79,
    peakRiskAdd: 18,
    cloudburstRatio: 0.42,
    flashFloodRatio: 0.46,
    stormRatio: 0.12,
    totalAlertsMonth: 40,
    leadTimeHours: 2.8,
    precisionPct: 90.0,
    recallPct: 94.2,
  },
  'Chennai': {
    name: 'Chennai Coastal Plain (Adyar / Cooum)',
    iwvBase: 56.4,
    iwvRange: 11.0,
    capeBase: 2310,
    capeMax: 2750,
    cinStart: 36,
    cinEnd: 9,
    riskBase: 70,
    peakRiskAdd: 20,
    cloudburstRatio: 0.14,
    flashFloodRatio: 0.50,
    stormRatio: 0.36,
    totalAlertsMonth: 38,
    leadTimeHours: 4.1,
    precisionPct: 93.2,
    recallPct: 91.8,
  },
};

const DEFAULT_PROFILE: StationProfile = {
  name: 'All Monitoring Stations / Composite',
  iwvBase: 55.5,
  iwvRange: 12.0,
  capeBase: 2450,
  capeMax: 2900,
  cinStart: 55,
  cinEnd: 10,
  riskBase: 75,
  peakRiskAdd: 18,
  cloudburstRatio: 0.30,
  flashFloodRatio: 0.42,
  stormRatio: 0.28,
  totalAlertsMonth: 48,
  leadTimeHours: 3.5,
  precisionPct: 92.0,
  recallPct: 94.5,
};

function getStationProfile(district: string): StationProfile {
  const norm = district.trim().toLowerCase();
  for (const [key, profile] of Object.entries(STATION_PROFILES)) {
    if (key.toLowerCase() === norm || norm.includes(key.toLowerCase()) || key.toLowerCase().includes(norm)) {
      return profile;
    }
  }
  return DEFAULT_PROFILE;
}

export function generateDistrictHazardAnalytics(
  district: string = 'all',
  hazard: string = 'all',
  period: string = '7d',
  liveJitterSeed: number = 0
): AnalyticsData {
  const profile = district === 'all' ? DEFAULT_PROFILE : getStationProfile(district);
  const normHazard = hazard.toLowerCase().trim();

  // Pseudo-random deterministic noise based on inputs and optional live jitter
  const seedString = `${district}-${hazard}-${period}-${liveJitterSeed}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) % 10000;
  }
  const jitterFactor = (hash % 100) / 100 - 0.5; // -0.5 to +0.5

  // Modulate baseline metrics based on Hazard selection
  let iwvShift = 0;
  let capeShift = 0;
  let cinShift = 0;
  let riskShift = 0;
  let leadTimeShift = 0;

  if (normHazard === 'cloudburst') {
    // Cloudburst: Extreme localized water vapor surge, rapid CAPE release, near-zero CIN
    iwvShift = 10.5;
    capeShift = 250;
    cinShift = -18;
    riskShift = 12;
    leadTimeShift = -0.8;
  } else if (normHazard === 'flash_flood') {
    // Flash Flood: Prolonged high moisture, lower CIN, extended runoff risk
    iwvShift = 6.0;
    capeShift = -100;
    cinShift = -10;
    riskShift = 6;
    leadTimeShift = 0.4;
  } else if (normHazard === 'severe_thunderstorm') {
    // Severe Thunderstorm: Extreme convective instability (CAPE explodes), higher initial CIN capping
    iwvShift = -4.0;
    capeShift = 550;
    cinShift = 25;
    riskShift = 8;
    leadTimeShift = 0.6;
  }

  const effectiveIwvBase = Math.max(32, profile.iwvBase + iwvShift + jitterFactor * 2.5);
  const effectiveCapeBase = Math.max(1200, profile.capeBase + capeShift + jitterFactor * 80);
  const effectiveCinStart = Math.max(15, profile.cinStart + cinShift + jitterFactor * 6);
  const effectiveCinEnd = Math.max(3, profile.cinEnd + jitterFactor * 2);
  const effectiveRiskBase = Math.min(94, Math.max(35, profile.riskBase + riskShift + jitterFactor * 4));

  // Time Axis configuration depending on period
  let timeLabels: string[] = [];
  let forecastStartIndex = 0;

  if (period === '24h') {
    timeLabels = ['T-12h', 'T-8h', 'T-4h', 'T-2h', 'T-1h', 'Current', '+1h (F)', '+2h (F)', '+4h (F)'];
    forecastStartIndex = 6;
  } else if (period === '30d') {
    timeLabels = ['Day -28', 'Day -21', 'Day -14', 'Day -7', 'Day -3', 'Yesterday', 'Current', '+24h (F)', '+48h (F)'];
    forecastStartIndex = 7;
  } else {
    // 7d default
    timeLabels = ['T-6h', 'T-4h', 'T-2h', 'T-1h', 'Current', '+1h (F)', '+2h (F)', '+4h (F)'];
    forecastStartIndex = 5;
  }

  // 1. IWV Trend: Observed curve stops cleanly at forecast start; forecast area extends smoothly
  const iwvTrend: IwvTrendDataPoint[] = timeLabels.map((t, idx) => {
    const isForecast = idx >= forecastStartIndex;
    const progress = idx / (timeLabels.length - 1);
    
    // Non-linear trajectory: accumulates up to Current/Forecast window
    let curve = 0;
    if (idx < forecastStartIndex) {
      curve = -Math.cos(progress * Math.PI * 0.8) * (profile.iwvRange / 2);
    } else {
      // Forecast peak and gradual convective discharge
      const fcstOffset = idx - forecastStartIndex + 1;
      curve = (profile.iwvRange / 2) - fcstOffset * 2.2;
    }

    const val = Math.round(Math.min(78, Math.max(28, effectiveIwvBase + curve + jitterFactor * 1.5)) * 10) / 10;
    
    return {
      time: t,
      observedIwvKgM2: isForecast ? null : val,
      forecastIwvKgM2: val,
      thresholdKgM2: 55,
    };
  });

  // 2. Instability (CAPE vs CIN) Trend
  const instabilityLabels = period === '24h'
    ? ['T-12h', 'T-8h', 'T-4h', 'T-2h', 'T-1h', 'Current', '+1h (F)', '+2h (F)']
    : period === '30d'
    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Yesterday', 'Current', '+1d (F)']
    : ['T-6h', 'T-4h', 'T-2h', 'T-1h', 'Current', '+1h (F)', '+2h (F)'];

  const instabilityTrend: InstabilityTrendDataPoint[] = instabilityLabels.map((t, idx) => {
    const ratio = idx / (instabilityLabels.length - 1);
    
    // CAPE builds up as convective energy accumulates
    const capeVal = Math.round(
      Math.min(3800, Math.max(800, effectiveCapeBase + (ratio - 0.4) * (profile.capeMax - profile.capeBase) * 1.6 + jitterFactor * 40))
    );

    // CIN barrier starts high and collapses (barrier breakdown preceding storm)
    const cinVal = Math.round(
      Math.max(4, effectiveCinStart - ratio * (effectiveCinStart - effectiveCinEnd) + jitterFactor * 3)
    );

    return {
      time: t,
      capeJkg: capeVal,
      cinJkg: cinVal,
      criticalCapeThreshold: 2000,
    };
  });

  // 3. Composite Risk Trend (Regional Mean vs Peak Sector Vulnerability)
  const riskLabels = period === '24h'
    ? ['T-12h', 'T-6h', 'T-3h', 'T-1h', 'Current', '+1h (F)', '+2h (F)', '+4h (F)']
    : period === '30d'
    ? ['Day -25', 'Day -18', 'Day -10', 'Day -5', 'Current', '+1d (F)', '+2d (F)', '+3d (F)']
    : ['T-12h', 'T-8h', 'T-4h', 'Current', '+2h (F)', '+4h (F)', '+6h (F)'];

  const riskTrend: RiskTrendDataPoint[] = riskLabels.map((t, idx) => {
    const ratio = idx / (riskLabels.length - 1);
    const bellCurve = Math.sin(ratio * Math.PI * 0.85);
    
    let meanRisk = Math.round(effectiveRiskBase * 0.65 + bellCurve * 28 + jitterFactor * 4);
    let peakRisk = Math.round(meanRisk + profile.peakRiskAdd + bellCurve * 8);

    meanRisk = Math.min(96, Math.max(18, meanRisk));
    peakRisk = Math.min(100, Math.max(28, peakRisk));

    return {
      time: t,
      averageRisk: meanRisk,
      peakRisk: peakRisk,
      threshold: 75,
    };
  });

  // 4. Incident Occurrence Breakdown (Scaled dynamically by Period and Hazard)
  let countMultiplier = 1;
  if (period === '24h') {
    countMultiplier = 0.10; // ~2-7 total events in 24 hours
  } else if (period === '7d') {
    countMultiplier = 0.35; // ~12-25 events in 7 days
  } else {
    countMultiplier = 1.0; // ~35-70 events in 30 days
  }

  const baseTotal = Math.max(6, Math.round(profile.totalAlertsMonth * countMultiplier));

  // Determine proportions
  let cbRatio = profile.cloudburstRatio;
  let ffRatio = profile.flashFloodRatio;
  let stRatio = profile.stormRatio;

  if (normHazard === 'cloudburst') {
    cbRatio = 0.70;
    ffRatio = 0.20;
    stRatio = 0.10;
  } else if (normHazard === 'flash_flood') {
    cbRatio = 0.15;
    ffRatio = 0.72;
    stRatio = 0.13;
  } else if (normHazard === 'severe_thunderstorm') {
    cbRatio = 0.10;
    ffRatio = 0.18;
    stRatio = 0.72;
  }

  const cloudburstCount = Math.max(period === '24h' ? 0 : 1, Math.round(baseTotal * cbRatio));
  const flashFloodCount = Math.max(period === '24h' ? 0 : 1, Math.round(baseTotal * ffRatio));
  const stormCount = Math.max(period === '24h' ? 0 : 1, Math.round(baseTotal * stRatio));

  const hazardEvents = [
    {
      type: 'Cloudburst',
      count: cloudburstCount,
      critical: Math.max(0, Math.round(cloudburstCount * 0.45)),
      resolved: Math.max(0, Math.round(cloudburstCount * 0.45)),
    },
    {
      type: 'Flash Flood',
      count: flashFloodCount,
      critical: Math.max(0, Math.round(flashFloodCount * 0.38)),
      resolved: Math.max(0, Math.round(flashFloodCount * 0.52)),
    },
    {
      type: 'Severe Thunderstorm',
      count: stormCount,
      critical: Math.max(0, Math.round(stormCount * 0.30)),
      resolved: Math.max(0, Math.round(stormCount * 0.65)),
    },
  ];

  // 5. Verification Matrix (Dynamic based on terrain & hazard difficulty)
  const totalAlerts = cloudburstCount + flashFloodCount + stormCount + Math.max(1, Math.round(jitterFactor * 2));
  const confirmed = Math.max(1, Math.round(totalAlerts * (profile.precisionPct / 100)));
  const falseAlerts = Math.max(0, totalAlerts - confirmed);
  const missed = Math.max(0, Math.round(confirmed * ((100 - profile.recallPct) / 100)));
  const calculatedLead = Math.round(Math.max(1.8, profile.leadTimeHours + leadTimeShift + jitterFactor * 0.3) * 10) / 10;

  // 6. QPE Rainfall Trend
  const rainfallTrend: RainfallDataPoint[] = timeLabels.map((t, idx) => {
    const isForecast = idx >= forecastStartIndex;
    const peakIdx = forecastStartIndex - 1;
    const dist = Math.abs(idx - peakIdx);
    const rainVal = Math.round(Math.max(0, (effectiveIwvBase * 1.4) - dist * 8 + jitterFactor * 6) * 10) / 10;
    return {
      time: t,
      observedMm: isForecast ? 0 : rainVal,
      forecastMm: isForecast ? rainVal : Math.round(rainVal * 0.92 * 10) / 10,
      thresholdMm: 50,
    };
  });

  return {
    rainfallTrend,
    iwvTrend,
    instabilityTrend,
    riskTrend,
    hazardEvents,
    alertPerformance: {
      totalAlertsGenerated: totalAlerts,
      confirmedEvents: confirmed,
      falseAlerts: falseAlerts,
      missedEvents: missed,
      precisionPct: Math.round(profile.precisionPct * 10) / 10,
      recallPct: Math.round(profile.recallPct * 10) / 10,
      averageLeadTimeHours: calculatedLead,
    },
    modelInfo: {
      ...MOCK_MODEL_TELEMETRY,
      activeModel: `Swin-Transformer MTL Head (${profile.name.split(' ')[0]})`,
      modelVersion: `MEGH-MTL-v2.4 [Head: ${normHazard.toUpperCase()}]`,
      precision: profile.precisionPct / 100,
      recall: profile.recallPct / 100,
      f1Score: Math.round(((2 * profile.precisionPct * profile.recallPct) / (profile.precisionPct + profile.recallPct)) / 10) / 1000,
    },
    timestamp: new Date().toISOString(),
  };
}
