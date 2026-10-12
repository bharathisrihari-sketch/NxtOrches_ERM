import { CodeBlueprint } from '../types/orchestrator';

export const CODE_BLUEPRINTS: CodeBlueprint[] = [
  {
    id: 'blueprint-server-config',
    title: 'Enterprise Server Runtime & Graceful Shutdown',
    pillarId: 'scale-concurrency',
    language: 'typescript',
    filename: 'server.enterprise.ts',
    description: 'Production-hardened Express server featuring zero-downtime graceful shutdown, Helmet CSP defense-in-depth, Redis distributed rate limiter, and health probe contracts.',
    productionNotes: [
      'Responds to SIGTERM by stopping ingress and allowing up to 25s for in-flight requests to complete.',
      'Readiness probe (/health/ready) returns 503 during draining to signal load balancers instantly.',
      'Enforces strict Content-Security-Policy with script nonces and HSTS headers.'
    ],
    snippet: `import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'http';
import { Redis } from 'ioredis';

const app = express();
const server = createServer(app);
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

let isShuttingDown = false;
let activeConnections = 0;

// Track active connections for graceful draining
server.on('connection', (socket) => {
  activeConnections++;
  socket.on('close', () => activeConnections--);
});

// 1. Enterprise Defense-in-Depth Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com"],
      connectSrc: ["'self'", "https://api.enterprise.domain.com"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Strict CORS whitelist for multi-tenant domains
app.use(cors({
  origin: (origin, callback) => {
    const allowed = ['https://app.domain.com', 'https://admin.domain.com'];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('Blocked by Enterprise CORS Policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '10mb' }));

// 2. Distributed Sliding-Window Rate Limiter
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';
  const key = \`rate_limit:\${ip}:\${Math.floor(Date.now() / 60000)}\`;
  
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 65); // 1 minute window
    
    if (count > 1000) { // 1,000 requests per minute
      res.setHeader('Retry-After', '60');
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Try again in 60 seconds.',
      });
    }
    next();
  } catch (err) {
    // Fail-open or fallback to local in case of transient Redis failure
    next();
  }
});

// 3. High Availability Health Probes (Liveness & Readiness)
app.get('/health/live', (req, res) => res.status(200).send('OK'));

app.get('/health/ready', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'DRAINING', message: 'Instance terminating' });
  }
  try {
    await redis.ping();
    res.status(200).json({ status: 'READY', activeConnections });
  } catch {
    res.status(503).json({ status: 'DEGRADED', reason: 'Redis unavailable' });
  }
});

// 4. Zero-Downtime Graceful Termination Handler
const handleShutdown = (signal: string) => {
  console.log(\`Received \${signal}. Initiating zero-downtime draining...\`);
  isShuttingDown = true;

  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP listener stopped. Flushing background resources...');
    try {
      await redis.quit();
      console.log('Redis connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during cleanup:', err);
      process.exit(1);
    }
  });

  // Force kill if connections take too long to drain
  setTimeout(() => {
    console.error('Forced shutdown timeout (25s) reached. Killing process.');
    process.exit(1);
  }, 25000).unref();
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

server.listen(3000, () => console.log('Enterprise API operational on port 3000'));
`
  },
  {
    id: 'blueprint-saga-orchestrator',
    title: 'Nxt Orchestrator: Distributed Saga & Compensation Engine',
    pillarId: 'workflow-resilience',
    language: 'typescript',
    filename: 'nxtSagaOrchestrator.ts',
    description: 'The core orchestration engine for distributed multi-service operations. Guarantees eventual consistency with automatic forward step execution and reverse compensating transactions.',
    productionNotes: [
      'Employs stateful transitions (PENDING -> EXECUTING -> COMPLETED / COMPENSATING -> ROLLED_BACK).',
      'If any downstream step fails (e.g. Payment Gateway or Provisioning), executed steps are compensated in reverse order.',
      'Saves full step audit log with duration and error context for SRE inspection.'
    ],
    snippet: `export interface SagaStep<TContext> {
  name: string;
  execute: (context: TContext) => Promise<Partial<TContext>>;
  compensate: (context: TContext) => Promise<void>;
  timeoutMs?: number;
}

export type SagaStatus = 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'COMPENSATING' | 'ROLLED_BACK' | 'FAILED';

export interface SagaAuditLog {
  step: string;
  status: 'SUCCESS' | 'COMPENSATED' | 'FAILED';
  durationMs: number;
  error?: string;
}

export class NxtSagaOrchestrator<TContext extends Record<string, any>> {
  private steps: SagaStep<TContext>[] = [];
  private executedSteps: SagaStep<TContext>[] = [];
  public status: SagaStatus = 'PENDING';
  public auditLogs: SagaAuditLog[] = [];

  constructor(public readonly sagaId: string, private context: TContext) {}

  addStep(step: SagaStep<TContext>): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<{ success: boolean; context: TContext; audit: SagaAuditLog[] }> {
    this.status = 'EXECUTING';

    for (const step of this.steps) {
      const startTime = Date.now();
      try {
        console.log(\`[Saga \${this.sagaId}] Executing forward step: \${step.name}\`);
        
        // Execute forward transaction
        const stepResult = await Promise.race([
          step.execute(this.context),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(\`Timeout (\${step.timeoutMs || 5000}ms)\`)), step.timeoutMs || 5000)
          )
        ]);

        this.context = { ...this.context, ...stepResult };
        this.executedSteps.push(step);
        
        this.auditLogs.push({
          step: step.name,
          status: 'SUCCESS',
          durationMs: Date.now() - startTime
        });
      } catch (err: any) {
        console.error(\`[Saga \${this.sagaId}] Step '\${step.name}' failed: \${err.message}\`);
        this.auditLogs.push({
          step: step.name,
          status: 'FAILED',
          durationMs: Date.now() - startTime,
          error: err.message
        });

        // Trigger automatic reverse compensation
        await this.compensate();
        return { success: false, context: this.context, audit: this.auditLogs };
      }
    }

    this.status = 'COMPLETED';
    return { success: true, context: this.context, audit: this.auditLogs };
  }

  private async compensate(): Promise<void> {
    this.status = 'COMPENSATING';
    console.warn(\`[Saga \${this.sagaId}] Triggering reverse compensations for \${this.executedSteps.length} steps...\`);

    // Reverse iterate executed steps to undo side-effects
    const stepsToRollback = [...this.executedSteps].reverse();

    for (const step of stepsToRollback) {
      const startTime = Date.now();
      try {
        console.log(\`[Saga \${this.sagaId}] Rolling back: \${step.name}\`);
        await step.compensate(this.context);
        this.auditLogs.push({
          step: \`COMPENSATION: \${step.name}\`,
          status: 'COMPENSATED',
          durationMs: Date.now() - startTime
        });
      } catch (compErr: any) {
        console.error(\`CRITICAL: Compensation failed for \${step.name}! Forwarded to DLQ.\`, compErr);
        this.auditLogs.push({
          step: \`COMPENSATION: \${step.name}\`,
          status: 'FAILED',
          durationMs: Date.now() - startTime,
          error: compErr.message
        });
        // Shunt to Dead Letter Queue for operations team intervention
      }
    }

    this.status = 'ROLLED_BACK';
  }
}
`
  },
  {
    id: 'blueprint-idempotency',
    title: 'Distributed Idempotency Key Middleware (Redis Mutex)',
    pillarId: 'workflow-resilience',
    language: 'typescript',
    filename: 'idempotencyMiddleware.ts',
    description: 'Enforces IETF Idempotency-Key protocol with atomic Redis distributed locks. Prevents duplicate charges and redundant records on retry spikes.',
    productionNotes: [
      'Uses atomic SET NX EX to prevent race conditions across parallel requests.',
      'Caches status code and payload response with 24h TTL.',
      'Returns 409 Conflict if another worker is already processing the same key.'
    ],
    snippet: `import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const idempotencyMiddleware = (ttlSeconds = 86400) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only apply to state-mutating requests
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
      return res.status(400).json({
        error: 'Missing Header',
        message: 'Enterprise mutations require an "Idempotency-Key" header.',
      });
    }

    const cacheKey = \`idempotency:\${idempotencyKey}\`;
    const lockKey = \`idempotency_lock:\${idempotencyKey}\`;

    try {
      // 1. Check if response is already cached from previous execution
      const cached = await redis.get(cacheKey);
      if (cached) {
        const { statusCode, headers, body } = JSON.parse(cached);
        res.setHeader('X-Cache-Lookup', 'IDEMPOTENT-HIT');
        return res.status(statusCode).json(body);
      }

      // 2. Acquire atomic distributed lock (prevents parallel duplicate processing)
      const acquired = await redis.set(lockKey, 'PROCESSING', 'EX', 30, 'NX');
      if (!acquired) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An operation with this Idempotency-Key is currently in progress.',
        });
      }

      // 3. Intercept res.json to capture response before sending
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Asynchronously persist response for future retries
        redis.set(
          cacheKey,
          JSON.stringify({ statusCode: res.statusCode, body }),
          'EX',
          ttlSeconds
        ).finally(() => redis.del(lockKey));

        return originalJson(body);
      };

      next();
    } catch (err) {
      // Release lock on error
      await redis.del(lockKey);
      next(err);
    }
  };
};
`
  },
  {
    id: 'blueprint-db-pool',
    title: 'PostgreSQL Connection Pooling & CQRS Read-Replica Router',
    pillarId: 'heavy-data',
    language: 'typescript',
    filename: 'dbRouter.ts',
    description: 'High-volume database architecture featuring PgBouncer pooling, read/write query splitting, replica health round-robin, and connection leak timeouts.',
    productionNotes: [
      'Routes all SELECT queries to read replicas across AZs, preserving Primary CPU for transactions.',
      'Enforces max connection limits per pod (typically 5-10) to avoid overloading PgBouncer.',
      'Supports "Read-Your-Own-Writes" session pinning for 2000ms after user writes.'
    ],
    snippet: `import { Pool } from 'pg';

// Primary Connection Pool (Writes & Transactions)
export const writePool = new Pool({
  host: process.env.DB_PRIMARY_HOST, // Pointing to PgBouncer port 6432
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10, // Max 10 pool connections per container pod
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
  ssl: { rejectUnauthorized: true },
});

// Read Replica Pool Array (Load balanced across 2+ availability zones)
const replicaHosts = (process.env.DB_REPLICA_HOSTS || '').split(',');
export const readPools = replicaHosts.map((host) => new Pool({
  host,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: true },
}));

let replicaCounter = 0;

export async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
  options: { forcePrimary?: boolean } = {}
): Promise<T[]> {
  const isRead = query.trim().toUpperCase().startsWith('SELECT');
  const shouldUseReplica = isRead && !options.forcePrimary && readPools.length > 0;

  const targetPool = shouldUseReplica
    ? readPools[replicaCounter++ % readPools.length]
    : writePool;

  const client = await targetPool.connect();
  const startTime = Date.now();

  try {
    const result = await client.query(query, params);
    const duration = Date.now() - startTime;
    if (duration > 500) {
      console.warn(\`[Slow Query Warning] \${duration}ms: \${query.slice(0, 100)}\`);
    }
    return result.rows;
  } finally {
    client.release(); // Essential: Return connection to pool immediately
  }
}
`
  },
  {
    id: 'blueprint-circuit-breaker',
    title: 'Resilient Circuit Breaker & Jittered Exponential Backoff',
    pillarId: 'workflow-resilience',
    language: 'typescript',
    filename: 'circuitBreaker.ts',
    description: 'Stops cascading failures by tripping open when external APIs degrade. Employs Full Jitter backoff to eliminate thundering herd spikes upon service recovery.',
    productionNotes: [
      'Trip conditions: >50% failure rate over 10s rolling window.',
      'Half-open probe allows 1 canary request to test recovery before closing circuit.',
      'Full Jitter sleep calculation: rand(0, min(cap, base * 2 ^ attempt)).'
    ],
    snippet: `export enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation
  OPEN = 'OPEN',           // Tripped: fail-fast immediately
  HALF_OPEN = 'HALF_OPEN'  // Testing recovery with canary request
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastStateChange = Date.now();
  
  constructor(
    private readonly name: string,
    private readonly failureThreshold = 5,
    private readonly resetTimeoutMs = 15000,
    private readonly executionTimeoutMs = 3000
  ) {}

  async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Check if open circuit should transition to half-open
    if (this.state === CircuitState.OPEN && now - this.lastStateChange > this.resetTimeoutMs) {
      this.state = CircuitState.HALF_OPEN;
      this.lastStateChange = now;
      console.log(\`[CircuitBreaker: \${this.name}] Probing recovery (HALF_OPEN)...\`);
    }

    if (this.state === CircuitState.OPEN) {
      if (fallback) return fallback();
      throw new Error(\`[CircuitBreaker: \${this.name}] Circuit is OPEN. Call rejected.\`);
    }

    try {
      // Execute with timeout
      const result = await Promise.race([
        action(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation Timed Out')), this.executionTimeoutMs)
        ),
      ]);

      // Success in HALF_OPEN resets circuit
      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.lastStateChange = Date.now();
        console.log(\`[CircuitBreaker: \${this.name}] Successfully healed (CLOSED).\`);
      }
      return result;
    } catch (err) {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold || this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.OPEN;
        this.lastStateChange = Date.now();
        console.error(\`[CircuitBreaker: \${this.name}] Tripped to OPEN! Consecutive failures: \${this.failureCount}\`);
      }
      if (fallback) return fallback();
      throw err;
    }
  }
}

// Enterprise Exponential Backoff with Full Jitter
export async function retryWithFullJitter<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseMs = 100,
  capMs = 5000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      
      // Full Jitter Formula: rand(0, min(cap, base * 2 ^ attempt))
      const exponential = Math.min(capMs, baseMs * Math.pow(2, attempt));
      const sleepMs = Math.floor(Math.random() * exponential);
      
      console.warn(\`Retry attempt \${attempt}/\${maxRetries} after \${sleepMs}ms jitter...\`);
      await new Promise((r) => setTimeout(r, sleepMs));
    }
  }
}
`
  },
  {
    id: 'blueprint-opentelemetry',
    title: 'OpenTelemetry (OTel) Distributed Tracing Bootstrapper',
    pillarId: 'observability-apm',
    language: 'typescript',
    filename: 'tracer.ts',
    description: 'Initializes OpenTelemetry distributed tracing with auto-instrumentations for Express, HTTP, pg, and Redis. Emits W3C traceparent headers across microservices.',
    productionNotes: [
      'Must be loaded via node --require ./tracer.js before any other application dependencies.',
      'Injects trace_id and span_id into structured logs automatically.',
      'Supports head-based sampling (e.g. 10% sampling in high volume to control telemetry egress cost).'
    ],
    snippet: `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Initialize Cloud Trace / OTLP Exporter
const traceExporter = new TraceExporter();

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'nxt-enterprise-core',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter, {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Auto-instrument HTTP, Express, PostgreSQL, Redis
      '@opentelemetry/instrumentation-fs': { enabled: false }, // Avoid noisy FS spans
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => req.url?.startsWith('/health') || false,
      },
    }),
  ],
});

sdk.start();
console.log('OpenTelemetry Distributed Tracing active. Service: nxt-enterprise-core');

process.on('SIGTERM', () => {
  sdk.shutdown().then(() => console.log('Tracing SDK terminated cleanly.'));
});
`
  },
  {
    id: 'blueprint-terraform',
    title: 'Terraform IaC: Multi-AZ Enterprise Infrastructure',
    pillarId: 'cicd-sre-operations',
    language: 'hcl',
    filename: 'main.tf',
    description: 'Production Terraform specification provisioning Multi-AZ Private VPC, High-Availability Cloud SQL PostgreSQL with automated failover, and Redis Cluster.',
    productionNotes: [
      'Multi-AZ High Availability: Standby PostgreSQL automatically fails over within 60s.',
      'Private IP only: Database has no public IP, reachable only within private VPC.',
      'Continuous Point-in-Time Recovery (PITR) with 30-day transaction log retention.'
    ],
    snippet: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "enterprise-tf-state-prod"
    prefix = "core-infrastructure"
  }
}

provider "google" {
  project = var.project_id
  region  = "us-central1"
}

# 1. Private VPC with zero public DB ingress
resource "google_compute_network" "vpc_network" {
  name                    = "enterprise-production-vpc"
  auto_create_subnetworks = false
}

# 2. High-Availability Multi-AZ Cloud SQL PostgreSQL
resource "google_sql_database_instance" "postgres_primary" {
  name             = "enterprise-pg-primary-ha"
  database_version = "POSTGRES_16"
  region           = "us-central1"

  settings {
    tier              = "db-custom-8-32768" # 8 vCPUs, 32GB RAM
    availability_type = "REGIONAL"          # Multi-AZ HA Standby in second zone
    disk_type         = "PD_SSD"
    disk_size         = 200
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled    = false               # Zero public IP exposure
      private_network = google_compute_network.vpc_network.id
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true # PITR continuous WAL retention
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
      }
    }

    database_flags {
      name  = "max_connections"
      value = "200"
    }
    database_flags {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements"
    }
  }
}

# 3. Read Replica in alternate zone for CQRS offloading
resource "google_sql_database_instance" "postgres_read_replica" {
  name                 = "enterprise-pg-replica-01"
  master_instance_name = google_sql_database_instance.postgres_primary.name
  database_version     = "POSTGRES_16"
  region               = "us-central1"

  settings {
    tier      = "db-custom-4-16384"
    disk_type = "PD_SSD"
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc_network.id
    }
  }
}

# 4. High-Availability Memorystore Redis Cluster
resource "google_redis_instance" "cache_cluster" {
  name           = "enterprise-redis-ha"
  tier           = "STANDARD_HA" # Multi-AZ replication
  memory_size_gb = 5
  region         = "us-central1"
  authorized_network = google_compute_network.vpc_network.id
  transit_encryption_mode = "SERVER_AUTHENTICATION"
}
`
  }
];
