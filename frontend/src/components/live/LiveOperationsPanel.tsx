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
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getSourceBadge = (source: string) => {
    if (source.includes('TOYOTA')) return 'text-red-400 border-red-800/60 bg-red-950/40';
    if (source.includes('FORD')) return 'text-blue-400 border-blue-800/60 bg-blue-950/40';
    if (source.includes('BMW')) return 'text-cyan-400 border-cyan-800/60 bg-cyan-950/40';
    return 'text-purple-400 border-purple-800/60 bg-purple-950/40';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Telemetry & Event Stream</h3>
            <p className="text-xs text-slate-400">Continuous normalized multi-OEM vehicle operational signals</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Search Vehicle ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs w-36 font-mono"
          />

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-500"
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
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Sources</option>
            <option value="TOYOTA">Toyota</option>
            <option value="FORD">Ford</option>
            <option value="BMW">BMW</option>
            <option value="TESLA">Tesla EV</option>
          </select>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            title="Clear Stream History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stream Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-[460px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Vehicle</th>
              <th className="py-2.5 px-3">Source Adapter</th>
              <th className="py-2.5 px-3">Event Type</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Recommended Operational Action</th>
              <th className="py-2.5 px-3 text-right">Est. Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans text-xs">
                  Waiting for incoming vehicle events from simulator or OEM ingestion...
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => onSelectVehicle && onSelectVehicle(evt.vehicleId)}
                >
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {evt.timestamp ? evt.timestamp.substring(11, 19) : '--:--:--'}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white group-hover:text-sky-400 transition">
                    {evt.vehicleId}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getSourceBadge(evt.source)}`}>
                      {evt.source.replace('SIMULATED_', '')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                    {evt.eventType.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getSeverityBadge(evt.severity)}`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 max-w-xs truncate" title={evt.recommendedAction}>
                    {evt.recommendedAction || 'Normal operational telemetry logged'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-200">
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
