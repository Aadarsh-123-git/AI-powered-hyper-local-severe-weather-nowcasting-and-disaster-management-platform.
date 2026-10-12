'use client';

import React, { useState } from 'react';
import { Radio, X, Send, Smartphone, MessageSquare, ShieldAlert, CheckCircle2, Globe, Users, Sparkles } from 'lucide-react';
import { RiskLevel, AlertItem, AlertSeverity } from '@/lib/types';

interface SmsDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  initialRiskLevel?: RiskLevel;
  initialAction?: string;
  isSimulated?: boolean;
  simulationVariables?: AlertItem['simulationVariables'];
  onDispatchedAlert?: (alertData: Partial<AlertItem>) => void;
}

export default function SmsDispatchModal({
  isOpen,
  onClose,
  initialLocation = 'East Sikkim (NH-10 Gangtok-Singtam Sector)',
  initialRiskLevel = 'CRITICAL',
  initialAction = 'Mandatory heavy vehicle halt at Rangpo checkpoint. Evacuate vulnerable slopes to Singtam Community Hall.',
  isSimulated = false,
  simulationVariables,
  onDispatchedAlert,
}: SmsDispatchModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'as' | 'bn' | 'ne' | 'hi'>('en');
  const [channels, setChannels] = useState<{ [key: string]: boolean }>({
    sms: true,
    cellBroadcast: true,
    whatsapp: true,
    pushApp: true,
    radioSiren: initialRiskLevel === 'CRITICAL',
  });

  const [recipients, setRecipients] = useState<{ [key: string]: boolean }>({
    deocOfficers: true,
    gaonBurahs: true,
    broEngineers: true,
    publicCell: true,
    sdrfTeams: true,
  });

  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentLog, setSentLog] = useState<{
    smsCount: number;
    cellBroadcastRadiusKm: number;
    whatsappDelivered: number;
    timestamp: string;
  } | null>(null);

  if (!isOpen) return null;

  const prefix = isSimulated ? '[AI SIMULATION DRILL - ' : '[NER-SAFE EARLY WARNING - ';

  const templates: Record<'en' | 'as' | 'bn' | 'ne' | 'hi', string> = {
    en: `${prefix}${initialRiskLevel}]\nHazard Threat at ${initialLocation}.\nStatus: High slope instability & debris flow risk.\nREQUIRED ACTION: ${initialAction}\nHelpline: 1077 (SDRF) / 1070 (SEOC).`,
    as: `${prefix}${initialRiskLevel}]\n${initialLocation} ত পানী আৰু ভূ-স্খলনৰ বিপদ সংকেত।\nপ্ৰয়োজনীয় পদক্ষেপ: ${initialAction}\nজৰুৰী সহায়ক নম্বৰ: ১০৭৭ (SDRF).`,
    bn: `${prefix}${initialRiskLevel}]\n${initialLocation} এলাকায় ভূমিধস ও পাহাড় ধসের তীব্র ঝুঁকি।\nকরণীয় পদক্ষেপ: ${initialAction}\nজরুরি নম্বর: ১০৭৭ (SDRF).`,
    ne: `${prefix}${initialRiskLevel}]\n${initialLocation} क्षेत्रमा पहिरोको उच्च जोखिम।\nआवश्यक कारबाही: ${initialAction}\nहेल्पलाइन: १०७७ (SDRF).`,
    hi: `${prefix}${initialRiskLevel}]\n${initialLocation} में भूस्खलन और मलबे का गंभीर खतरा।\nआवश्यक कार्रवाई: ${initialAction}\nआपातकालीन नंबर: 1077 (SDRF).`,
  };

  const handleSendDispatch = () => {
    setIsSending(true);
    setTimeout(() => {
      setSentLog({
        smsCount: 4280,
        cellBroadcastRadiusKm: 15,
        whatsappDelivered: 890,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });

      if (onDispatchedAlert) {
        const severity: AlertSeverity =
          initialRiskLevel === 'CRITICAL'
            ? 'CRITICAL'
            : initialRiskLevel === 'HIGH'
            ? 'WARNING'
            : 'WATCH';

        onDispatchedAlert({
          id: `alt-${isSimulated ? 'sim-' : ''}${Date.now()}`,
          title: `${isSimulated ? '[AI SIMULATION DRILL] ' : ''}Early Warning Broadcast - ${initialLocation}`,
          severity,
          location: initialLocation,
          district: initialLocation.split('(')[0].trim(),
          state: initialLocation.includes('Sikkim') ? 'Sikkim' : initialLocation.includes('Assam') ? 'Assam' : 'Meghalaya',
          locationId: 'loc-001',
          hazardType: 'landslide',
          riskScore: initialRiskLevel === 'CRITICAL' ? 88 : 65,
          probability: initialRiskLevel === 'CRITICAL' ? 0.88 : 0.65,
          forecastWindow: 'Immediate Dispatch Horizon',
          status: 'ACTIVE',
          factors: [
            isSimulated ? 'Triggered via AI Geotechnical Risk Simulator' : 'Triggered via Operational Threshold Matrix',
            `Broadcast Channels: ${Object.keys(channels).filter((k) => channels[k]).join(', ')}`,
          ],
          recommendedAction: initialAction,
          modelVersion: isSimulated ? 'NER-RF-v1.4 (Simulation Dispatch)' : 'NER-RF-v1.4 (Operational)',
          recipientGroup: 'DEOC, Gaon Burahs, BRO, SDRF, Public Cell Towers',
          isSimulated: isSimulated,
          simulationVariables: simulationVariables,
        });
      }

      setIsSending(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-white text-slate-900 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className={`w-5 h-5 ${isSimulated ? 'text-blue-600' : 'text-red-600'} animate-pulse`} />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-sm text-slate-900">Automated Multi-Channel Early Warning System</h2>
                {isSimulated ? (
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                    SIMULATION DRILL
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                    EMERGENCY
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Cell Broadcast, SMS Gateway, & SDRF Emergency Radio Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {/* Target Location Summary */}
          <div className={`${isSimulated ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-md p-2.5 flex items-center justify-between`}>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isSimulated ? 'text-blue-700' : 'text-red-600'}`}>
                {isSimulated ? 'Simulated Drill Hazard Zone' : 'Target Hazard Zone'}
              </span>
              <strong className="text-slate-900 font-semibold">{initialLocation}</strong>
            </div>
            <span className={`${isSimulated ? 'bg-blue-600' : 'bg-red-600'} text-white text-[11px] font-bold px-2 py-0.5 rounded font-mono`}>
              {initialRiskLevel}
            </span>
          </div>

          {/* Delivery Channels Checklist */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1 flex items-center space-x-1">
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
              <span>Select Transmission Channels:</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { id: 'sms', label: 'SMS Gateway (Govt. BSNL/Jio)' },
                { id: 'cellBroadcast', label: '15km Cell Broadcast Siren' },
                { id: 'whatsapp', label: 'WhatsApp Official Alert Bot' },
                { id: 'pushApp', label: 'NER-SAFE Mobile App Push' },
                { id: 'radioSiren', label: 'SDRF VHF Radio Siren' },
              ].map((ch) => (
                <label
                  key={ch.id}
                  className={`flex items-center space-x-2 p-2 rounded border cursor-pointer ${
                    channels[ch.id] ? 'bg-blue-600 text-white border-blue-600 font-medium' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!channels[ch.id]}
                    onChange={(e) => setChannels({ ...channels, [ch.id]: e.target.checked })}
                    className="rounded accent-blue-600"
                  />
                  <span>{ch.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Target Recipient Groups */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Target Recipient Stakeholders:</span>
            </label>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                { id: 'deocOfficers', label: 'DEOC Officers' },
                { id: 'gaonBurahs', label: 'Gaon Burahs (Headmen)' },
                { id: 'broEngineers', label: 'BRO Road Crews' },
                { id: 'sdrfTeams', label: 'SDRF Alpha Units' },
                { id: 'publicCell', label: 'General Public (Zone)' },
              ].map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setRecipients({ ...recipients, [rec.id]: !recipients[rec.id] })}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                    recipients[rec.id] ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector & Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-800 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Multi-lingual Alert Message Template:</span>
              </label>
              <div className="flex space-x-1">
                {(['en', 'as', 'bn', 'ne', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                      selectedLanguage === lang ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              readOnly
              value={templates[selectedLanguage]}
              rows={4}
              className="w-full bg-slate-50 text-slate-900 font-mono text-[11px] p-2.5 rounded border border-slate-200 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Send Dispatch Action */}
          <button
            onClick={handleSendDispatch}
            disabled={isSending}
            className={`w-full py-2.5 ${isSimulated ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold rounded-md flex items-center justify-center space-x-2 shadow-2xs cursor-pointer transition-colors`}
          >
            <Send className="w-4 h-4 text-white" />
            <span>{isSending ? 'Transmitting Emergency Signals...' : isSimulated ? 'Execute AI Simulated Warning Broadcast (Drill)' : 'Execute Immediate Multi-Channel Early Warning Dispatch'}</span>
          </button>

          {/* Confirmation Output */}
          {sentLog && (
            <div className="bg-emerald-50 border border-emerald-300 rounded p-3 text-emerald-950 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dispatch Executed Successfully at {sentLog.timestamp}</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-tight">
                Sent <strong>{sentLog.smsCount}</strong> emergency SMS messages. Activated <strong>{sentLog.cellBroadcastRadiusKm}km</strong> radius Cell Broadcast siren towers. Delivered <strong>{sentLog.whatsappDelivered}</strong> official WhatsApp broadcasts to Gaon Burahs & BRO officers.
              </p>
              {isSimulated && (
                <p className="text-[10px] text-blue-800 font-semibold mt-1">
                  🔬 Drill Alert added to Alerts queue with [AI SIMULATION] tag.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
