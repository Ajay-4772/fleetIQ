import React, { useState } from 'react';
import {
  Wrench,
  AlertOctagon,
  BatteryWarning,
  Gauge,
  Clock,
  ArrowDownRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { FleetHealth } from '../../types';

interface FleetHealthSectionProps {
  health: FleetHealth | null;
}

export const FleetHealthSection: React.FC<FleetHealthSectionProps> = ({ health }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    healthPct: number;
    volume: number;
  } | null>({
    date: 'Jan 18, 2025',
    healthPct: 96.4,
    volume: 1420
  });

  if (!health) {
    return (
      <div className="h-96 rounded-2xl bg-white border border-slate-100 p-6 shadow-card animate-pulse" />
    );
  }

  const issueCategories = [
    { label: 'Maintenance Due', count: health.maintenanceDueCount, icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-200/60' },
    { label: 'Engine Faults', count: health.engineFaultCount, icon: AlertOctagon, color: 'text-rose-600 bg-rose-50 border-rose-200/60' },
    { label: 'Battery Warnings', count: health.batteryWarningCount, icon: BatteryWarning, color: 'text-blue-600 bg-blue-50 border-blue-200/60' },
    { label: 'TPMS Low', count: health.tirePressureWarningCount, icon: Gauge, color: 'text-yellow-600 bg-yellow-50 border-yellow-200/60' },
    { label: 'Excessive Idling', count: health.excessiveIdleCount, icon: Clock, color: 'text-indigo-600 bg-indigo-50 border-indigo-200/60' },
    { label: 'Low Utilization', count: health.lowUtilizationCount, icon: ArrowDownRight, color: 'text-slate-600 bg-slate-50 border-slate-200/60' }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-6">
      {/* Top Header & Big Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fleet Operational Health</span>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {health.healthyPercentage}%
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-3 h-3" />
              <span>+24.4% vs last period</span>
            </span>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-700 font-medium">Healthy ({health.healthyPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-700 font-medium">At Risk ({health.atRiskPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-700 font-medium">Critical ({health.criticalPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* Shopeers-style Interactive Smooth Area Chart */}
      <div className="relative pt-2">
        <div className="h-48 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="30" x2="700" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="80" x2="700" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="130" x2="700" y2="130" stroke="#f1f5f9" strokeDasharray="4 4" />

            {/* Area fill */}
            <path
              d="M 0 130 C 70 120, 140 135, 210 110 C 280 85, 350 125, 420 70 C 490 60, 560 95, 630 50 L 700 65 L 700 160 L 0 160 Z"
              fill="url(#blueGradient)"
            />

            {/* Primary Blue Line */}
            <path
              d="M 0 130 C 70 120, 140 135, 210 110 C 280 85, 350 125, 420 70 C 490 60, 560 95, 630 50 L 700 65"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Scrubber vertical line at Jan 18 */}
            <line x1="420" y1="10" x2="420" y2="160" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Peak Active Dot */}
            <circle cx="420" cy="70" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" className="filter drop-shadow-sm" />
          </svg>

          {/* Floating Scrubber Tooltip Card (Shopeers style) */}
          {hoveredPoint && (
            <div className="absolute left-[54%] top-[10%] -translate-x-1/2 bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-lg shadow-slate-900/5 text-left pointer-events-none z-10 min-w-[140px]">
              <div className="text-[10px] font-semibold text-slate-400">{hoveredPoint.date}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-slate-900">{hoveredPoint.healthPct}% Health</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {hoveredPoint.volume} signals/min
              </div>
            </div>
          )}
        </div>

        {/* X-Axis Date Labels */}
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
          <span>1 Jan</span>
          <span>8 Jan</span>
          <span>15 Jan</span>
          <span>22 Jan</span>
          <span>29 Jan</span>
        </div>
      </div>

      {/* Shopeers-style 3 Sub-Segmented Metric Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full bg-blue-600" />
            <div>
              <div className="text-sm font-bold text-slate-900">{health.healthyPercentage}% Score</div>
              <div className="text-[11px] text-slate-500 font-medium">Nominal Fleet Operating</div>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 font-mono">NOMINAL</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full bg-emerald-500" />
            <div>
              <div className="text-sm font-bold text-slate-900">{health.maintenanceDueCount} Units</div>
              <div className="text-[11px] text-slate-500 font-medium">Preventive Maintenance</div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 font-mono">{health.atRiskPercentage}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full bg-rose-500" />
            <div>
              <div className="text-sm font-bold text-slate-900">{health.engineFaultCount} Units</div>
              <div className="text-[11px] text-slate-500 font-medium">Critical Grounded</div>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-600 font-mono">{health.criticalPercentage}%</span>
        </div>
      </div>

      {/* Diagnostic Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {issueCategories.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between ${item.color} transition hover:shadow-xs`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-base font-extrabold font-mono">{item.count}</span>
              </div>
              <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
