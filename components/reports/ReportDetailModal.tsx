'use client';

import React from 'react';
import { FieldReport } from '@/lib/types';
import { X, CheckCircle, XCircle, MapPin, Clock, User, Phone, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface ReportDetailModalProps {
  report: FieldReport | null;
  onClose: () => void;
  onVerify: (reportId: string) => void;
  onReject: (reportId: string) => void;
  onViewOnMap: (lat: number, lng: number) => void;
}

export default function ReportDetailModal({
  report,
  onClose,
  onVerify,
  onReject,
  onViewOnMap,
}: ReportDetailModalProps) {
  if (!report) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-slate-100 text-slate-500 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div
        id="report-detail-modal"
        className="bg-white rounded-md border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                  report.verificationStatus
                )}`}
              >
                Verification: {report.verificationStatus}
              </span>
              <span className="text-xs uppercase font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {report.reportType.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {report.id}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{report.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Image Preview */}
          <div className="relative w-full h-56 bg-slate-100 rounded-md overflow-hidden border border-slate-200">
            <Image
              src={report.mediaUrl}
              alt={report.title}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-1 rounded">
              GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </div>
          </div>

          {/* Location & Metadata */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Location Observed</span>
              <span className="font-semibold text-slate-800 flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {report.location}
              </span>
              <span className="text-[11px] text-slate-500">
                {report.district}, {report.state}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Reporter Details</span>
              <span className="font-semibold text-slate-800 flex items-center mt-0.5">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {report.reporterName} ({report.reporterType.replace('_', ' ')})
              </span>
              {report.reporterPhone && (
                <span className="text-[11px] text-slate-500 flex items-center mt-0.5">
                  <Phone className="w-3 h-3 mr-1 text-slate-400" />
                  {report.reporterPhone}
                </span>
              )}
            </div>
          </div>

          {/* Detailed Narrative */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-1">
              Field Description & Physical Indicators
            </h4>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed text-xs">
              {report.description}
            </p>
          </div>

          {/* AI Advisory Analysis Notice */}
          {report.aiAdvisoryAnalysis && (
            <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded text-blue-950">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-blue-800 mb-0.5 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Automated Advisory Preliminary Analysis
              </h4>
              <p className="text-[11px] leading-relaxed text-blue-900">
                {report.aiAdvisoryAnalysis}
              </p>
            </div>
          )}

          {/* Verification Record */}
          {report.verifiedBy && (
            <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Sign-off: <strong>{report.verifiedBy}</strong></span>
              <span>Timestamp: {new Date(report.verifiedAt || '').toLocaleString()} IST</span>
            </div>
          )}
        </div>

        {/* Footer with exact buttons conforming to spec:
            Verify, Reject, Open on map */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onViewOnMap(report.latitude, report.longitude);
              onClose();
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Open on Map</span>
          </button>

          <div className="flex items-center space-x-2">
            {report.verificationStatus === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => onVerify(report.id)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center space-x-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReject(report.id)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-medium cursor-pointer flex items-center space-x-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
