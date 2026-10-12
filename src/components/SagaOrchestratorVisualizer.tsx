import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Lock,
  CreditCard,
  Mail,
  Server
} from 'lucide-react';

interface WorkflowScenario {
  id: string;
  name: string;
  description: string;
  steps: {
    name: string;
    description: string;
    forwardAction: string;
    compensatingAction: string;
    icon: string;
  }[];
}

const SCENARIOS: WorkflowScenario[] = [
  {
    id: 'enterprise-provisioning',
    name: 'Enterprise Multi-Tenant Onboarding Saga',
    description: 'Provisions dedicated VPC database, sets up Okta SAML domain, charges corporate card, and initializes KMS encryption keys.',
    steps: [
      {
        name: '01. Validate Idempotency & Tenant Domain',
        description: 'Verify Idempotency-Key in Redis to prevent double execution.',
        forwardAction: 'Acquire Redis atomic lock SET NX EX 60s',
        compensatingAction: 'Release Redis atomic lock and clear cache key',
        icon: 'Lock',
      },
      {
        name: '02. Reserve High-Availability Cloud SQL Cluster',
        description: 'Allocates regional PostgreSQL instance with standby replica.',
        forwardAction: 'POST /v1/cloudsql/instances/create',
        compensatingAction: 'DELETE /v1/cloudsql/instances/cleanup',
        icon: 'Database',
      },
      {
        name: '03. Generate Tenant KMS Encryption Keys',
        description: 'Creates Customer-Managed Encryption Key (CMEK) in Cloud KMS.',
        forwardAction: 'Create CryptoKey in projects/enterprise/locations/global',
        compensatingAction: 'Destroy CryptoKeyVersion and revoke IAM bindings',
        icon: 'Lock',
      },
      {
        name: '04. Charge Annual Enterprise Subscription',
        description: 'Processes corporate invoice payment via Stripe Enterprise.',
        forwardAction: 'Stripe PaymentIntent capture for $24,000',
        compensatingAction: 'Issue immediate credit refund & cancel invoice',
        icon: 'CreditCard',
      },
      {
        name: '05. Dispatch SCIM & Welcome Notification',
        description: 'Sends automated webhook to client IT administrator.',
        forwardAction: 'Emit SCIM Webhook and admin setup token',
        compensatingAction: 'Send failure notification & quarantine tenant record',
        icon: 'Mail',
      },
    ],
  },
  {
    id: 'heavy-data-migration',
    name: 'High-Volume Partition Ingestion Saga',
    description: 'Ingests 10 million telemetry records into PostgreSQL partitioned table, writes Parquet replica to object storage, and triggers cache purge.',
    steps: [
      {
        name: '01. Acquire Distributed Table Lock',
        description: 'Acquires advisory lock on partition master table.',
        forwardAction: 'SELECT pg_advisory_lock(99201)',
        compensatingAction: 'SELECT pg_advisory_unlock(99201)',
        icon: 'Lock',
      },
      {
        name: '02. Attach Partition & Bulk COPY 10M Records',
        description: 'Streams records into unlogged staging table via PgBouncer.',
        forwardAction: 'COPY telemetry_2026_q3 FROM STDIN BINARY',
        compensatingAction: 'DROP TABLE telemetry_2026_q3_staging',
        icon: 'Database',
      },
      {
        name: '03. Rebuild B-Tree & BRIN Indexes',
        description: 'Builds composite indexes for range query acceleration.',
        forwardAction: 'CREATE INDEX CONCURRENTLY idx_telemetry_ts',
        compensatingAction: 'DROP INDEX IF EXISTS idx_telemetry_ts',
        icon: 'Server',
      },
      {
        name: '04. CDC Stream to BigQuery Warehouse',
        description: 'Debezium emits partition snapshot to analytical warehouse.',
        forwardAction: 'Publish 10M rows to Pub/Sub analytical topic',
        compensatingAction: 'Send tombstone cancellation marker to Pub/Sub',
        icon: 'Database',
      },
      {
        name: '05. Invalidate Edge CDN & Redis Entity Caches',
        description: 'Purges stale aggregation responses across Redis and CDN.',
        forwardAction: 'Redis DEL analytics:summary:* + CDN Tag Purge',
        compensatingAction: 'Restore fallback static snapshot from backup',
        icon: 'Server',
      },
    ],
  },
];

export const SagaOrchestratorVisualizer: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [shouldFailAtStep, setShouldFailAtStep] = useState<number | null>(4); // Step 4 fails by default to show compensation
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [stepStatuses, setStepStatuses] = useState<('idle' | 'running' | 'success' | 'failed' | 'compensating' | 'compensated')[]>([]);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [orchestratorStatus, setOrchestratorStatus] = useState<'IDLE' | 'EXECUTING' | 'COMPLETED' | 'COMPENSATING' | 'ROLLED_BACK'>('IDLE');

  const currentScenario = SCENARIOS[selectedScenarioIndex];

  const handleStartWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOrchestratorStatus('EXECUTING');
    setStepStatuses(new Array(currentScenario.steps.length).fill('idle'));
    setExecutionLogs([
      `[Nxt Orchestrator] Initializing distributed saga for workflow: "${currentScenario.name}"`,
      `[Nxt Orchestrator] Generating unique execution Trace ID: 0x${Math.random().toString(16).substring(2, 10)}...`,
    ]);

    const statuses = new Array(currentScenario.steps.length).fill('idle');

    // Forward execution phase
    let failureOccurredAt = -1;

    for (let i = 0; i < currentScenario.steps.length; i++) {
      setCurrentStepIndex(i);
      statuses[i] = 'running';
      setStepStatuses([...statuses]);
      setExecutionLogs((prev) => [
        ...prev,
        `[Forward Step ${i + 1}] Executing: ${currentScenario.steps[i].name} (${currentScenario.steps[i].forwardAction})`,
      ]);

      await new Promise((r) => setTimeout(r, 700));

      // Check if this step should fail
      if (shouldFailAtStep === i + 1) {
        statuses[i] = 'failed';
        setStepStatuses([...statuses]);
        setExecutionLogs((prev) => [
          ...prev,
          `[CRITICAL FAILURE] Step ${i + 1} rejected! Error: Downstream service rejected request (e.g., Payment Gateway timeout or connection limit).`,
          `[Nxt Orchestrator] HALTING forward execution. Initiating automatic REVERSE COMPENSATION for ${i} executed steps...`,
        ]);
        failureOccurredAt = i;
        break;
      } else {
        statuses[i] = 'success';
        setStepStatuses([...statuses]);
        setExecutionLogs((prev) => [
          ...prev,
          `[Success] Step ${i + 1} committed durably in 42ms.`,
        ]);
      }
    }

    // Compensation phase if failure occurred
    if (failureOccurredAt >= 0) {
      setOrchestratorStatus('COMPENSATING');
      for (let j = failureOccurredAt - 1; j >= 0; j--) {
        statuses[j] = 'compensating';
        setStepStatuses([...statuses]);
        setExecutionLogs((prev) => [
          ...prev,
          `[Compensating Step ${j + 1}] Executing Rollback: ${currentScenario.steps[j].compensatingAction}`,
        ]);

        await new Promise((r) => setTimeout(r, 650));

        statuses[j] = 'compensated';
        setStepStatuses([...statuses]);
        setExecutionLogs((prev) => [
          ...prev,
          `[Compensated] Step ${j + 1} side-effects reversed. Transactional integrity preserved.`,
        ]);
      }

      setOrchestratorStatus('ROLLED_BACK');
      setExecutionLogs((prev) => [
        ...prev,
        `[Nxt Orchestrator] Saga rollback complete. Status: ROLLED_BACK. Zero orphaned resources or inconsistent data. Failure context routed to Dead Letter Queue (DLQ).`,
      ]);
    } else {
      setOrchestratorStatus('COMPLETED');
      setExecutionLogs((prev) => [
        ...prev,
        `[Nxt Orchestrator] All forward steps completed successfully. Distributed transaction committed.`,
      ]);
    }

    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setStepStatuses([]);
    setExecutionLogs([]);
    setOrchestratorStatus('IDLE');
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Nxt Orchestrator: Distributed Saga Engine
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Prototype apps fail when multi-step operations crash halfway through, leaving databases in corrupt states. The Nxt Orchestrator coordinates distributed steps with guaranteed forward durability and automatic compensating transaction rollbacks.
        </p>
      </div>

      {/* Configuration & Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Scenario Picker */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Enterprise Workflow Scenario
            </span>
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  disabled={isRunning}
                  onClick={() => { setSelectedScenarioIndex(idx); handleReset(); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                    selectedScenarioIndex === idx
                      ? 'bg-slate-800 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Failure Injection Simulation */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Failure Simulation Behavior
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                disabled={isRunning}
                onClick={() => setShouldFailAtStep(null)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  shouldFailAtStep === null
                    ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                100% Success Flow
              </button>
              <button
                disabled={isRunning}
                onClick={() => setShouldFailAtStep(4)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  shouldFailAtStep === 4
                    ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fail at Step 4 (Trigger Compensation)
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              disabled={isRunning}
              onClick={handleStartWorkflow}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-sm ${
                isRunning
                  ? 'bg-indigo-600/50 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Orchestrating Saga...' : 'Execute Saga Workflow'}</span>
            </button>

            <button
              disabled={isRunning}
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Orchestrator State:</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              orchestratorStatus === 'COMPLETED'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : orchestratorStatus === 'ROLLED_BACK'
                ? 'bg-rose-950 text-rose-300 border-rose-800'
                : orchestratorStatus === 'COMPENSATING'
                ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                : orchestratorStatus === 'EXECUTING'
                ? 'bg-indigo-950 text-indigo-300 border-indigo-800 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              {orchestratorStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Step by Step Visual Pipeline */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Workflow State Machine Pipeline
        </h2>

        <div className="space-y-3">
          {currentScenario.steps.map((step, idx) => {
            const status = stepStatuses[idx] || 'idle';

            return (
              <div
                key={step.name}
                className={`p-4 rounded-xl border transition-all ${
                  status === 'running'
                    ? 'bg-indigo-950/30 border-indigo-500/80 shadow-md'
                    : status === 'success'
                    ? 'bg-emerald-950/20 border-emerald-900/60'
                    : status === 'failed'
                    ? 'bg-rose-950/40 border-rose-800'
                    : status === 'compensating'
                    ? 'bg-amber-950/30 border-amber-800 animate-pulse'
                    : status === 'compensated'
                    ? 'bg-purple-950/20 border-purple-900/50'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Status Icon */}
                    <div className="shrink-0 pt-0.5 sm:pt-0">
                      {status === 'running' ? (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      ) : status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : status === 'failed' ? (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      ) : status === 'compensating' ? (
                        <Clock className="w-5 h-5 text-amber-400" />
                      ) : status === 'compensated' ? (
                        <RotateCcw className="w-5 h-5 text-purple-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{step.name}</span>
                        <span className="text-xs text-slate-500 hidden sm:inline">· {step.description}</span>
                      </div>

                      <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
                        <span>Action: <code className="text-slate-300">{step.forwardAction}</code></span>
                        <span>·</span>
                        <span>Compensate: <code className="text-purple-300">{step.compensatingAction}</code></span>
                      </div>
                    </div>
                  </div>

                  {/* Step status badge */}
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded uppercase shrink-0 ${
                    status === 'running'
                      ? 'bg-indigo-900 text-indigo-200'
                      : status === 'success'
                      ? 'bg-emerald-900 text-emerald-200'
                      : status === 'failed'
                      ? 'bg-rose-900 text-rose-200'
                      : status === 'compensating'
                      ? 'bg-amber-900 text-amber-200'
                      : status === 'compensated'
                      ? 'bg-purple-900 text-purple-200'
                      : 'text-slate-500'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live SRE Orchestrator Console Logs */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Nxt Orchestrator Execution Log &amp; Audit Trail
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {executionLogs.length} events logged
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-1 font-mono text-xs text-slate-300">
          {executionLogs.length === 0 ? (
            <div className="text-slate-600 italic py-2">
              Ready to execute. Click "Execute Saga Workflow" above to begin trace.
            </div>
          ) : (
            executionLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={`py-0.5 ${
                  log.includes('CRITICAL FAILURE')
                    ? 'text-rose-400 font-bold'
                    : log.includes('REVERSE COMPENSATION') || log.includes('Compensating Step')
                    ? 'text-amber-300'
                    : log.includes('Compensated') || log.includes('ROLLED_BACK')
                    ? 'text-purple-300'
                    : log.includes('Success')
                    ? 'text-emerald-300'
                    : 'text-slate-400'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
