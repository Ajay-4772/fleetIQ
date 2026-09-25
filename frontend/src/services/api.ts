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
  LoadTestResponse,
  User,
  LoginResponse,
  AssistantResponse,
  SearchResult
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Token management in localStorage with backward-compatible migration
let currentToken: string | null = localStorage.getItem('vehyron_auth_token') || localStorage.getItem('fleetiq_auth_token') || null;
let currentRefreshToken: string | null = localStorage.getItem('vehyron_refresh_token') || localStorage.getItem('fleetiq_refresh_token') || null;

export const setAuthToken = (token: string | null, refreshToken?: string | null) => {
  currentToken = token;
  if (token) {
    localStorage.setItem('vehyron_auth_token', token);
  } else {
    localStorage.removeItem('vehyron_auth_token');
    localStorage.removeItem('fleetiq_auth_token');
  }

  if (refreshToken !== undefined) {
    currentRefreshToken = refreshToken;
    if (refreshToken) {
      localStorage.setItem('vehyron_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('vehyron_refresh_token');
      localStorage.removeItem('fleetiq_refresh_token');
    }
  }
};

export const getAuthToken = (): string | null => currentToken;
export const getRefreshToken = (): string | null => currentRefreshToken;

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let message = '';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.message || parsed.error || '';
    } catch {
      // keep empty
    }
    const cleanMessage = message || errorText || res.statusText || 'Request failed';
    const err: any = new Error(cleanMessage);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  // Authentication
  login: (username: string, password: string, requestedRole?: string): Promise<LoginResponse> =>
    fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, requestedRole })
    })
      .then(handleResponse<LoginResponse>)
      .then((res) => {
        setAuthToken(res.token || res.accessToken || null, res.refreshToken || null);
        return res;
      }),

  register: (payload: import('../types').RegisterRequest): Promise<import('../types').AuthTokensResponse> =>
    fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(handleResponse<import('../types').AuthTokensResponse>)
      .then((res) => {
        setAuthToken(res.token || res.accessToken || null, res.refreshToken || null);
        return res;
      }),

  refreshToken: async (): Promise<string | null> => {
    if (!currentRefreshToken) {
      return null;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken })
      }).then(handleResponse<import('../types').AuthTokensResponse>);

      setAuthToken(res.accessToken || res.token || null, res.refreshToken || null);
      return res.accessToken || res.token || null;
    } catch {
      setAuthToken(null, null);
      return null;
    }
  },

  forgotPassword: (email: string): Promise<{ message: string; status: string }> =>
    fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(handleResponse<{ message: string; status: string }>),

  resetPassword: (payload: import('../types').ResetPasswordRequest): Promise<{ message: string; status: string }> =>
    fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handleResponse<{ message: string; status: string }>),

  getCurrentUser: (): Promise<User> =>
    fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: authHeaders()
    }).then(handleResponse<User>),

  logout: (): Promise<any> => {
    const refresh = currentRefreshToken;
    return fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ refreshToken: refresh || '' })
    })
      .then(handleResponse)
      .catch(() => ({ status: 'SUCCESS' }))
      .finally(() => {
        setAuthToken(null, null);
      });
  },

  // Grounded AI Assistant
  queryAssistant: (question: string): Promise<AssistantResponse> =>
    fetch(`${BASE_URL}/api/v1/assistant/query`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ question })
    }).then(handleResponse<AssistantResponse>),

  // Global Search
  search: (query: string): Promise<SearchResult> =>
    fetch(`${BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}`, {
      headers: authHeaders()
    }).then(handleResponse<SearchResult>),

  // Real Data Export Helper
  getExportUrl: (type: 'vehicles' | 'actions' | 'events', format: 'csv' | 'json' = 'csv'): string => {
    const tokenParam = currentToken ? `&token=${encodeURIComponent(currentToken)}` : '';
    return `${BASE_URL}/api/v1/export/${type}?format=${format}${tokenParam}`;
  },

  downloadExport: async (type: 'vehicles' | 'actions' | 'events', format: 'csv' | 'json' = 'csv'): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/v1/export/${type}?format=${format}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleetiq-${type}-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Dashboard Aggregations
  getSummary: (): Promise<DashboardSummary> =>
    fetch(`${BASE_URL}/api/v1/dashboard/summary`, { headers: authHeaders() })
      .then(handleResponse<DashboardSummary>),

  getHealth: (): Promise<FleetHealth> =>
    fetch(`${BASE_URL}/api/v1/dashboard/health`, { headers: authHeaders() })
      .then(handleResponse<FleetHealth>),

  getEvents: (page = 0, size = 50, severity?: string, eventType?: string): Promise<{ content: CanonicalVehicleEvent[], totalElements: number }> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (severity) params.append('severity', severity);
    if (eventType) params.append('eventType', eventType);
    return fetch(`${BASE_URL}/api/v1/dashboard/events?${params}`, { headers: authHeaders() })
      .then(handleResponse<{ content: CanonicalVehicleEvent[], totalElements: number }>);
  },

  getTrends: (range = '24H'): Promise<TrendDataPoint[]> =>
    fetch(`${BASE_URL}/api/v1/dashboard/trends?range=${range}`, { headers: authHeaders() })
      .then(handleResponse<TrendDataPoint[]>),

  getDataQuality: (): Promise<DataQuality> =>
    fetch(`${BASE_URL}/api/v1/dashboard/data-quality`, { headers: authHeaders() })
      .then(handleResponse<DataQuality>),

  getDecisionMetrics: (): Promise<DecisionMetrics> =>
    fetch(`${BASE_URL}/api/v1/dashboard/decision-metrics`, { headers: authHeaders() })
      .then(handleResponse<DecisionMetrics>),

  getImpact: (): Promise<ImpactMetrics> =>
    fetch(`${BASE_URL}/api/v1/dashboard/impact`, { headers: authHeaders() })
      .then(handleResponse<ImpactMetrics>),

  // Vehicles
  getVehicles: (status?: string, make?: string, fuelType?: string): Promise<Vehicle[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (make) params.append('make', make);
    if (fuelType) params.append('fuelType', fuelType);
    return fetch(`${BASE_URL}/api/v1/vehicles?${params}`, { headers: authHeaders() })
      .then(handleResponse<Vehicle[]>);
  },

  getVehicleProfile: (id: string): Promise<VehicleProfile> =>
    fetch(`${BASE_URL}/api/v1/vehicles/${id}/profile`, { headers: authHeaders() })
      .then(handleResponse<VehicleProfile>),

  // Actions
  getActions: (status?: string, priority?: string, humanReview?: boolean, page = 0, size = 50): Promise<{ content: ActionItem[], totalElements: number }> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (humanReview !== undefined) params.append('requiresHumanReview', humanReview.toString());
    return fetch(`${BASE_URL}/api/v1/actions?${params}`, { headers: authHeaders() })
      .then(handleResponse<{ content: ActionItem[], totalElements: number }>);
  },

  updateActionStatus: (actionId: string, status: string, notes?: string): Promise<ActionItem> =>
    fetch(`${BASE_URL}/api/v1/actions/${actionId}/status`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, notes })
    }).then(handleResponse<ActionItem>),

  // Controlled Fleet Query
  runFleetQuery: (intent: string, parameters: Record<string, any> = {}): Promise<FleetQueryResponse> =>
    fetch(`${BASE_URL}/api/v1/fleet/query`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ intent, parameters })
    }).then(handleResponse<FleetQueryResponse>),

  // Simulator
  runScenario: (scenario: string, config: any = {}): Promise<SimulatorResponse> =>
    fetch(`${BASE_URL}/api/v1/simulator/scenario/${scenario}`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(config)
    }).then(handleResponse<SimulatorResponse>),

  runLoadTest: (level: number, seed?: number): Promise<LoadTestResponse> => {
    const params = new URLSearchParams({ level: level.toString() });
    if (seed) params.append('seed', seed.toString());
    return fetch(`${BASE_URL}/api/v1/simulator/load-test?${params}`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handleResponse<LoadTestResponse>);
  },

  // Actuator Health
  getActuatorHealth: (): Promise<any> =>
    fetch(`${BASE_URL}/actuator/health`).then(handleResponse),

  // Persistent AI Copilot Conversations
  getConversations: (): Promise<import('../types').ChatConversation[]> =>
    fetch(`${BASE_URL}/api/v1/assistant/conversations`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').ChatConversation[]>),

  createConversation: (title?: string): Promise<import('../types').ChatConversation> => {
    const query = title ? `?title=${encodeURIComponent(title)}` : '';
    return fetch(`${BASE_URL}/api/v1/assistant/conversations${query}`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handleResponse<import('../types').ChatConversation>);
  },

  getConversationDetails: (id: string): Promise<import('../types').ChatConversationDetail> =>
    fetch(`${BASE_URL}/api/v1/assistant/conversations/${id}`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').ChatConversationDetail>),

  sendConversationMessage: (id: string, message: string): Promise<import('../types').ChatMessage> =>
    fetch(`${BASE_URL}/api/v1/assistant/conversations/${id}/messages`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ message })
    }).then(handleResponse<import('../types').ChatMessage>),

  renameConversation: (id: string, title: string): Promise<import('../types').ChatConversation> =>
    fetch(`${BASE_URL}/api/v1/assistant/conversations/${id}?title=${encodeURIComponent(title)}`, {
      method: 'PATCH',
      headers: authHeaders()
    }).then(handleResponse<import('../types').ChatConversation>),

  deleteConversation: (id: string): Promise<void> =>
    fetch(`${BASE_URL}/api/v1/assistant/conversations/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    }).then((res) => {
      if (!res.ok) throw new Error(`Failed to delete conversation: ${res.statusText}`);
    }),

  // Admin User Management
  getAdminUsers: (): Promise<import('../types').UserAdmin[]> =>
    fetch(`${BASE_URL}/api/v1/admin/users`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').UserAdmin[]>),

  searchAdminUsers: (q?: string): Promise<import('../types').UserAdmin[]> => {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return fetch(`${BASE_URL}/api/v1/admin/users/search${query}`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').UserAdmin[]>);
  },

  createAdminUser: (data: { username: string; password: string; fullName: string; role: string }): Promise<import('../types').UserAdmin> =>
    fetch(`${BASE_URL}/api/v1/admin/users`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    }).then(handleResponse<import('../types').UserAdmin>),

  updateAdminUserStatus: (id: number, enabled: boolean): Promise<import('../types').UserAdmin> =>
    fetch(`${BASE_URL}/api/v1/admin/users/${id}/status?enabled=${enabled}`, {
      method: 'PATCH',
      headers: authHeaders()
    }).then(handleResponse<import('../types').UserAdmin>),

  updateAdminUserRole: (id: number, role: string): Promise<import('../types').UserAdmin> =>
    fetch(`${BASE_URL}/api/v1/admin/users/${id}/role?role=${role}`, {
      method: 'PATCH',
      headers: authHeaders()
    }).then(handleResponse<import('../types').UserAdmin>),

  getAdminUserAuditLogs: (): Promise<import('../types').UserAuditLog[]> =>
    fetch(`${BASE_URL}/api/v1/admin/users/audit`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').UserAuditLog[]>),

  // Aliases for CopilotWorkspace and UserManagementPanel
  listConversations: (): Promise<import('../types').ChatConversation[]> =>
    fetch(`${BASE_URL}/api/v1/assistant/conversations`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').ChatConversation[]>),

  getConversation: (id: string): Promise<import('../types').ChatConversationDetail> =>
    fetch(`${BASE_URL}/api/v1/assistant/conversations/${id}`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').ChatConversationDetail>),

  sendMessage: (id: string, message: string): Promise<import('../types').ChatMessage> =>
    fetch(`${BASE_URL}/api/v1/assistant/conversations/${id}/messages`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ message })
    }).then(handleResponse<import('../types').ChatMessage>),

  getAdminAuditLogs: (): Promise<import('../types').UserAuditLog[]> =>
    fetch(`${BASE_URL}/api/v1/admin/users/audit`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').UserAuditLog[]>),

  // Ingestion & Data Sources Management
  getIngestionSources: (): Promise<import('../types').DataSource[]> =>
    fetch(`${BASE_URL}/api/v1/ingestion/sources`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').DataSource[]>),

  createIngestionSource: (data: Partial<import('../types').DataSource>): Promise<import('../types').DataSource> =>
    fetch(`${BASE_URL}/api/v1/ingestion/sources`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    }).then(handleResponse<import('../types').DataSource>),

  updateIngestionSource: (id: string, data: Partial<import('../types').DataSource>): Promise<import('../types').DataSource> =>
    fetch(`${BASE_URL}/api/v1/ingestion/sources/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    }).then(handleResponse<import('../types').DataSource>),

  deleteIngestionSource: (id: string): Promise<void> =>
    fetch(`${BASE_URL}/api/v1/ingestion/sources/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    }).then(() => {}),

  testIngestionSource: (id: string): Promise<{ sourceId: string; connected: boolean; message: string }> =>
    fetch(`${BASE_URL}/api/v1/ingestion/sources/${id}/test`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handleResponse<{ sourceId: string; connected: boolean; message: string }>),

  startIngestionSource: (id: string): Promise<import('../types').DataSource> =>
    fetch(`${BASE_URL}/api/v1/ingestion/sources/${id}/start`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handleResponse<import('../types').DataSource>),

  stopIngestionSource: (id: string): Promise<import('../types').DataSource> =>
    fetch(`${BASE_URL}/api/v1/ingestion/sources/${id}/stop`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handleResponse<import('../types').DataSource>),

  previewUpload: (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${BASE_URL}/api/v1/ingestion/upload/preview`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    }).then(handleResponse<any>);
  },

  uploadDataset: (file: File, mapping?: Record<string, string>): Promise<import('../types').IngestionJob> => {
    const formData = new FormData();
    formData.append('file', file);
    if (mapping) {
      formData.append('mapping', JSON.stringify(mapping));
    }
    return fetch(`${BASE_URL}/api/v1/ingestion/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    }).then(handleResponse<import('../types').IngestionJob>);
  },

  getIngestionJobs: (): Promise<import('../types').IngestionJob[]> =>
    fetch(`${BASE_URL}/api/v1/ingestion/jobs`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').IngestionJob[]>),

  getIngestionQualityMetrics: (): Promise<import('../types').DataQualityMetrics> =>
    fetch(`${BASE_URL}/api/v1/ingestion/quality`, {
      headers: authHeaders()
    }).then(handleResponse<import('../types').DataQualityMetrics>),

  getRawRecords: (): Promise<any[]> =>
    fetch(`${BASE_URL}/api/v1/ingestion/raw-records`, {
      headers: authHeaders()
    }).then(handleResponse<any[]>),

  retryRawRecord: (recordId: number): Promise<any> =>
    fetch(`${BASE_URL}/api/v1/ingestion/retry/${recordId}`, {
      method: 'POST',
      headers: authHeaders()
    }).then(handleResponse<any>),

  getSystemStatus: (): Promise<any> =>
    fetch(`${BASE_URL}/api/v1/system/status`, {
      headers: authHeaders()
    }).then(handleResponse<any>)
};
