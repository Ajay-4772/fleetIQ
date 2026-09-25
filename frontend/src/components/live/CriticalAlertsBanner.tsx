import React from 'react';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ActionItem } from '../../types';

interface CriticalAlertsBannerProps {
  actions: ActionItem[];
  onSelectAction?: (action: ActionItem) => void;
}

export const CriticalAlertsBanner: React.FC<CriticalAlertsBannerProps> = ({ actions, onSelectAction }) => {
  const criticalActions = actions.filter((a) => a.priority === 'CRITICAL' && a.status === 'OPEN').slice(0, 3);

  if (criticalActions.length === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-medium">All vehicle powertrains, braking circuits, and high-voltage batteries operating nominally. No critical alarms.</span>
        </div>
        <span className="font-mono text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded-lg bg-emerald-100/70 border border-emerald-300/60">
          ALL NOMINAL
        </span>
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
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Active Critical Operations Alerts ({criticalActions.length})</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Immediate Operator Review Required</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {criticalActions.map((action) => (
          <div
            key={action.actionId}
            onClick={() => onSelectAction && onSelectAction(action)}
            className="cursor-pointer bg-rose-50/60 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-600 text-white shadow-xs">
                  CRITICAL
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">{action.vehicleId}</span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700">
                {formatCurrency(action.estimatedImpact)}
              </span>
            </div>

            <p className="mt-2 text-xs font-bold text-slate-800 line-clamp-1">{action.issue}</p>
            <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
              {action.recommendedAction}
            </p>

            <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">
                Confidence: <strong className="text-slate-800">{Math.round(action.confidence * 100)}%</strong>
              </span>
              <span className="flex items-center gap-1 text-rose-600 group-hover:translate-x-1 transition font-bold text-xs">
                Inspect <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
