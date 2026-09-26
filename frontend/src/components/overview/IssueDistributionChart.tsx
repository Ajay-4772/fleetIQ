import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertOctagon, Wrench, BatteryWarning, Gauge, Clock, ShieldAlert } from 'lucide-react';
import { IssueDistribution } from '../../types';
import { api } from '../../services/api';

interface IssueDistributionChartProps {
  distribution?: IssueDistribution | null;
  onSelectSeverity?: (severity: string) => void;
}

export const IssueDistributionChart: React.FC<IssueDistributionChartProps> = ({
  distribution: propDistribution,
  onSelectSeverity
}) => {
  const [data, setData] = useState<IssueDistribution | null>(propDistribution || null);

  useEffect(() => {
    if (propDistribution !== undefined) {
      setData(propDistribution);
    } else {
      api.getIssueDistribution().then(setData).catch(() => setData(null));
    }
  }, [propDistribution]);

  const hasData = data?.hasData && (data.totalIssues > 0);

  const severities = [
    { key: 'CRITICAL', label: 'Critical', color: 'bg-rose-500', barColor: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
    { key: 'HIGH', label: 'High', color: 'bg-amber-500', barColor: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
    { key: 'MEDIUM', label: 'Medium', color: 'bg-blue-500', barColor: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'LOW', label: 'Low', color: 'bg-slate-400', barColor: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' }
  ];

  const categories = [
    { key: 'ENGINE', label: 'Engine Faults', icon: AlertOctagon, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { key: 'BATTERY', label: 'Battery Warning', icon: BatteryWarning, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { key: 'MAINTENANCE', label: 'Maintenance Due', icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { key: 'TPMS', label: 'Tire Pressure Low', icon: Gauge, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { key: 'UTILIZATION', label: 'Excessive Idling', icon: Clock, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  ];

  const total = data?.totalIssues || 1;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Vehicle Issue & Severity Distribution
          </span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Normalized diagnostic faults categorized by operational urgency and powertrain subsystem
          </p>
        </div>
        {hasData && (
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {data?.totalIssues} Detected Issues
          </span>
        )}
      </div>

      {/* Empty State vs Real Distribution */}
      {!hasData ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No vehicle issues have been detected.</p>
          <p className="text-[11px] text-slate-400 max-w-sm">
            Autonomous decision engine continuously monitors incoming telemetry streams for diagnostic fault codes and thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stacked Severity Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex">
              {severities.map((s) => {
                const count = data?.severityCounts?.[s.key] || 0;
                const pct = Math.round((count / total) * 100);
                if (pct === 0) return null;
                return (
                  <div
                    key={s.key}
                    style={{ width: `${pct}%` }}
                    className={`${s.barColor} transition-all duration-300`}
                    title={`${s.label}: ${count} (${pct}%)`}
                  />
                );
              })}
            </div>

            {/* Severity Legend Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {severities.map((s) => {
                const count = data?.severityCounts?.[s.key] || 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <div
                    key={s.key}
                    onClick={() => onSelectSeverity && onSelectSeverity(s.key)}
                    className={`p-3 rounded-xl border border-slate-200/80 cursor-pointer hover:shadow-xs transition ${s.bg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{s.label}</span>
                      <span className={`text-[10px] font-bold ${s.text}`}>{pct}%</span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subsystem Category Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Subsystem Distribution
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {categories.map((c) => {
                const Icon = c.icon;
                const count = data?.categoryCounts?.[c.key] || 0;
                return (
                  <div key={c.key} className={`p-2.5 rounded-xl border flex items-center justify-between ${c.color}`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-800">{c.label}</span>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-slate-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
