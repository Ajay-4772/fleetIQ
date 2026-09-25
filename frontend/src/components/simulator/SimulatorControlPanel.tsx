import React, { useState } from 'react';
import { Sliders, Zap, Play, Gauge, CheckCircle2, AlertOctagon, Wrench, Clock, Shuffle } from 'lucide-react';
import { api } from '../../services/api';
import { SimulatorResponse, LoadTestResponse } from '../../types';

interface SimulatorControlPanelProps {
  onScenarioExecuted?: () => void;
}

export const SimulatorControlPanel: React.FC<SimulatorControlPanelProps> = ({ onScenarioExecuted }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('mixed_fleet');
  const [seed, setSeed] = useState<number>(20260925);
  const [eventCount, setEventCount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimulatorResponse | null>(null);

  // Load test state
  const [loadLevel, setLoadLevel] = useState<number>(1000);
  const [loadTesting, setLoadTesting] = useState<boolean>(false);
  const [loadResult, setLoadResult] = useState<LoadTestResponse | null>(null);

  const scenarios = [
    {
      id: 'mixed_fleet',
      name: 'Scenario E: Mixed Fleet (Primary Demo)',
      desc: 'Balanced realistic distribution of normal driving, critical powertrain DTCs, overdue maintenance, battery alerts, and excessive idle.',
      icon: Shuffle,
      color: 'border-blue-200 bg-blue-50/60',
      iconColor: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'critical_faults',
      name: 'Scenario C: Critical Engine Faults',
      desc: 'Simulates a surge of powertrain misfires (P0300, P0301) and safety-critical open circuits triggering urgent grounding actions.',
      icon: AlertOctagon,
      color: 'border-rose-200 bg-rose-50/60',
      iconColor: 'text-rose-600 bg-rose-100'
    },
    {
      id: 'maintenance_spike',
      name: 'Scenario B: Maintenance Spike',
      desc: 'Simulates 30+ vehicles simultaneously reaching critical oil life degradation (< 10%) or overdue service thresholds.',
      icon: Wrench,
      color: 'border-amber-200 bg-amber-50/60',
      iconColor: 'text-amber-600 bg-amber-100'
    },
    {
      id: 'excessive_idle',
      name: 'Scenario D: Excessive Idling Fleet',
      desc: 'Widespread abnormal idling (> 60 mins) incurring severe fuel burn and carbon footprint anomalies.',
      icon: Clock,
      color: 'border-purple-200 bg-purple-50/60',
      iconColor: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'healthy_fleet',
      name: 'Scenario A: Healthy Fleet Nominal',
      desc: 'Smooth nominal operation with high oil life, balanced battery state of charge, and low idle durations.',
      icon: CheckCircle2,
      color: 'border-emerald-200 bg-emerald-50/60',
      iconColor: 'text-emerald-600 bg-emerald-100'
    }
  ];

  const handleExecuteScenario = async (scenarioId: string) => {
    setLoading(true);
    setSimResult(null);
    try {
      const res = await api.runScenario(scenarioId, {
        seed,
        eventCount
      });
      setSimResult(res);
      if (onScenarioExecuted) onScenarioExecuted();
    } catch (err: any) {
      alert('Error triggering scenario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteLoadTest = async () => {
    setLoadTesting(true);
    setLoadResult(null);
    try {
      const res = await api.runLoadTest(loadLevel, seed);
      setLoadResult(res);
      if (onScenarioExecuted) onScenarioExecuted();
    } catch (err: any) {
      alert('Error running load test: ' + err.message);
    } finally {
      setLoadTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Predefined Scenario Injection */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Deterministic Demonstration Scenarios</h3>
              <p className="text-xs text-slate-400 font-medium">Inject reproducible multi-OEM telemetry scenarios into VEHYRON</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 font-medium">Seed:</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 w-28 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-inner"
            />
            <label className="text-slate-500 font-medium ml-2">Count:</label>
            <input
              type="number"
              value={eventCount}
              onChange={(e) => setEventCount(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 w-20 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition hover:shadow-md ${sc.color}`}
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`p-1.5 rounded-xl ${sc.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-slate-900">{sc.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-5 font-medium">{sc.desc}</p>
                </div>

                <button
                  onClick={() => handleExecuteScenario(sc.id)}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200/80 shadow-2xs transition disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current text-blue-600" />
                  <span>{loading ? 'Simulating...' : 'Inject Scenario'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {simResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <div>
              <span className="font-bold uppercase tracking-wider block">Simulation Complete</span>
              <span className="font-medium">{simResult.message}</span>
            </div>
            <div className="flex gap-4 font-mono font-bold">
              <span>Normalized: {simResult.normalizedCount}</span>
              <span>Actions: {simResult.actionsCreated}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Scaled Load Testing & Benchmarking */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 shadow-2xs">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Telemetry Load Testing & Latency Benchmarks</h3>
            <p className="text-xs text-slate-400 font-medium">Validate high-throughput multi-OEM normalization & decision latency</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {[100, 1000, 10000].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLoadLevel(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                loadLevel === lvl
                  ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500 shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Level {lvl === 100 ? '1' : lvl === 1000 ? '2' : '3'}: {lvl.toLocaleString()} Events
            </button>
          ))}

          <button
            onClick={handleExecuteLoadTest}
            disabled={loadTesting}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loadTesting ? 'Benchmarking Engine...' : 'Run Load Benchmark'}</span>
          </button>
        </div>

        {loadResult && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider font-mono">
                Benchmark Results — {loadResult.eventsGenerated.toLocaleString()} Events Ingested
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Total Runtime: <strong className="text-slate-900">{loadResult.totalProcessingTimeMs}ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Average Latency</span>
                <span className="text-lg font-bold text-slate-900">{loadResult.avgLatencyMs} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">P95 Latency</span>
                <span className="text-lg font-bold text-blue-600">{loadResult.p95LatencyMs} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">P99 Latency</span>
                <span className="text-lg font-bold text-amber-600">{loadResult.p99LatencyMs} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Decisions Generated</span>
                <span className="text-lg font-bold text-emerald-600">{loadResult.decisionsGenerated.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
