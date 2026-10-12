'use client';

import React from 'react';
import { CloudRain, Radio, ChevronDown, UserCheck } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface HeaderProps {
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  isSystemLive: boolean;
  onRefreshTelemetry: () => void;
  isRefreshing: boolean;
}

const DISTRICT_OPTIONS = [
  { value: 'all', label: 'All Monitoring Stations (National View)' },
  { value: 'East Khasi Hills', label: 'East Khasi Hills (Cherrapunji)' },
  { value: 'North Sikkim', label: 'North Sikkim (Mangan / Chungthang)' },
  { value: 'Uttarkashi', label: 'Uttarkashi (Bhagirathi River)' },
  { value: 'Mumbai Suburban', label: 'Mumbai Suburban (Mithi Basin)' },
  { value: 'Kamrup Metropolitan', label: 'Guwahati (Bharalu Basin)' },
  { value: 'Central Delhi', label: 'Central Delhi (Yamuna)' },
  { value: 'Noney / Imphal West', label: 'Noney / Tupul (Manipur)' },
  { value: 'Chennai', label: 'Chennai Coastal Plain (Adyar)' },
];

export default function Header({
  selectedDistrict,
  onDistrictChange,
  userRole,
  onUserRoleChange,
  isSystemLive,
  onRefreshTelemetry,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
          <CloudRain className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
              <span>MEGH-AI</span>
              <span className="text-blue-600 text-xs font-mono font-bold">| Nowcasting</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              IMDAA & MOSDAC Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            AI-Driven Hyper-Local Severe Weather Nowcasting &bull; 2–6h Lead Time
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Real-Time Live Telemetry Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span className="font-semibold font-mono">INSAT-3D & IMDAA ACTIVE</span>
        </div>

        {/* Selected District Dropdown */}
        <div className="flex items-center space-x-1.5">
          <label htmlFor="district-header-select" className="text-xs text-slate-500 font-medium hidden sm:inline">
            Station:
          </label>
          <div className="relative">
            <select
              id="district-header-select"
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="appearance-none bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold py-1.5 pl-2.5 pr-7 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
            >
              {DISTRICT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Manual refresh trigger */}
        <button
          type="button"
          onClick={onRefreshTelemetry}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-md text-xs text-slate-700 shadow-2xs transition-colors cursor-pointer"
          title="Click to refresh satellite & nowcast feeds"
        >
          <Radio className={`w-3.5 h-3.5 ${isSystemLive ? 'text-emerald-600' : 'text-amber-500'} ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-medium hidden sm:inline">
            {isRefreshing ? 'Syncing...' : 'Live Feed'}
          </span>
        </button>

        {/* User Role Selector */}
        <div className="relative border-l border-slate-200 pl-3">
          <div className="flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="user-role-select"
              value={userRole}
              onChange={(e) => onUserRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer py-1 pr-1 border-b border-dashed border-slate-300 hover:border-slate-500"
              title="Switch operational role"
            >
              <option value="district_officer" className="bg-white text-slate-900">District Officer (DEOC)</option>
              <option value="disaster_management_authority" className="bg-white text-slate-900">State Authority (SDMA)</option>
              <option value="imd_forecaster" className="bg-white text-slate-900">IMD Nowcast Forecaster</option>
              <option value="field_official" className="bg-white text-slate-900">Field Official</option>
              <option value="administrator" className="bg-white text-slate-900">System Administrator</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
