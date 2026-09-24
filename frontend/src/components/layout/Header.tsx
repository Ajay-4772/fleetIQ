import React from 'react';
import { Activity, ShieldAlert, Cpu, RefreshCw, Zap } from 'lucide-react';
import { SSEConnectionStatus } from '../../hooks/useSSE';
import { DashboardSummary } from '../../types';

interface HeaderProps {
  sseStatus: SSEConnectionStatus;
  summary: DashboardSummary | null;
  onRefresh: () => void;
  onOpenSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sseStatus, summary, onRefresh, onOpenSimulator }) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-900/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">FleetIQ</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                Operations Center
              </span>
            </div>
            <p className="text-xs text-slate-400">Connected Vehicle Intelligence & Decision Platform</p>
          </div>
        </div>

        {/* SSE Stream Status Indicator */}
        <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800">
          <span className="relative flex h-2 w-2">
            {sseStatus === 'LIVE' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                sseStatus === 'LIVE'
                  ? 'bg-emerald-500'
                  : sseStatus === 'RECONNECTING'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span className="text-xs font-mono font-medium text-slate-300">
            {sseStatus === 'LIVE' ? 'LIVE STREAM' : sseStatus === 'RECONNECTING' ? 'RECONNECTING...' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {summary && (
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium mr-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Health:</span>
              <span
                className={`font-semibold ${
                  summary.fleetHealthScore >= 85
                    ? 'text-emerald-400'
                    : summary.fleetHealthScore >= 65
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {summary.fleetHealthScore}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Active:</span>
              <span className="font-semibold text-white">{summary.activeVehicles} / {summary.totalVehicles}</span>
            </div>

            {summary.criticalActionCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/60 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{summary.criticalActionCount} Critical</span>
              </div>
            )}
          </div>
        )}

        {/* Simulator Trigger */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simulator</span>
        </button>

        {/* Manual Refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh Data"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
