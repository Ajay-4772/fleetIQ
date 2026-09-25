import React, { useState } from 'react';
import { AlertTriangle, Filter, CheckCircle2, UserCheck, ShieldAlert, Edit3, ArrowRight } from 'lucide-react';
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
        return 'bg-rose-50 text-rose-700 border border-rose-200 font-extrabold';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border border-amber-200 font-bold';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'OPEN':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'DISMISSED':
        return 'bg-slate-100 text-slate-500 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
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
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Priority Operational Action Center</h3>
            <p className="text-xs text-slate-400 font-medium">Authoritative dispatch & mitigation decision queue</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500 transition"
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
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500 transition"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => setHumanReviewOnly(!humanReviewOnly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              humanReviewOnly
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Human Review Queue</span>
          </button>
        </div>
      </div>

      {/* Action Table (Shopeers Table Style) */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-100">
            <tr>
              <th className="py-3 px-3.5">Vehicle</th>
              <th className="py-3 px-3.5">Issue Detected</th>
              <th className="py-3 px-3.5">Priority</th>
              <th className="py-3 px-3.5">Severity</th>
              <th className="py-3 px-3.5 text-right">Est. Impact</th>
              <th className="py-3 px-3.5">Recommended Operational Action</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5 text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400 text-xs font-medium">
                  No actions matching selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((action) => (
                <tr key={action.actionId} className="hover:bg-slate-50/80 transition group">
                  <td
                    className="py-3 px-3.5 font-bold font-mono text-slate-900 cursor-pointer group-hover:text-blue-600 transition"
                    onClick={() => onSelectVehicle && onSelectVehicle(action.vehicleId)}
                  >
                    {action.vehicleId}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span>{action.issue}</span>
                      {action.requiresHumanReview && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-purple-50 text-purple-700 border border-purple-200 font-bold" title="Flagged for human operator review">
                          REVIEW
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${getPriorityBadge(action.priority)}`}>
                      {action.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 font-medium">
                    {action.severity}
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono">
                    {action.estimatedImpact > 0 ? formatCurrency(action.estimatedImpact) : '—'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 max-w-sm truncate font-medium" title={action.recommendedAction}>
                    {action.recommendedAction}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(action.status)}`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedAction(action)}
                      className="px-3 py-1 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold flex items-center gap-1.5 ml-auto transition shadow-2xs"
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
