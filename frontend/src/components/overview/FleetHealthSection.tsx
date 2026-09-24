import React from 'react';
import { Wrench, AlertOctagon, BatteryWarning, Gauge, Clock, ArrowDownRight } from 'lucide-react';
import { FleetHealth } from '../../types';

interface FleetHealthSectionProps {
  health: FleetHealth | null;
}

export const FleetHealthSection: React.FC<FleetHealthSectionProps> = ({ health }) => {
  if (!health) {
    return <div className="h-44 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />;
  }

  const issueCategories = [
    { label: 'Maintenance Due', count: health.maintenanceDueCount, icon: Wrench, color: 'text-amber-400 bg-amber-950/60 border-amber-800/50' },
    { label: 'Engine Faults', count: health.engineFaultCount, icon: AlertOctagon, color: 'text-rose-400 bg-rose-950/60 border-rose-800/50' },
    { label: 'Battery Warnings', count: health.batteryWarningCount, icon: BatteryWarning, color: 'text-sky-400 bg-sky-950/60 border-sky-800/50' },
    { label: 'TPMS Low Pressure', count: health.tirePressureWarningCount, icon: Gauge, color: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/50' },
    { label: 'Excessive Idling', count: health.excessiveIdleCount, icon: Clock, color: 'text-purple-400 bg-purple-950/60 border-purple-800/50' },
    { label: 'Low Utilization', count: health.lowUtilizationCount, icon: ArrowDownRight, color: 'text-slate-400 bg-slate-800/60 border-slate-700/50' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fleet Health & Diagnostics Breakdown</h3>
          <p className="text-xs text-slate-400">Real-time status distribution across monitored multi-OEM vehicles</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Healthy ({health.healthyPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">At Risk ({health.atRiskPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Critical ({health.criticalPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* Health Proportion Progress Bar */}
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${health.healthyPercentage}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Healthy: ${health.healthyPercentage}%`}
        />
        <div
          style={{ width: `${health.atRiskPercentage}%` }}
          className="bg-amber-500 transition-all duration-500"
          title={`At Risk: ${health.atRiskPercentage}%`}
        />
        <div
          style={{ width: `${health.criticalPercentage}%` }}
          className="bg-rose-500 transition-all duration-500"
          title={`Critical: ${health.criticalPercentage}%`}
        />
      </div>

      {/* Grid of Diagnostic Issue Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {issueCategories.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex flex-col justify-between ${item.color} transition hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-lg font-bold font-mono">{item.count}</span>
              </div>
              <span className="text-[11px] font-medium leading-tight">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
