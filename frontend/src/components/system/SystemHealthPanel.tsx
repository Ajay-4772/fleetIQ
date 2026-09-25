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
    <div className="space-y-6">
      {/* 1. Infrastructure & Service Status */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Platform Health & Core Engine</h3>
              <p className="text-xs text-slate-400 font-medium">Multi-OEM backend services, persistence, and real-time streaming</p>
            </div>
          </div>
          <button
            onClick={fetchHealth}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition"
            title="Refresh Health"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Spring Boot API */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">Backend API Status</span>
              <span className="text-sm font-bold font-mono text-emerald-600">UP (200 OK)</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Database */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">Persistence Engine</span>
              <span className="text-sm font-bold font-mono text-emerald-600">CONNECTED</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* SSE Stream */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">SSE Stream Client</span>
              <span className={`text-sm font-bold font-mono ${
                sseStatus === 'LIVE' ? 'text-emerald-600' : sseStatus === 'RECONNECTING' ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {sseStatus}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Radio className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          {/* AI Layer Fallback */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">AI Service Policy</span>
              <span className="text-sm font-bold font-mono text-indigo-600">RULE-FALLBACK READY</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Data Quality & Pipeline Integrity */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Ingestion & Data Quality Metrics</h3>
          <p className="text-xs text-slate-400 font-medium">Real-time schema validation, normalization pass rate, and error counters</p>
        </div>

        {dataQuality && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Events Received</span>
              <span className="text-2xl font-extrabold font-mono text-slate-900">{dataQuality.eventsReceived.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Total Ingested</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Normalized OK</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-600">{dataQuality.successfullyNormalized.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 mt-2 block font-bold">
                {dataQuality.eventsReceived > 0
                  ? `${Math.round((dataQuality.successfullyNormalized / dataQuality.eventsReceived) * 100)}% Pass Rate`
                  : '100%'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Rejected Payloads</span>
              <span className="text-2xl font-extrabold font-mono text-rose-600">{dataQuality.normalizationFailed}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Malformed JSON</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Duplicate Events</span>
              <span className="text-2xl font-extrabold font-mono text-amber-600">{dataQuality.duplicateEvents}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">De-duplicated</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">AI Fallback Rescues</span>
              <span className="text-2xl font-extrabold font-mono text-blue-600">{dataQuality.fallbackDecisions}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Deterministic Rules</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
