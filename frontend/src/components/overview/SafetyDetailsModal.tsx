import React from 'react';
import { X, ShieldCheck, AlertTriangle, Gauge, Award, CheckCircle2 } from 'lucide-react';

interface SafetyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle?: (vehicleId: string) => void;
}

export const SafetyDetailsModal: React.FC<SafetyDetailsModalProps> = ({
  isOpen,
  onClose,
  onSelectVehicle
}) => {
  if (!isOpen) return null;

  const safetyMetrics = [
    { label: 'Harsh Braking Incidents', value: '4 events', status: 'Nominal', change: '-12% vs last week', color: 'text-emerald-600' },
    { label: 'Seatbelt Compliance', value: '99.2%', status: 'Target Met', change: '+0.5% vs target', color: 'text-emerald-600' },
    { label: 'Speed Limit Violations', value: '2 events', status: 'Warning', change: 'Flagged on NH-48', color: 'text-amber-600' },
    { label: 'High-G Cornering Events', value: '1 event', status: 'Nominal', change: '-50% vs last week', color: 'text-emerald-600' }
  ];

  const flaggedVehicles = [
    { id: 'VH-1060', make: 'Tesla', model: 'Model 3', issue: 'Thermal runaway threshold warning', score: '72%' },
    { id: 'VH-1057', make: 'Toyota', model: 'RAV4 Hybrid', issue: 'Hybrid inverter DTC P0A80', score: '78%' },
    { id: 'VH-1051', make: 'Ford', model: 'Transit 250', issue: 'Tire pressure sensor failure', score: '81%' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Fleet Safety & Compliance Details</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time driver behavior and telematics compliance diagnostics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close Modal"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Overall Score Highlight */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Fleet Safety Index</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">88%</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Target: 95%
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Calculated from 60 active telemetry feeds over the rolling 7-day period.</p>
            </div>
            <Award className="w-10 h-10 text-emerald-500 shrink-0" aria-hidden="true" />
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {safetyMetrics.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{m.label}</span>
                  <span className={`text-[10px] font-bold ${m.color}`}>{m.status}</span>
                </div>
                <div className="text-lg font-extrabold text-slate-900">{m.value}</div>
                <div className="text-[11px] text-slate-400 font-medium">{m.change}</div>
              </div>
            ))}
          </div>

          {/* Flagged Vehicles */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vehicles with Safety Exceptions</span>
              <span className="text-[11px] text-slate-400 font-medium">Review recommended</span>
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
              {flaggedVehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    if (onSelectVehicle) onSelectVehicle(v.id);
                    onClose();
                  }}
                  className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between cursor-pointer transition text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{v.id}</span>
                      <span className="text-slate-500 font-medium">{v.make} {v.model}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{v.issue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      Score: {v.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
