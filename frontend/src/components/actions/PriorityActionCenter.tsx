import React, { useState } from 'react';
import { AlertTriangle, Filter, CheckCircle2, UserCheck, ShieldAlert, Edit3 } from 'lucide-react';
import { ActionItem } from '../../types';
import { ActionStatusModal } from './ActionStatusModal';

interface PriorityActionCenterProps {
  actions: ActionItem[];
  onUpdateStatus: (actionId: string, status: string, notes: string) => Promise<void>;
  onSelectVehicle?: (vehicleId: string) => void;
}

export const PriorityActionCenter: React.FC<PriorityActionCenterProps> = ({
  actions,
  onUpdateStatus,
  onSelectVehicle
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [humanReviewOnly, setHumanReviewOnly] = useState<boolean>(false);

  const filtered = actions.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && a.priority !== priorityFilter) return false;
    if (humanReviewOnly && !a.requiresHumanReview) return false;
    return true;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white font-extrabold animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-semibold';
      default:
        return 'bg-slate-700 text-slate-300 font-medium';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'OPEN':
        return 'bg-sky-500/20 text-sky-400 border border-sky-500/40';
      case 'IN_PROGRESS':
        return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40';
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      case 'DISMISSED':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/60">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Priority Operational Action Center</h3>
            <p className="text-xs text-slate-400">Authoritative backend priority queue for fleet operations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => setHumanReviewOnly(!humanReviewOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              humanReviewOnly
                ? 'bg-purple-950 text-purple-300 border-purple-700'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Human Review Queue</span>
          </button>
        </div>
      </div>

      {/* Action Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Vehicle</th>
              <th className="py-3 px-3">Issue Detected</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Severity</th>
              <th className="py-3 px-3 text-right">Est. Impact</th>
              <th className="py-3 px-3">Recommended Operational Action</th>
              <th className="py-3 px-3">Decision Source</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-sans text-xs">
                  No actions matching selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((action) => (
                <tr key={action.actionId} className="hover:bg-slate-800/40 transition">
                  <td
                    className="py-3 px-3 font-semibold text-white cursor-pointer hover:text-sky-400 transition"
                    onClick={() => onSelectVehicle && onSelectVehicle(action.vehicleId)}
                  >
                    {action.vehicleId}
                  </td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span>{action.issue}</span>
                      {action.requiresHumanReview && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-800" title="Flagged for human operator review">
                          REVIEW
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getPriorityBadge(action.priority)}`}>
                      {action.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-400 font-sans">
                    {action.severity}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-200">
                    {action.estimatedImpact > 0 ? formatCurrency(action.estimatedImpact) : '—'}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300 max-w-sm truncate" title={action.recommendedAction}>
                    {action.recommendedAction}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {action.decisionSource || 'RULE_ENGINE'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(action.status)}`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedAction(action)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1 ml-auto transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Update</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedAction && (
        <ActionStatusModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onUpdate={onUpdateStatus}
        />
      )}
    </div>
  );
};
