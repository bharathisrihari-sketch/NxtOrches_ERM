import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Zap,
  Terminal
} from 'lucide-react';

interface Archetype {
  id: string;
  name: string;
  description: string;
  commonBottlenecks: string[];
  day30Milestones: string[];
  day60Milestones: string[];
  day90Milestones: string[];
}

const ARCHETYPES: Archetype[] = [
  {
    id: 'ai-studio-applet',
    name: 'AI Studio Web App (Express + Vite + Gemini SDK)',
    description: 'A skeleton app built in Google AI Studio or similar modern AI dev environments with Vite frontend and Express server proxy.',
    commonBottlenecks: [
      'Gemini API key stored in server memory without rate limiting or quota isolation between tenants.',
      'Heavy AI generations run synchronously in HTTP thread, locking Node event loop and timing out users after 30 seconds.',
      'Lack of circuit breaker: if Gemini API experiences rate limits (429), the entire application freezes.',
      'Frontend serves unpaginated responses and raw Markdown streams without virtual DOM caching.',
    ],
    day30Milestones: [
      'Wrap all Gemini API calls in a Circuit Breaker with exponential backoff & jitter.',
      'Convert synchronous LLM generation to asynchronous BullMQ worker fleet with SSE (Server-Sent Events) streaming.',
      'Deploy Redis distributed sliding-window rate limiter per tenant organization.',
      'Add Helmet defense-in-depth headers and strict Content-Security-Policy.',
    ],
    day60Milestones: [
      'Deploy multi-tier Cache-Aside (Redis) to cache common LLM prompts and vector responses.',
      'Enable OpenTelemetry distributed tracing to monitor P99 LLM response latency and token consumption.',
      'Set up Multi-AZ Cloud Run autoscaling with pre-warmed minimum instances.',
      'Implement Idempotency-Key headers on all AI prompt generation endpoints.',
    ],
    day90Milestones: [
      'Enterprise SSO via SAML 2.0 / OIDC (Okta, Azure AD) for corporate customer onboarding.',
      'Audit logging of all AI queries with automated PII masking for HIPAA / SOC 2 compliance.',
      'Automated k6 load test simulating 10,000 concurrent AI streaming connections.',
      'Customer-Managed Encryption Keys (CMEK) via Cloud KMS for customer document stores.',
    ],
  },
  {
    id: 'node-postgres-prototype',
    name: 'Traditional Node + PostgreSQL Monolith Prototype',
    description: 'A single-server or single-container app connecting directly to a standard relational database with ORM (Prisma/Drizzle).',
    commonBottlenecks: [
      'Direct database connection pool maxes out when container pods scale up (connection exhaustion crash).',
      'Complex reporting queries run on primary transactional database, locking writes and spiking CPU to 100%.',
      'Session stored in server memory Map, making zero-downtime rolling deploys impossible.',
      'Missing composite indexes on foreign keys cause full sequential table scans.',
    ],
    day30Milestones: [
      'Deploy PgBouncer in transaction pooling mode between app pods and database.',
      'Extract session state to high-availability Redis Cluster with asymmetric JWT auth.',
      'Implement graceful shutdown handler (SIGTERM) with 25s connection draining.',
      'Run pg_stat_statements audit to identify slow queries and add composite indexes.',
    ],
    day60Milestones: [
      'Provision cross-zone Read Replicas and implement CQRS read/write query splitting.',
      'Implement Nxt Saga Orchestrator for all multi-table or multi-system transactions.',
      'Configure Continuous Point-in-Time Recovery (PITR) with continuous WAL archiving.',
      'Export Terraform IaC modules for complete infrastructure recreation.',
    ],
    day90Milestones: [
      'Establish SOC 2 Type II audit baseline and automate compliance checks in Vanta/Drata.',
      'Implement automated GDPR / CCPA right-to-erasure and export endpoints.',
      'Execute bi-annual disaster recovery Game Day drill (simulated database failover in <15m).',
      'Implement SCIM 2.0 automated user provisioning protocol.',
    ],
  },
];

export const StackDiagnostic: React.FC = () => {
  const [selectedArchetypeId, setSelectedArchetypeId] = useState(ARCHETYPES[0].id);

  const currentArchetype = ARCHETYPES.find((a) => a.id === selectedArchetypeId) || ARCHETYPES[0];

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Enterprise Transformation Roadmap
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Select your current skeleton archetype to view tailored migration milestones across 30, 60, and 90-day sprints to achieve enterprise readiness.
        </p>
      </div>

      {/* Archetype Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ARCHETYPES.map((arch) => {
          const isSelected = arch.id === selectedArchetypeId;

          return (
            <button
              key={arch.id}
              onClick={() => setSelectedArchetypeId(arch.id)}
              className={`text-left p-5 rounded-xl transition-all border ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/80 shadow-md text-white'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-sm text-white">{arch.name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {arch.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Identified Bottlenecks */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-4">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          <span>Critical Scaling &amp; Security Risks in Current Skeleton</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentArchetype.commonBottlenecks.map((bottleneck, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-950/80 border border-rose-900/30 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <span className="text-rose-400 font-bold shrink-0">•</span>
              <span>{bottleneck}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Phase Milestone Roadmap */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Engineered 90-Day Enterprise Migration Schedule
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Phase 1: Day 0 - 30 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">Phase 1</span>
                <h3 className="text-sm font-bold text-white">Day 0 – 30: Hardened Foundation</h3>
              </div>
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminate immediate crash vectors: session decoupling, connection limits, and network defense.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {currentArchetype.day30Milestones.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Phase 2: Day 31 - 60 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">Phase 2</span>
                <h3 className="text-sm font-bold text-white">Day 31 – 60: High Availability &amp; Sagas</h3>
              </div>
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Introduce Nxt Orchestrator resilient patterns: distributed sagas, CQRS read replicas, and APM.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {currentArchetype.day60Milestones.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Phase 3: Day 61 - 90 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">Phase 3</span>
                <h3 className="text-sm font-bold text-white">Day 61 – 90: Zero-Trust &amp; SOC 2</h3>
              </div>
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Unlock Enterprise Fortune 500 procurement: SAML/SCIM SSO, compliance audits, and CMEK.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {currentArchetype.day90Milestones.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
