'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert, FileClock } from 'lucide-react';

interface SummaryMetricProps {
  label: string;
  count: number;
  context: string;
  type: 'critical' | 'high' | 'roads' | 'reports';
  onClick?: () => void;
}

export default function SummaryMetric({
  label,
  count,
  context,
  type,
  onClick,
}: SummaryMetricProps) {
  const getStyling = () => {
    switch (type) {
      case 'critical':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-50',
          border: 'border-red-200',
          textColor: 'text-red-700',
          accent: 'text-red-600',
        };
      case 'high':
        return {
          icon: AlertTriangle,
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          textColor: 'text-orange-700',
          accent: 'text-orange-600',
        };
      case 'roads':
        return {
          icon: AlertCircle,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          textColor: 'text-amber-800',
          accent: 'text-amber-600',
        };
      case 'reports':
        return {
          icon: FileClock,
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          textColor: 'text-slate-800',
          accent: 'text-slate-600',
        };
    }
  };

  const style = getStyling();
  const Icon = style.icon;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-md border ${style.border} ${style.bg} transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:shadow-xs hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-600 tracking-tight">
          {label}
        </span>
        <Icon className={`w-4 h-4 ${style.accent}`} />
      </div>

      <div className="flex items-baseline space-x-2">
        <span className={`text-2xl font-bold font-mono tracking-tight ${style.textColor}`}>
          {count}
        </span>
      </div>

      <div className="text-[11px] text-slate-500 mt-1 leading-tight">
        {context}
      </div>
    </div>
  );
}
