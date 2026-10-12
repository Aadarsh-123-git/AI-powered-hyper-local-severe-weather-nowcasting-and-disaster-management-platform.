'use client';

import React, { useState } from 'react';
import { AlertItem } from '@/lib/types';
import { Search, AlertTriangle, ShieldAlert, CheckCircle2, Clock, MapPin, Eye, Sparkles, Radio } from 'lucide-react';

interface AlertListProps {
  alerts: AlertItem[];
  onSelectAlert: (alert: AlertItem) => void;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onViewOnMap: (locationId: string) => void;
}

export default function AlertList({
  alerts,
  onSelectAlert,
  onAcknowledge,
  onResolve,
  onViewOnMap,
}: AlertListProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = alerts.filter((a) => {
    if (filterType === 'real' && a.isSimulated) return false;
    if (filterType === 'simulated' && !a.isSimulated) return false;
    if (filterType === 'critical' && a.severity !== 'CRITICAL') return false;
    if (filterType === 'high' && a.severity !== 'WARNING') return false;
    if (filterType === 'moderate' && a.severity !== 'WATCH') return false;
    if (filterType === 'resolved' && a.status !== 'RESOLVED') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.hazardType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (severity: string, isSimulated?: boolean) => {
    if (isSimulated) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'WARNING':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'WATCH':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-100 text-red-800';
      case 'ACKNOWLEDGED':
        return 'bg-amber-100 text-amber-800';
      case 'RESOLVED':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const simulatedCount = alerts.filter((a) => a.isSimulated).length;

  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        {/* Severity & Mode Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All Alerts (${alerts.length})` },
            { id: 'real', label: '📡 Real Telemetry' },
            { id: 'simulated', label: `🔬 AI Simulations (${simulatedCount})` },
            { id: 'critical', label: 'Critical' },
            { id: 'high', label: 'High' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : tab.id === 'simulated' && simulatedCount > 0
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by location or alert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Alert List Rows */}
      <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100 shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-medium text-slate-700">No alerts match the selected filter criteria.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filterType === 'simulated'
                ? 'No AI simulation drills currently generated. Open the AI Risk Simulator to run a drill.'
                : 'All monitored North Eastern corridors operating within normal parameters.'}
            </p>
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                alert.isSimulated ? 'bg-blue-50/30 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div
                onClick={() => onSelectAlert(alert)}
                className="flex-1 cursor-pointer pr-2"
              >
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  {alert.isSimulated ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 tracking-wide uppercase">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>AI SIMULATED NOWCAST</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      📡 MOSDAC / IMDAA
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getSeverityBadge(
                      alert.severity,
                      alert.isSimulated
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded">
                    {alert.hazardType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">
                    Score: {alert.riskScore}/100
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(
                      alert.status
                    )}`}
                  >
                    {alert.status}
                  </span>
                </div>

                <div className="font-semibold text-slate-900 text-sm hover:text-blue-700 transition-colors flex items-center space-x-1.5">
                  <span>{alert.title}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center font-medium text-slate-700">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                    {alert.location}
                  </span>
                  <span className="flex items-center font-mono">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    Triggered: {new Date(alert.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                  </span>
                  <span className="text-slate-600">
                    Horizon: <strong>{alert.forecastWindow}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectAlert(alert)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer flex items-center space-x-1 ${
                    alert.isSimulated
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{alert.isSimulated ? 'Inspect Drill' : 'Inspect'}</span>
                </button>

                {alert.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => onAcknowledge(alert.id)}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    onClick={() => onResolve(alert.id)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onViewOnMap(alert.locationId)}
                  className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium cursor-pointer"
                >
                  Map
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
