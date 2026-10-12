'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { RainfallDataPoint, RiskTrendDataPoint } from '@/lib/types';
import { CloudRain, TrendingUp } from 'lucide-react';

interface DashboardChartsProps {
  rainfallData: RainfallDataPoint[];
  riskTrendData: RiskTrendDataPoint[];
}

export default function DashboardCharts({
  rainfallData,
  riskTrendData,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* Rainfall Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <CloudRain className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-xs text-slate-800">
              Precipitation Hyetograph & Forecast (mm)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Critical Threshold: 20mm/hr
          </span>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rainfallData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '11px',
                  padding: '4px 8px',
                }}
              />
              <ReferenceLine
                y={20}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Hazard Threshold', position: 'insideTopRight', fill: '#dc2626', fontSize: 9 }}
              />
              <Area
                type="monotone"
                dataKey="observedMm"
                name="Observed (mm)"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rainColor)"
              />
              <Line
                type="monotone"
                dataKey="forecastMm"
                name="NWP Forecast (mm)"
                stroke="#93c5fd"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Risk Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-xs text-slate-800">
              Regional Geotechnical Risk Index (0-100)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Red Zone &ge; 75
          </span>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '11px',
                  padding: '4px 8px',
                }}
              />
              <ReferenceLine
                y={75}
                stroke="#dc2626"
                strokeDasharray="3 3"
                label={{ value: 'CRITICAL (75)', position: 'insideTopLeft', fill: '#dc2626', fontSize: 9 }}
              />
              <Line
                type="monotone"
                dataKey="peakRisk"
                name="Peak Vulnerability"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="averageRisk"
                name="District Avg Risk"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
