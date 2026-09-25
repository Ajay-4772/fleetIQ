import React, { useState } from 'react';
import { Radio, RotateCcw, Search, ShieldAlert, Cpu } from 'lucide-react';
import { DashboardEvent } from '../../types';

interface LiveOperationsPanelProps {
  events: DashboardEvent[];
  onClear: () => void;
  onSelectVehicle?: (vehicleId: string) => void;
  isLoading?: boolean;
}

export const LiveOperationsPanel: React.FC<LiveOperationsPanelProps> = ({
  events,
  onClear,
  onSelectVehicle,
  isLoading = false
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = events.filter((e) => {
    if (severityFilter !== 'ALL' && e.severity !== severityFilter) return false;
    if (sourceFilter !== 'ALL' && !e.source.toLowerCase().includes(sourceFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchVehicle = e.vehicleId && e.vehicleId.toLowerCase().includes(q);
      const matchType = e.eventType && e.eventType.toLowerCase().includes(q);
      const matchSource = e.source && e.source.toLowerCase().includes(q);
      const matchSev = e.severity && e.severity.toLowerCase().includes(q);
      const matchAction = e.recommendedAction && e.recommendedAction.toLowerCase().includes(q);
      if (!matchVehicle && !matchType && !matchSource && !matchSev && !matchAction) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white font-bold';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border border-amber-200 font-bold';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200 font-semibold';
      default:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
    }
  };

  const getSourceBadge = (source: string) => {
    const s = source.toUpperCase();
    if (s.includes('TOYOTA')) return 'text-red-700 border-red-200 bg-red-50';
    if (s.includes('FORD')) return 'text-blue-700 border-blue-200 bg-blue-50';
    if (s.includes('BMW')) return 'text-sky-700 border-sky-200 bg-sky-50';
    if (s.includes('TESLA')) return 'text-purple-700 border-purple-200 bg-purple-50';
    return 'text-slate-700 border-slate-200 bg-slate-50';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4 font-sans">
      {/* Stream Header & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Radio className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Live Operations Telemetry</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Real-time normalized vehicle signals and active diagnostic events</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search VIN, DTC, OEM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs w-44 font-sans"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All OEM Sources</option>
            <option value="TOYOTA">Toyota</option>
            <option value="FORD">Ford</option>
            <option value="BMW">BMW</option>
            <option value="TESLA">Tesla</option>
          </select>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/80 transition"
            title="Clear Stream History"
            aria-label="Clear Stream History"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Stream Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200/80 max-h-[480px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold sticky top-0 z-10 border-b border-slate-200/80">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Vehicle</th>
              <th className="py-2.5 px-3">OEM Adapter</th>
              <th className="py-2.5 px-3">Event Type</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Operational Directive</th>
              <th className="py-2.5 px-3 text-right">Est. Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-sans text-xs">
                  {isLoading ? 'Hydrating real-time telemetry stream...' : 'No live telemetry events currently match selected filters.'}
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt, idx) => (
                <tr
                  key={evt.eventId || idx}
                  className="hover:bg-slate-50 transition group cursor-pointer"
                  onClick={() => onSelectVehicle && onSelectVehicle(evt.vehicleId)}
                >
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap font-mono">
                    {evt.timestamp ? evt.timestamp.substring(11, 19) : '--:--:--'}
                  </td>
                  <td className="py-2.5 px-3 font-bold font-mono text-slate-900 group-hover:text-blue-600 transition">
                    {evt.vehicleId}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${getSourceBadge(evt.source)}`}>
                      {evt.source.replace('SIMULATED_', '')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {evt.eventType.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${getSeverityBadge(evt.severity)}`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate font-normal" title={evt.recommendedAction}>
                    {evt.recommendedAction || 'Normal operational telemetry logged'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                    {evt.estimatedImpact && evt.estimatedImpact > 0 ? `₹${Math.round(evt.estimatedImpact).toLocaleString('en-IN')}` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
