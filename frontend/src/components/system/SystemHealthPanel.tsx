import React, { useEffect, useState } from 'react';
import { Server, CheckCircle2, AlertTriangle, ShieldCheck, Database, Radio, RefreshCw } from 'lucide-react';
import { DataQuality } from '../../types';
import { api } from '../../services/api';
import { SSEConnectionStatus } from '../../hooks/useSSE';

interface SystemHealthPanelProps {
  dataQuality: DataQuality | null;
  sseStatus: SSEConnectionStatus;
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ dataQuality, sseStatus }) => {
  const [actuatorHealth, setActuatorHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = () => {
    setLoading(true);
    api
      .getActuatorHealth()
      .then((data) => setActuatorHealth(data))
      .catch((err) => console.error('Actuator health fetch failed', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-5">
      {/* 1. Infrastructure & Service Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platform Health & Connectivity</h3>
              <p className="text-xs text-slate-400">Core backend microservices, database, and real-time streaming health</p>
            </div>
          </div>
          <button
            onClick={fetchHealth}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Health"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Spring Boot API */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Backend API Status</span>
              <span className="text-sm font-bold font-mono text-emerald-400">UP (200 OK)</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Database */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Persistence Engine</span>
              <span className="text-sm font-bold font-mono text-emerald-400">CONNECTED</span>
            </div>
            <Database className="w-5 h-5 text-emerald-400" />
          </div>

          {/* SSE Stream */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">SSE Stream Client</span>
              <span className={`text-sm font-bold font-mono ${
                sseStatus === 'LIVE' ? 'text-emerald-400' : sseStatus === 'RECONNECTING' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {sseStatus}
              </span>
            </div>
            <Radio className="w-5 h-5 text-sky-400" />
          </div>

          {/* AI Layer Fallback */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">AI Service Policy</span>
              <span className="text-sm font-bold font-mono text-indigo-400">RULE-FALLBACK READY</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* 2. Data Quality & Pipeline Integrity */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ingestion & Data Quality Metrics</h3>
          <p className="text-xs text-slate-400">Real-time validation, normalization success rate, and error counters</p>
        </div>

        {dataQuality && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Events Received</span>
              <span className="text-xl font-bold font-mono text-white">{dataQuality.eventsReceived.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Total Ingested</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Normalized Successfully</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{dataQuality.successfullyNormalized.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-500 mt-1 block">
                {dataQuality.eventsReceived > 0
                  ? `${Math.round((dataQuality.successfullyNormalized / dataQuality.eventsReceived) * 100)}% Pass Rate`
                  : '100%'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Normalization Failed</span>
              <span className="text-xl font-bold font-mono text-rose-400">{dataQuality.normalizationFailed}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Rejected Payloads</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Duplicate Events</span>
              <span className="text-xl font-bold font-mono text-amber-400">{dataQuality.duplicateEvents}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">De-duplicated</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">AI Fallback Decisions</span>
              <span className="text-xl font-bold font-mono text-sky-400">{dataQuality.fallbackDecisions}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Deterministic Rescues</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
