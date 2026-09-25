import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download, CheckCircle2, Shield, FileText } from 'lucide-react';
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
import { CopilotWorkspace } from './components/copilot/CopilotWorkspace';
import { UserManagementPanel } from './components/admin/UserManagementPanel';
import { DataIngestionCenter } from './components/admin/DataIngestionCenter';
import { LoginPage } from './components/auth/LoginPage';
import { SafetyDetailsModal } from './components/overview/SafetyDetailsModal';
import { LegalModal } from './components/system/LegalModal';
import { AccessDeniedPage, NotFoundPage, ServerErrorPage, MaintenancePage } from './components/system/SystemStatusPages';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useDashboardData } from './hooks/useDashboardData';
import { useSSE } from './hooks/useSSE';
import { api } from './services/api';

const VehyronDashboard: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Operational Tools Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'security' | 'cookies' | null>(null);

  // Export dropdown state
  const [exportMessage, setExportMessage] = useState<string | null>(null);

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
  } = useDashboardData(isAuthenticated);

  // Handle incoming real-time SSE stream events
  const handleIncomingEvent = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const { status: sseStatus, events: streamEvents, clearEvents } = useSSE(handleIncomingEvent, isAuthenticated);

  const handleUpdateActionStatus = async (actionId: string, status: string, notes: string) => {
    await api.updateActionStatus(actionId, status, notes);
    await refreshData();
  };

  // Keyboard shortcut listener: Cmd+K / Ctrl+K opens AI Assistant Copilot tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('copilot');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTriggerExport = async (type: 'vehicles' | 'actions' | 'events', format: 'csv' | 'json' = 'csv') => {
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

  // Auth Guard
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-700 font-sans">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Initializing Secure Session & RBAC Tokens...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onOpenLegal={(type) => setLegalModalType(type)} />
        <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      </>
    );
  }

  const isAdmin = hasRole('ADMIN') || hasRole('ROLE_ADMIN');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f5f9] text-slate-900 font-sans antialiased">
      <Header
        sseStatus={sseStatus}
        summary={summary}
        actions={actions}
        onRefresh={refreshData}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenAssistant={() => setActiveTab('copilot')}
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
          onOpenAssistant={() => setActiveTab('copilot')}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 shadow-xs flex items-center justify-between">
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
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-700 shadow-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{exportMessage}</span>
            </div>
          )}

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Operations Intelligence Center</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Real-time multi-OEM telematics ingestion, decision engine queue, and live fleet readiness metrics
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('copilot')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition"
                  >
                    <span>Launch AI Copilot</span>
                  </button>
                  <button
                    onClick={() => handleTriggerExport('vehicles', 'csv')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs transition"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <CriticalAlertsBanner actions={actions} onSelectAction={(a) => setSelectedVehicleId(a.vehicleId)} />
              <FleetOverviewCards summary={summary} />

              {/* Main Analytics Dashboard (Full Width) */}
              <div className="w-full">
                <FleetHealthSection health={health} />
              </div>

              {/* Parallel Widgets Row: Most Day Active + Fleet Safety Rate (2 Columns) */}
              <div className="w-full">
                <RightSidebarWidgets
                  onViewDetails={() => setIsSafetyModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* 2. LIVE OPERATIONS TAB */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Real-Time Ingestion & Streaming</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Live Server-Sent Events (SSE) stream capturing multi-OEM raw payloads, schema validation, and normalization
                </p>
              </div>
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

          {/* 5. DEDICATED AI COPILOT WORKSPACE TAB */}
          {activeTab === 'copilot' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">VEHYRON Intelligence Copilot</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Full-page conversational interface with persistent chat history, deterministic safety guardrails, and RAG OEM citations
                  </p>
                </div>
              </div>
              <CopilotWorkspace onSelectVehicle={setSelectedVehicleId} />
            </div>
          )}

          {/* 6. INTELLIGENCE TAB */}
          {activeTab === 'intelligence' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Intelligence & Decisioning Hub</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Multi-signal rule engine calibration, deterministic fallback monitoring, and financial risk breakdown
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

          {/* 7. USER MANAGEMENT TAB (ADMIN ONLY) */}
          {activeTab === 'users' && (
            isAdmin ? (
              <UserManagementPanel />
            ) : (
              <AccessDeniedPage onReturnHome={() => setActiveTab('overview')} />
            )
          )}

          {/* 8. DATA INGESTION TAB (ADMIN ONLY) */}
          {activeTab === 'ingestion' && (
            isAdmin ? (
              <DataIngestionCenter />
            ) : (
              <AccessDeniedPage onReturnHome={() => setActiveTab('overview')} />
            )
          )}

          {/* 8. SYSTEM HEALTH TAB */}
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

          {/* 9. SYSTEM STATUS ERROR PAGES */}
          {(activeTab as string) === '404' && (
            <NotFoundPage onReturnHome={() => setActiveTab('overview')} />
          )}

          {(activeTab as string) === '500' && (
            <ServerErrorPage onReturnHome={() => setActiveTab('overview')} onRetry={refreshData} requestId="CORR-VEHY-883921" />
          )}

          {(activeTab as string) === '503' && (
            <MaintenancePage onReturnHome={() => setActiveTab('overview')} onRetry={refreshData} />
          )}

          {/* Global Footer with Compliance & Documentation Links */}
          <footer className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span>VEHYRON Connected Vehicle Intelligence Platform • API v1.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLegalModalType('terms')}
                className="hover:text-slate-600 transition"
              >
                Terms
              </button>
              <span>•</span>
              <button
                onClick={() => setLegalModalType('privacy')}
                className="hover:text-slate-600 transition"
              >
                Privacy
              </button>
              <span>•</span>
              <button
                onClick={() => setLegalModalType('security')}
                className="hover:text-slate-600 transition"
              >
                Security Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setLegalModalType('cookies')}
                className="hover:text-slate-600 transition"
              >
                Cookies
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* Global Vehicle Profile Modal */}
      {selectedVehicleId && (
        <VehicleProfileModal
          vehicleId={selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}

      {/* Global Multi-OEM Simulator Tool Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onScenarioExecuted={refreshData}
      />

      {/* Global Legal & Policy Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Fleet Safety Details Modal */}
      <SafetyDetailsModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        onSelectVehicle={(vId) => setSelectedVehicleId(vId)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <VehyronDashboard />
    </AuthProvider>
  );
};

export default App;
