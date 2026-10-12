import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Activity, 
  Database, 
  Server, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  RotateCcw,
  Zap,
  Cpu
} from 'lucide-react';

export const ScaleSimulator: React.FC = () => {
  const [userScaleIndex, setUserScaleIndex] = useState<number>(2); // 10,000 users default
  const [injectFailure, setInjectFailure] = useState<'none' | 'slow-downstream' | 'db-spike' | 'zone-blackout'>('none');

  const scales = [
    { label: '100 Users', users: 100, rps: 50 },
    { label: '1,000 Users', users: 1000, rps: 600 },
    { label: '10,000 Users', users: 10000, rps: 7500 },
    { label: '100,000 Users', users: 100000, rps: 80000 },
    { label: '1,000,000 Users', users: 1000000, rps: 650000 },
  ];

  const currentScale = scales[userScaleIndex];

  // Derived simulation metrics
  const simulation = useMemo(() => {
    const { users, rps } = currentScale;

    // Skeleton Prototype calculation
    let skeletonStatus: 'Healthy' | 'Degraded' | 'Catastrophic Failure' = 'Healthy';
    let skeletonLatency = 45;
    let skeletonErrorRate = 0.0;
    let skeletonDbConnections = Math.min(20, Math.floor(users * 0.15));
    let skeletonRootCause = '';

    if (users <= 100) {
      skeletonStatus = 'Healthy';
      skeletonLatency = 48;
      skeletonErrorRate = 0.0;
      skeletonDbConnections = 12;
    } else if (users <= 1000) {
      skeletonStatus = 'Degraded';
      skeletonLatency = 420;
      skeletonErrorRate = 4.2;
      skeletonDbConnections = 20;
      skeletonRootCause = 'Database connection pool maxed out (20/20). Requests queuing in Node.js event loop.';
    } else if (users <= 10000) {
      skeletonStatus = 'Catastrophic Failure';
      skeletonLatency = 14500;
      skeletonErrorRate = 58.6;
      skeletonDbConnections = 20;
      skeletonRootCause = 'FATAL: remaining connection slots are reserved for non-replication superuser connections. Node process memory exceeded 1.4GB.';
    } else {
      skeletonStatus = 'Catastrophic Failure';
      skeletonLatency = 30000;
      skeletonErrorRate = 99.8;
      skeletonDbConnections = 20;
      skeletonRootCause = 'HTTP 502/504 Bad Gateway. Container OOM-Killed repeatedly (CrashLoopBackOff). Database CPU 100% frozen on sequential table scans.';
    }

    if (injectFailure === 'slow-downstream' && users >= 1000) {
      skeletonLatency = Math.min(30000, skeletonLatency + 8000);
      skeletonErrorRate = Math.min(100, skeletonErrorRate + 35);
      skeletonRootCause = 'Downstream 3rd-party API latency starved socket pool; all worker threads blocked waiting for HTTP timeout.';
    }

    // Enterprise Nxt Orchestrator calculation
    let enterpriseStatus: 'Healthy' | 'Auto-Scaling' | 'Resilient Under Stress' = 'Healthy';
    let enterpriseLatency = 18;
    let enterpriseErrorRate = 0.0;
    let enterpriseDbConnections = 32;
    let cdnHitRatio = 91.5;
    let cacheHitRatio = 94.2;
    let activeReplicas = 4;

    if (users <= 100) {
      enterpriseStatus = 'Healthy';
      enterpriseLatency = 16;
      activeReplicas = 4;
      enterpriseDbConnections = 24;
    } else if (users <= 1000) {
      enterpriseStatus = 'Healthy';
      enterpriseLatency = 21;
      activeReplicas = 8;
      enterpriseDbConnections = 38;
      cdnHitRatio = 92.8;
      cacheHitRatio = 95.4;
    } else if (users <= 10000) {
      enterpriseStatus = 'Auto-Scaling';
      enterpriseLatency = 26;
      activeReplicas = 24;
      enterpriseDbConnections = 48; // PgBouncer multiplexing keeps it under 60
      cdnHitRatio = 93.6;
      cacheHitRatio = 96.1;
    } else if (users <= 100000) {
      enterpriseStatus = 'Auto-Scaling';
      enterpriseLatency = 32;
      activeReplicas = 85;
      enterpriseDbConnections = 54;
      cdnHitRatio = 94.8;
      cacheHitRatio = 97.2;
    } else {
      enterpriseStatus = 'Resilient Under Stress';
      enterpriseLatency = 38;
      activeReplicas = 160;
      enterpriseDbConnections = 58;
      cdnHitRatio = 95.4;
      cacheHitRatio = 98.0;
    }

    if (injectFailure === 'slow-downstream') {
      enterpriseLatency = 24; // Circuit breaker trips open, serving fallback immediately
    } else if (injectFailure === 'zone-blackout') {
      activeReplicas = Math.round(activeReplicas * 0.95);
      enterpriseLatency = 28;
    }

    return {
      skeletonStatus,
      skeletonLatency,
      skeletonErrorRate,
      skeletonDbConnections,
      skeletonRootCause,
      enterpriseStatus,
      enterpriseLatency,
      enterpriseErrorRate,
      enterpriseDbConnections,
      cdnHitRatio,
      cacheHitRatio,
      activeReplicas,
    };
  }, [currentScale, injectFailure]);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          High-Volume Concurrency &amp; Stress Simulator
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Simulate scaling from development sandbox to millions of concurrent enterprise users. Observe real-time connection pooling, edge caching, circuit breaker trips, and where un-orchestrated prototypes fail.
        </p>
      </div>

      {/* Control Panel: Scale & Chaos Injection */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Concurrent User Load
            </span>
            <span className="font-mono text-sm font-bold text-indigo-400 tabular-nums">
              {currentScale.users.toLocaleString()} Active Users · {currentScale.rps.toLocaleString()} Req/Sec
            </span>
          </div>

          {/* Stepper buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {scales.map((s, idx) => (
              <button
                key={s.users}
                onClick={() => setUserScaleIndex(idx)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                  userScaleIndex === idx
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="font-mono">{s.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.rps.toLocaleString()} RPS</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chaos Injection Selector */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Chaos Failure Injection:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {[
              { id: 'none', label: 'None (Nominal Traffic)' },
              { id: 'slow-downstream', label: 'Downstream 3rd-Party API Lag (3,000ms)' },
              { id: 'db-spike', label: 'Sudden Database Cache Miss Surge' },
              { id: 'zone-blackout', label: 'Cloud Availability Zone Outage' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setInjectFailure(f.id as any)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  injectFailure === f.id
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Side-by-Side Simulation Dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prototype Skeleton Telemetry */}
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Prototype / AI Studio Skeleton</h2>
                <p className="text-xs text-slate-400">Unbuffered, single container</p>
              </div>
            </div>
            
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border font-mono ${
              simulation.skeletonStatus === 'Healthy'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : simulation.skeletonStatus === 'Degraded'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
            }`}>
              {simulation.skeletonStatus}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase">P99 Latency</div>
              <div className={`text-lg font-bold tabular-nums ${
                simulation.skeletonLatency > 1000 ? 'text-rose-400' : 'text-slate-200'
              }`}>
                {simulation.skeletonLatency >= 30000 ? '>30.0s (Timeout)' : `${simulation.skeletonLatency}ms`}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase">Error Rate</div>
              <div className={`text-lg font-bold tabular-nums ${
                simulation.skeletonErrorRate > 5 ? 'text-rose-400' : 'text-slate-200'
              }`}>
                {simulation.skeletonErrorRate.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase">DB Conns</div>
              <div className={`text-lg font-bold tabular-nums ${
                simulation.skeletonDbConnections >= 20 ? 'text-rose-400' : 'text-slate-200'
              }`}>
                {simulation.skeletonDbConnections} / 20 MAX
              </div>
            </div>
          </div>

          {/* Diagnostics Box */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Runtime Telemetry &amp; Diagnostics
            </div>
            {simulation.skeletonRootCause ? (
              <p className="text-xs text-rose-400 font-mono leading-relaxed">
                {simulation.skeletonRootCause}
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Operational within lightweight bounds (&lt; 200 req/min). No immediate lock contention observed.
              </p>
            )}
          </div>
        </div>

        {/* Nxt Enterprise Orchestrator Telemetry */}
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Nxt Enterprise Orchestrator</h2>
                <p className="text-xs text-slate-400">Elastic, pooled, multi-AZ</p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-md border font-mono bg-emerald-950 text-emerald-300 border-emerald-800">
              {simulation.enterpriseStatus}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase">P99 Latency</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                {simulation.enterpriseLatency}ms
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase">Error Rate</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                {simulation.enterpriseErrorRate.toFixed(2)}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase">Physical DB Conns</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                {simulation.enterpriseDbConnections} / 60 Cap
              </div>
            </div>
          </div>

          {/* Secondary Enterprise KPIs */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Edge CDN Hit</div>
              <div className="text-slate-200 font-bold tabular-nums mt-0.5">{simulation.cdnHitRatio}%</div>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Redis Cache Hit</div>
              <div className="text-slate-200 font-bold tabular-nums mt-0.5">{simulation.cacheHitRatio}%</div>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Active Pods</div>
              <div className="text-slate-200 font-bold tabular-nums mt-0.5">{simulation.activeReplicas} Pods</div>
            </div>
          </div>

          {/* Diagnostics Box */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Orchestrator Safeguards Active
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              PgBouncer multiplexes {currentScale.rps.toLocaleString()} RPS into {simulation.enterpriseDbConnections} physical DB connections. Multi-CDN absorbs {Math.round(currentScale.rps * 0.9)} static reads. Circuit breakers and Saga transactions guarantee zero corrupted states.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
