import React from 'react';
import { AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { ActionItem } from '../../types';

interface CriticalAlertsBannerProps {
  actions: ActionItem[];
  onSelectAction?: (action: ActionItem) => void;
}

export const CriticalAlertsBanner: React.FC<CriticalAlertsBannerProps> = ({ actions, onSelectAction }) => {
  const criticalActions = actions.filter((a) => a.priority === 'CRITICAL' && a.status === 'OPEN').slice(0, 3);

  if (criticalActions.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>No unresolved critical alarms. All critical powertrain and battery parameters within operating limits.</span>
        </div>
        <span className="font-mono text-emerald-400 font-semibold">ALL NOMINAL</span>
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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>Active Critical Operations Alerts ({criticalActions.length})</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Immediate Action Required</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {criticalActions.map((action) => (
          <div
            key={action.actionId}
            onClick={() => onSelectAction && onSelectAction(action)}
            className="cursor-pointer bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-800/60 hover:border-rose-600 rounded-xl p-3.5 shadow-md transition group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500 text-white font-mono">
                  CRITICAL
                </span>
                <span className="text-xs font-bold text-white font-mono">{action.vehicleId}</span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-300">
                {formatCurrency(action.estimatedImpact)}
              </span>
            </div>

            <p className="mt-2 text-xs font-semibold text-slate-200 line-clamp-1">{action.issue}</p>
            <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {action.recommendedAction}
            </p>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Confidence: <strong className="text-slate-200">{Math.round(action.confidence * 100)}%</strong>
              </span>
              <span className="flex items-center gap-1 text-rose-400 group-hover:translate-x-0.5 transition font-semibold">
                Inspect <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
