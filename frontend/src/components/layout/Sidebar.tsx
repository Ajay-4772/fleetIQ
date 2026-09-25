import React from 'react';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Car,
  BrainCircuit,
  Search,
  Server,
  Sliders,
  Sparkles,
  ShieldCheck,
  ChevronRight
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
  const sections = [
    {
      group: 'MAIN MENU',
      items: [
        { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
        {
          id: 'live' as NavTab,
          label: 'Live Operations',
          icon: Radio,
          badge: 'LIVE',
          badgeColor: 'bg-emerald-50 text-emerald-600 border border-emerald-200'
        },
        {
          id: 'actions' as NavTab,
          label: 'Priority Actions',
          icon: AlertTriangle,
          badge: openActionCount > 0 ? `${openActionCount}` : undefined,
          badgeColor: criticalActionCount > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
        },
      ]
    },
    {
      group: 'FLEET INTELLIGENCE',
      items: [
        { id: 'vehicles' as NavTab, label: 'Fleet Assets', icon: Car },
        { id: 'intelligence' as NavTab, label: 'Intelligence Hub', icon: BrainCircuit },
        { id: 'queries' as NavTab, label: 'Fleet Queries', icon: Search },
      ]
    },
    {
      group: 'SYSTEM & CONTROLS',
      items: [
        { id: 'system' as NavTab, label: 'System Health', icon: Server },
        { id: 'simulator' as NavTab, label: 'Simulator Control', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.01)] overflow-y-auto">
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.group}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Gradient Card (Shopeers Promo / Simulator Card) */}
      <div className="space-y-3 pt-4">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-500/15 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-bold text-sm leading-tight text-white">Fault Simulator</h4>
          <p className="text-[11px] text-blue-100/90 mt-1 leading-relaxed">
            Test multi-OEM telemetry triggers, DTCs, and decision automation.
          </p>
          <button
            onClick={() => onSelectTab('simulator')}
            className="mt-3.5 w-full py-2 px-3 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition hover:shadow"
          >
            <span>Launch Controls</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Engine status footer */}
        <div className="px-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Multi-OEM Engine</span>
          </div>
          <span className="font-mono text-slate-500 text-[10px]">v1.0-LIVE</span>
        </div>
      </div>
    </aside>
  );
};
