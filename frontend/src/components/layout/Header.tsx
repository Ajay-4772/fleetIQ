import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  RefreshCw,
  Zap,
  Bot,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';
import { SSEConnectionStatus } from '../../hooks/useSSE';
import { DashboardSummary, ActionItem, SearchResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface HeaderProps {
  sseStatus: SSEConnectionStatus;
  summary: DashboardSummary | null;
  actions?: ActionItem[];
  onRefresh: () => void;
  onOpenSimulator: () => void;
  onOpenAssistant: (query?: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  onSelectAction: (action: ActionItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sseStatus,
  summary,
  actions = [],
  onRefresh,
  onOpenSimulator,
  onOpenAssistant,
  onSelectVehicle,
  onSelectAction
}) => {
  const { user, logout } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // User menu dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(searchQuery.trim());
        setSearchResult(res);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const criticalActions = actions.filter((a) => a.priority === 'CRITICAL' && a.status === 'OPEN');

  const roleLabels: Record<string, { title: string; color: string }> = {
    ROLE_ADMIN: { title: 'Administrator', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    ADMIN: { title: 'Administrator', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    ROLE_OPERATOR: { title: 'Fleet Operator', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    OPERATOR: { title: 'Fleet Operator', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  };

  const currentRoleInfo = roleLabels[user?.role || 'ROLE_OPERATOR'] || {
    title: user?.role || 'Operator',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Brand & Search Bar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">VEHYRON</span>
            <p className="text-[11px] text-slate-400 font-medium">Connected Vehicle Intelligence</p>
          </div>
        </div>

        {/* Real Functional Global Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl w-80 text-xs text-slate-700 transition shadow-inner">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              placeholder="Search VIN, vehicle ID, fault code, action..."
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (
            <div className="absolute top-10 left-0 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 max-h-96 overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 duration-150">
              {/* Ask AI shortcut button */}
              <button
                onClick={() => {
                  onOpenAssistant(searchQuery);
                  setShowSearchDropdown(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition text-left"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>Ask AI Assistant: "{searchQuery}"</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {isSearching && (
                <div className="py-4 text-center text-xs text-slate-400 animate-pulse">Searching fleet assets...</div>
              )}

              {searchResult && (
                <>
                  {/* Matching Vehicles */}
                  {searchResult.vehicles.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
                        Vehicles ({searchResult.vehicles.length})
                      </span>
                      <div className="space-y-1">
                        {searchResult.vehicles.slice(0, 4).map((v) => (
                          <div
                            key={v.id}
                            onClick={() => {
                              onSelectVehicle(v.id);
                              setShowSearchDropdown(false);
                            }}
                            className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition"
                          >
                            <div>
                              <span className="font-bold text-slate-900 font-mono">{v.id}</span>
                              <span className="text-slate-500 ml-2">
                                {v.make} {v.model} ({v.vin})
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                v.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : v.status === 'MAINTENANCE'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {v.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Actions */}
                  {searchResult.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
                        Action Orders ({searchResult.actions.length})
                      </span>
                      <div className="space-y-1">
                        {searchResult.actions.slice(0, 3).map((a) => (
                          <div
                            key={a.actionId}
                            onClick={() => {
                              onSelectAction(a);
                              setShowSearchDropdown(false);
                            }}
                            className="p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold font-mono text-slate-900">{a.actionId}</span>
                              <span className="text-[10px] font-bold text-rose-600 font-mono">{a.priority}</span>
                            </div>
                            <p className="text-slate-500 line-clamp-1 mt-0.5">{a.issue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResult.totalMatches === 0 && !isSearching && (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No matching vehicles, fault codes, or actions found.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Streamlined Live Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
          <span className="relative flex h-2 w-2">
            {sseStatus === 'LIVE' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" aria-hidden="true"></span>
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
          <span>
            {sseStatus === 'LIVE' ? 'Live' : sseStatus === 'RECONNECTING' ? 'Reconnecting' : 'Offline'}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition"
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition relative"
            title="Operational Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {criticalActions.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Critical Alerts ({criticalActions.length})</span>
                <span className="text-[10px] text-slate-400 font-mono">Live SSE</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {criticalActions.length > 0 ? (
                  criticalActions.map((action) => (
                    <div
                      key={action.actionId}
                      onClick={() => {
                        onSelectAction(action);
                        setShowNotifications(false);
                      }}
                      className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 hover:bg-rose-100/70 cursor-pointer transition text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono">{action.vehicleId}</span>
                        <span className="text-[10px] font-bold text-rose-600 font-mono">${action.estimatedImpact}</span>
                      </div>
                      <p className="text-slate-700 font-medium line-clamp-1">{action.issue}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">No open critical alerts. All nominal.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role & RBAC Switcher Dropdown */}
        <div className="relative pl-2 border-l border-slate-200" ref={userMenuRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition p-1 rounded-xl"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-blue-100">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'OP'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.fullName || 'Operations Lead'}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {currentRoleInfo.title}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </div>

          {/* User Menu & Role Switcher Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-slate-100 pb-2 px-1">
                <span className="text-[11px] font-bold text-slate-800 block">{user?.fullName}</span>
                <span className="text-[10px] text-slate-400 font-mono">@{user?.username}</span>
                <span className={`mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRoleInfo.color}`}>
                  {user?.role}
                </span>
              </div>

              {/* Authenticated RBAC Role Display */}
              <div className="py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-1">
                  Active Security Role
                </span>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="text-[10px] text-slate-500">Backend Enforced:</div>
                  <div className="font-bold text-blue-700 font-mono mt-0.5">{user?.role || 'ROLE_OPERATOR'}</div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full py-1.5 px-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  Log out session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
