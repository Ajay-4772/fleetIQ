import React, { useState, useRef } from 'react';
import {
  Wrench,
  AlertOctagon,
  BatteryWarning,
  Gauge,
  Clock,
  ArrowDownRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { FleetHealth } from '../../types';

interface FleetHealthSectionProps {
  health: FleetHealth | null;
  onSelectCategory?: (category: string) => void;
}

export const FleetHealthSection: React.FC<FleetHealthSectionProps> = ({ health, onSelectCategory }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activePointIndex, setActivePointIndex] = useState<number>(0);

  if (!health) {
    return (
      <div className="h-96 rounded-2xl bg-white border border-slate-100 p-6 shadow-card animate-pulse" />
    );
  }

  const hasRealData = health.hasData && health.points && health.points.length > 0;

  if (!hasRealData) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-10 shadow-card text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Fleet Operational Health</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No telemetry data available yet. Connect a data source or ingest vehicle data to generate fleet health analytics.
          </p>
        </div>
      </div>
    );
  }

  const rawPoints = health.points || [];
  const pointCount = rawPoints.length;

  // Map real telemetry points to SVG coordinates (width: 700, height: 160)
  const svgPoints = rawPoints.map((p, idx) => {
    const x = pointCount > 1 ? Math.round((idx / (pointCount - 1)) * 640 + 30) : 350;
    const y = Math.round(140 - (Math.min(100, Math.max(0, p.healthScore)) / 100.0) * 110);
    return {
      x,
      y,
      date: p.label,
      healthPct: p.healthScore,
      volume: p.signalCount
    };
  });

  const activeIdx = Math.min(activePointIndex, svgPoints.length - 1);
  const activePoint = svgPoints[activeIdx] || svgPoints[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || svgPoints.length === 0) return;
    const rect = chartRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width * 700;

    let closestIdx = 0;
    let minDiff = 99999;
    svgPoints.forEach((p, idx) => {
      const diff = Math.abs(p.x - relX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setActivePointIndex(closestIdx);
  };

  // Generate SVG path through the actual points
  const pathD = svgPoints.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = svgPoints.length > 0
    ? `${pathD} L ${svgPoints[svgPoints.length - 1].x} 160 L ${svgPoints[0].x} 160 Z`
    : '';

  const issueCategories = [
    { label: 'Maintenance Due', type: 'MAINTENANCE_DUE', count: health.maintenanceDueCount, icon: Wrench, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100/80 border-amber-200/60' },
    { label: 'Engine Faults', type: 'ENGINE_FAULT', count: health.engineFaultCount, icon: AlertOctagon, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100/80 border-rose-200/60' },
    { label: 'Battery Warnings', type: 'BATTERY_WARNING', count: health.batteryWarningCount, icon: BatteryWarning, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100/80 border-blue-200/60' },
    { label: 'TPMS Low', type: 'TIRE_PRESSURE_LOW', count: health.tirePressureWarningCount, icon: Gauge, color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100/80 border-yellow-200/60' },
    { label: 'Excessive Idling', type: 'EXCESSIVE_IDLE', count: health.excessiveIdleCount, icon: Clock, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200/60' },
    { label: 'Low Utilization', type: 'LOW_UTILIZATION', count: health.lowUtilizationCount, icon: ArrowDownRight, color: 'text-slate-600 bg-slate-50 hover:bg-slate-100/80 border-slate-200/60' }
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
            {health.previousPeriodPercentageChange !== null && health.previousPeriodPercentageChange !== undefined ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                health.previousPeriodPercentageChange >= 0
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                <TrendingUp className="w-3 h-3" />
                <span>
                  {health.previousPeriodPercentageChange >= 0 ? `+${health.previousPeriodPercentageChange}%` : `${health.previousPeriodPercentageChange}%`} vs last period
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                <span>Comparison unavailable</span>
              </span>
            )}
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

      {/* Dynamic Interactive Smooth Area Chart */}
      <div className="relative pt-2" ref={chartRef} onMouseMove={handleMouseMove}>
        <div className="h-48 w-full relative cursor-crosshair">
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
            {areaD && (
              <path
                d={areaD}
                fill="url(#blueGradient)"
              />
            )}

            {/* Primary Blue Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}

            {/* Dynamic Scrubber vertical line */}
            {activePoint && (
              <>
                <line
                  x1={activePoint.x}
                  y1="10"
                  x2={activePoint.x}
                  y2="160"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="transition-all duration-75"
                />

                {/* Dynamic Scrubber Dot */}
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="6"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="filter drop-shadow-md transition-all duration-75"
                />
              </>
            )}
          </svg>

          {/* Dynamic Floating Scrubber Tooltip */}
          {activePoint && (
            <div
              style={{ left: `${(activePoint.x / 700) * 100}%` }}
              className="absolute top-[5%] -translate-x-1/2 bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-xl text-left pointer-events-none z-10 min-w-[130px] transition-all duration-75"
            >
              <div className="text-[10px] font-bold text-slate-400 font-mono">{activePoint.date}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-extrabold text-slate-900">{activePoint.healthPct}% Health</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {activePoint.volume} signals/window
              </div>
            </div>
          )}
        </div>

        {/* X-Axis Date Labels from actual points */}
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
          {svgPoints.map((p, idx) => (
            <span key={idx}>{p.date}</span>
          ))}
        </div>
      </div>

      {/* 3 Sub-Segmented Metric Boxes */}
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

      {/* Clickable Diagnostic Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {issueCategories.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectCategory && onSelectCategory(item.type)}
              className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer ${item.color} transition hover:shadow-xs group`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className="w-4 h-4 group-hover:scale-110 transition" />
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
