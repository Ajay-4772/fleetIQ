import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Calendar, Download, Plus, ChevronDown, FileSpreadsheet, FileJson, CheckCircle2 } from 'lucide-react';
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
import { SystemHealthPanel } from './components/system/SystemHealthPanel';
import { SimulatorModal } from './components/simulator/SimulatorModal';
import { AiAssistantModal } from './components/assistant/AiAssistantModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useDashboardData } from './hooks/useDashboardData';
import { useSSE } from './hooks/useSSE';
import { api } from './services/api';

const FleetIQDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Operational Tools Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');

  // Export dropdown state
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

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

  // Keyboard shortcut listener: Cmd+K / Ctrl+K opens AI Assistant Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAssistantInitialQuery('');
        setIsAssistantOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerExport = async (type: 'vehicles' | 'actions' | 'events', format: 'csv' | 'json' = 'csv') => {
    setIsExportMenuOpen(false);
    try {
      setExportMessage(`Exporting ${type} as ${format.toUpperCase()}...`);
      await api.downloadExport(type, format);
      setExportMessage(`Export complete!`);
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err: any) {
      setExportMessage(`Export error: ${err.message}`);
      setTimeout(() => setExportMessage(null), 4000);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f5f9] text-slate-900 font-sans antialiased">
      <Header
        sseStatus={sseStatus}
        summary={summary}
        actions={actions}
        onRefresh={refreshData}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenAssistant={(q) => {
          setAssistantInitialQuery(q || '');
          setIsAssistantOpen(true);
        }}
        onSelectVehicle={(vId) => setSelectedVehicleId(vId)}
        onSelectAction={(action) => setSelectedVehicleId(action.vehicleId)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          openActionCount={summary?.openActionCount}
          criticalActionCount={summary?.criticalActionCount}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenAssistant={() => {
            setAssistantInitialQuery('');
            setIsAssistantOpen(true);
          }}
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

          {exportMessage && (
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-700 shadow-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{exportMessage}</span>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Dashboard Action Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fleet Intelligence Overview</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Real-time connected vehicle telemetry, health diagnostics & operations dispatch
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-600 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Live Telemetry Window</span>
                  </div>

                  <button
                    onClick={() => setIsSimulatorOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Scenario Simulator</span>
                  </button>

                  {/* Real Export Dropdown */}
                  <div className="relative" ref={exportRef}>
                    <button
                      onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Data</span>
                      <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
                    </button>

                    {isExportMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          Production Datasets
                        </div>
                        <button
                          onClick={() => handleTriggerExport('vehicles', 'csv')}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>Vehicles Registry (CSV)</span>
                        </button>
                        <button
                          onClick={() => handleTriggerExport('actions', 'csv')}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                          <span>Priority Actions (CSV)</span>
                        </button>
                        <button
                          onClick={() => handleTriggerExport('events', 'csv')}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                          <span>Telemetry Events (CSV)</span>
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button
                          onClick={() => handleTriggerExport('vehicles', 'json')}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                        >
                          <FileJson className="w-4 h-4 text-amber-600" />
                          <span>Vehicles Raw JSON</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 KPI Top Cards */}
              <FleetOverviewCards summary={summary} onNavigateTab={(tab) => setActiveTab(tab)} />

              {/* Critical Alerts Banner */}
              <CriticalAlertsBanner
                actions={actions}
                onSelectAction={(a) => setSelectedVehicleId(a.vehicleId)}
              />

              {/* Main 2-Column Split */}
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

                {/* Right Column (4 cols): Most Day Active + Radial Gauge + AI Assistant Widget */}
                <div className="lg:col-span-4 space-y-6">
                  <RightSidebarWidgets
                    onAskAi={(q) => {
                      setAssistantInitialQuery(q);
                      setIsAssistantOpen(true);
                    }}
                    onViewDetails={() => setActiveTab('intelligence')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. LIVE OPERATIONS TAB */}
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

          {/* 3. VEHICLES TAB */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fleet Asset Registry</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Monitored multi-OEM connected vehicles with telemetry health scores, diagnostics, and service states
                  </p>
                </div>
                <button
                  onClick={() => handleTriggerExport('vehicles', 'csv')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Vehicles CSV</span>
                </button>
              </div>
              <VehicleTable />
            </div>
          )}

          {/* 4. ACTIONS TAB */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Priority Operational Actions</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Authoritative decision engine queue with human operator review workflows & role-based mutation
                  </p>
                </div>
                <button
                  onClick={() => handleTriggerExport('actions', 'csv')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Actions CSV</span>
                </button>
              </div>
              <PriorityActionCenter
                actions={actions}
                onUpdateStatus={handleUpdateActionStatus}
                onSelectVehicle={setSelectedVehicleId}
              />
            </div>
          )}

          {/* 5. INTELLIGENCE TAB */}
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

          {/* 6. SYSTEM TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Health & Data Quality</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Backend service health checks, multi-OEM normalizer metrics, schema pass rates, and SSE stream health
                </p>
              </div>
              <SystemHealthPanel
                dataQuality={dataQuality}
                sseStatus={sseStatus}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Vehicle Profile Modal */}
      {selectedVehicleId && (
        <VehicleProfileModal
          vehicleId={selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}

      {/* Global AI Assistant Copilot Modal */}
      <AiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialQuery={assistantInitialQuery}
        onSelectVehicle={(vId) => {
          setIsAssistantOpen(false);
          setSelectedVehicleId(vId);
        }}
      />

      {/* Global Multi-OEM Simulator Tool Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onScenarioExecuted={refreshData}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FleetIQDashboard />
    </AuthProvider>
  );
};

export default App;
