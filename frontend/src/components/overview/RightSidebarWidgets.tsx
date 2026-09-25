import React, { useState } from 'react';
import { MoreHorizontal, Sparkles, Send, ArrowUpRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface RightSidebarWidgetsProps {
  onAskAi?: (query: string) => void;
  onViewDetails?: () => void;
}

export const RightSidebarWidgets: React.FC<RightSidebarWidgetsProps> = ({ onAskAi, onViewDetails }) => {
  const [aiInput, setAiInput] = useState('');
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

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiInput.trim() && onAskAi) {
      onAskAi(aiInput.trim());
      setAiInput('');
    }
  };

  const handleChipClick = (text: string) => {
    if (onAskAi) {
      onAskAi(text);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Most Day Active (Weekly Fleet Utilization Bar Chart) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Most Day Active</h4>
            <p className="text-[11px] text-slate-400 font-medium">Weekly fleet distance & utilization</p>
          </div>
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Bar Chart Container */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
          {daysData.map((d) => {
            const isSelected = activeDay === d.day;
            return (
              <div
                key={d.day}
                onClick={() => setActiveDay(d.day as any)}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
              >
                {/* Floating Tooltip Pill for Peak or Selected Day */}
                {isSelected && (
                  <div className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-slate-900 text-white shadow-md animate-fade-in -mb-1">
                    {d.val}
                  </div>
                )}

                {/* Vertical Bar */}
                <div className="w-full max-w-[28px] h-full flex items-end">
                  <div
                    style={{ height: d.height }}
                    className={`w-full rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-600 shadow-md shadow-blue-500/30'
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

      {/* 2. Fleet Safety & Compliance Rate (Semi-circular Radial Gauge) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Fleet Safety Rate</h4>
            <p className="text-[11px] text-slate-400 font-medium">Telemetry safety & compliance score</p>
          </div>
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Semi-circular radial gauge */}
        <div className="flex flex-col items-center justify-center pt-2 pb-1">
          <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
            {/* SVG Arc with dashed dashes like Shopeers design */}
            <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="none"
                strokeDasharray="201"
                strokeDashoffset="100"
                strokeLinecap="round"
              />
              {/* Active Emerald Arc (88%) */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="#10b981"
                strokeWidth="12"
                fill="none"
                strokeDasharray="201"
                strokeDashoffset="35"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center percentage value */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">88%</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">On track for 95% target</span>
            </div>
          </div>

          <button
            onClick={onViewDetails}
            className="mt-3 px-4 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition"
          >
            Show details
          </button>
        </div>
      </div>

      {/* 3. AI Assistant Widget (Shopeers 3D Glowing Blue Sphere Card) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">AI Assistant</h4>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
              Copilot
            </span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          </button>
        </div>

        {/* 3D Glowing Orb Visual */}
        <div className="py-4 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Soft outer glow */}
            <div className="absolute w-20 h-20 rounded-full bg-blue-500/20 blur-xl"></div>
            
            {/* 3D Shiny Gradient Sphere */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 shadow-[0_12px_24px_rgba(37,99,235,0.45)] relative flex items-center justify-center animate-orb">
              {/* Specular glass reflection */}
              <div className="w-4 h-4 rounded-full bg-white/50 blur-[1px] absolute top-2 left-3"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/80 absolute top-2.5 left-3.5"></div>
            </div>
          </div>
        </div>

        {/* Quick query chips */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-3">
          {[
            'Brake fault risks',
            'Low SoC EVs',
            'Engine overheating'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-medium border border-slate-200/80 transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAiSubmit} className="relative flex items-center">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask me anything..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
