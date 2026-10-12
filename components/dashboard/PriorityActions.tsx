'use client';

import React from 'react';
import { PriorityAction } from '@/lib/types';
import { AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

interface PriorityActionsProps {
  actions: PriorityAction[];
  onActionClick?: (action: PriorityAction) => void;
  onViewAllAlerts?: () => void;
}

export default function PriorityActions({
  actions,
  onActionClick,
  onViewAllAlerts,
}: PriorityActionsProps) {
  const getSeverityBadge = (severity: 'CRITICAL' | 'HIGH' | 'MODERATE') => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-300';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
        <div>
          <h3 className="font-semibold text-sm text-slate-900 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1.5 text-red-600" />
            Priority Operational Actions
          </h3>
          <p className="text-[11px] text-slate-500">
            Immediate tactical decisions recommended by risk algorithms & ground reports
          </p>
        </div>
        {onViewAllAlerts && (
          <button
            onClick={onViewAllAlerts}
            className="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center cursor-pointer"
          >
            <span>All Alerts</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {actions.slice(0, 4).map((item) => (
          <div
            key={item.id}
            onClick={() => onActionClick?.(item)}
            className="p-2.5 rounded border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getSeverityBadge(
                  item.severity
                )}`}
              >
                {item.severity}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {item.timeContext}
              </span>
            </div>

            <div className="font-semibold text-slate-900 text-xs mb-1">
              {item.title}
            </div>

            <p className="text-[11px] text-slate-600 mb-1.5 leading-relaxed">
              {item.actionRequired}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-1.5 mt-1">
              <span>Unit: <strong className="text-slate-700">{item.assignedUnit}</strong></span>
              <span className="flex items-center text-slate-600 capitalize">
                <CheckCircle2 className="w-3 h-3 mr-1 text-slate-400" />
                {item.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
