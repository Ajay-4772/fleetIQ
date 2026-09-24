import React from 'react';
import { Car, Activity, AlertTriangle, IndianRupee, ShieldCheck, Zap } from 'lucide-react';
import { DashboardSummary } from '../../types';

interface FleetOverviewCardsProps {
  summary: DashboardSummary | null;
}

export const FleetOverviewCards: React.FC<FleetOverviewCardsProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Fleet Asset Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Fleet Assets</span>
          <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/50">
            <Car className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{summary.totalVehicles}</span>
          <span className="text-xs text-slate-400">Total Monitored</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-emerald-400 font-medium">{summary.activeVehicles} Active</span>
          <span>{summary.inactiveVehicles} Inactive</span>
          <span className="text-amber-400 font-medium">{summary.maintenanceVehicles} Service</span>
        </div>
      </div>

      {/* 2. Fleet Health Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Fleet Health Index</span>
          <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              summary.fleetHealthScore >= 80
                ? 'text-emerald-400'
                : summary.fleetHealthScore >= 60
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {summary.fleetHealthScore}%
          </span>
          <span className="text-xs text-slate-400">Operational Integrity</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-emerald-400 font-medium">{summary.healthyVehicles} Healthy</span>
          <span className="text-amber-400 font-medium">{summary.atRiskVehicles} At-Risk</span>
          <span className="text-rose-400 font-medium">{summary.criticalVehicles} Critical</span>
        </div>
      </div>

      {/* 3. Operational Utilization */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Active Utilization</span>
          <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/50">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{summary.overallUtilizationPct}%</span>
          <span className="text-xs text-slate-400">Operating Duty</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{summary.openActionCount} Open Actions</span>
          <span className="text-rose-400 font-medium">{summary.criticalActionCount} Critical</span>
        </div>
      </div>

      {/* 4. Estimated Financial Impact */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Est. Operational Risk</span>
          <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/50">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400 tracking-tight">
            {formatCurrency(summary.estimatedTotalImpact)}
          </span>
          <span className="text-[10px] text-slate-400 uppercase">Simulated</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Active unresolved risk</span>
          <span className="text-slate-400 font-mono">₹ INR</span>
        </div>
      </div>
    </div>
  );
};
