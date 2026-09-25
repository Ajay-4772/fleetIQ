import React, { useState } from 'react';
import { ShieldCheck, Award } from 'lucide-react';

interface RightSidebarWidgetsProps {
  onViewDetails?: () => void;
  safetyScore?: number;
}

export const RightSidebarWidgets: React.FC<RightSidebarWidgetsProps> = ({
  onViewDetails,
  safetyScore = 88
}) => {
  const [activeDay, setActiveDay] = useState<'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>('Tue');

  const daysData = [
    { day: 'Sun', height: '35%', val: '3,120 km' },
    { day: 'Mon', height: '65%', val: '6,450 km' },
    { day: 'Tue', height: '92%', val: '8,162 km', isPeak: true },
    { day: 'Wed', height: '70%', val: '7,100 km' },
    { day: 'Thu', height: '78%', val: '7,890 km' },
    { day: 'Fri', height: '55%', val: '5,600 km' },
    { day: 'Sat', height: '30%', val: '2,900 km' }
  ];

  // SVG circular gauge calculation: circumference = 2 * PI * r
  // r = 54 -> circumference = ~339.29
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * safetyScore) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Most Day Active (Weekly Fleet Utilization Bar Chart) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Most Day Active</h4>
            <p className="text-[11px] text-slate-500 font-medium">Weekly fleet distance & utilization</p>
          </div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Peak: Tue (8,162 km)
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="h-44 flex items-end justify-between gap-2 pt-4 pb-1 px-1">
          {daysData.map((d) => {
            const isSelected = activeDay === d.day;
            return (
              <div
                key={d.day}
                onClick={() => setActiveDay(d.day as any)}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                title={`${d.day}: ${d.val}`}
              >
                {/* Floating Tooltip Pill for Selected Day */}
                {isSelected && (
                  <div className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-slate-900 text-white shadow-xs">
                    {d.val}
                  </div>
                )}

                {/* Vertical Bar */}
                <div className="w-full max-w-[28px] h-full flex items-end">
                  <div
                    style={{ height: d.height }}
                    className={`w-full rounded-t-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-600 shadow-xs'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`text-[11px] font-semibold transition ${
                    isSelected ? 'text-blue-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Fleet Safety & Compliance Rate (Complete Circular Donut Gauge) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Fleet Safety Rate</h4>
            <p className="text-[11px] text-slate-500 font-medium">Telemetry safety & compliance score</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            Nominal
          </span>
        </div>

        {/* Circular Donut Gauge Container */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background Track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#f1f5f9"
                strokeWidth="11"
                fill="none"
              />
              {/* Active Emerald Arc */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#10b981"
                strokeWidth="11"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center percentage value */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {safetyScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">Target: 95%</span>
            </div>
          </div>

          <button
            onClick={onViewDetails}
            className="mt-3 px-4 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition"
          >
            Show details
          </button>
        </div>
      </div>
    </div>
  );
};
