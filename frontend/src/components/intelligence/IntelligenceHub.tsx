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
  IndianRupee
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fleet Intelligence Hub</h3>
            <p className="text-xs text-slate-400">Decisions, AI-rule telemetry analytics, and impact breakdown</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('decision')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              subTab === 'decision' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Decision Intelligence
          </button>
          <button
            onClick={() => setSubTab('humanReview')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              subTab === 'humanReview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Human Review ({humanReviewActions.length})</span>
          </button>
          <button
            onClick={() => setSubTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              subTab === 'maintenance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Maintenance Intel
          </button>
          <button
            onClick={() => setSubTab('faults')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              subTab === 'faults' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fault Intelligence
          </button>
          <button
            onClick={() => setSubTab('impact')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              subTab === 'impact' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Impact Intelligence
          </button>
        </div>
      </div>

      {/* 1. DECISION INTELLIGENCE */}
      {subTab === 'decision' && decisionMetrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Rule Engine Directives</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">{decisionMetrics.ruleEngineCount}</span>
                <span className="text-xs text-sky-400 font-semibold font-mono">({decisionMetrics.ruleEnginePct}%)</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Deterministic authoritative safety rules</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Hybrid Validation</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">{decisionMetrics.hybridCount}</span>
                <span className="text-xs text-indigo-400 font-semibold font-mono">({decisionMetrics.hybridPct}%)</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Multi-signal rule + AI verification</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Jev AI Model Directives</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">{decisionMetrics.jevAiCount}</span>
                <span className="text-xs text-purple-400 font-semibold font-mono">({decisionMetrics.jevAiPct}%)</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Predictive servicing recommendations</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Rule Engine Fallbacks</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-amber-400 font-mono">{decisionMetrics.fallbackCount}</span>
                <span className="text-xs text-amber-400 font-semibold font-mono">({decisionMetrics.fallbackPct}%)</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Triggered on AI timeout / unconfigured</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              FleetIQ Decision Authority Model
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              In FleetIQ, deterministic safety rules remain <strong>authoritative</strong>. If an external AI decision service (Jev AI) is unreachable, times out, or returns a confidence score below the threshold (0.80), the platform automatically transitions to <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">RULE_ENGINE_FALLBACK</code> and flags the item for operator review rather than failing the ingestion pipeline.
            </p>
          </div>
        </div>
      )}

      {/* 2. HUMAN REVIEW QUEUE */}
      {subTab === 'humanReview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Decisions flagged where confidence was below threshold or AI fallback executed.</span>
            <span className="font-mono text-purple-400 font-bold">{humanReviewActions.length} Pending Review</span>
          </div>

          {humanReviewActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
              No decisions currently require manual operator review. All decisions validated with high confidence.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {humanReviewActions.map((action) => (
                <div key={action.actionId} className="p-4 rounded-xl bg-slate-950 border border-purple-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">{action.vehicleId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                      Conf: {Math.round(action.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">{action.issue}</p>
                  <p className="text-[11px] text-slate-400">{action.recommendedAction}</p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Source: {action.decisionSource}</span>
                    <span className="text-rose-400 font-semibold">{formatCurrency(action.estimatedImpact)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. MAINTENANCE INTELLIGENCE */}
      {subTab === 'maintenance' && fleetHealth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-400" /> Preventative Maintenance
            </span>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {fleetHealth.maintenanceDueCount}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vehicles with engine oil life below 10% or scheduled service intervals due.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-sky-400" /> Battery & EV Health
            </span>
            <div className="text-2xl font-bold font-mono text-sky-400">
              {fleetHealth.batteryWarningCount}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Electric & hybrid vehicle batteries exhibiting state-of-charge imbalance or degradation &lt;75%.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-purple-400" /> Idle Fuel Reduction
            </span>
            <div className="text-2xl font-bold font-mono text-purple-400">
              {fleetHealth.excessiveIdleCount}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vehicles idling &gt;45 minutes incurring unnecessary fuel burn and engine run hours.
            </p>
          </div>
        </div>
      )}

      {/* 4. FAULT INTELLIGENCE */}
      {subTab === 'faults' && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Standard Diagnostic Trouble Codes (DTC) Reference Taxonomy
          </h4>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Code</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">Diagnostic Description</th>
                  <th className="p-2.5 text-right">Estimated Financial Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-slate-200">
                <tr>
                  <td className="p-2.5 font-mono text-rose-400 font-bold">P0300 / P0301</td>
                  <td className="p-2.5 text-xs text-slate-400">Powertrain</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">CRITICAL</span></td>
                  <td className="p-2.5 text-xs">Cylinder Misfire Detected — catastrophic engine failure risk</td>
                  <td className="p-2.5 text-right font-mono font-bold">₹45,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-rose-400 font-bold">B1800 / U0100</td>
                  <td className="p-2.5 text-xs text-slate-400">Safety & Comm</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">CRITICAL</span></td>
                  <td className="p-2.5 text-xs">Driver Airbag Circuit Open / Lost ECM Communication</td>
                  <td className="p-2.5 text-right font-mono font-bold">₹55,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-amber-400 font-bold">P0420</td>
                  <td className="p-2.5 text-xs text-slate-400">Emissions</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold">HIGH</span></td>
                  <td className="p-2.5 text-xs">Catalyst System Efficiency Below Threshold</td>
                  <td className="p-2.5 text-right font-mono font-bold">₹35,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-sky-400 font-bold">BMS_028 / P0562</td>
                  <td className="p-2.5 text-xs text-slate-400">Battery</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">CRITICAL</span></td>
                  <td className="p-2.5 text-xs">EV High Voltage Cell Imbalance / System Voltage Low</td>
                  <td className="p-2.5 text-right font-mono font-bold">₹75,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. IMPACT INTELLIGENCE */}
      {subTab === 'impact' && impactMetrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Total Monitored Risk</span>
              <span className="text-xl font-bold font-mono text-amber-400">{formatCurrency(impactMetrics.totalEstimatedImpact)}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">All detected operational anomalies</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Open Action Risk</span>
              <span className="text-xl font-bold font-mono text-rose-400">{formatCurrency(impactMetrics.openActionImpact)}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Unresolved maintenance/fault tasks</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Powertrain Fault Risk</span>
              <span className="text-xl font-bold font-mono text-slate-200">{formatCurrency(impactMetrics.faultImpact)}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Engine, misfire, and sensor DTCs</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Wasted Idle Fuel</span>
              <span className="text-xl font-bold font-mono text-purple-400">{formatCurrency(impactMetrics.idleFuelImpact)}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Unproductive idling fuel burn</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
