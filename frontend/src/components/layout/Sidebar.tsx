import React, { useState } from 'react';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Car,
  BrainCircuit,
  Server,
  Sparkles,
  Zap,
  Users,
  Database,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StreamStatus } from '../../types';

export type NavTab =
  | 'overview'
  | 'live'
  | 'vehicles'
  | 'actions'
  | 'intelligence'
  | 'copilot'
  | 'system'
  | 'users'
  | 'ingestion';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openActionCount?: number;
  criticalActionCount?: number;
  streamStatus?: StreamStatus | null;
  onOpenSimulator: () => void;
  onOpenAssistant?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openActionCount = 0,
  criticalActionCount = 0,
  streamStatus,
  onOpenSimulator,
  isCollapsed: controlledCollapsed,
  onToggleCollapse
}) => {
  const { hasRole } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const isAdmin = hasRole('ADMIN') || hasRole('ROLE_ADMIN');
  const isOpsLeadOrAdmin = isAdmin || hasRole('OPERATIONS_LEAD') || hasRole('ROLE_OPERATIONS_LEAD');

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
          badgeColor:
            criticalActionCount > 0
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
        },
      ]
    },
    {
      group: 'INTELLIGENCE',
      items: [
        {
          id: 'copilot' as NavTab,
          label: 'AI Copilot',
          icon: Sparkles,
          badge: 'NEW',
          badgeColor: 'bg-blue-50 text-blue-600 border border-blue-200'
        },
        { id: 'intelligence' as NavTab, label: 'Intelligence Hub', icon: BrainCircuit }
      ]
    },
    {
      group: 'ADMINISTRATION',
      items: [
        ...(isAdmin
          ? [
              {
                id: 'users' as NavTab,
                label: 'User Directory',
                icon: Users,
                badge: 'ADMIN',
                badgeColor: 'bg-purple-50 text-purple-600 border border-purple-200'
              },
              {
                id: 'ingestion' as NavTab,
                label: 'Data Ingestion',
                icon: Database,
                badge: 'ADMIN',
                badgeColor: 'bg-blue-50 text-blue-600 border border-blue-200'
              }
            ]
          : []),
        { id: 'system' as NavTab, label: 'System Health', icon: Server }
      ]
    }
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 transition-all duration-200 ease-in-out font-sans ${
        isCollapsed ? 'w-16 p-2' : 'w-60 p-4'
      } overflow-y-auto`}
    >
      <div className="space-y-5">
        {/* Toggle Collapse Header Button */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} pb-1`}>
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Workspace Navigation
            </span>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Section Navigation Items */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {section.group}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-full flex items-center rounded-xl text-xs font-semibold transition group ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                      aria-hidden="true"
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge !== undefined && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Secondary Operational / Testing Tools (Simulator - Admin Only) */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-100 space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Testing Tools
              </div>
            )}
            <button
              onClick={onOpenSimulator}
              title="Launch Telematics Scenario Simulator"
              aria-label="Launch Telematics Scenario Simulator"
              className={`w-full flex items-center rounded-xl text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-800 transition ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
              {!isCollapsed && <span>Simulator (Dev)</span>}
            </button>
          </div>
        )}
      </div>

      {/* Engine Status Footer (When Expanded) */}
      {!isCollapsed && (
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800">
                {streamStatus?.pipelineStatus === 'LIVE'
                  ? 'Pipeline Active'
                  : streamStatus?.pipelineStatus === 'CONNECTED_WAITING'
                  ? 'Pipeline Standby'
                  : streamStatus?.pipelineStatus === 'STALE'
                  ? 'Pipeline Stale'
                  : streamStatus?.pipelineStatus === 'ERROR'
                  ? 'Pipeline Error'
                  : 'No Source Connected'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  streamStatus?.pipelineStatus === 'LIVE'
                    ? 'bg-emerald-500'
                    : streamStatus?.pipelineStatus === 'CONNECTED_WAITING'
                    ? 'bg-blue-500'
                    : streamStatus?.pipelineStatus === 'STALE'
                    ? 'bg-amber-500'
                    : streamStatus?.pipelineStatus === 'ERROR'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
                aria-hidden="true"
              ></span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {streamStatus?.freshnessDescription || 'Awaiting incoming vehicle telemetry payloads.'}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
