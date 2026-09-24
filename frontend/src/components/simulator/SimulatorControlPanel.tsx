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
      color: 'border-sky-500 bg-sky-950/30'
    },
    {
      id: 'critical_faults',
      name: 'Scenario C: Critical Engine Faults',
      desc: 'Simulates a surge of powertrain misfires (P0300, P0301) and safety-critical open circuits triggering urgent grounding actions.',
      icon: AlertOctagon,
      color: 'border-rose-500 bg-rose-950/30'
    },
    {
      id: 'maintenance_spike',
      name: 'Scenario B: Maintenance Spike',
      desc: 'Simulates 30+ vehicles simultaneously reaching critical oil life degradation (< 10%) or overdue service thresholds.',
      icon: Wrench,
      color: 'border-amber-500 bg-amber-950/30'
    },
    {
      id: 'excessive_idle',
      name: 'Scenario D: Excessive Idling Fleet',
      desc: 'Widespread abnormal idling (> 60 mins) incurring severe fuel burn and carbon footprint anomalies.',
      icon: Clock,
      color: 'border-purple-500 bg-purple-950/30'
    },
    {
      id: 'healthy_fleet',
      name: 'Scenario A: Healthy Fleet Nominal',
      desc: 'Smooth nominal operation with high oil life, balanced battery state of charge, and low idle durations.',
      icon: CheckCircle2,
      color: 'border-emerald-500 bg-emerald-950/30'
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deterministic Demonstration Scenarios</h3>
              <p className="text-xs text-slate-400">Inject reproducible multi-OEM telemetry scenarios into FleetIQ</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400 font-mono">Seed:</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 w-28 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <label className="text-slate-400 font-mono ml-2">Count:</label>
            <input
              type="number"
              value={eventCount}
              onChange={(e) => setEventCount(Number(e.target.value))}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 w-20 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition hover:border-sky-500 ${sc.color}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-white" />
                    <span className="font-bold text-xs text-white">{sc.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{sc.desc}</p>
                </div>

                <button
                  onClick={() => handleExecuteScenario(sc.id)}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{loading ? 'Simulating...' : 'Inject Scenario'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {simResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between">
            <div>
              <span className="font-bold uppercase tracking-wider block">Simulation Complete</span>
              <span>{simResult.message}</span>
            </div>
            <div className="flex gap-4 font-mono font-semibold">
              <span>Normalized: {simResult.normalizedCount}</span>
              <span>Actions: {simResult.actionsCreated}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Scaled Load Testing & Benchmarking */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/60">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Telemetry Load Testing & Benchmarking</h3>
            <p className="text-xs text-slate-400">Validate high-throughput multi-OEM normalization & priority decision latency</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {[100, 1000, 10000].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLoadLevel(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                loadLevel === lvl
                  ? 'border-purple-500 bg-purple-950/60 text-white ring-1 ring-purple-500'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Level {lvl === 100 ? '1' : lvl === 1000 ? '2' : '3'}: {lvl.toLocaleString()} Events
            </button>
          ))}

          <button
            onClick={handleExecuteLoadTest}
            disabled={loadTesting}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loadTesting ? 'Benchmarking Engine...' : 'Run Load Benchmark'}</span>
          </button>
        </div>

        {loadResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                Benchmark Results — {loadResult.eventsGenerated.toLocaleString()} Events Ingested
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Total Runtime: <strong className="text-white">{loadResult.totalProcessingTimeMs}ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Average Latency</span>
                <span className="text-lg font-bold text-white">{loadResult.avgLatencyMs} ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">P95 Latency</span>
                <span className="text-lg font-bold text-sky-400">{loadResult.p95LatencyMs} ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">P99 Latency</span>
                <span className="text-lg font-bold text-amber-400">{loadResult.p99LatencyMs} ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Decisions Generated</span>
                <span className="text-lg font-bold text-emerald-400">{loadResult.decisionsGenerated.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
