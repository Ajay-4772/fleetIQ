import React, { useState } from 'react';
import { Radio, Filter, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';
import { DashboardEvent } from '../../types';

interface LiveOperationsPanelProps {
  events: DashboardEvent[];
  onClear: () => void;
  onSelectVehicle?: (vehicleId: string) => void;
}

export const LiveOperationsPanel: React.FC<LiveOperationsPanelProps> = ({ events, onClear, onSelectVehicle }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = events.filter((e) => {
    if (severityFilter !== 'ALL' && e.severity !== severityFilter) return false;
    if (sourceFilter !== 'ALL' && !e.source.includes(sourceFilter)) return false;
    if (searchQuery.trim() && !e.vehicleId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
  };

  const getSourceBadge = (source: string) => {
    if (source.includes('TOYOTA')) return 'text-red-700 border-red-200 bg-red-50';
    if (source.includes('FORD')) return 'text-blue-700 border-blue-200 bg-blue-50';
    if (source.includes('BMW')) return 'text-sky-700 border-sky-200 bg-sky-50';
    return 'text-purple-700 border-purple-200 bg-purple-50';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Live Telemetry & Event Stream</h3>
            <p className="text-xs text-slate-400 font-medium">Continuous normalized multi-OEM vehicle operational signals</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Search Vehicle ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs w-36 font-mono"
          />

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500"
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
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Sources</option>
            <option value="TOYOTA">Toyota</option>
            <option value="FORD">Ford</option>
            <option value="BMW">BMW</option>
            <option value="TESLA">Tesla EV</option>
          </select>

          <button
            onClick={onClear}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/80 transition"
            title="Clear Stream History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stream Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[460px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="py-3 px-3.5">Time</th>
              <th className="py-3 px-3.5">Vehicle</th>
              <th className="py-3 px-3.5">Source Adapter</th>
              <th className="py-3 px-3.5">Event Type</th>
              <th className="py-3 px-3.5">Severity</th>
              <th className="py-3 px-3.5">Operational Directive</th>
              <th className="py-3 px-3.5 text-right">Est. Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-sans text-xs">
                  Waiting for incoming vehicle events from simulator or OEM ingestion...
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 transition group cursor-pointer"
                  onClick={() => onSelectVehicle && onSelectVehicle(evt.vehicleId)}
                >
                  <td className="py-3 px-3.5 text-slate-400 text-[11px] whitespace-nowrap font-mono">
                    {evt.timestamp ? evt.timestamp.substring(11, 19) : '--:--:--'}
                  </td>
                  <td className="py-3 px-3.5 font-bold font-mono text-slate-900 group-hover:text-blue-600 transition">
                    {evt.vehicleId}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border font-bold ${getSourceBadge(evt.source)}`}>
                      {evt.source.replace('SIMULATED_', '')}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800">
                    {evt.eventType.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityBadge(evt.severity)}`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate font-medium" title={evt.recommendedAction}>
                    {evt.recommendedAction || 'Normal operational telemetry logged'}
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono">
                    {evt.estimatedImpact > 0 ? `₹${Math.round(evt.estimatedImpact).toLocaleString('en-IN')}` : '—'}
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
