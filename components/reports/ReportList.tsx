'use client';

import React, { useState } from 'react';
import { FieldReport } from '@/lib/types';
import { Plus, CheckCircle, XCircle, Clock, MapPin, ShieldAlert, User } from 'lucide-react';
import Image from 'next/image';

interface ReportListProps {
  reports: FieldReport[];
  onSelectReport: (report: FieldReport) => void;
  onOpenNewReportModal: () => void;
  onVerify: (reportId: string) => void;
  onReject: (reportId: string) => void;
  onViewOnMap: (lat: number, lng: number) => void;
}

export default function ReportList({
  reports,
  onSelectReport,
  onOpenNewReportModal,
  onVerify,
  onReject,
  onViewOnMap,
}: ReportListProps) {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = reports.filter((r) => {
    if (activeTab !== 'all' && r.verificationStatus !== activeTab) return false;
    if (filterType !== 'all' && r.reportType !== filterType) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-slate-100 text-slate-500 border-slate-300 line-through';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getReporterBadge = (reporterType: string) => {
    switch (reporterType) {
      case 'field_official':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'traffic_police':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'sdrf_team':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Controls: Tabs and New Report CTA */}
      <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        {/* Verification Status Tabs strictly conforming to spec */}
        <div className="flex items-center space-x-1 text-xs">
          {[
            { id: 'pending', label: 'Pending Verification' },
            { id: 'verified', label: 'Verified Ground Truth' },
            { id: 'rejected', label: 'Rejected / Discarded' },
            { id: 'all', label: 'All Observations' },
          ].map((tab) => {
            const count = tab.id === 'all'
              ? reports.length
              : reports.filter((r) => r.verificationStatus === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded font-medium text-xs whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === tab.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Button & Type Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Observation Types</option>
            <option value="crack">Ground Tension Crack</option>
            <option value="slope_movement">Slope Movement</option>
            <option value="landslide">Active Landslide</option>
            <option value="flooding">Flooding / Waterlogging</option>
            <option value="road_blockage">Road Blockage</option>
            <option value="infrastructure_damage">Infrastructure Damage</option>
          </select>

          <button
            type="button"
            id="submit-new-report-btn"
            onClick={onOpenNewReportModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Observation</span>
          </button>
        </div>
      </div>

      {/* Warning Notice on Ground Truth Verification */}
      <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded text-xs text-amber-900 flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="text-[11px] leading-tight">
          <strong>Mandatory Verification Rule:</strong> Citizen and crowd field submissions are unverified alerts until signed off by a designated District Geologist or Executive Magistrate. AI notes are advisory only.
        </span>
      </div>

      {/* Report Cards Grid / Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 rounded-md p-8 text-center text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-medium text-slate-700">No field reports found in this verification queue.</p>
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200 rounded-md p-3 hover:border-slate-300 transition-shadow shadow-2xs flex flex-col justify-between text-xs"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                        report.verificationStatus
                      )}`}
                    >
                      {report.verificationStatus}
                    </span>
                    <span className="text-[10px] uppercase font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {report.reportType.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getReporterBadge(
                        report.reporterType
                      )}`}
                    >
                      {report.reporterType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center shrink-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                  </span>
                </div>

                {/* Body & Image Preview */}
                <div className="flex space-x-3 mb-2.5">
                  <div
                    onClick={() => onSelectReport(report)}
                    className="relative w-20 h-20 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200 cursor-pointer"
                  >
                    <Image
                      src={report.mediaUrl}
                      alt={report.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => onSelectReport(report)}
                      className="font-semibold text-slate-900 text-xs hover:text-blue-700 transition-colors cursor-pointer line-clamp-2"
                    >
                      {report.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Location & Reporter */}
                <div className="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2 mb-2">
                  <div className="flex items-center text-slate-700 font-medium">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center text-slate-500">
                      <User className="w-3 h-3 mr-1 text-slate-400" />
                      {report.reporterName}
                    </span>
                    {report.roadAffected && (
                      <span className="text-amber-700 font-medium bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                        Road: {report.roadAffected}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons strictly conforming to spec:
                  Verify, Reject, Open on map */}
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectReport(report)}
                  className="text-xs text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
                >
                  View Full Detail
                </button>

                <div className="flex items-center space-x-1.5">
                  {report.verificationStatus === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onVerify(report.id)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer flex items-center space-x-1"
                        title="Officer confirmation of hazard"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Verify</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onReject(report.id)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded text-[11px] font-medium cursor-pointer flex items-center space-x-1"
                        title="Reject ungrounded submission"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewOnMap(report.latitude, report.longitude)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
