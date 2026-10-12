'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  CloudRain,
  Zap,
  Waves,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Brain,
  MapPin,
  Info,
  Layers,
} from 'lucide-react';
import { HazardType, AlertItem } from '@/lib/types';
import XaiExplainabilityPanel from '@/components/model/XaiExplainabilityPanel';

export interface DistrictPreset {
  district: string;
  name: string;
  state: string;
  locationId: string;
  drainageBasin: string;
  elevationM: number;
  demSlopeDegrees: number;
  terrainRiskNote: string;
  defaultHazard: HazardType;
  susceptibilityScore: number;
  baseline: {
    iwv: number;
    cape: number;
    cin: number;
    conv: number;
    shear: number;
    cttDropRate: number;
  };
}

export const DISTRICT_PRESETS: Record<string, DistrictPreset> = {
  'East Khasi Hills': {
    district: 'East Khasi Hills',
    name: 'East Khasi Hills (Cherrapunji / Sohra Slopes)',
    state: 'Meghalaya',
    locationId: 'loc-001',
    drainageBasin: 'Shella-Southern Escarpment Catchment',
    elevationM: 1430,
    demSlopeDegrees: 41,
    terrainRiskNote: 'Funnel-shaped plateau escarpment causing extreme orographic moisture lifting and intense convective updrafts.',
    defaultHazard: 'cloudburst',
    susceptibilityScore: 94,
    baseline: {
      iwv: 64.2,
      cape: 2850,
      cin: 8,
      conv: 0.00048,
      shear: 24.5,
      cttDropRate: -12.4,
    },
  },
  'North Sikkim': {
    district: 'North Sikkim',
    name: 'North Sikkim (Mangan - Chungthang Sector)',
    state: 'Sikkim',
    locationId: 'loc-002',
    drainageBasin: 'Upper Teesta River Hydrologic Sub-basin',
    elevationM: 2100,
    demSlopeDegrees: 44,
    terrainRiskNote: 'Glacial valley choke points susceptible to cloudburst-induced debris flows and sudden river surges.',
    defaultHazard: 'flash_flood',
    susceptibilityScore: 91,
    baseline: {
      iwv: 58.6,
      cape: 2400,
      cin: 12,
      conv: 0.00041,
      shear: 22.1,
      cttDropRate: -9.8,
    },
  },
  'Uttarkashi': {
    district: 'Uttarkashi',
    name: 'Uttarkashi (Bhagirathi River Escarpment)',
    state: 'Uttarakhand',
    locationId: 'loc-003',
    drainageBasin: 'Bhagirathi Upper Himalayan Watershed',
    elevationM: 1352,
    demSlopeDegrees: 39,
    terrainRiskNote: 'High alpine ridges triggering rapid cloud top cooling and sudden localized cloudburst deluges.',
    defaultHazard: 'cloudburst',
    susceptibilityScore: 89,
    baseline: {
      iwv: 57.2,
      cape: 2250,
      cin: 4,
      conv: 0.00038,
      shear: 19.8,
      cttDropRate: -10.5,
    },
  },
  'Mumbai Suburban': {
    district: 'Mumbai Suburban',
    name: 'Mumbai Coastal Plain (Kurla - Mithi River Basin)',
    state: 'Maharashtra',
    locationId: 'loc-004',
    drainageBasin: 'Mithi River Estuary & Storm Drain Grid',
    elevationM: 8,
    demSlopeDegrees: 4,
    terrainRiskNote: 'Low-elevation coastal estuarine basin prone to high-tide combined urban flash floods.',
    defaultHazard: 'severe_thunderstorm',
    susceptibilityScore: 82,
    baseline: {
      iwv: 61.5,
      cape: 2600,
      cin: 18,
      conv: 0.00035,
      shear: 26.2,
      cttDropRate: -8.2,
    },
  },
  'Kamrup Metropolitan': {
    district: 'Kamrup Metropolitan',
    name: 'Guwahati (Brahmaputra Valley & Bharalu Basin)',
    state: 'Assam',
    locationId: 'loc-005',
    drainageBasin: 'Bharalu Stream & Deepor Beel Catchment',
    elevationM: 55,
    demSlopeDegrees: 12,
    terrainRiskNote: 'Alluvial valley trough bounded by granite knolls causing localized convective storm stagnation.',
    defaultHazard: 'flash_flood',
    susceptibilityScore: 78,
    baseline: {
      iwv: 56.1,
      cape: 1950,
      cin: 22,
      conv: 0.00029,
      shear: 16.5,
      cttDropRate: -6.8,
    },
  },
  'Central Delhi': {
    district: 'Central Delhi',
    name: 'Delhi-NCR (Yamuna Floodplain & Ridge Zone)',
    state: 'Delhi',
    locationId: 'loc-006',
    drainageBasin: 'Najafgarh Drain & Yamuna River Floodplain',
    elevationM: 216,
    demSlopeDegrees: 3,
    terrainRiskNote: 'Urban heat island effect triggering rapid convective squall lines and localized cell bursts.',
    defaultHazard: 'severe_thunderstorm',
    susceptibilityScore: 74,
    baseline: {
      iwv: 48.2,
      cape: 1650,
      cin: 15,
      conv: 0.00022,
      shear: 18.2,
      cttDropRate: -5.2,
    },
  },
  'Noney / Imphal West': {
    district: 'Noney / Imphal West',
    name: 'Imphal West (Noney - Ijei River Basin)',
    state: 'Manipur',
    locationId: 'loc-007',
    drainageBasin: 'Ijei River Hydro-Catchment',
    elevationM: 780,
    demSlopeDegrees: 37,
    terrainRiskNote: 'V-shaped mountain valley capturing mesoscale convective complexes and flash-flood surges.',
    defaultHazard: 'flash_flood',
    susceptibilityScore: 78,
    baseline: {
      iwv: 53.8,
      cape: 1800,
      cin: 25,
      conv: 0.00026,
      shear: 14.8,
      cttDropRate: -5.9,
    },
  },
  'Chennai': {
    district: 'Chennai',
    name: 'Chennai Coastal Plain (Adyar & Cooum Estuary)',
    state: 'Tamil Nadu',
    locationId: 'loc-008',
    drainageBasin: 'Adyar & Cooum River Urban Estuary',
    elevationM: 6,
    demSlopeDegrees: 2,
    terrainRiskNote: 'Flat coastal plain vulnerable to cloudburst outflow boundary collisions and slow-moving maritime squalls.',
    defaultHazard: 'severe_thunderstorm',
    susceptibilityScore: 80,
    baseline: {
      iwv: 59.0,
      cape: 2450,
      cin: 15,
      conv: 0.00031,
      shear: 18.5,
      cttDropRate: -7.8,
    },
  },
};

interface AiNowcastSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDistrict?: string;
  onSelectDistrict?: (district: string) => void;
  onGenerateAlert?: (simulatedAlert: Partial<AlertItem>) => void;
  onGenerateSimulatedAlert?: (simulatedAlert: Partial<AlertItem>) => void;
  onOpenSmsDispatch?: (simulatedAlert: Partial<AlertItem>) => void;
}

export default function AiNowcastSimulatorModal({
  isOpen,
  onClose,
  initialDistrict = 'East Khasi Hills',
  onSelectDistrict,
  onGenerateAlert,
  onGenerateSimulatedAlert,
  onOpenSmsDispatch,
}: AiNowcastSimulatorModalProps) {
  const [district, setDistrict] = useState<string>(initialDistrict && DISTRICT_PRESETS[initialDistrict] ? initialDistrict : 'East Khasi Hills');
  const currentPreset = DISTRICT_PRESETS[district] || DISTRICT_PRESETS['East Khasi Hills'];

  const [hazardType, setHazardType] = useState<HazardType>(currentPreset.defaultHazard);

  // 6 Core Predictor Sliders
  const [iwv, setIwv] = useState<number>(currentPreset.baseline.iwv);
  const [cape, setCape] = useState<number>(currentPreset.baseline.cape);
  const [cin, setCin] = useState<number>(currentPreset.baseline.cin);
  const [conv, setConv] = useState<number>(currentPreset.baseline.conv);
  const [shear, setShear] = useState<number>(currentPreset.baseline.shear);
  const [cttDropRate, setCttDropRate] = useState<number>(currentPreset.baseline.cttDropRate);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Sync when initialDistrict changes or modal opens
  useEffect(() => {
    if (initialDistrict && DISTRICT_PRESETS[initialDistrict]) {
      handleSelectDistrict(initialDistrict);
    }
  }, [initialDistrict, isOpen]);

  // Handle District Change: Immediately update preset values and notify parent
  const handleSelectDistrict = (newDistrict: string) => {
    setDistrict(newDistrict);
    const preset = DISTRICT_PRESETS[newDistrict] || DISTRICT_PRESETS['East Khasi Hills'];
    setHazardType(preset.defaultHazard);
    setIwv(preset.baseline.iwv);
    setCape(preset.baseline.cape);
    setCin(preset.baseline.cin);
    setConv(preset.baseline.conv);
    setShear(preset.baseline.shear);
    setCttDropRate(preset.baseline.cttDropRate);
    setSimulationResult(null);
    if (onSelectDistrict) {
      onSelectDistrict(newDistrict);
    }
  };

  // Handle Hazard Head Toggle: Adapt relevant atmospheric factors
  const handleSelectHazard = (h: HazardType) => {
    setHazardType(h);
    const preset = DISTRICT_PRESETS[district] || DISTRICT_PRESETS['East Khasi Hills'];
    if (h === 'cloudburst') {
      setIwv(Math.min(75, Math.round((preset.baseline.iwv + 6.2) * 10) / 10));
      setCttDropRate(Math.max(-18, Math.round((preset.baseline.cttDropRate - 3.2) * 10) / 10));
      setCin(Math.max(2, preset.baseline.cin - 6));
      setCape(Math.min(3800, preset.baseline.cape + 350));
    } else if (h === 'severe_thunderstorm') {
      setCape(Math.min(3800, preset.baseline.cape + 550));
      setShear(Math.min(35, preset.baseline.shear + 5.5));
      setCin(Math.max(5, preset.baseline.cin + 4));
    } else if (h === 'flash_flood') {
      setIwv(Math.min(72, Math.round((preset.baseline.iwv + 3.5) * 10) / 10));
      setConv(Math.min(0.00060, preset.baseline.conv + 0.00008));
    }
    setSimulationResult(null);
  };

  if (!isOpen) return null;

  // Real-time calculation formula matching backend nowcast simulator API
  const computeNowcastRisk = () => {
    const iwvComponent = (iwv / 70) * 38;
    const capeComponent = (cape / 3500) * 26;
    const cinPenalty = (cin / 100) * -12;
    const cttComponent = (Math.abs(cttDropRate) / 15) * 26;
    const shearConvComponent = (shear / 35) * 12 + (conv / 0.0005) * 10;

    const raw = iwvComponent + capeComponent + cinPenalty + cttComponent + shearConvComponent;
    const riskScore = Math.min(98, Math.max(15, Math.round(raw)));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 55) riskLevel = 'HIGH';
    else if (riskScore >= 35) riskLevel = 'MODERATE';

    const probability = Math.round((riskScore / 100) * 100) / 100;
    const leadTime = riskLevel === 'CRITICAL' ? '1-2 Hours' : riskLevel === 'HIGH' ? '2-4 Hours' : '3-6 Hours';

    const xaiTopDrivers = [
      { factor: `Integrated Water Vapor (${iwv} kg/m² in ${currentPreset.drainageBasin})`, contributionPct: Math.round(Math.max(10, (iwvComponent / Math.max(1, raw)) * 100)) },
      { factor: `Rapid Cloud Top Cooling (${cttDropRate}°C/min)`, contributionPct: Math.round(Math.max(10, (cttComponent / Math.max(1, raw)) * 100)) },
      { factor: `Convective Energy (CAPE ${cape} J/kg)`, contributionPct: Math.round(Math.max(10, (capeComponent / Math.max(1, raw)) * 100)) },
      { factor: `Orographic & Low-Level Convergence (${currentPreset.demSlopeDegrees}° slope)`, contributionPct: Math.round(Math.max(5, (shearConvComponent / Math.max(1, raw)) * 100)) },
    ];

    return { riskScore, riskLevel, probability, leadTime, xaiTopDrivers };
  };

  const currentCalc = computeNowcastRisk();

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/nowcast/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integratedWaterVaporKgM2: iwv,
          capeJkg: cape,
          cinJkg: cin,
          lowLevelConvergence: conv,
          verticalWindShearMs: shear,
          cttDropRateCPerMin: cttDropRate,
          hazardType,
          district,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSimulationResult(json.data);
      } else {
        setSimulationResult(currentCalc);
      }
    } catch {
      setSimulationResult(currentCalc);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDispatchDrillAlert = () => {
    const result = simulationResult || currentCalc;
    const alertData: Partial<AlertItem> = {
      severity: result.riskLevel === 'CRITICAL' ? 'CRITICAL' : result.riskLevel === 'HIGH' ? 'WARNING' : 'WATCH',
      title: `[AI NOWCAST DRILL] ${hazardType.toUpperCase().replace('_', ' ')}: ${currentPreset.district}`,
      location: `${currentPreset.name} (Simulated Basin)`,
      district: currentPreset.district,
      state: currentPreset.state,
      locationId: currentPreset.locationId,
      hazardType,
      riskScore: result.riskScore,
      probability: result.probability,
      forecastWindow: `Lead Time: ${result.leadTime}`,
      factors: [
        `Target Station: ${currentPreset.name}`,
        `Drainage Basin: ${currentPreset.drainageBasin}`,
        `Simulated IWV: ${iwv} kg/m²`,
        `Simulated CAPE: ${cape} J/kg (CIN ${cin} J/kg)`,
        `Simulated CTT Drop Rate: ${cttDropRate}°C/min`,
      ],
      recommendedAction: `Simulated Nowcast Protocol for ${currentPreset.district}: Sound emergency sirens & pre-position ${currentPreset.district} DDMA & SDRF teams.`,
      modelVersion: 'MEGH-MTL-Transformer-v2.4 (Simulator)',
      recipientGroup: `DEOC Officers, ${currentPreset.district} DDMA, SDRF Units`,
      isSimulated: true,
      simulationVariables: {
        integratedWaterVaporKgM2: iwv,
        capeJkg: cape,
        cinJkg: cin,
        lowLevelConvergence: conv,
        verticalWindShearMs: shear,
        cttDropRateCPerMin: cttDropRate,
      },
    };

    if (onSelectDistrict) onSelectDistrict(currentPreset.district);
    if (onGenerateAlert) onGenerateAlert(alertData);
    if (onGenerateSimulatedAlert) onGenerateSimulatedAlert(alertData);
    if (onOpenSmsDispatch) onOpenSmsDispatch(alertData);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col text-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white text-slate-900 p-3.5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <h2 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span>AI Nowcast Predictor Simulator</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                  MEGH-MTL-v2.4
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Adjust atmospheric predictors & simulate 2–6h lead-time hazard outputs with Explainable AI attribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Top Controls: Location & Hazard Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Target Monitoring Zone / District:</span>
              </label>
              <select
                value={district}
                onChange={(e) => handleSelectDistrict(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs font-medium cursor-pointer"
              >
                <option value="East Khasi Hills">East Khasi Hills (Cherrapunji / Sohra)</option>
                <option value="North Sikkim">North Sikkim (Mangan / Chungthang)</option>
                <option value="Uttarkashi">Uttarkashi (Bhagirathi Escarpment)</option>
                <option value="Mumbai Suburban">Mumbai Suburban (Mithi River Basin)</option>
                <option value="Kamrup Metropolitan">Kamrup Metro (Guwahati Basin)</option>
                <option value="Central Delhi">Central Delhi (Yamuna Floodplain)</option>
                <option value="Noney / Imphal West">Noney / Imphal West (Ijei Basin)</option>
                <option value="Chennai">Chennai Coastal Plain (Adyar River)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Target MTL Hazard Output Head:</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['cloudburst', 'severe_thunderstorm', 'flash_flood'] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectHazard(h)}
                    className={`py-1.5 px-2 rounded text-[11px] font-bold cursor-pointer transition-colors text-center ${
                      hazardType === h
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {h === 'cloudburst' ? 'Cloudburst' : h === 'severe_thunderstorm' ? 'Storm' : 'Flash Flood'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active District & Catchment Details Card */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 text-xs shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-2 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {currentPreset.locationId.replace('loc-00', '#')}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{currentPreset.name}</span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                      {currentPreset.state}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Drainage Basin: <strong>{currentPreset.drainageBasin}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0 text-[10px] font-semibold">
                <span className="bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                  Elevation: {currentPreset.elevationM}m
                </span>
                <span className="bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                  Slope: {currentPreset.demSlopeDegrees}° DEM
                </span>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded shadow-2xs font-bold">
                  Risk: {currentPreset.susceptibilityScore}/100
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-[11px] text-slate-700 bg-white p-2 rounded border border-blue-100">
              <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
              <span>
                <strong>Catchment Vulnerability:</strong> {currentPreset.terrainRiskNote}
              </span>
            </div>
          </div>

          {/* 6 Core Predictor Sliders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Atmospheric & Satellite Predictor Variables (IMDAA + INSAT-3D)</span>
              </h3>
              <button
                type="button"
                onClick={() => handleSelectDistrict(district)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline flex items-center space-x-1"
                title="Reset sliders to baseline station telemetry"
              >
                <span>Reset Station Baseline</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Slider 1: IWV */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">Integrated Water Vapor (IWV):</span>
                  <span className="font-mono text-blue-700 font-bold">{iwv} kg/m²</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="75"
                  step="0.5"
                  value={iwv}
                  onChange={(e) => setIwv(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>20 (Dry)</span>
                  <span>55 (Threshold)</span>
                  <span>75 (Extreme)</span>
                </div>
              </div>

              {/* Slider 2: CAPE */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">CAPE Instability:</span>
                  <span className="font-mono text-blue-700 font-bold">{cape} J/kg</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3800"
                  step="50"
                  value={cape}
                  onChange={(e) => setCape(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>200 (Weak)</span>
                  <span>2000 (Severe)</span>
                  <span>3800 (Extreme)</span>
                </div>
              </div>

              {/* Slider 3: CIN */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">CIN Inhibition Barrier:</span>
                  <span className="font-mono text-blue-700 font-bold">{cin} J/kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={cin}
                  onChange={(e) => setCin(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0 (Eroded / Explosive)</span>
                  <span>120 (Capped)</span>
                </div>
              </div>

              {/* Slider 4: Low Level Convergence */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">Low-Level Convergence:</span>
                  <span className="font-mono text-blue-700 font-bold">{(conv * 10000).toFixed(1)} × 10⁻⁴ s⁻¹</span>
                </div>
                <input
                  type="range"
                  min="0.00005"
                  max="0.00060"
                  step="0.00001"
                  value={conv}
                  onChange={(e) => setConv(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0.5 (Weak)</span>
                  <span>6.0 (Intense)</span>
                </div>
              </div>

              {/* Slider 5: Wind Shear */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">0-6km Vertical Wind Shear:</span>
                  <span className="font-mono text-blue-700 font-bold">{shear} m/s</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="35"
                  step="1"
                  value={shear}
                  onChange={(e) => setShear(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>4 m/s (Unorganized)</span>
                  <span>35 m/s (Supercell)</span>
                </div>
              </div>

              {/* Slider 6: CTT Drop Rate */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">Cloud Top Temp Drop Rate:</span>
                  <span className="font-mono text-blue-700 font-bold">{cttDropRate} °C/min</span>
                </div>
                <input
                  type="range"
                  min="-18"
                  max="0"
                  step="0.5"
                  value={cttDropRate}
                  onChange={(e) => setCttDropRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>-18 °C/min (Explosive Updraft)</span>
                  <span>0 °C/min (Stable)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md font-bold text-xs flex items-center space-x-2 shadow-2xs cursor-pointer transition-all"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Executing Transformer Inference for {currentPreset.district}...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 text-amber-300" />
                  <span>Run Multi-Task Transformer Inference ({currentPreset.district})</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Display */}
          {(simulationResult || currentCalc) && (
            <div className="space-y-3 pt-2">
              <div className="bg-blue-50/40 border border-blue-200 rounded-lg p-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-blue-200">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-blue-700" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Predicted Hazard Output: {(simulationResult || currentCalc).riskLevel}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {hazardType.toUpperCase().replace('_', ' ')} Nowcast Lead Time:{' '}
                        <strong>{(simulationResult || currentCalc).leadTime || (simulationResult || currentCalc).leadTimeHours}</strong> &bull; Location: <strong>{currentPreset.name}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="bg-white px-2.5 py-1 rounded-md border border-blue-300 text-blue-900 font-bold shadow-2xs">
                      Score: {(simulationResult || currentCalc).riskScore}/100
                    </span>
                    <span className="bg-blue-600 text-white px-2.5 py-1 rounded-md font-bold shadow-2xs">
                      P: {((simulationResult || currentCalc).probability * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* XAI Attribution Panel */}
                <XaiExplainabilityPanel
                  drivers={(simulationResult || currentCalc).xaiTopDrivers}
                  hazardType={hazardType}
                  leadTime={(simulationResult || currentCalc).leadTime || (simulationResult || currentCalc).leadTimeHours}
                />
              </div>

              {/* Dispatch Drill Alert Button */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-slate-900 p-3 rounded-md">
                <span className="text-[11px] text-slate-600">
                  Broadcast this nowcast scenario for <strong>{currentPreset.district}</strong> to the live alert queue.
                </span>
                <button
                  type="button"
                  onClick={handleDispatchDrillAlert}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center space-x-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs"
                >
                  <span>Dispatch Nowcast Drill Alert</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
