'use client';

import React from 'react';
import { RiskPrediction, FieldReport } from '@/lib/types';
import { AlertTriangle, MapPin, X, ArrowRight, CloudRain, Zap, Waves, Activity } from 'lucide-react';
import XaiExplainabilityPanel from '@/components/model/XaiExplainabilityPanel';

interface LocationPanelProps {
  prediction: RiskPrediction | null;
  onClose: () => void;
  onViewAlert: (locationId: string) => void;
  onViewReports: (location: string) => void;
  relatedReports?: FieldReport[];
}

export default function LocationPanel({
  prediction,
  onClose,
  onViewAlert,
  onViewReports,
  relatedReports = [],
}: LocationPanelProps) {
  if (!prediction) return null;

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    }
  };

  return (
    <div
      id="location-inspection-panel"
      className="bg-white border border-slate-200 rounded-md p-4 shadow-sm flex flex-col h-full text-slate-800"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRiskBadgeColor(
                prediction.riskLevel
              )}`}
            >
              {prediction.riskLevel}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Score: {prediction.riskScore}/100
            </span>
          </div>
          <h3 className="font-semibold text-base text-slate-900 mt-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-blue-600 shrink-0" />
            {prediction.location}
          </h3>
          <p className="text-xs text-slate-500">
            District: {prediction.district}, {prediction.state} &bull; Basin: {prediction.drainageBasin || 'Local Watershed'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
          title="Close details panel"
          id="close-location-panel-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable details */}
      <div className="space-y-3.5 text-xs overflow-y-auto flex-1 pr-1">
        {/* Metric summary grid - Atmospheric & Satellite Predictors */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
          <div>
            <span className="text-slate-500 block text-[11px]">Hazard Head</span>
            <span className="font-semibold text-blue-900 capitalize">
              {prediction.hazardType.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Lead Time</span>
            <span className="font-semibold text-slate-800 font-mono">
              {prediction.forecastWindow}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Integrated Water Vapor (IWV)</span>
            <span className="font-bold text-blue-700 font-mono">
              {prediction.integratedWaterVaporKgM2} kg/m²
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">CAPE Instability</span>
            <span className="font-bold text-amber-700 font-mono">
              {prediction.capeJkg} J/kg
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">CTT Drop Rate</span>
            <span className="font-bold text-blue-700 font-mono">
              {prediction.cttDropRateCPerMin} °C/min
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Satellite QPE Rate</span>
            <span className="font-bold text-indigo-700 font-mono">
              {prediction.qpeRainfallRateMmHr} mm/hr
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">0-6km Wind Shear</span>
            <span className="font-semibold text-slate-800 font-mono">
              {prediction.verticalWindShearMs} m/s
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">DEM Terrain Slope</span>
            <span className="font-semibold text-slate-800 font-mono">
              {prediction.demSlopeDegrees}°
            </span>
          </div>
        </div>

        {/* Explainable AI Attribution Component */}
        {prediction.xaiTopDrivers && (
          <XaiExplainabilityPanel
            drivers={prediction.xaiTopDrivers}
            hazardType={prediction.hazardType}
            leadTime={prediction.forecastWindow}
          />
        )}

        {/* Contributing Factors */}
        <div>
          <h4 className="font-semibold text-slate-900 text-xs mb-1.5 flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Atmospheric & Satellite Drivers
          </h4>
          <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
            {prediction.factors.map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        </div>

        {/* Infrastructure & Drainage */}
        <div className="border-t border-slate-100 pt-2.5">
          <h4 className="font-semibold text-slate-900 text-xs mb-1">
            Drainage Catchment & Critical Assets
          </h4>
          <div className="space-y-1 text-[11px] text-slate-600">
            <div>
              <span className="text-slate-500">Hydro Basin: </span>
              <span className="font-medium text-slate-800">
                {prediction.drainageBasin}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Roads & Corridors: </span>
              <span className="font-medium text-slate-700">
                {prediction.nearbyRoads?.join(', ') || 'Regional Highway'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">High Risk Sub-basins: </span>
              <span className="font-medium text-slate-700">
                {prediction.nearbyVillages?.join(', ') || 'Local settlements'}
              </span>
            </div>
          </div>
        </div>

        {/* Associated Field Reports */}
        <div className="border-t border-slate-100 pt-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-semibold text-slate-900 text-xs">
              Linked Ground Truth Reports
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {relatedReports.length} reports
            </span>
          </div>
          {relatedReports.length > 0 ? (
            <div className="space-y-1.5">
              {relatedReports.slice(0, 2).map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px]"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-0.5">
                    <span className="font-medium uppercase text-blue-800">{r.reportType.replace('_', ' ')}</span>
                    <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                  </div>
                  <p className="text-slate-700 line-clamp-1">{r.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No field reports submitted for these coordinates.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-slate-100 pt-3 mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          id="panel-view-alert-btn"
          onClick={() => onViewAlert(prediction.locationId)}
          className="w-full text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
        >
          <span>View Alert</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          type="button"
          id="panel-view-reports-btn"
          onClick={() => onViewReports(prediction.location)}
          className="w-full text-center py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer"
        >
          <span>View Reports</span>
        </button>
      </div>
    </div>
  );
}
