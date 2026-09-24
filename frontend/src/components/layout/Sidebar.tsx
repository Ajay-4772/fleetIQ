import React from 'react';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Car,
  BrainCircuit,
  Search,
  Server,
  Sliders
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'live'
  | 'actions'
  | 'vehicles'
  | 'intelligence'
  | 'queries'
  | 'system'
  | 'simulator';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openActionCount?: number;
  criticalActionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openActionCount = 0,
  criticalActionCount = 0
}) => {
  const items = [
    { id: 'overview' as NavTab, label: 'Fleet Overview', icon: LayoutDashboard },
    { id: 'live' as NavTab, label: 'Live Operations', icon: Radio },
    {
      id: 'actions' as NavTab,
      label: 'Priority Actions',
      icon: AlertTriangle,
      badge: openActionCount > 0 ? openActionCount : undefined,
      badgeColor: criticalActionCount > 0 ? 'bg-rose-500' : 'bg-amber-500'
    },
    { id: 'vehicles' as NavTab, label: 'Vehicles', icon: Car },
    { id: 'intelligence' as NavTab, label: 'Intelligence Hub', icon: BrainCircuit },
    { id: 'queries' as NavTab, label: 'Fleet Queries', icon: Search },
    { id: 'system' as NavTab, label: 'System & Data Quality', icon: Server },
    { id: 'simulator' as NavTab, label: 'Simulator Control', icon: Sliders }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Command Center
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
        <div className="flex justify-between items-center">
          <span>Engine Status:</span>
          <span className="text-emerald-400 font-mono font-medium">ONLINE</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Multi-OEM Adapter:</span>
          <span className="text-slate-300 font-mono">v1.0-SYNTH</span>
        </div>
        <div className="pt-2 text-[10px] text-slate-400 italic">
          Simulated telemetry inspired by connected vehicle signal patterns.
        </div>
      </div>
    </aside>
  );
};
