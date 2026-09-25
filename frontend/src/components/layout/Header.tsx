import React from 'react';
import { Search, Calendar, ChevronDown, Bell, Download, Zap, RefreshCw, Activity, SlidersHorizontal } from 'lucide-react';
import { SSEConnectionStatus } from '../../hooks/useSSE';
import { DashboardSummary } from '../../types';

interface HeaderProps {
  sseStatus: SSEConnectionStatus;
  summary: DashboardSummary | null;
  onRefresh: () => void;
  onOpenSimulator: () => void;
  onSearchFocus?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sseStatus,
  summary,
  onRefresh,
  onOpenSimulator,
  onSearchFocus
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Brand & Search Bar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">FleetIQ</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Vehicle Operations Intelligence</p>
          </div>
        </div>

        {/* Global Search Input (Shopeers style with shortcut ⌘ K) */}
        <div className="hidden md:flex items-center">
          <div
            onClick={onSearchFocus}
            className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl w-72 text-xs text-slate-400 cursor-pointer transition shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex-1 text-slate-500 font-normal">Search VIN, issue, query...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs font-mono">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls (Pills, Actions, Notifications, Avatar) */}
      <div className="flex items-center gap-3">
        {/* Real-time SSE Live Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
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
          <span className="text-xs font-semibold text-slate-700">
            {sseStatus === 'LIVE' ? 'Real-Time Stream' : sseStatus === 'RECONNECTING' ? 'Reconnecting...' : 'Offline'}
          </span>
        </div>

        {/* Date Filter Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Today, Live Sync</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>

        {/* Simulator Button */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition border border-slate-200"
          title="Open Scenario Simulator"
        >
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Run Simulator</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition relative">
            <Bell className="w-3.5 h-3.5" />
            {summary && summary.criticalActionCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-blue-100">
            OP
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">Operations Lead</div>
            <div className="text-[10px] text-slate-400 leading-tight">Fleet Control Room</div>
          </div>
        </div>
      </div>
    </header>
  );
};
