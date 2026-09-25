import React from 'react';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Car,
  BrainCircuit,
  Server,
  Sparkles,
  Zap,
  Bot
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'live'
  | 'vehicles'
  | 'actions'
  | 'intelligence'
  | 'system';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openActionCount?: number;
  criticalActionCount?: number;
  onOpenSimulator: () => void;
  onOpenAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openActionCount = 0,
  criticalActionCount = 0,
  onOpenSimulator,
  onOpenAssistant
}) => {
  const sections = [
    {
      group: 'OPERATIONS',
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
          id: 'vehicles' as NavTab,
          label: 'Vehicles',
          icon: Car
        },
        {
          id: 'actions' as NavTab,
          label: 'Actions',
          icon: AlertTriangle,
          badge: openActionCount > 0 ? `${openActionCount}` : undefined,
          badgeColor: criticalActionCount > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
        },
      ]
    },
    {
      group: 'INTELLIGENCE & SYSTEM',
      items: [
        { id: 'intelligence' as NavTab, label: 'Intelligence', icon: BrainCircuit },
        { id: 'system' as NavTab, label: 'System', icon: Server }
      ]
    }
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.01)] overflow-y-auto">
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

        {/* Secondary Operational Tools */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            OPERATIONAL TOOLS
          </div>
          <button
            onClick={onOpenAssistant}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
          >
            <Bot className="w-4 h-4 text-blue-500" />
            <span>AI Assistant Copilot</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Scenario Simulator</span>
          </button>
        </div>
      </div>

      {/* Engine Status Card */}
      <div className="pt-4">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800">Pipeline Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Multi-OEM ingestion (Toyota, Ford, BMW, Tesla) normalized in real-time.
          </p>
        </div>
      </div>
    </aside>
  );
};
