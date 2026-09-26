export interface Vehicle {
  id: string;
  vin: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  vehicleType: string;
  mileageKm: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  batteryHealthPct: number;
  oilLifePct: number;
  tirePressurePsi: number;
  avgMpg: number;
  lastServiceDate: string;
}

export interface CanonicalVehicleEvent {
  eventId: string;
  vehicleId: string;
  eventType: 'ENGINE_FAULT' | 'MAINTENANCE_DUE' | 'EXCESSIVE_IDLE' | 'BATTERY_WARNING' | 'TIRE_PRESSURE_LOW' | 'LOW_UTILIZATION' | 'TELEMETRY_NORMAL' | string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  faultCode?: string;
  idleMinutes?: number;
  oilLifePct?: number;
  batteryHealthPct?: number;
  tirePressurePsi?: number;
  fuelConsumedLiters?: number;
  operatingHours?: number;
  odometerKm?: number;
  source: string;
  status: string;
  timestamp: string;
}

export interface Decision {
  decisionId: string;
  eventId: string;
  vehicleId: string;
  issueDetected: string;
  decisionType: string;
  recommendedAction: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedCostImpact: number;
  confidenceScore: number;
  decisionSource: 'RULE_ENGINE' | 'JEV_AI' | 'HYBRID' | 'RULE_ENGINE_FALLBACK';
  rationale: string;
  requiresHumanReview: boolean;
  createdAt: string;
}

export interface ActionItem {
  actionId: string;
  decisionId: string;
  vehicleId: string;
  issue: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedImpact: number;
  recommendedAction: string;
  confidence: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  decisionSource: string;
  requiresHumanReview: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface DashboardSummary {
  hasData?: boolean;
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  maintenanceVehicles: number;
  healthyVehicles: number;
  atRiskVehicles: number;
  criticalVehicles: number;
  fleetHealthScore: number;
  overallUtilizationPct: number;
  openActionCount: number;
  criticalActionCount: number;
  estimatedTotalImpact: number;
}

export interface FleetHealthPoint {
  timestamp: string;
  label: string;
  healthScore: number;
  vehicleCount: number;
  signalCount: number;
}

export interface FleetHealth {
  hasData: boolean;
  healthyPercentage: number;
  atRiskPercentage: number;
  criticalPercentage: number;
  maintenanceDueCount: number;
  engineFaultCount: number;
  batteryWarningCount: number;
  tirePressureWarningCount: number;
  excessiveIdleCount: number;
  lowUtilizationCount: number;
  previousPeriodPercentageChange?: number | null;
  points?: FleetHealthPoint[];
  freshnessStatus?: string;
  lastEventTimestamp?: string | null;
}

export interface ThroughputPoint {
  timestamp: string;
  label: string;
  received: number;
  processed: number;
  rejected: number;
}

export interface IngestionThroughput {
  hasData: boolean;
  eventsReceived: number;
  eventsProcessed: number;
  eventsRejected: number;
  processingRate: number;
  processingLatencyMs: number;
  freshnessStatus: string;
  lastEventTimestamp?: string | null;
  points: ThroughputPoint[];
}

export interface IssueDistribution {
  hasData: boolean;
  totalIssues: number;
  severityCounts: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    [key: string]: number;
  };
  categoryCounts: {
    BATTERY: number;
    ENGINE: number;
    MAINTENANCE: number;
    TPMS: number;
    UTILIZATION: number;
    [key: string]: number;
  };
}

export interface DayUtilization {
  day: string;
  distanceKm: number;
  activeVehicles: number;
  isPeak: boolean;
}

export interface WeeklyUtilization {
  hasData: boolean;
  days: DayUtilization[];
  peakDay?: string | null;
  peakKm?: number | null;
  averageDailyKm?: number | null;
}

export interface SafetyScore {
  hasData: boolean;
  safetyScore?: number | null;
  targetScore: number;
  status: string;
  harshBrakingCount: number;
  speedViolationsCount: number;
  criticalFaultCount: number;
  complianceRate: number;
}

export interface StreamStatus {
  pipelineStatus: 'LIVE' | 'CONNECTED_WAITING' | 'NO_SOURCE_CONNECTED' | 'STALE' | 'ERROR' | string;
  statusLabel: string;
  totalSources: number;
  activeSources: number;
  lastEventAt?: string | null;
  freshnessDescription: string;
  configuredSources: any[];
}

export interface TrendDataPoint {
  timestamp: string;
  eventsCount: number;
  criticalCount: number;
  maintenanceCount: number;
  faultCount: number;
  estimatedImpact: number;
}

export interface DataQuality {
  eventsReceived: number;
  successfullyNormalized: number;
  normalizationFailed: number;
  invalidPayloads: number;
  duplicateEvents: number;
  unsupportedSources: number;
  processingFailed: number;
  aiFailures: number;
  fallbackDecisions: number;
}

export interface DecisionMetrics {
  totalDecisions: number;
  ruleEngineCount: number;
  jevAiCount: number;
  hybridCount: number;
  fallbackCount: number;
  ruleEnginePct: number;
  jevAiPct: number;
  hybridPct: number;
  fallbackPct: number;
  avgConfidence: number;
  humanReviewCount: number;
}

export interface ImpactMetrics {
  totalEstimatedImpact: number;
  openActionImpact: number;
  criticalActionImpact: number;
  maintenanceImpact: number;
  faultImpact: number;
  idleFuelImpact: number;
  batteryImpact: number;
}

export interface DashboardEvent {
  eventId?: string;
  eventType: string;
  timestamp: string;
  vehicleId: string;
  make?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  recommendedAction?: string;
  estimatedImpact?: number;
  status?: string;
  data?: any;
}

export interface VehicleProfile {
  vehicle: Vehicle;
  recentEvents: CanonicalVehicleEvent[];
  activeActions: ActionItem[];
  decisions: Decision[];
}

export interface FleetQueryResponse {
  intent: string;
  summary: string;
  resultCount: number;
  data: any[];
  metadata: Record<string, any>;
}

export interface SimulatorResponse {
  scenario: string;
  eventsGenerated: number;
  normalizedCount: number;
  failedCount: number;
  decisionsCreated: number;
  actionsCreated: number;
  executionTimeMs: number;
  message: string;
}

export interface LoadTestResponse {
  eventLevel: number;
  eventsGenerated: number;
  successfullyNormalized: number;
  failedNormalization: number;
  totalProcessingTimeMs: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  decisionsGenerated: number;
  fallbackDecisions: number;
  actionsCreated: number;
}

export interface User {
  username: string;
  id?: number;
  fullName: string;
  email?: string;
  role: 'ROLE_ADMIN' | 'ROLE_OPERATOR' | 'ADMIN' | 'OPERATOR' | string;
  organization?: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
}

export interface LoginResponse {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  type?: string;
  tokenType?: string;
  username: string;
  fullName: string;
  email?: string;
  role: string;
  organization?: string;
  expiresInMs?: number;
  message?: string;
}

export interface AuthTokensResponse extends LoginResponse {}

export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  organization?: string;
  requestedRole?: 'OPERATOR' | 'ADMIN' | string;
  termsAccepted: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AssistantResponse {
  answer: string;
  queryType: 'LIVE_DATA' | 'KNOWLEDGE_RAG' | 'HYBRID' | string;
  sources: string[];
  supportingData?: any;
  recommendedAction?: string;
  confidence: number;
  aiProviderStatus: string;
  timestamp: string;
}

export interface SearchResult {
  query: string;
  totalMatches: number;
  vehicles: Vehicle[];
  actions: ActionItem[];
  events: CanonicalVehicleEvent[];
}

export interface ChatConversation {
  id: string;
  title: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  queryType?: string;
  sources?: string[];
  citations?: string[];
  evidence?: string;
  confidence?: number;
  confidenceScore?: string;
  modelProvider?: string;
  modelTag?: string;
  ruleTag?: string;
  vehicleId?: string;
  createdAt: string;
}

export interface ChatConversationDetail {
  conversation: ChatConversation;
  messages: ChatMessage[];
}

export interface UserAdmin {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role: string;
  enabled: boolean;
  organization?: string;
  status?: string;
  requestedRole?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface UserAuditLog {
  id: number;
  actorUsername?: string;
  username?: string;
  action: string;
  targetUsername?: string;
  targetEntity?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  role: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'KAFKA' | 'MQTT' | 'REST' | 'WEBHOOK' | 'PUBSUB' | 'KINESIS' | 'EVENT_HUBS' | 'EXCEL' | 'CSV' | string;
  status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR' | 'PAUSED';
  configuration?: string;
  credentialReference?: string;
  schemaMapping?: string;
  enabled: boolean;
  eventsReceived: number;
  eventsProcessed: number;
  eventsRejected: number;
  lastConnectedAt?: string;
  lastEventAt?: string;
  lastErrorAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IngestionJob {
  jobId: string;
  sourceId?: string;
  fileName?: string;
  sourceType: string;
  totalRecords: number;
  processedRecords: number;
  rejectedRecords: number;
  warningRecords: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
  uploadedBy?: string;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface DataQualityMetrics {
  totalReceived: number;
  successfullyNormalized: number;
  normalizationFailed: number;
  invalidPayloads: number;
  duplicateEvents: number;
  unsupportedSources: number;
  processingFailed: number;
  activeSourcesCount: number;
  connectedSourcesCount: number;
}



