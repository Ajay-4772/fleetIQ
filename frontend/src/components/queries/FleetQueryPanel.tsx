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
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Controlled Fleet Query Engine</h3>
          <p className="text-xs text-slate-400 font-medium">Strictly typed operational intent execution without hallucinations</p>
        </div>
      </div>

      {/* Intent Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {supportedIntents.map((item) => {
          const isSelected = selectedIntent === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedIntent(item.id)}
              className={`p-4 rounded-2xl border text-left transition ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-500'
                  : 'border-slate-200/80 bg-slate-50/60 text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs">{item.label}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Query Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-inner">
          <CornerDownRight className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-slate-500 font-mono">POST /api/fleet/query</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-blue-700 font-bold truncate">{selectedIntent}</span>
        </div>

        {selectedIntent === 'VEHICLE_HEALTH' && (
          <input
            type="text"
            placeholder="Vehicle ID (Optional)..."
            value={vehicleIdParam}
            onChange={(e) => setVehicleIdParam(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-44 font-mono shadow-inner"
          />
        )}

        <button
          onClick={handleRunQuery}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Executing...' : 'Run Query'}</span>
        </button>
      </div>

      {/* Results View */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {response && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Structured Query Response</span>
              <p className="text-xs font-bold text-blue-700 mt-0.5">{response.summary}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-800 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
                {response.resultCount} records
              </span>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white">
            <pre className="p-4 text-[11px] font-mono text-slate-700 overflow-x-auto leading-relaxed">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
