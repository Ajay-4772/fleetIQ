import React, { useState } from 'react';
import {
  Wrench,
  AlertOctagon,
  BrainCircuit,
  UserCheck,
  TrendingDown,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  IndianRupee,
  Cpu
} from 'lucide-react';
import { DecisionMetrics, ImpactMetrics, FleetHealth, ActionItem } from '../../types';

interface IntelligenceHubProps {
  decisionMetrics: DecisionMetrics | null;
  impactMetrics: ImpactMetrics | null;
  fleetHealth: FleetHealth | null;
  actions: ActionItem[];
  onSelectVehicle?: (vehicleId: string) => void;
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({
  decisionMetrics,
  impactMetrics,
  fleetHealth,
  actions,
  onSelectVehicle
}) => {
  const [subTab, setSubTab] = useState<'decision' | 'maintenance' | 'faults' | 'impact' | 'humanReview'>('decision');

  const humanReviewActions = actions.filter((a) => a.requiresHumanReview && a.status === 'OPEN');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-6">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Fleet Intelligence Hub</h3>
            <p className="text-xs text-slate-400 font-medium">Decisions, AI-rule telemetry analytics, and operational impact</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setSubTab('decision')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              subTab === 'decision' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Decision Intelligence
          </button>
          <button
            onClick={() => setSubTab('humanReview')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
              subTab === 'humanReview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Human Review ({humanReviewActions.length})</span>
          </button>
          <button
            onClick={() => setSubTab('maintenance')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              subTab === 'maintenance' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Maintenance Intel
          </button>
          <button
            onClick={() => setSubTab('faults')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              subTab === 'faults' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fault Intelligence
          </button>
          <button
            onClick={() => setSubTab('impact')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              subTab === 'impact' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Impact Intelligence
          </button>
        </div>
      </div>

      {/* 1. DECISION INTELLIGENCE */}
      {subTab === 'decision' && decisionMetrics && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Rule Engine Directives</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">{decisionMetrics.ruleEngineCount}</span>
                <span className="text-xs text-blue-600 font-bold font-mono">({decisionMetrics.ruleEnginePct}%)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Deterministic authoritative safety rules</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Hybrid Validation</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">{decisionMetrics.hybridCount}</span>
                <span className="text-xs text-indigo-600 font-bold font-mono">({decisionMetrics.hybridPct}%)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Multi-signal rule + AI cross-check</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Jev AI Directives</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">{decisionMetrics.jevAiCount}</span>
                <span className="text-xs text-purple-600 font-bold font-mono">({decisionMetrics.jevAiPct}%)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Predictive servicing recommendations</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Rule Fallbacks</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-amber-600 font-mono">{decisionMetrics.fallbackCount}</span>
                <span className="text-xs text-amber-600 font-bold font-mono">({decisionMetrics.fallbackPct}%)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Safety fallback on AI timeout / unconfigured</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              VEHYRON Decision Authority Model
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              In VEHYRON, deterministic safety rules remain <strong className="text-slate-900">authoritative</strong>. If an external AI decision service (Jev AI) is unreachable, times out, or returns a confidence score below threshold (0.80), the platform automatically transitions to <code className="text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded font-mono font-bold">RULE_ENGINE_FALLBACK</code> and flags the item for operator review rather than failing the ingestion pipeline.
            </p>
          </div>
        </div>
      )}

      {/* 2. HUMAN REVIEW QUEUE */}
      {subTab === 'humanReview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Decisions flagged where confidence was below threshold or AI fallback executed.</span>
            <span className="font-mono text-purple-700 font-bold px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">
              {humanReviewActions.length} Pending Review
            </span>
          </div>

          {humanReviewActions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100 font-medium">
              No decisions currently require manual operator review. All decisions validated with high confidence.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {humanReviewActions.map((action) => (
                <div key={action.actionId} className="p-5 rounded-2xl bg-white border border-purple-200 shadow-card hover:shadow-card-hover space-y-2.5 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">{action.vehicleId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono font-bold">
                      Confidence: {Math.round(action.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{action.issue}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{action.recommendedAction}</p>
                  <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="font-medium">Source: {action.decisionSource}</span>
                    <span className="text-rose-600 font-bold font-mono">{formatCurrency(action.estimatedImpact)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. MAINTENANCE INTELLIGENCE */}
      {subTab === 'maintenance' && fleetHealth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-500" /> Preventative Maintenance
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-900">
              {fleetHealth.maintenanceDueCount}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Vehicles with engine oil life below 10% or scheduled service intervals due.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-500" /> Battery & EV Health
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-900">
              {fleetHealth.batteryWarningCount}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Electric & hybrid vehicle batteries exhibiting state-of-charge imbalance or degradation &lt;75%.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-purple-500" /> Idle Fuel Reduction
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-900">
              {fleetHealth.excessiveIdleCount}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Vehicles idling &gt;45 minutes incurring unnecessary fuel burn and engine run hours.
            </p>
          </div>
        </div>
      )}

      {/* 4. FAULT INTELLIGENCE */}
      {subTab === 'faults' && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Standard Diagnostic Trouble Codes (DTC) Reference Taxonomy
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Diagnostic Description</th>
                  <th className="p-3 text-right">Estimated Financial Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-slate-800">
                <tr>
                  <td className="p-3 font-mono text-rose-600 font-bold">P0300 / P0301</td>
                  <td className="p-3 text-xs text-slate-500 font-medium">Powertrain</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold">CRITICAL</span></td>
                  <td className="p-3 text-xs font-medium">Cylinder Misfire Detected — catastrophic engine failure risk</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹45,000</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-rose-600 font-bold">B1800 / U0100</td>
                  <td className="p-3 text-xs text-slate-500 font-medium">Safety & Comm</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold">CRITICAL</span></td>
                  <td className="p-3 text-xs font-medium">Driver Airbag Circuit Open / Lost ECM Communication</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹55,000</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-amber-600 font-bold">P0420</td>
                  <td className="p-3 text-xs text-slate-500 font-medium">Emissions</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">HIGH</span></td>
                  <td className="p-3 text-xs font-medium">Catalyst System Efficiency Below Threshold</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹35,000</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-sky-600 font-bold">BMS_028 / P0562</td>
                  <td className="p-3 text-xs text-slate-500 font-medium">Battery</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold">CRITICAL</span></td>
                  <td className="p-3 text-xs font-medium">EV High Voltage Cell Imbalance / System Voltage Low</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹75,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. IMPACT INTELLIGENCE */}
      {subTab === 'impact' && impactMetrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Total Monitored Risk</span>
              <span className="text-2xl font-extrabold font-mono text-amber-600">{formatCurrency(impactMetrics.totalEstimatedImpact)}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">All detected operational anomalies</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Open Action Risk</span>
              <span className="text-2xl font-extrabold font-mono text-rose-600">{formatCurrency(impactMetrics.openActionImpact)}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Unresolved maintenance/fault tasks</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Powertrain Fault Risk</span>
              <span className="text-2xl font-extrabold font-mono text-slate-900">{formatCurrency(impactMetrics.faultImpact)}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Engine, misfire, and sensor DTCs</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Wasted Idle Fuel</span>
              <span className="text-2xl font-extrabold font-mono text-purple-600">{formatCurrency(impactMetrics.idleFuelImpact)}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Unproductive idling fuel burn</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
