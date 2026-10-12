'use client';

import React, { useState } from 'react';
import { FieldReport, ReportType, ReporterType } from '@/lib/types';
import { X, UploadCloud, Check, CloudRain } from 'lucide-react';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportData: Partial<FieldReport>) => Promise<void>;
}

export default function NewReportModal({
  isOpen,
  onClose,
  onSubmit,
}: NewReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('heavy_rainfall');
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState('East Khasi Hills');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('25.2702');
  const [longitude, setLongitude] = useState('91.7323');
  const [description, setDescription] = useState('');
  const [roadAffected, setRoadAffected] = useState('SH-5 Shillong-Sohra Route');
  const [reporterName, setReporterName] = useState('Duty Field Inspector');
  const [reporterType, setReporterType] = useState<ReporterType>('field_official');
  const [reporterPhone, setReporterPhone] = useState('+91 98560-00000');
  const [rainfallEstimateMm, setRainfallEstimateMm] = useState<number>(85);
  const [hailObserved, setHailObserved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        reportType,
        title,
        district,
        state: 'Meghalaya',
        location,
        latitude: parseFloat(latitude) || 25.2702,
        longitude: parseFloat(longitude) || 91.7323,
        description,
        roadAffected: roadAffected || undefined,
        reporterName,
        reporterType,
        reporterPhone,
        rainfallEstimateMm: rainfallEstimateMm || undefined,
        hailObserved,
        mediaUrl: 'https://picsum.photos/seed/severe_weather_report/640/420',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white text-slate-900 rounded-t-lg">
          <div>
            <h2 className="font-bold text-sm flex items-center space-x-1.5 text-slate-900">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>Submit Ground-Truth Weather Observation</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Crowdsourced & field inspector real-time weather incident report for model validation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
          {/* Observation Type */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Observation Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
              >
                <option value="heavy_rainfall">Torrential Heavy Rainfall / Cloudburst</option>
                <option value="flash_flood">Flash Flood / River Overflow</option>
                <option value="waterlogging">Urban Waterlogging</option>
                <option value="hailstorm">Hailstorm</option>
                <option value="lightning_damage">Lightning Damage</option>
                <option value="infrastructure_damage">Infrastructure / Bridge Damage</option>
                <option value="other">Other Severe Incident</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target District / Basin</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
              >
                <option value="East Khasi Hills">East Khasi Hills (Cherrapunji)</option>
                <option value="North Sikkim">North Sikkim (Mangan)</option>
                <option value="Uttarkashi">Uttarkashi (Bhagirathi)</option>
                <option value="Mumbai Suburban">Mumbai Suburban (Mithi)</option>
                <option value="Kamrup Metropolitan">Guwahati (Bharalu)</option>
                <option value="Central Delhi">Central Delhi (Yamuna)</option>
                <option value="Noney">Noney (Ijei Basin)</option>
                <option value="Chennai">Chennai Coastal Plain</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Observation Summary Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Torrential sheet rain overflowing Shella causeway"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
            />
          </div>

          {/* Specific Location & Affected Road */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Specific Landmark / Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Near Shella Gorge Bridge"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Corridor / Road Affected</label>
              <input
                type="text"
                placeholder="e.g. SH-5 Highway"
                value={roadAffected}
                onChange={(e) => setRoadAffected(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Crowdsourced Metrics: Rainfall Estimate & Hail */}
          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-2.5 rounded-md border border-slate-200">
            <div>
              <label className="block font-medium text-slate-800 mb-1">Est. Rain Rate (mm/hr)</label>
              <input
                type="number"
                value={rainfallEstimateMm}
                onChange={(e) => setRainfallEstimateMm(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-800"
              />
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="hail-checkbox"
                checked={hailObserved}
                onChange={(e) => setHailObserved(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="hail-checkbox" className="font-semibold text-slate-800 cursor-pointer">
                Hailstones Observed
              </label>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Latitude (N)</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Longitude (E)</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Detailed Narrative */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Observed Details & Impact</label>
            <textarea
              rows={3}
              placeholder="Describe rainfall intensity, stream overflow level, wind gusts, or traffic stoppages..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
            />
          </div>

          {/* Photo upload mock */}
          <div className="border border-dashed border-slate-300 rounded-md p-3 bg-slate-50 text-center">
            <UploadCloud className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <span className="text-[11px] font-medium text-slate-700 block">
              Attach Geotagged Photo Evidence (AWS / Satellite Verification)
            </span>
            <span className="text-[10px] text-slate-500">
              Media Bucket: weather-ground-truth-reports
            </span>
          </div>

          {/* Reporter details */}
          <div className="grid grid-cols-2 gap-2.5 border-t border-slate-200 pt-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Observer Name</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Observer Role</label>
              <select
                value={reporterType}
                onChange={(e) => setReporterType(e.target.value as ReporterType)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-800"
              >
                <option value="field_official">Field Official (PWD/Water Resources)</option>
                <option value="imd_observer">IMD AWS Observer</option>
                <option value="ndrf_sdrf_team">NDRF / SDRF Emergency Team</option>
                <option value="traffic_police">Traffic Police Patrol</option>
                <option value="citizen">Local Citizen / Gram Panchayat</option>
              </select>
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2 -mx-4 -mb-4 mt-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 rounded-md text-xs font-semibold cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Weather Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
