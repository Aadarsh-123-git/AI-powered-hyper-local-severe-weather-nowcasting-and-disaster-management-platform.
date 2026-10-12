'use client';

import React from 'react';
import { X, Shield, BookOpen, AlertTriangle, PhoneCall } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="bg-white rounded-md border border-slate-200 shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h2 className="font-bold text-sm text-slate-900">
              District Disaster Officer SOP & Operational Reference
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 mb-1 flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1 text-blue-600" />
              1. Four Essential Operational Questions
            </h3>
            <p className="text-slate-600 mb-1.5 leading-relaxed">
              The platform is designed to answer four key operational questions within 10 seconds:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-700 font-medium">
              <li><strong>What is happening?</strong> Check Hazard Type (Landslide, Flash Flood, Road Blockage).</li>
              <li><strong>Where is it happening?</strong> Check Road Corridor (NH-10, NH-29) and District Coordinates.</li>
              <li><strong>How serious is it?</strong> Check Risk Level (Critical = Red &ge;75, High = Orange 50-74).</li>
              <li><strong>What needs attention?</strong> Check Priority Actions on Dashboard & Active Alerts queue.</li>
            </ol>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
              2. Standard Operating Procedure (SOP) for Critical Alerts
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Open the alert in the <strong>Alerts</strong> tab to read specific recommended actions.</li>
              <li>Click <strong>Acknowledge</strong> to log duty officer engagement and avoid duplicate notifications.</li>
              <li>Contact the Border Roads Organisation (BRO) and local traffic outpost for preemptive vehicle halts.</li>
              <li>Dispatch SDRF quick-response teams to vulnerable downhill settlements.</li>
              <li>Once road debris is cleared and geotechnical stability is verified, click <strong>Mark Resolved</strong>.</li>
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="font-bold text-slate-900 mb-1">
              3. Citizen Field Reports Verification Workflow
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Crowdsourced and citizen reports are classified as <em>Pending Verification</em>. Physical ground inspection by a certified PWD engineer, geologist, or police patrol is mandatory before confirming a hazard in official logs.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded text-slate-700">
            <span className="font-semibold block mb-1 flex items-center">
              <PhoneCall className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Emergency Regional Contact Points:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>SDRF Control Room: 1077</div>
              <div>BRO Project Swastik: 03592-XXXXX</div>
              <div>Police Emergency: 112</div>
              <div>IMD Met Centre Gangtok: 03592-202720</div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
