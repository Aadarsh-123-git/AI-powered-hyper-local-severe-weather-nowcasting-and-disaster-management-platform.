'use client';

import React from 'react';
import { Brain, Info } from 'lucide-react';

interface XaiDriver {
  factor: string;
  contributionPct: number;
}

interface XaiExplainabilityPanelProps {
  drivers: XaiDriver[];
  hazardType?: string;
  leadTime?: string;
  className?: string;
}

export default function XaiExplainabilityPanel({
  drivers,
  hazardType = 'severe_weather',
  leadTime = '2-6 Hours',
  className = '',
}: XaiExplainabilityPanelProps) {
  if (!drivers || drivers.length === 0) {
    return null;
  }

  // Sort drivers by contribution percentage descending
  const sortedDrivers = [...drivers].sort((a, b) => b.contributionPct - a.contributionPct);

  return (
    <div className={`bg-white text-slate-800 border border-slate-200 rounded-lg p-3.5 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-xs tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>Explainable AI (XAI) Feature Attribution</span>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
              Integrated Gradients
            </span>
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 font-mono">
          Lead Time: {leadTime}
        </span>
      </div>

      <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
        Meteorological predictor contribution weights driving the current nowcast prediction for{' '}
        <strong className="text-blue-700 capitalize">{hazardType.replace('_', ' ')}</strong>:
      </p>

      {/* Driver Bars */}
      <div className="space-y-2.5">
        {sortedDrivers.map((driver, idx) => (
          <div key={driver.factor} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5 font-medium text-slate-700 truncate pr-2">
                <span className="text-[10px] font-mono text-blue-600 font-bold">#{idx + 1}</span>
                <span className="truncate">{driver.factor}</span>
              </div>
              <span className="font-mono font-bold text-blue-700 shrink-0">
                {driver.contributionPct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, driver.contributionPct))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200 flex items-start space-x-1.5 text-[10px] text-slate-500">
        <Info className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
        <span>
          Attribution weights are computed in real-time from the 3D Swin-Transformer cross-attention layers using IMDAA reanalysis and INSAT-3D/3DR satellite channels.
        </span>
      </div>
    </div>
  );
}
