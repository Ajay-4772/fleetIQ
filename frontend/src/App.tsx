import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Download, Plus, Zap, ArrowUpRight } from 'lucide-react';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { FleetOverviewCards } from './components/overview/FleetOverviewCards';
import { FleetHealthSection } from './components/overview/FleetHealthSection';
import { RightSidebarWidgets } from './components/overview/RightSidebarWidgets';
import { CriticalAlertsBanner } from './components/live/CriticalAlertsBanner';
import { LiveOperationsPanel } from './components/live/LiveOperationsPanel';
import { PriorityActionCenter } from './components/actions/PriorityActionCenter';
import { VehicleTable } from './components/vehicles/VehicleTable';
import { VehicleProfileModal } from './components/vehicles/VehicleProfileModal';
import { IntelligenceHub } from './components/intelligence/IntelligenceHub';
import { FleetQueryPanel } from './components/queries/FleetQueryPanel';
import { SystemHealthPanel } from './components/system/SystemHealthPanel';
import { SimulatorControlPanel } from './components/simulator/SimulatorControlPanel';
import { useDashboardData } from './hooks/useDashboardData';
import { useSSE } from './hooks/useSSE';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const {
    summary,
    health,
    decisionMetrics,
    dataQuality,
    impact,
    actions,
    loading,
    error,
    refreshData
  } = useDashboardData();

  // Handle incoming real-time SSE stream events
  const handleIncomingEvent = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const { status: sseStatus, events: streamEvents, clearEvents } = useSSE(handleIncomingEvent);

  const handleUpdateActionStatus = async (actionId: string, status: string, notes: string) => {
    await api.updateActionStatus(actionId, status, notes);
    await refreshData();
  };

  // Keyboard shortcut listener: Cmd+K / Ctrl+K opens queries
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('queries');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f5f9] text-slate-900 font-sans antialiased">
      <Header
        sseStatus={sseStatus}
        summary={summary}
        onRefresh={refreshData}
        onOpenSimulator={() => setActiveTab('simulator')}
        onSearchFocus={() => setActiveTab('queries')}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          openActionCount={summary?.openActionCount}
          criticalActionCount={summary?.criticalActionCount}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 shadow-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={refreshData}
                className="px-3 py-1 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* OVERVIEW TAB (Shopeers / Logip 2-Column Dashboard Layout) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Dashboard Action Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Real-time connected vehicle telemetry, health diagnostics & operations dispatch
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-600 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Jan 1, 2025 - Feb 1, 2025</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Scenario Simulator</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Top Cards */}
              <FleetOverviewCards summary={summary} />

              {/* Critical Alerts Banner */}
              <CriticalAlertsBanner
                actions={actions}
                onSelectAction={(a) => setSelectedVehicleId(a.vehicleId)}
              />

              {/* Shopeers Main 2-Column Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (8 cols): Fleet Health Chart + Action Queue + Live Stream */}
                <div className="lg:col-span-8 space-y-6">
                  <FleetHealthSection health={health} />
                  <PriorityActionCenter
                    actions={actions}
                    onUpdateStatus={handleUpdateActionStatus}
                    onSelectVehicle={setSelectedVehicleId}
                  />
                  <LiveOperationsPanel
                    events={streamEvents}
                    onClear={clearEvents}
                    onSelectVehicle={setSelectedVehicleId}
                  />
                </div>

                {/* Right Column (4 cols): Most Day Active + Radial Gauge + AI Assistant */}
                <div className="lg:col-span-4 space-y-6">
                  <RightSidebarWidgets
                    onAskAi={(q) => {
                      setActiveTab('queries');
                    }}
                    onViewDetails={() => setActiveTab('intelligence')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* LIVE OPERATIONS TAB */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Operations Feed</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Sub-second Server-Sent Events (SSE) telemetry normalized across multi-OEM ingestion adapters
                </p>
              </div>
              <CriticalAlertsBanner
                actions={actions}
                onSelectAction={(a) => setSelectedVehicleId(a.vehicleId)}
              />
              <LiveOperationsPanel
                events={streamEvents}
                onClear={clearEvents}
                onSelectVehicle={setSelectedVehicleId}
              />
            </div>
          )}

          {/* PRIORITY ACTIONS TAB */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Priority Operational Actions</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Authoritative decision engine queue with human operator review workflows
                </p>
              </div>
              <PriorityActionCenter
                actions={actions}
                onUpdateStatus={handleUpdateActionStatus}
                onSelectVehicle={setSelectedVehicleId}
              />
            </div>
          )}

          {/* VEHICLES TAB */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fleet Asset Registry</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Monitored multi-OEM connected vehicles with telemetry health scores and diagnostics
                </p>
              </div>
              <VehicleTable />
            </div>
          )}

          {/* INTELLIGENCE HUB TAB */}
          {activeTab === 'intelligence' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Intelligence & Decisioning Hub</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Multi-signal rule engine calibration, Jev AI models, fallback monitoring, and financial risk breakdown
                </p>
              </div>
              <IntelligenceHub
                decisionMetrics={decisionMetrics}
                impactMetrics={impact}
                fleetHealth={health}
                actions={actions}
                onSelectVehicle={setSelectedVehicleId}
              />
            </div>
          )}

          {/* FLEET QUERIES TAB */}
          {activeTab === 'queries' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Controlled Fleet Queries</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Deterministic intent-based queries across fleet health, DTCs, maintenance, and asset utilization
                </p>
              </div>
              <FleetQueryPanel />
            </div>
          )}

          {/* SYSTEM HEALTH & DATA QUALITY TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Health & Data Quality</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Backend service health checks, multi-OEM normalizer metrics, schema pass rates, and SSE connection
                </p>
              </div>
              <SystemHealthPanel
                dataQuality={dataQuality}
                sseStatus={sseStatus}
              />
            </div>
          )}

          {/* SIMULATOR TAB */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Multi-OEM Scenario Simulator</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Inject deterministic test scenarios and high-volume load benchmarks to validate real-time operational response
                </p>
              </div>
              <SimulatorControlPanel onScenarioExecuted={refreshData} />
            </div>
          )}
        </main>
      </div>

      {selectedVehicleId && (
        <VehicleProfileModal
          vehicleId={selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}
    </div>
  );
};
export default App;
