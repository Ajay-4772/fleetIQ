import {
  DashboardSummary,
  FleetHealth,
  CanonicalVehicleEvent,
  TrendDataPoint,
  DataQuality,
  DecisionMetrics,
  ImpactMetrics,
  Vehicle,
  VehicleProfile,
  ActionItem,
  FleetQueryResponse,
  SimulatorResponse,
  LoadTestResponse
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Dashboard Aggregations
  getSummary: (): Promise<DashboardSummary> =>
    fetch(`${BASE_URL}/api/dashboard/summary`).then(handleResponse<DashboardSummary>),

  getHealth: (): Promise<FleetHealth> =>
    fetch(`${BASE_URL}/api/dashboard/health`).then(handleResponse<FleetHealth>),

  getEvents: (page = 0, size = 50, severity?: string, eventType?: string): Promise<{ content: CanonicalVehicleEvent[], totalElements: number }> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (severity) params.append('severity', severity);
    if (eventType) params.append('eventType', eventType);
    return fetch(`${BASE_URL}/api/dashboard/events?${params}`).then(handleResponse<{ content: CanonicalVehicleEvent[], totalElements: number }>);
  },

  getTrends: (range = '24H'): Promise<TrendDataPoint[]> =>
    fetch(`${BASE_URL}/api/dashboard/trends?range=${range}`).then(handleResponse<TrendDataPoint[]>),

  getDataQuality: (): Promise<DataQuality> =>
    fetch(`${BASE_URL}/api/dashboard/data-quality`).then(handleResponse<DataQuality>),

  getDecisionMetrics: (): Promise<DecisionMetrics> =>
    fetch(`${BASE_URL}/api/dashboard/decision-metrics`).then(handleResponse<DecisionMetrics>),

  getImpact: (): Promise<ImpactMetrics> =>
    fetch(`${BASE_URL}/api/dashboard/impact`).then(handleResponse<ImpactMetrics>),

  // Vehicles
  getVehicles: (status?: string, make?: string, fuelType?: string): Promise<Vehicle[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (make) params.append('make', make);
    if (fuelType) params.append('fuelType', fuelType);
    return fetch(`${BASE_URL}/api/vehicles?${params}`).then(handleResponse<Vehicle[]>);
  },

  getVehicleProfile: (id: string): Promise<VehicleProfile> =>
    fetch(`${BASE_URL}/api/vehicles/${id}/profile`).then(handleResponse<VehicleProfile>),

  // Actions
  getActions: (status?: string, priority?: string, humanReview?: boolean, page = 0, size = 50): Promise<{ content: ActionItem[], totalElements: number }> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (humanReview !== undefined) params.append('requiresHumanReview', humanReview.toString());
    return fetch(`${BASE_URL}/api/actions?${params}`).then(handleResponse<{ content: ActionItem[], totalElements: number }>);
  },

  updateActionStatus: (actionId: string, status: string, notes?: string): Promise<ActionItem> =>
    fetch(`${BASE_URL}/api/actions/${actionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    }).then(handleResponse<ActionItem>),

  // Controlled Fleet Query
  runFleetQuery: (intent: string, parameters: Record<string, any> = {}): Promise<FleetQueryResponse> =>
    fetch(`${BASE_URL}/api/fleet/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent, parameters })
    }).then(handleResponse<FleetQueryResponse>),

  // Simulator
  runScenario: (scenario: string, config: any = {}): Promise<SimulatorResponse> =>
    fetch(`${BASE_URL}/api/simulator/scenario/${scenario}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).then(handleResponse<SimulatorResponse>),

  runLoadTest: (level: number, seed?: number): Promise<LoadTestResponse> => {
    const params = new URLSearchParams({ level: level.toString() });
    if (seed) params.append('seed', seed.toString());
    return fetch(`${BASE_URL}/api/simulator/load-test?${params}`, { method: 'POST' }).then(handleResponse<LoadTestResponse>);
  },

  // Actuator Health
  getActuatorHealth: (): Promise<any> =>
    fetch(`${BASE_URL}/actuator/health`).then(handleResponse)
};
