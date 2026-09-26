import React, { useState, useEffect } from 'react';
import { Activity, Radio, RefreshCw, CheckCircle2, AlertOctagon, XCircle } from 'lucide-react';
import { IngestionThroughput } from '../../types';
import { api } from '../../services/api';

interface IngestionThroughputChartProps {
  throughput?: IngestionThroughput | null;
  onRefresh?: () => void;
}

export const IngestionThroughputChart: React.FC<IngestionThroughputChartProps> = ({
  throughput: propThroughput,
  onRefresh
}) => {
  const [data, setData] = useState<IngestionThroughput | null>(propThroughput || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (propThroughput !== undefined) {
      setData(propThroughput);
    }
  }, [propThroughput]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getIngestionThroughput();
      setData(res);
      if (onRefresh) onRefresh();
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propThroughput === undefined) {
      loadData();
      const interval = setInterval(loadData, 10000); // 10s auto refresh for throughput
      return () => clearInterval(interval);
    }
  }, [propThroughput]);

  const hasData = data?.hasData && data.points && data.points.length > 0 && (data.eventsReceived > 0);

  // SVG Area rendering for Received vs Processed
  const points = data?.points || [];
  const maxVal = Math.max(1, ...points.map(p => Math.max(p.received, p.processed, p.rejected)));

  const svgWidth = 650;
  const svgHeight = 140;

  const getX = (idx: number) => {
    if (points.length <= 1) return svgWidth / 2;
    return Math.round((idx / (points.length - 1)) * (svgWidth - 40) + 20);
  };

  const getY = (val: number) => {
    return Math.round(svgHeight - 20 - (val / maxVal) * (svgHeight - 40));
  };

  const pathReceived = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.received)}`).join(' ');
  const areaReceived = points.length > 0 ? `${pathReceived} L ${getX(points.length - 1)} ${svgHeight - 15} L ${getX(0)} ${svgHeight - 15} Z` : '';

  const pathProcessed = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.processed)}`).join(' ');

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Real-Time Ingestion Throughput
            </span>
            {data?.freshnessStatus === 'LIVE' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                OFFLINE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Incoming multi-OEM payload ingestion, schema normalization throughput & drop rates
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-600 font-medium">Received: <b className="text-slate-900 font-mono">{data?.eventsReceived || 0}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Processed: <b className="text-slate-900 font-mono">{data?.eventsProcessed || 0}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">Rejected: <b className="text-slate-900 font-mono">{data?.eventsRejected || 0}</b></span>
          </div>
        </div>
      </div>

      {/* Chart Canvas vs Clean Empty State */}
      {!hasData ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No telemetry ingestion activity yet.</p>
          <p className="text-[11px] text-slate-400 max-w-sm">
            Connect an external data source (Kafka, MQTT, REST, Webhook) or upload an Excel/CSV dataset to stream live telematics.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-40 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="ingestArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="30" x2={svgWidth - 20} y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="20" y1="80" x2={svgWidth - 20} y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="20" y1={svgHeight - 15} x2={svgWidth - 20} y2={svgHeight - 15} stroke="#f1f5f9" />

              {/* Area */}
              {areaReceived && <path d={areaReceived} fill="url(#ingestArea)" />}

              {/* Lines */}
              {pathReceived && <path d={pathReceived} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />}
              {pathProcessed && <path d={pathProcessed} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />}

              {/* Dots */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={getX(idx)} cy={getY(p.received)} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <circle cx={getX(idx)} cy={getY(p.processed)} r="3" fill="#10b981" />
                </g>
              ))}
            </svg>
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-[11px] font-mono font-semibold text-slate-400 px-4">
            {points.map((p, idx) => (
              <span key={idx}>{p.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* KPI Footer Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ingestion Rate</span>
          <span className="text-sm font-extrabold text-slate-900 font-mono">
            {hasData ? `${data?.processingRate} ev/min` : '—'}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Processing Latency</span>
          <span className="text-sm font-extrabold text-slate-900 font-mono">
            {hasData ? `${data?.processingLatencyMs} ms` : '—'}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Ingested</span>
          <span className="text-sm font-extrabold text-slate-900 font-mono">
            {hasData ? data?.eventsReceived.toLocaleString() : '0'}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Success</span>
          <span className="text-sm font-extrabold text-emerald-600 font-mono">
            {hasData && data && data.eventsReceived > 0
              ? `${Math.round((data.eventsProcessed / data.eventsReceived) * 100)}%`
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
