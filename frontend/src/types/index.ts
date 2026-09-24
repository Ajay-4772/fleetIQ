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

export interface FleetHealth {
  healthyPercentage: number;
  atRiskPercentage: number;
  criticalPercentage: number;
  maintenanceDueCount: number;
  engineFaultCount: number;
  batteryWarningCount: number;
  tirePressureWarningCount: number;
  excessiveIdleCount: number;
  lowUtilizationCount: number;
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
  eventType: string;
  timestamp: string;
  vehicleId: string;
  make: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  recommendedAction: string;
  estimatedImpact: number;
  status: string;
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
