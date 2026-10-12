import { NextRequest, NextResponse } from 'next/server';
import { HazardType } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface NowcastSimulationInput {
  integratedWaterVaporKgM2: number;
  capeJkg: number;
  cinJkg: number;
  lowLevelConvergence: number;
  verticalWindShearMs: number;
  cttDropRateCPerMin: number;
  hazardType?: HazardType;
  district?: string;
}

const DISTRICT_BASINS: Record<string, { basin: string; state: string; name: string; advice: string }> = {
  'East Khasi Hills': {
    basin: 'Shella-Southern Escarpment Catchment',
    state: 'Meghalaya',
    name: 'East Khasi Hills (Cherrapunji / Sohra)',
    advice: 'Activate Mawsmai-Shella escarpment early-warning sirens and alert tourism police.',
  },
  'North Sikkim': {
    basin: 'Upper Teesta River Hydrologic Sub-basin',
    state: 'Sikkim',
    name: 'North Sikkim (Mangan / Chungthang)',
    advice: 'Alert Chungthang Hydro Dam engineers, BRO staging units, and close Teesta gorge crossings.',
  },
  'Uttarkashi': {
    basin: 'Bhagirathi Upper Himalayan Watershed',
    state: 'Uttarakhand',
    name: 'Uttarkashi (Bhagirathi River)',
    advice: 'Alert Maneri Bhali Dam control and evacuate Gangotri highway (NH-34) riverbed settlements.',
  },
  'Mumbai Suburban': {
    basin: 'Mithi River Estuary & Storm Drain Grid',
    state: 'Maharashtra',
    name: 'Mumbai Coastal Plain (Mithi Basin)',
    advice: 'Pre-activate BMC Mithi river pumping stations and warn Kurla-Sion railway corridor cells.',
  },
  'Kamrup Metropolitan': {
    basin: 'Bharalu Stream & Deepor Beel Catchment',
    state: 'Assam',
    name: 'Guwahati (Bharalu Basin)',
    advice: 'Open sluice gates into Brahmaputra and deploy municipal de-watering units on GS Road.',
  },
  'Central Delhi': {
    basin: 'Najafgarh Drain & Yamuna River Floodplain',
    state: 'Delhi',
    name: 'Delhi-NCR (Yamuna Floodplain)',
    advice: 'Clear Yamuna floodplain underpasses (Minto Road, ITO) and issue squall advisory.',
  },
  'Noney / Imphal West': {
    basin: 'Ijei River Hydro-Catchment',
    state: 'Manipur',
    name: 'Imphal West (Noney - Ijei Basin)',
    advice: 'Warn Northeast Frontier Railway bridge staging yards and monitor NH-37 mountain passes.',
  },
  'Chennai': {
    basin: 'Adyar & Cooum River Urban Estuary',
    state: 'Tamil Nadu',
    name: 'Chennai Coastal Plain (Adyar)',
    advice: 'Alert GCC flood disaster cells and monitor Velachery-Tambaram canal outflow levels.',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: NowcastSimulationInput = await request.json();

    const iwv = body.integratedWaterVaporKgM2 ?? 45;
    const cape = body.capeJkg ?? 1500;
    const cin = body.cinJkg ?? 30;
    const conv = body.lowLevelConvergence ?? 0.0002;
    const shear = body.verticalWindShearMs ?? 15;
    const cttRate = body.cttDropRateCPerMin ?? -5;
    const hazardType = body.hazardType || 'cloudburst';
    const district = body.district || 'East Khasi Hills';

    const info = DISTRICT_BASINS[district] || {
      basin: `${district} Hydrographic Basin`,
      state: 'Regional Basin',
      name: district,
      advice: `Monitor ${district} local AWS telemetry.`,
    };

    // Weighted nowcast scoring algorithm (stand-in for production MTL transformer inference)
    const iwvComponent = (iwv / 70) * 35;
    const capeComponent = (cape / 3500) * 25;
    const cinPenalty = (cin / 100) * -10;
    const cttComponent = (Math.abs(cttRate) / 15) * 25;
    const shearConvComponent = (shear / 35) * 15 + (conv / 0.0005) * 10;

    const rawScore = iwvComponent + capeComponent + cinPenalty + cttComponent + shearConvComponent;
    const riskScore = Math.min(98, Math.max(15, Math.round(rawScore)));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 55) riskLevel = 'HIGH';
    else if (riskScore >= 35) riskLevel = 'MODERATE';

    const probability = Math.round((riskScore / 100) * 100) / 100;

    let leadTimeHours = '3-6 Hours';
    if (riskLevel === 'CRITICAL') leadTimeHours = '1-2 Hours';
    else if (riskLevel === 'HIGH') leadTimeHours = '2-4 Hours';

    let primaryDriver = `Integrated Water Vapor (${iwv} kg/m²) in ${info.basin}`;
    if (Math.abs(cttRate) > 8) primaryDriver = `Rapid Cloud Top Temperature Drop (-${Math.abs(cttRate)}°C/15min) over ${district}`;
    else if (cape > 2200) primaryDriver = `High Thermodynamic Instability (CAPE ${cape} J/kg) over ${info.state}`;

    let recommendedAction = `Routine AWS & INSAT-3D satellite telemetry monitoring for ${district}.`;
    if (riskLevel === 'CRITICAL') {
      recommendedAction = `CRITICAL ALERT: ${info.advice} Pre-position SDRF/NDRF teams for ${info.basin}.`;
    } else if (riskLevel === 'HIGH') {
      recommendedAction = `HIGH ADVISORY: Issue DEOC notice to ${district} emergency response units. ${info.advice}`;
    }

    const factors = [
      `Location: ${info.name} (${info.basin})`,
      `IWV Column Load: ${iwv} kg/m²`,
      `CAPE Instability: ${cape} J/kg (CIN barrier ${cin} J/kg)`,
      `Cloud Top Temp Drop Rate: ${cttRate}°C/min`,
      `Vertical Wind Shear: ${shear} m/s`,
    ];

    const xaiTopDrivers = [
      { factor: `IWV Moisture Load (${info.basin})`, contributionPct: Math.round(Math.max(10, (iwvComponent / Math.max(1, rawScore)) * 100)) },
      { factor: `Cloud Top Cooling Rate (${cttRate}°C/min)`, contributionPct: Math.round(Math.max(10, (cttComponent / Math.max(1, rawScore)) * 100)) },
      { factor: `Thermodynamic Energy (CAPE ${cape} J/kg)`, contributionPct: Math.round(Math.max(10, (capeComponent / Math.max(1, rawScore)) * 100)) },
      { factor: `Low-Level Convergence & Shear`, contributionPct: Math.round(Math.max(5, (shearConvComponent / Math.max(1, rawScore)) * 100)) },
    ];

    return NextResponse.json({
      success: true,
      data: {
        district,
        locationName: info.name,
        drainageBasin: info.basin,
        state: info.state,
        hazardType,
        riskScore,
        riskLevel,
        probability,
        leadTimeHours,
        primaryDriver,
        recommendedAction,
        factors,
        xaiTopDrivers,
        modelVersion: 'MEGH-MTL-Transformer-v2.4 (Simulated Inference)',
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'SIMULATION_ERROR', message: err?.message || 'Failed to compute nowcast simulation' } },
      { status: 400 }
    );
  }
}
