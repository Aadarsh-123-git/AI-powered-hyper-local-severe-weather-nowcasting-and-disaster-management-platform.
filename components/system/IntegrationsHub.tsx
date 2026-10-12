'use client';

import React from 'react';
import { DataSourceStatus } from '@/lib/types';
import { Database, Satellite, CloudRain, Mountain, Activity, ShieldCheck, Cpu } from 'lucide-react';

interface IntegrationsHubProps {
  dataSources: DataSourceStatus[];
}

export default function IntegrationsHub({ dataSources }: IntegrationsHubProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'reanalysis':
        return <Database className="w-4 h-4 text-blue-600" />;
      case 'satellite':
        return <Satellite className="w-4 h-4 text-indigo-600" />;
      case 'precipitation':
        return <CloudRain className="w-4 h-4 text-blue-600" />;
      case 'elevation':
        return <Mountain className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Meteorological Data Ingestion & Satellite Integration Pipeline</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time telemetry streams powering the Spatiotemporal Multi-Task Learning Nowcast Engine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dataSources.map((source) => (
          <div key={source.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-900">
                  {getIcon(source.type)}
                  <span>{source.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {source.status}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider Agency:</span>
                  <strong className="text-slate-800 font-mono">{source.provider}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Update Cadence:</span>
                  <span className="text-slate-800">{source.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ingestion Latency:</span>
                  <span className="font-mono text-slate-900 font-bold">{source.latencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Sync:</span>
                  <span>{new Date(source.lastSuccessfulUpdate).toLocaleTimeString()} IST</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
              Feed ID: {source.id} &bull; Stream Status: Normal
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
