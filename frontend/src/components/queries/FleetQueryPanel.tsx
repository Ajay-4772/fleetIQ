import React, { useState } from 'react';
import { Search, Play, CheckCircle2, AlertCircle, FileText, CornerDownRight } from 'lucide-react';
import { FleetQueryResponse } from '../../types';
import { api } from '../../services/api';

export const FleetQueryPanel: React.FC = () => {
  const [selectedIntent, setSelectedIntent] = useState<string>('MAINTENANCE_REQUIRED');
  const [vehicleIdParam, setVehicleIdParam] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<FleetQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supportedIntents = [
    { id: 'MAINTENANCE_REQUIRED', label: 'Maintenance Required', desc: 'Vehicles with oil life <= 10% or in maintenance' },
    { id: 'HIGH_RISK_VEHICLES', label: 'High Risk Vehicles', desc: 'Assets exhibiting critical faults or severe battery degradation' },
    { id: 'TOP_PRIORITY_ACTIONS', label: 'Top Priority Actions', desc: 'Unresolved CRITICAL and HIGH priority operational work orders' },
    { id: 'ENGINE_FAULTS', label: 'Engine DTC Faults', desc: 'Recent diagnostic trouble code events across fleet' },
    { id: 'BATTERY_WARNINGS', label: 'Battery Warnings', desc: 'Electric & hybrid vehicles with state-of-charge or cell warnings' },
    { id: 'EXCESSIVE_IDLE', label: 'Excessive Idling', desc: 'Vehicles exceeding operational idle duration benchmark' },
    { id: 'LOW_UTILIZATION', label: 'Low Utilization Assets', desc: 'Inactive or low mileage vehicles ready for reallocation' },
    { id: 'HIGH_UTILIZATION', label: 'Highest Utilized Assets', desc: 'Top 10 highest-mileage fleet workhorses' },
    { id: 'VEHICLE_HEALTH', label: 'Vehicle Health Catalog', desc: 'Complete health telemetry summary across fleet' }
  ];

  const handleRunQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (vehicleIdParam.trim()) {
        params.vehicleId = vehicleIdParam.trim();
      }
      const res = await api.runFleetQuery(selectedIntent, params);
      setResponse(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60">
          <Search className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Controlled Fleet Query Engine</h3>
          <p className="text-xs text-slate-400">Strictly typed operational intent execution without open-ended LLM hallucinations</p>
        </div>
      </div>

      {/* Intent Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {supportedIntents.map((item) => {
          const isSelected = selectedIntent === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedIntent(item.id)}
              className={`p-3 rounded-xl border text-left transition ${
                isSelected
                  ? 'border-sky-500 bg-sky-950/40 text-white shadow-sm ring-1 ring-sky-500/50'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">{item.label}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Query Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <CornerDownRight className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-slate-400 font-mono">POST /api/fleet/query</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-sky-300 font-bold truncate">{selectedIntent}</span>
        </div>

        {selectedIntent === 'VEHICLE_HEALTH' && (
          <input
            type="text"
            placeholder="Vehicle ID (Optional)..."
            value={vehicleIdParam}
            onChange={(e) => setVehicleIdParam(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-44 font-mono"
          />
        )}

        <button
          onClick={handleRunQuery}
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Executing...' : 'Run Query'}</span>
        </button>
      </div>

      {/* Results View */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {response && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Structured Query Response</span>
              <p className="text-xs font-semibold text-sky-300 mt-0.5">{response.summary}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                {response.resultCount} records
              </span>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800/80">
            <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto bg-slate-950/90 leading-relaxed">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
