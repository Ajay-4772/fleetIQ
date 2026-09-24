import React, { useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { FleetOverviewCards } from './components/overview/FleetOverviewCards';
import { FleetHealthSection } from './components/overview/FleetHealthSection';
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
    // Refresh background metrics and action queues when live events arrive
    refreshData();
  }, [refreshData]);

  const { status: sseStatus, events: streamEvents, clearEvents } = useSSE(handleIncomingEvent);

  const handleUpdateActionStatus = async (actionId: string, status: string, notes: string) => {
    await api.updateActionStatus(actionId, status, notes);
    await refreshData();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-slate-100">
      <Header
        sseStatus={sseStatus}
        summary={summary}
        onRefresh={refreshData}
        onOpenSimulator={() => setActiveTab('simulator')}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          openActionCount={summary?.openActionCount}
          criticalActionCount={summary?.criticalActionCount}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <FleetOverviewCards summary={summary} />
              <CriticalAlertsBanner
                actions={actions}
                onSelectAction={(a) => setSelectedVehicleId(a.vehicleId)}
              />
              <FleetHealthSection health={health} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiveOperationsPanel
                  events={streamEvents}
                  onClear={clearEvents}
                  onSelectVehicle={setSelectedVehicleId}
                />
                <PriorityActionCenter
                  actions={actions}
                  onUpdateStatus={handleUpdateActionStatus}
                  onSelectVehicle={setSelectedVehicleId}
                />
              </div>
            </div>
          )}

          {/* LIVE OPERATIONS TAB */}
          {activeTab === 'live' && (
            <div className="space-y-6">
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
              <VehicleTable />
            </div>
          )}

          {/* INTELLIGENCE HUB TAB */}
          {activeTab === 'intelligence' && (
            <div className="space-y-6">
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
              <FleetQueryPanel />
            </div>
          )}

          {/* SYSTEM HEALTH & DATA QUALITY TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <SystemHealthPanel
                dataQuality={dataQuality}
                sseStatus={sseStatus}
              />
            </div>
          )}

          {/* SIMULATOR TAB */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
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
