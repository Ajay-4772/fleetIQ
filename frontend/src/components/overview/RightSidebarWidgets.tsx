import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import { WeeklyUtilization, SafetyScore } from '../../types';
import { api } from '../../services/api';

interface RightSidebarWidgetsProps {
  onViewDetails?: () => void;
  utilization?: WeeklyUtilization | null;
  safety?: SafetyScore | null;
}

export const RightSidebarWidgets: React.FC<RightSidebarWidgetsProps> = ({
  onViewDetails,
  utilization: propUtilization,
  safety: propSafety
}) => {
  const [utilization, setUtilization] = useState<WeeklyUtilization | null>(propUtilization || null);
  const [safety, setSafety] = useState<SafetyScore | null>(propSafety || null);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    if (propUtilization !== undefined) {
      setUtilization(propUtilization);
    } else {
      api.getWeeklyUtilization().then(setUtilization).catch(() => setUtilization(null));
    }
  }, [propUtilization]);

  useEffect(() => {
    if (propSafety !== undefined) {
      setSafety(propSafety);
    } else {
      api.getSafetyScore().then(setSafety).catch(() => setSafety(null));
    }
  }, [propSafety]);

  useEffect(() => {
    if (utilization?.peakDay) {
      setActiveDay(utilization.peakDay);
    } else if (utilization?.days && utilization.days.length > 0) {
      setActiveDay(utilization.days[0].day);
    }
  }, [utilization]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const currentSafetyScore = safety?.hasData && safety.safetyScore !== null && safety.safetyScore !== undefined
    ? Math.round(safety.safetyScore)
    : null;
  const strokeOffset = currentSafetyScore !== null
    ? circumference - (circumference * currentSafetyScore) / 100
    : circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Most Day Active (Weekly Fleet Utilization Bar Chart) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Most Day Active</h4>
            <p className="text-[11px] text-slate-500 font-medium">Weekly fleet distance & utilization</p>
          </div>
          {utilization?.hasData && utilization.peakDay && utilization.peakKm ? (
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Peak: {utilization.peakDay} ({utilization.peakKm.toLocaleString()} km)
            </span>
          ) : null}
        </div>

        {/* Empty State vs Real Bars */}
        {!utilization || !utilization.hasData || utilization.days.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <span className="text-xs font-semibold text-slate-700">No utilization data available.</span>
            <span className="text-[11px] text-slate-400 mt-1">Weekly fleet distance will be calculated from ingested odometer telemetry.</span>
          </div>
        ) : (
          <div className="h-44 flex items-end justify-between gap-2 pt-4 pb-1 px-1">
            {utilization.days.map((d) => {
              const isSelected = activeDay === d.day;
              const maxKm = utilization.peakKm && utilization.peakKm > 0 ? utilization.peakKm : 1;
              const heightPct = Math.max(15, Math.min(100, Math.round((d.distanceKm / maxKm) * 100)));

              return (
                <div
                  key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                  title={`${d.day}: ${d.distanceKm.toLocaleString()} km`}
                >
                  {/* Floating Tooltip Pill for Selected Day */}
                  {isSelected && (
                    <div className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-slate-900 text-white shadow-xs">
                      {d.distanceKm.toLocaleString()} km
                    </div>
                  )}

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-600 shadow-xs'
                          : d.isPeak
                          ? 'bg-blue-300 group-hover:bg-blue-400'
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
        )}
      </div>

      {/* 2. Fleet Safety & Compliance Rate */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Fleet Safety Rate</h4>
            <p className="text-[11px] text-slate-500 font-medium">Telemetry safety & compliance score</p>
          </div>
          {currentSafetyScore !== null ? (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              safety?.status === 'NOMINAL'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <ShieldCheck className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              {safety?.status || 'Nominal'}
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              Unavailable
            </span>
          )}
        </div>

        {/* Empty State vs Real Gauge */}
        {currentSafetyScore === null ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Safety score unavailable</span>
            <span className="text-[11px] text-slate-400 mt-1">Awaiting vehicle telemetry and driver safety exception events.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth="11"
                  fill="none"
                />
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

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {currentSafetyScore}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Target: {safety?.targetScore || 95}%
                </span>
              </div>
            </div>

            <button
              onClick={onViewDetails}
              className="mt-3 px-4 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition"
            >
              Show details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
