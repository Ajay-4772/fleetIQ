import React, { useState } from 'react';
import { X, CheckCircle, Clock, Ban, AlertCircle } from 'lucide-react';
import { ActionItem } from '../../types';

interface ActionStatusModalProps {
  action: ActionItem | null;
  onClose: () => void;
  onUpdate: (actionId: string, status: string, notes: string) => Promise<void>;
}

export const ActionStatusModal: React.FC<ActionStatusModalProps> = ({ action, onClose, onUpdate }) => {
  if (!action) return null;

  const [status, setStatus] = useState<string>(action.status);
  const [notes, setNotes] = useState<string>(action.notes || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onUpdate(action.actionId, status, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update action');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'OPEN', label: 'Open', desc: 'Awaiting operator review or dispatch', icon: AlertCircle, color: 'border-sky-500 text-sky-400 bg-sky-950/40' },
    { value: 'IN_PROGRESS', label: 'In Progress', desc: 'Work order dispatched to service technician', icon: Clock, color: 'border-indigo-500 text-indigo-400 bg-indigo-950/40' },
    { value: 'RESOLVED', label: 'Resolved', desc: 'Maintenance completed & telemetry verified', icon: CheckCircle, color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40' },
    { value: 'DISMISSED', label: 'Dismissed', desc: 'Operator reviewed and dismissed as false anomaly', icon: Ban, color: 'border-slate-500 text-slate-400 bg-slate-900/60' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Update Operational Action</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{action.actionId} • {action.vehicleId}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Issue Detected
            </label>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
              {action.issue}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Lifecycle Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      isSelected
                        ? opt.color + ' ring-1 ring-offset-1 ring-offset-slate-900'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-bold text-xs">{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Operator Notes / Technician Log
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Work order WO-4402 assigned to bay 3 for coil pack replacement..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
