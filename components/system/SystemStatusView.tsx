'use client';

import React from 'react';
import { SystemHealthData } from '@/services/systemApi';
import {
  Server,
  Database,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Lock,
} from 'lucide-react';

interface SystemStatusViewProps {
  healthData: SystemHealthData;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function SystemStatusView({
  healthData,
  onRefresh,
  isRefreshing,
}: SystemStatusViewProps) {
  const getStatusPill = (status: 'operational' | 'degraded' | 'offline') => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Operational</span>
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Degraded</span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center space-x-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-semibold uppercase">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Offline</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with status badge and refresh button */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="font-bold text-sm text-slate-900 flex items-center">
              <Server className="w-4 h-4 mr-1.5 text-slate-700" />
              Platform Infrastructure Health & Ingestion Telemetry
            </h2>
            {getStatusPill(healthData.status)}
          </div>
          <p className="text-[11px] text-slate-500">
            Real-time status of backend API services, Supabase PostgreSQL, ingest schedulers, and ML inference engines
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="refresh-system-health-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Polling...' : 'Poll Health Status'}</span>
          </button>
        </div>
      </div>

      {/* Section 1: Data Sources Status strictly conforming to spec */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              1. External Data Sources & Sensor Feeds
            </h3>
            <p className="text-[11px] text-slate-500">
              Weather APIs, ground piezometer telemetry, seismic feeds, and citizen field reports
            </p>
          </div>
          <Radio className="w-4 h-4 text-slate-400" />
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {healthData.dataSources.map((source) => (
            <div key={source.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="pr-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">{source.name}</span>
                  {source.isSimulated && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                      Simulated Grid
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Provider: {source.provider} &bull; Type: {source.type}
                </div>
                {source.lastError && (
                  <div className="text-[10px] text-amber-600 mt-0.5 italic">
                    Note: {source.lastError}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right text-[11px]">
                  <span className="text-slate-400 block text-[10px]">Last Update</span>
                  <span className="font-medium text-slate-700">{source.lastSuccessfulUpdate}</span>
                </div>
                <div className="text-right text-[11px]">
                  <span className="text-slate-400 block text-[10px]">Latency</span>
                  <span className="font-mono text-slate-700">{source.latencyMs}ms</span>
                </div>
                <div>
                  {getStatusPill(source.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: System Services Status strictly conforming to spec */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              2. Core Platform System Services
            </h3>
            <p className="text-[11px] text-slate-500">
              FastAPI backend, Supabase PostgreSQL, prediction workers, and notification gateway
            </p>
          </div>
          <Database className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {healthData.services.map((svc) => (
            <div key={svc.id} className="bg-slate-50 border border-slate-200 rounded p-3 text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-1.5">
                  <span className="font-semibold text-slate-900">{svc.name}</span>
                  {getStatusPill(svc.status)}
                </div>
                <div className="text-[11px] text-slate-500 mb-1 font-mono">
                  {svc.version}
                </div>
                {svc.notes && (
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    {svc.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-1.5 mt-2">
                <span>Uptime: <strong className="text-slate-800 font-mono">{svc.uptimePct}%</strong></span>
                <span>Latency: <strong className="text-slate-800 font-mono">{svc.latencyMs}ms</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Model Status strictly conforming to spec */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 mr-1 text-blue-600" />
              3. Predictive Model Engine & Inference Status
            </h3>
            <p className="text-[11px] text-slate-500">
              Active model configuration and continuous validation status
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Protected settings (Admin sign-off required for retrain)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Active Model</span>
            <span className="font-semibold text-slate-900 block mt-0.5">{healthData.model.activeModel}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Version Tag</span>
            <span className="font-mono font-semibold text-slate-900 block mt-0.5">{healthData.model.modelVersion}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Last Full Training</span>
            <span className="font-medium text-slate-800 block mt-0.5">{healthData.model.trainedAt}</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
            <span className="text-[10px] text-emerald-700 block">Prediction Engine Status</span>
            <span className="font-bold text-emerald-800 block mt-0.5">Active Continuous Inference</span>
          </div>
        </div>
      </div>
    </div>
  );
}
