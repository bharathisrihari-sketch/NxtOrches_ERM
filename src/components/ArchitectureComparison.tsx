import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Workflow, 
  Activity, 
  Globe, 
  Key, 
  Repeat, 
  AlertTriangle,
  ArrowRight,
  Cpu
} from 'lucide-react';

export const ArchitectureComparison: React.FC = () => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'enterprise-deepdive'>('side-by-side');

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            System Topology Comparison
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            Side-by-side architectural blueprint contrasting a typical prototype / AI Studio skeleton application against the high-throughput Nxt Orchestrator enterprise specification.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Side-by-Side Comparison
          </button>
          <button
            onClick={() => setViewMode('enterprise-deepdive')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'enterprise-deepdive'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nxt Orchestrator Deep Dive
          </button>
        </div>
      </div>

      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: SKELETON PROTOTYPE */}
          <div className="rounded-2xl bg-slate-900/40 border border-rose-900/40 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Prototype / AI Studio Skeleton</h2>
                  <p className="text-xs text-rose-400/90 font-medium">Single container, synchronous bottlenecks & SPOF</p>
                </div>
              </div>
              <span className="text-xs font-mono text-rose-400 font-semibold uppercase tracking-wider">
                Fragile at &gt;500 users
              </span>
            </div>

            {/* Architecture diagram nodes for Skeleton */}
            <div className="space-y-3 font-mono text-xs">
              {/* Node 1: Client */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span>Public Client Requests</span>
                </div>
                <span className="text-rose-400 text-[11px]">Direct to server IP, no CDN</span>
              </div>

              <div className="text-center text-slate-600 text-xs py-0.5">↓ Raw HTTP Traffic</div>

              {/* Node 2: App Server */}
              <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/50 space-y-2">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-rose-400" />
                    <span>Single Express Container (Port 3000)</span>
                  </div>
                  <span className="text-rose-400 text-[10px]">Single Zone</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 font-sans">
                  <li>• Serves Vite static bundles, CSS, and images directly (wastes event loop I/O)</li>
                  <li>• In-memory session state (cannot horizontally scale past 1 pod)</li>
                  <li>• Plain text secrets in runtime <code className="text-rose-300">.env</code></li>
                  <li>• Synchronous execution for heavy jobs (hangs HTTP clients &gt;30s)</li>
                  <li>• Plain <code className="text-rose-300">console.log</code> text logs (wiped on restart)</li>
                </ul>
              </div>

              <div className="text-center text-slate-600 text-xs py-0.5">↓ Direct TCP Connection Pool (Max 20)</div>

              {/* Node 3: Database */}
              <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/50 space-y-2">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-rose-400" />
                    <span>Single Standalone Database Instance</span>
                  </div>
                  <span className="text-rose-400 text-[10px]">No HA Replica</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 font-sans">
                  <li>• Direct connections without PgBouncer (crashes when multiple pods scale up)</li>
                  <li>• All reads &amp; writes compete on 1 primary instance (locks CPU at 100%)</li>
                  <li>• Unindexed tables cause full sequential scans across millions of rows</li>
                  <li>• Daily midnight backups: up to 24 hours of customer data loss on corruption</li>
                </ul>
              </div>
            </div>

            {/* Failure Mode Summary */}
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Primary Failure Cascades Under Load</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed">
                At ~1,000 concurrent users: Database connection slots exhaust (`max_connections reached`), CPU hits 100%, Node event loop blocks on synchronous tasks, and the single container terminates with Out-Of-Memory (OOM).
              </p>
            </div>
          </div>

          {/* RIGHT: ENTERPRISE NXT ORCHESTRATOR */}
          <div className="rounded-2xl bg-slate-900/40 border border-emerald-900/40 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-900/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Nxt Enterprise Orchestrated Architecture</h2>
                  <p className="text-xs text-emerald-400/90 font-medium">Multi-AZ, CQRS, Sagas, Anycast Edge &amp; Zero-Trust</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                Millions of users
              </span>
            </div>

            {/* Architecture diagram nodes for Enterprise */}
            <div className="space-y-3 font-mono text-xs">
              {/* Edge Layer */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Anycast Multi-CDN + WAF Edge (Cloudflare/Cloud Armor)</span>
                </div>
                <span className="text-emerald-400 text-[11px]">92% Cache Hit</span>
              </div>

              <div className="text-center text-slate-600 text-xs py-0.5">↓ Layer 7 Ingress + Distributed Redis Rate Limiter</div>

              {/* Compute Layer */}
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/50 space-y-2">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Stateless Microservice Fleet (Multi-AZ Autoscaling)</span>
                  </div>
                  <span className="text-emerald-400 text-[10px]">Multi-AZ 3 Zones</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-sans">
                  <li>• Asymmetric JWT auth + Redis cluster for session revocation</li>
                  <li>• Graceful SIGTERM termination with 25s connection draining</li>
                  <li>• Secret injection via Google Cloud Secret Manager / HashiCorp Vault</li>
                  <li>• OpenTelemetry distributed tracing across all HTTP &amp; RPC spans</li>
                </ul>
              </div>

              <div className="text-center text-slate-600 text-xs py-0.5">↓ Nxt Orchestration Layer (Sagas &amp; BullMQ/Kafka)</div>

              {/* Orchestrator & Resilience Core */}
              <div className="p-4 rounded-lg bg-indigo-950/25 border border-indigo-900/50 space-y-2">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-indigo-400" />
                    <span>Nxt Orchestrator &amp; Resiliency Engine</span>
                  </div>
                  <span className="text-indigo-300 text-[10px]">Guaranteed Consistency</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-sans">
                  <li>• Distributed Saga Engine: Automatic forward steps + compensating rollbacks</li>
                  <li>• Idempotency-Key validation with Redis atomic locks (prevents duplicates)</li>
                  <li>• Circuit Breakers &amp; Full Jitter backoff (safeguards downstream APIs)</li>
                </ul>
              </div>

              <div className="text-center text-slate-600 text-xs py-0.5">↓ PgBouncer Connection Multiplexing (5,000 → 60 conns)</div>

              {/* Tiered Data Layer */}
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/50 space-y-2">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Tiered High-Availability Data Core</span>
                  </div>
                  <span className="text-emerald-400 text-[10px]">RPO &lt; 1m / RTO &lt; 15m</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-sans">
                  <li>• PostgreSQL Primary with Synchronous Standby HA (automatic sub-60s failover)</li>
                  <li>• Read Replica cluster across zones for analytical &amp; search queries</li>
                  <li>• Continuous Point-in-Time Recovery (PITR) to any microsecond in 35 days</li>
                  <li>• Distributed Redis Cluster for L2 Cache-Aside with stampede protection</li>
                </ul>
              </div>
            </div>

            {/* Resilience Summary */}
            <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Zero Downtime Resilience Under Peak Stress</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed">
                Even during catastrophic cloud availability zone failure or viral traffic spikes to millions of users, the edge CDN absorbs static reads, PgBouncer protects database connections, and the Nxt Orchestrator guarantees zero corrupted transactions.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ENTERPRISE DEEP DIVE VIEW */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                The Nxt Enterprise Orchestrator: Layer-by-Layer Architecture
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">
                Every tier in the modern enterprise orchestrator decouples responsibility so that no single component can drag down the platform. Here is how state, transactions, security, and traffic flow in production.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Edge & Gateway */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <Globe className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">1. Edge &amp; Ingress Defense</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cloudflare Enterprise / Google Cloud Armor filters volumetric DDoS at Layer 3/4 and Layer 7. HTTP/3 (QUIC) and TLS 1.3 are terminated at edge points-of-presence worldwide.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                  WAF rules: OWASP ModSecurity Core Rule Set + IP reputation + Geo-rate limiting.
                </div>
              </div>

              {/* Card 2: Zero-Trust Identity */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <Key className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">2. Zero-Trust Identity (SSO/SCIM)</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Federated authentication via SAML 2.0 and OIDC (Okta, Azure AD). SCIM 2.0 automated provisioning updates role assignments and deprovisions offboarded employees within seconds.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                  Tokens signed with asymmetric keys (RS256). Asymmetric public keys exposed via JWKS.
                </div>
              </div>

              {/* Card 3: Nxt Saga Orchestrator */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <Workflow className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">3. Distributed Saga Engine</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Coordinates complex multi-service transactions (e.g. Billing + Provisioning + Notification). Guarantees transactional consistency by executing compensating rollback actions if any step fails.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                  Durable state machine. Forward steps idempotent via distributed Redis keys.
                </div>
              </div>

              {/* Card 4: High-Throughput Data Core */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <Database className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">4. CQRS Database Core</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  PgBouncer connection multiplexer sits in front of PostgreSQL. Writes go to Primary (with regional synchronous standby replica); all analytical reads route across Read Replicas.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                  Continuous WAL archiving provides Point-in-Time Recovery (PITR) to any microsecond.
                </div>
              </div>

              {/* Card 5: Resiliency & Circuit Breakers */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <Repeat className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">5. Circuit Breakers &amp; DLQs</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Third-party external dependencies (LLM APIs, Stripe, Twilio) are wrapped in Circuit Breakers. If downstream latency spikes, circuit trips open immediately to avoid cascading resource lockups.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                  Retries use Full Jitter: Sleep = rand(0, min(cap, base * 2 ^ attempt)).
                </div>
              </div>

              {/* Card 6: OpenTelemetry APM */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <Activity className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">6. OpenTelemetry Telemetry</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every inbound HTTP request receives a W3C traceparent header. Spans propagate across microservice boundaries, queues, and database queries for immediate root-cause diagnosis.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                  Structured JSON logging (Pino) + Prometheus RED metrics + Cloud Trace exporter.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
