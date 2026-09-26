import React from 'react';
import { X, ShieldCheck, AlertTriangle, Award, CheckCircle2 } from 'lucide-react';
import { SafetyScore, ActionItem } from '../../types';

interface SafetyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  safetyScore?: SafetyScore | null;
  actions?: ActionItem[];
  onSelectVehicle?: (vehicleId: string) => void;
}

export const SafetyDetailsModal: React.FC<SafetyDetailsModalProps> = ({
  isOpen,
  onClose,
  safetyScore,
  actions = [],
  onSelectVehicle
}) => {
  if (!isOpen) return null;

  const hasData = safetyScore?.hasData && safetyScore.safetyScore !== null && safetyScore.safetyScore !== undefined;

  const safetyMetrics = hasData ? [
    {
      label: 'Harsh Braking Incidents',
      value: `${safetyScore.harshBrakingCount} events`,
      status: safetyScore.harshBrakingCount === 0 ? 'Nominal' : 'Active Events',
      color: safetyScore.harshBrakingCount === 0 ? 'text-emerald-600' : 'text-amber-600'
    },
    {
      label: 'Speed Limit Violations',
      value: `${safetyScore.speedViolationsCount} events`,
      status: safetyScore.speedViolationsCount === 0 ? 'Nominal' : 'Warning',
      color: safetyScore.speedViolationsCount === 0 ? 'text-emerald-600' : 'text-rose-600'
    },
    {
      label: 'Critical Diagnostic Faults',
      value: `${safetyScore.criticalFaultCount} events`,
      status: safetyScore.criticalFaultCount === 0 ? 'Nominal' : 'High Priority',
      color: safetyScore.criticalFaultCount === 0 ? 'text-emerald-600' : 'text-rose-600'
    },
    {
      label: 'Telemetry Compliance',
      value: `${safetyScore.complianceRate}%`,
      status: safetyScore.complianceRate >= safetyScore.targetScore ? 'Target Met' : 'Under Review',
      color: safetyScore.complianceRate >= safetyScore.targetScore ? 'text-emerald-600' : 'text-amber-600'
    }
  ] : [];

  const flaggedActions = actions.filter((a) => a.priority === 'CRITICAL' || a.priority === 'HIGH');

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
          {!hasData ? (
            <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" aria-hidden="true" />
              <h4 className="text-sm font-bold text-slate-700">Safety Telemetry Unavailable</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No safety telemetry data available yet. Ingest vehicle telemetry or execute simulator scenarios to evaluate safety compliance.
              </p>
            </div>
          ) : (
            <>
              {/* Overall Score Highlight */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Fleet Safety Index</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {Math.round(safetyScore.safetyScore!)}%
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Target: {safetyScore.targetScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Status: <span className="font-semibold text-slate-800">{safetyScore.status}</span> based on live processed telemetry events.
                  </p>
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
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Flagged Vehicles / Active Safety Exceptions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vehicles with Safety Exceptions</span>
              <span className="text-[11px] text-slate-400 font-medium">
                {flaggedActions.length > 0 ? `${flaggedActions.length} flagged` : 'All nominal'}
              </span>
            </div>
            {flaggedActions.length === 0 ? (
              <div className="p-4 text-center bg-slate-50/50 rounded-xl border border-slate-100 text-xs text-slate-400">
                No active critical or high-priority safety exceptions flagged.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                {flaggedActions.slice(0, 5).map((action) => (
                  <div
                    key={action.actionId}
                    onClick={() => {
                      if (onSelectVehicle) onSelectVehicle(action.vehicleId);
                      onClose();
                    }}
                    className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between cursor-pointer transition text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">{action.vehicleId}</span>
                        <span className="text-slate-500 font-medium">{action.decisionSource}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{action.issue}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                        {action.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
