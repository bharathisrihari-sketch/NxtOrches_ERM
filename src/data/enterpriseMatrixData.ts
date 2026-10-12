import { PillarMeta, EnterpriseCheckItem } from '../types/orchestrator';

export const PILLARS: PillarMeta[] = [
  {
    id: 'scale-concurrency',
    name: '01. Scale & Concurrency (Millions of Users)',
    shortTitle: 'Scale & Concurrency',
    tagline: 'Stateless elasticity, multi-CDN caching, Anycast routing & distributed sessions',
    iconName: 'Users',
    itemCount: 6,
  },
  {
    id: 'heavy-data',
    name: '02. Heavy Data Volumes & Throughput',
    shortTitle: 'Data & Throughput',
    tagline: 'Connection pooling, CQRS read replicas, partitioning & distributed Redis caching',
    iconName: 'Database',
    itemCount: 6,
  },
  {
    id: 'zero-trust-security',
    name: '03. Zero-Trust Security & Identity',
    shortTitle: 'Zero-Trust Security',
    tagline: 'SAML/OIDC SSO, SCIM provisioning, KMS envelope encryption, mTLS & strict RBAC',
    iconName: 'ShieldCheck',
    itemCount: 6,
  },
  {
    id: 'workflow-resilience',
    name: '04. Workflow Orchestration & Resilience',
    shortTitle: 'Nxt Orchestrator & Sagas',
    tagline: 'Distributed sagas, compensating transactions, idempotency keys & circuit breakers',
    iconName: 'Workflow',
    itemCount: 5,
  },
  {
    id: 'ha-disaster-recovery',
    name: '05. High Availability & Disaster Recovery',
    shortTitle: 'HA & Disaster Recovery',
    tagline: 'Multi-region failover, RPO < 1m, RTO < 15m, graceful shutdown & PITR recovery',
    iconName: 'ServerCrash',
    itemCount: 5,
  },
  {
    id: 'observability-apm',
    name: '06. Observability, Telemetry & APM',
    shortTitle: 'Observability & APM',
    tagline: 'OpenTelemetry traces, RED/USE metrics, structured JSON logs & SLA/SLO budgets',
    iconName: 'Activity',
    itemCount: 5,
  },
  {
    id: 'compliance-governance',
    name: '07. Compliance & Data Governance',
    shortTitle: 'Compliance & Governance',
    tagline: 'SOC 2 Type II, ISO 27001, GDPR right-to-erasure, tamper-proof audit trails & SBOM',
    iconName: 'FileCheck',
    itemCount: 5,
  },
  {
    id: 'cicd-sre-operations',
    name: '08. CI/CD & Production Operations',
    shortTitle: 'CI/CD & SRE Ops',
    tagline: 'Canary deployments, zero-downtime DB migrations, chaos testing & GitOps IaC',
    iconName: 'GitMerge',
    itemCount: 5,
  },
];

export const ENTERPRISE_CHECK_ITEMS: EnterpriseCheckItem[] = [
  // PILLAR 1: Scale & Concurrency
  {
    id: 'SCALE-01',
    pillarId: 'scale-concurrency',
    title: 'Stateless Service Decoupling & Distributed Session Store',
    category: 'Application Architecture',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Skeleton holds session state in Node.js process memory (`req.session` or in-memory Map). As soon as you scale past 1 container instance, user logins get lost or require sticky sessions.',
    enterpriseStandard: 'Zero local server state. JWT with asymmetric keys (RS256/ES256) for stateless authentication combined with Redis Cluster / Memorystore for short-lived token revocations and distributed sessions.',
    targetMetric: 'Horizontal scalability to 1,000+ pods without sticky sessions; 0 lost user states during rolling updates.',
    architectureMechanism: 'Stateless microservices behind Layer 7 Application Load Balancer with distributed Redis cluster for session invalidation.',
    remediationSteps: [
      'Extract all in-process memory caches and session stores into a high-availability Redis Cluster with TLS.',
      'Sign tokens using asymmetric key pairs (Private key in KMS, Public key published via JWKS endpoint).',
      'Ensure zero persistent file writes to local container filesystem; use cloud object storage (Cloud Storage / S3) with signed URLs.'
    ],
    complianceImpact: ['SOC 2 Security', 'ISO 27001 A.9'],
    codeSampleRef: 'blueprint-server-config'
  },
  {
    id: 'SCALE-02',
    pillarId: 'scale-concurrency',
    title: 'Global Anycast Multi-CDN & Static Asset Offloading',
    category: 'Edge & Network',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Frontend assets (Vite bundles, images, fonts) are served directly by the Express/Node app server on port 3000, exhausting Node event loop workers on static file I/O.',
    enterpriseStandard: 'Edge offloading via Cloudflare Enterprise or Google Cloud CDN. Origin shield caching, Brotli/AVIF auto-compression, HTTP/3 (QUIC), and immutable caching headers (`max-age=31536000, immutable`).',
    targetMetric: '>92% Edge Cache Hit Ratio; P99 static asset TTFB < 25ms globally.',
    architectureMechanism: 'Global Anycast DNS -> Edge CDN with Origin Shield -> Object Storage / Cloud Run origin.',
    remediationSteps: [
      'Separate static build artifacts into a CDN-fronted Cloud Storage / S3 bucket.',
      'Configure cache-control headers: `public, max-age=31536000, immutable` for hashed assets and `no-cache, must-revalidate` for `index.html`.',
      'Enable HTTP/3 and TLS 1.3 at the CDN edge.'
    ],
    complianceImpact: ['Availability SLA (99.99%)']
  },
  {
    id: 'SCALE-03',
    pillarId: 'scale-concurrency',
    title: 'Horizontal Pod Autoscaling (HPA) & Pre-Warmed Capacity',
    category: 'Compute & Scaling',
    priority: 'P1 - Critical',
    skeletonDefect: 'Single static container instance running with default resource limits. Unexpected traffic spikes crash the container or cause severe latency queuing.',
    enterpriseStandard: 'Elastic auto-scaling governed by CPU (>65%), Memory (>75%), and custom metrics (concurrent requests per pod > 250). Pre-warmed minimum standby pods to absorb sudden viral spikes without cold-start latency.',
    targetMetric: 'Autoscale from 10 to 500 pods in <90 seconds; Zero cold-start timeouts.',
    architectureMechanism: 'Kubernetes HPA or Google Cloud Run autoscaling with concurrency limits and Pod Disruption Budgets (minAvailable: 80%).',
    remediationSteps: [
      'Define explicit CPU and Memory requests and limits in Kubernetes / Container specs.',
      'Configure minimum instance reserve (e.g. min 5 instances) to completely eliminate serverless cold starts.',
      'Set target concurrency per container (e.g., 80 requests/container) to trigger scaling before saturation.'
    ],
    complianceImpact: ['Availability SLA']
  },
  {
    id: 'SCALE-04',
    pillarId: 'scale-concurrency',
    title: 'Distributed Rate Limiting & Layer 7 Abuse Throttling',
    category: 'Security & Availability',
    priority: 'P0 - Blocker',
    skeletonDefect: 'No rate limiting or naive in-memory `express-rate-limit` that fails once multiple servers run, leaving APIs wide open to brute-force credential stuffing and DoS crashes.',
    enterpriseStandard: 'Multi-tiered rate limiting: Edge WAF (Cloud Armor / Cloudflare) for volumetric DDoS, plus API Gateway distributed sliding-window rate limiting backed by Redis with Token Bucket algorithm.',
    targetMetric: 'Protect 100,000 req/sec; Throttled responses return HTTP 429 with `Retry-After` header within 2ms.',
    architectureMechanism: 'Cloud Armor / WAF Layer -> API Gateway Redis Token Bucket -> Microservice.',
    remediationSteps: [
      'Deploy Cloud Armor / AWS WAF security policies for IP reputation and geo-rate limits.',
      'Implement distributed sliding-window counter in Redis using atomic Lua scripts.',
      'Tier rate limits by identity (e.g., Unauthenticated: 60 rpm, Authenticated: 1,000 rpm, Enterprise Tier: 10,000 rpm).'
    ],
    complianceImpact: ['SOC 2 CC6.6', 'PCI-DSS 6.5.10'],
    codeSampleRef: 'blueprint-server-config'
  },
  {
    id: 'SCALE-05',
    pillarId: 'scale-concurrency',
    title: 'Non-Blocking Asynchronous Offloading for Heavy Operations',
    category: 'Application Architecture',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Heavy operations (generating PDF reports, AI model completions, batch emails) execute synchronously in the HTTP request thread, blocking Node event loop and timing out HTTP clients (>30s).',
    enterpriseStandard: 'Asynchronous event-driven architecture using distributed message brokers (Kafka, RabbitMQ, BullMQ with Redis). Client receives HTTP 202 Accepted with a job UUID and polls or receives a WebSocket/Webhook callback.',
    targetMetric: 'HTTP API response time < 80ms for all submissions; 100% queue durability with no message loss.',
    architectureMechanism: 'Producer API -> Distributed Queue -> Horizontally scaled Worker Fleet -> Webhook / WebSocket notification.',
    remediationSteps: [
      'Audit all endpoints taking > 300ms and convert them to asynchronous background jobs.',
      'Implement BullMQ or Google Cloud Pub/Sub with worker worker pools.',
      'Provide an idempotent job status polling endpoint or Server-Sent Events (SSE) notification.'
    ],
    complianceImpact: ['Availability SLA', 'ISO 27001 A.12']
  },
  {
    id: 'SCALE-06',
    pillarId: 'scale-concurrency',
    title: 'Client-Side Payload Optimization & Virtualized Rendering',
    category: 'Frontend Performance',
    priority: 'P1 - Critical',
    skeletonDefect: 'Frontend fetches unpaginated datasets (e.g. 50,000 items at once), causing browser DOM freeze, memory bloat (>1GB RAM on mobile), and catastrophic rendering lag.',
    enterpriseStandard: 'Cursor-based API pagination, virtualized DOM list rendering (windowing), code-splitting by route, and dynamic asset streaming.',
    targetMetric: 'Lighthouse Performance score > 90; Core Web Vitals LCP < 1.8s, INP < 100ms, CLS < 0.05 on 4G mobile.',
    architectureMechanism: 'Virtual window rendering + GraphQL/REST cursor pagination + dynamic import chunking.',
    remediationSteps: [
      'Enforce maximum `limit=100` page size at the API gateway layer.',
      'Integrate `@tanstack/react-virtual` for all large lists and data tables.',
      'Configure Vite manualChunks to split vendor libraries and heavy components.'
    ],
    complianceImpact: ['User Experience SLA']
  },

  // PILLAR 2: Heavy Data Volumes & High Throughput
  {
    id: 'DATA-01',
    pillarId: 'heavy-data',
    title: 'Database Connection Pooling & Connection Multiplexing',
    category: 'Database Architecture',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Each server pod opens a direct Postgres/MySQL connection pool (e.g., 20 connections per pod). When 50 pods spin up, 1,000 connections hit the database, instantly crashing it with `FATAL: remaining connection slots are reserved for non-replication superuser connections`.',
    enterpriseStandard: 'Centralized database connection pooler (PgBouncer or AWS RDS Proxy) in transaction pooling mode. Pods connect to pooler over Unix sockets or private VPC, keeping physical DB connections capped at optimal CPU threshold (e.g. 50-100).',
    targetMetric: 'Support 5,000+ app pod connections mapped to 60 physical DB connections; 0 connection exhaustion errors.',
    architectureMechanism: 'App Pods -> Private VPC -> PgBouncer / Cloud SQL Auth Proxy -> Primary PostgreSQL Instance.',
    remediationSteps: [
      'Deploy PgBouncer in transaction pooling mode adjacent to the database.',
      'Set application pool size to small limits (e.g., 2-5 per pod) and configure idle connection timeouts.',
      'Enforce TCP keepalive and connection lifetime limits to prevent stale socket leaks.'
    ],
    complianceImpact: ['Availability SLA', 'SOC 2 Availability'],
    codeSampleRef: 'blueprint-db-pool'
  },
  {
    id: 'DATA-02',
    pillarId: 'heavy-data',
    title: 'Read-Write Splitting (CQRS) & Read Replica Cluster',
    category: 'Database Architecture',
    priority: 'P0 - Blocker',
    skeletonDefect: 'All queries (heavy analytics, search queries, dashboards, and transactional writes) run against the single primary database instance, causing CPU saturation and write lock contention.',
    enterpriseStandard: 'Command Query Responsibility Segregation (CQRS) with automatic Read-Write connection splitting. All `SELECT` queries route to a pool of Read Replicas across availability zones; `INSERT/UPDATE/DELETE` go to the Primary.',
    targetMetric: 'Sub-5ms read latency; Primary DB CPU utilization < 50% under peak load.',
    architectureMechanism: 'ORM / Database Driver middleware with primary-replica routing and replica lag detection.',
    remediationSteps: [
      'Provision at least 2 read replicas in different availability zones with automated promotion.',
      'Configure ORM/driver to route read transactions to replica pool and write transactions to primary.',
      'Implement read-your-own-writes consistency by routing queries to primary for 2 seconds following a user write.'
    ],
    complianceImpact: ['Availability SLA', 'ISO 27001 A.12'],
    codeSampleRef: 'blueprint-db-pool'
  },
  {
    id: 'DATA-03',
    pillarId: 'heavy-data',
    title: 'Multi-Tier Caching & Dogpile (Thundering Herd) Protection',
    category: 'Caching & Memory',
    priority: 'P0 - Blocker',
    skeletonDefect: 'No distributed cache or naive cache with identical TTL. When a high-traffic cache key expires, 10,000 simultaneous requests hit the database simultaneously (Cache Stampede), causing immediate database outage.',
    enterpriseStandard: 'Multi-tier Cache-Aside pattern: L1 in-process LRU cache + L2 distributed Redis Cluster. Cache stampede protection using probabilistic early expiration (XFetch algorithm) or distributed mutex locks.',
    targetMetric: '>95% Cache Hit Ratio on read-heavy entities; Database protected from stampedes on cache misses.',
    architectureMechanism: 'Application -> L1 Memory -> L2 Redis Cluster (with Mutex lock on miss) -> Database.',
    remediationSteps: [
      'Implement Cache-Aside with Redis Cluster and TLS.',
      'Add distributed locking (Redlock or single-flight mutex) so only 1 worker regenerates an expired cache entry while others wait or serve stale.',
      'Add random jitter (±10%) to TTL values to avoid synchronized bulk expirations.'
    ],
    complianceImpact: ['Performance SLA']
  },
  {
    id: 'DATA-04',
    pillarId: 'heavy-data',
    title: 'Database Index Optimization, Partitioning & Sharding',
    category: 'Database Engineering',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Unindexed foreign keys and filter columns causing full table sequential scans across millions of rows (`Seq Scan on orders`), degrading query times from 5ms to 45,000ms as data grows.',
    enterpriseStandard: 'Index coverage for all foreign keys, composite B-tree indexes for multi-column filters, and range/hash partitioning for tables exceeding 10M rows (e.g., partitioning audit logs or transactions by month).',
    targetMetric: 'Zero sequential table scans on production query plans; P99 database query time < 15ms.',
    architectureMechanism: 'Declarative schema indexes + PostgreSQL declarative table partitioning + pg_stat_statements monitoring.',
    remediationSteps: [
      'Enable `pg_stat_statements` to identify slow queries and missing indexes.',
      'Create composite indexes matched to exact `WHERE` and `ORDER BY` query patterns.',
      'Partition massive append-only tables (audit logs, metrics, telemetry) by date range.'
    ],
    complianceImpact: ['Performance SLA'],
    codeSampleRef: 'blueprint-db-indexes'
  },
  {
    id: 'DATA-05',
    pillarId: 'heavy-data',
    title: 'OLTP vs OLAP Separation & Streaming Change Data Capture (CDC)',
    category: 'Data Pipeline',
    priority: 'P1 - Critical',
    skeletonDefect: 'Heavy reporting, BI queries, and executive dashboards run directly against the live transactional database, locking tables and starving end-user transactions.',
    enterpriseStandard: 'Change Data Capture (Debezium / Google Datastream) streaming transactional changes from PostgreSQL to an analytical data warehouse (BigQuery / Snowflake / ClickHouse) in near real-time.',
    targetMetric: '0 analytical queries on transactional database; Analytics warehouse data freshness < 60 seconds.',
    architectureMechanism: 'PostgreSQL WAL -> CDC Debezium -> Kafka / Pub/Sub -> Analytical Warehouse (BigQuery).',
    remediationSteps: [
      'Enable logical replication on PostgreSQL primary.',
      'Deploy Datastream / Debezium connector to stream updates to BigQuery or Snowflake.',
      'Direct all dashboard and reporting queries to the analytical data warehouse.'
    ],
    complianceImpact: ['Operational Separation of Concerns']
  },
  {
    id: 'DATA-06',
    pillarId: 'heavy-data',
    title: 'Automated Hot / Warm / Cold Data Tiering & Archival',
    category: 'Storage Lifecycle',
    priority: 'P1 - Critical',
    skeletonDefect: 'Database keeps 10 years of raw historical logs and inactive records in expensive, high-IOPS NVMe primary storage, causing storage bloat, costly backups, and vacuuming slowdowns.',
    enterpriseStandard: 'Automated lifecycle policies: Hot data (last 90 days) in primary DB; Warm data (1-2 years) in partitioned warehouse tables; Cold data (>2 years) compressed in object storage (S3 Glacier / Cloud Storage Archive).',
    targetMetric: 'Primary database size maintained within predictable bounds; Storage cost reduced by >60%.',
    architectureMechanism: 'Scheduled pg_partman / partition detachment -> Parquet export -> Cloud Storage Archive.',
    remediationSteps: [
      'Define data retention policy per compliance rules (e.g. 7 years for financial, 90 days for raw telemetry).',
      'Set up cron job or cloud function to detach old partitions and export to compressed Parquet format.',
      'Verify archival data can be queried via external BigQuery/Athena tables on demand.'
    ],
    complianceImpact: ['GDPR Storage Limitation', 'Cost Governance']
  },

  // PILLAR 3: Zero-Trust Security & Identity
  {
    id: 'SEC-01',
    pillarId: 'zero-trust-security',
    title: 'Enterprise Identity Federation (SAML 2.0 / OIDC) & SCIM 2.0',
    category: 'Identity & Access',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Simple email/password or local credentials stored in database. Enterprise clients (Fortune 500) will reject the app immediately because it lacks enterprise SSO and centralized employee deprovisioning.',
    enterpriseStandard: 'Identity federation supporting SAML 2.0 and OpenID Connect (Okta, Azure AD / Microsoft Entra ID, Google Workspace) plus SCIM 2.0 automated provisioning and instant offboarding.',
    targetMetric: '100% enterprise users authenticate via corporate IdP; Employee de-provisioning reflected within 60 seconds.',
    architectureMechanism: 'Enterprise SSO Gateway (WorkOS / Auth0 / NextAuth / Custom SAML Service Provider) + SCIM webhooks.',
    remediationSteps: [
      'Implement multi-tenant SSO routing by organization domain (e.g. `user@enterprise.com` routes to client Okta).',
      'Validate SAML signatures and enforce SHA-256 with current X.509 certificate validation.',
      'Implement SCIM 2.0 `/Users` and `/Groups` endpoints to handle automated lifecycle events.'
    ],
    complianceImpact: ['SOC 2 CC6.1, CC6.2, CC6.3', 'ISO 27001 A.9', 'Enterprise RFP Mandate'],
    codeSampleRef: 'blueprint-security-auth'
  },
  {
    id: 'SEC-02',
    pillarId: 'zero-trust-security',
    title: 'Granular Role-Based & Attribute-Based Access Control (RBAC/ABAC)',
    category: 'Authorization',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Naive `isAdmin: boolean` flag in user table or client-side UI hiding of buttons without server-side validation, leading to Broken Object Level Authorization (BOLA / IDOR).',
    enterpriseStandard: 'Decoupled policy-based authorization (e.g. Open Policy Agent / Casbin / Cerbos) evaluating identity, tenant ID, resource owner, and contextual attributes on every API call.',
    targetMetric: 'Zero authorization bypass vulnerabilities (BOLA/BFLA); Policy evaluation latency < 3ms.',
    architectureMechanism: 'API Gateway / Express middleware calling Policy Decision Point (PDP) before controller dispatch.',
    remediationSteps: [
      'Enforce multi-tenant scoping: every database query MUST include `tenant_id` filter.',
      'Define clear permission matrix (e.g. `billing:read`, `users:manage`, `audit:export`).',
      'Verify authorization at the repository/service layer, not just the HTTP controller.'
    ],
    complianceImpact: ['OWASP Top 10 A01 (Broken Access Control)', 'SOC 2 CC6.1']
  },
  {
    id: 'SEC-03',
    pillarId: 'zero-trust-security',
    title: 'Secrets Management, Vault & Zero Hardcoded Credentials',
    category: 'Secret Hygiene',
    priority: 'P0 - Blocker',
    skeletonDefect: 'API keys, database passwords, and secrets stored in plain `.env` files or hardcoded in repositories, risking accidental git push or unauthorized access.',
    enterpriseStandard: 'Centralized secret management (Google Secret Manager, HashiCorp Vault, AWS Secrets Manager) with automated secret rotation, dynamic database credentials, and IAM least-privilege.',
    targetMetric: 'Zero plaintext secrets in source code, CI/CD logs, or Docker images; Secrets rotated automatically every 90 days.',
    architectureMechanism: 'Runtime injection via Secret Manager with workload identity federation (no static service account keys).',
    remediationSteps: [
      'Migrate all `.env` secrets into Cloud Secret Manager or HashiCorp Vault.',
      'Use Workload Identity (GCP) or IAM Roles for Service Accounts (EKS) rather than static JSON credentials.',
      'Integrate Git pre-commit hooks (TruffleHog / GitGuardian) to block commits containing secrets.'
    ],
    complianceImpact: ['SOC 2 CC6.6', 'ISO 27001 A.10', 'PCI-DSS 3.5']
  },
  {
    id: 'SEC-04',
    pillarId: 'zero-trust-security',
    title: 'Data Encryption at Rest, In-Transit & Envelope Encryption',
    category: 'Cryptography',
    priority: 'P0 - Blocker',
    skeletonDefect: 'PII, customer data, and payment details stored as plaintext strings in the database; internal service-to-service communication runs over unencrypted HTTP.',
    enterpriseStandard: 'End-to-end encryption: TLS 1.3 in-transit with mutual TLS (mTLS) between internal services; AES-256-GCM encryption at rest with customer-managed encryption keys (CMEK) and envelope encryption for sensitive fields.',
    targetMetric: '100% internal and external network traffic encrypted; Sensitive PII fields encrypted with DEK/KEK envelope keys.',
    architectureMechanism: 'Istio/Linkerd service mesh mTLS + Cloud KMS Envelope Encryption for high-risk columns.',
    remediationSteps: [
      'Enforce TLS 1.3 across all load balancers and reject older ciphers.',
      'Implement application-level envelope encryption for sensitive fields (SSN, credit card, health data).',
      'Enable Transparent Data Encryption (TDE) on PostgreSQL with Cloud KMS keys.'
    ],
    complianceImpact: ['HIPAA § 164.312', 'PCI-DSS 3.4', 'GDPR Article 32', 'SOC 2 CC6.7']
  },
  {
    id: 'SEC-05',
    pillarId: 'zero-trust-security',
    title: 'OWASP Top 10 Hardening & Defense-in-Depth Headers',
    category: 'Application Security',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Missing security headers (no CSP, no HSTS, loose CORS allowing `*`), unsanitized inputs susceptible to SQL injection and XSS.',
    enterpriseStandard: 'Strict Content Security Policy (CSP) with nonces, HSTS (`max-age=63072000; includeSubDomains; preload`), parameterized SQL queries, strict CORS whitelist, and automated input validation with Zod.',
    targetMetric: 'Grade A+ on Mozilla Observatory; Zero SQL injection, XSS, or CSRF vulnerabilities in automated DAST/SAST scans.',
    architectureMechanism: 'Helmet middleware + strict Zod schema validation + parameterized ORM.',
    remediationSteps: [
      'Configure Helmet with strict CSP, HSTS, and frameguard headers.',
      'Lock down CORS to verified production tenant origins.',
      'Validate every incoming request body with Zod schemas and reject unparsed parameters.'
    ],
    complianceImpact: ['OWASP Top 10 2021', 'SOC 2 CC6.6', 'PCI-DSS 6.5'],
    codeSampleRef: 'blueprint-server-config'
  },
  {
    id: 'SEC-06',
    pillarId: 'zero-trust-security',
    title: 'Immutable Append-Only Audit Logging Streamed to SIEM',
    category: 'Audit & Forensics',
    priority: 'P0 - Blocker',
    skeletonDefect: 'No audit logs or simple `console.log` output that gets wiped upon container restart. No ability to prove who accessed or modified sensitive customer data during an incident.',
    enterpriseStandard: 'Structured, tamper-evident audit logs capturing: actor identity, IP, tenant ID, action, target resource, timestamp, and diff. Streamed synchronously to write-once SIEM (Splunk, Datadog, Cloud Logging).',
    targetMetric: '100% of state-changing and access events audited; Logs retained for 365+ days in immutable WORM storage.',
    architectureMechanism: 'Audit event publisher -> Cloud Pub/Sub -> Immutable Cloud Storage with Object Lock.',
    remediationSteps: [
      'Implement dedicated audit logging middleware for all mutations and sensitive read queries.',
      'Include actor ID, user agent, IP address, and payload diff in audit records.',
      'Ensure audit logs bypass application database and stream directly to Cloud Logging or SIEM.'
    ],
    complianceImpact: ['SOC 2 CC7.2', 'HIPAA § 164.312(b)', 'ISO 27001 A.12.4']
  },

  // PILLAR 4: Workflow Orchestration & Resilience (Nxt Orchestrator Core)
  {
    id: 'ORCH-01',
    pillarId: 'workflow-resilience',
    title: 'Distributed Saga Pattern & Automatic Compensating Transactions',
    category: 'Orchestration & Workflows',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Multi-step business processes (e.g., Charge Card -> Provision Cloud Tenant -> Send Email) execute sequentially with simple `try/catch`. If Step 2 fails, the card is charged but the tenant is never created (distributed state inconsistency).',
    enterpriseStandard: 'Saga Orchestration pattern (like Nxt Orchestrator, Temporal, or AWS Step Functions). Every forward transaction has a guaranteed compensating rollback transaction executed automatically upon failure.',
    targetMetric: '100% eventual consistency; Zero orphaned charges or half-provisioned resources.',
    architectureMechanism: 'Stateful workflow engine tracking state machine transitions with durable step execution and compensation queue.',
    remediationSteps: [
      'Map multi-step business transactions into explicit Saga steps (Step 1, Step 2, Step 3).',
      'For every step, define its reverse compensation function (e.g. RefundPayment for ProcessPayment).',
      'Persist saga execution state in durable storage before triggering each step.'
    ],
    complianceImpact: ['Financial Audit Consistency', 'SOC 2 Availability & Processing Integrity'],
    codeSampleRef: 'blueprint-saga-orchestrator'
  },
  {
    id: 'ORCH-02',
    pillarId: 'workflow-resilience',
    title: 'Distributed Idempotency Keys with Redis Mutex Locks',
    category: 'Resilience & Concurrency',
    priority: 'P0 - Blocker',
    skeletonDefect: 'If a client loses network connection and retries an HTTP request, or a message broker delivers a message twice (at-least-once delivery), the operation executes twice, resulting in duplicate charges or duplicate rows.',
    enterpriseStandard: 'IETF standard `Idempotency-Key` header enforcement. Server uses Redis atomic `SET NX EX` to acquire key lock, cache response, and return identical response if identical key is re-sent.',
    targetMetric: '0 duplicate mutations on retries; Idempotency evaluation overhead < 1.5ms.',
    architectureMechanism: 'Idempotency HTTP middleware with Redis distributed lock and response cache.',
    remediationSteps: [
      'Require `Idempotency-Key: <UUID>` header on all POST/PUT mutations.',
      'Check Redis for existing key: if currently processing, return 409 Conflict; if already succeeded, return cached response.',
      'Store response body and status code with 24-hour TTL in Redis upon completion.'
    ],
    complianceImpact: ['Payment & Processing Integrity', 'Stripe/Enterprise Standards'],
    codeSampleRef: 'blueprint-idempotency'
  },
  {
    id: 'ORCH-03',
    pillarId: 'workflow-resilience',
    title: 'Circuit Breaker Pattern & Graceful Degraded Fallbacks',
    category: 'Resilience & Reliability',
    priority: 'P1 - Critical',
    skeletonDefect: 'When a downstream 3rd-party API (e.g. LLM provider, payment gateway) slows down or goes offline, all app threads wait for timeouts, consuming socket connections and causing a cascading outage of the entire web app.',
    enterpriseStandard: 'Circuit breaker pattern (Closed -> Open -> Half-Open). When error threshold exceeds 50% over 10 seconds, circuit trips Open immediately, bypassing failing downstream service and returning cached/degraded fallback.',
    targetMetric: 'Fail-fast response in < 1ms when downstream is broken; Automatic self-healing probe when service recovers.',
    architectureMechanism: 'Circuit breaker proxy (opossum / resilience4j) wrapping all external HTTP and RPC calls.',
    remediationSteps: [
      'Wrap all external 3rd-party calls (AI APIs, SMS gateways, webhooks) with a circuit breaker.',
      'Configure failure threshold (50% failures), timeout (2000ms), and reset timeout (15000ms).',
      'Provide graceful degraded user experience (e.g. serve cached recommendation if AI is down).'
    ],
    complianceImpact: ['Availability SLA (99.99%)'],
    codeSampleRef: 'blueprint-circuit-breaker'
  },
  {
    id: 'ORCH-04',
    pillarId: 'workflow-resilience',
    title: 'Exponential Backoff with Full Jitter Retry Strategy',
    category: 'Resilience & Networking',
    priority: 'P1 - Critical',
    skeletonDefect: 'Retries use fixed delays (e.g. retry every 1 second). When an outage resolves, thousands of retrying clients hit the service simultaneously, triggering a massive "Thundering Herd" crash.',
    enterpriseStandard: 'Exponential backoff with Full Jitter algorithm: `Sleep = rand(0, min(cap, base * 2 ^ attempt))`. Desynchronizes retrying clients evenly across the retry window.',
    targetMetric: 'Zero thundering herd spikes on downstream recovery; 99% recovery success on transient network hiccups.',
    architectureMechanism: 'HTTP client retry interceptor with jittered exponential curve.',
    remediationSteps: [
      'Configure Axios or fetch wrapper with exponential backoff and randomized jitter.',
      'Set maximum retry ceiling (e.g. 3 retries, maximum 30 seconds delay).',
      'Only retry transient errors (HTTP 429, 502, 503, 504, ECONNRESET); never retry 4xx client errors.'
    ],
    complianceImpact: ['Operational Resilience']
  },
  {
    id: 'ORCH-05',
    pillarId: 'workflow-resilience',
    title: 'Dead Letter Queues (DLQ) & Poison Pill Poison Isolation',
    category: 'Queue Management',
    priority: 'P1 - Critical',
    skeletonDefect: 'A malformed or corrupt message ("poison pill") fails processing, gets rejected back to queue, and crashes worker repeatedly in an infinite loop, halting all background processing for thousands of customers.',
    enterpriseStandard: 'Dead Letter Queue (DLQ) routing. After 3 failed delivery attempts, the corrupt message is automatically shunted into an isolated DLQ with error context and triggers an alert for manual inspection.',
    targetMetric: 'Zero queue blocking by poison pills; 100% of failed payloads preserved for forensic inspection.',
    architectureMechanism: 'Message broker redelivery policy with maxDeliveryAttempts: 3 -> DLQ topic.',
    remediationSteps: [
      'Configure deadLetterConfig on message queues with maximum retry count of 3.',
      'Build an administrative DLQ inspection and replay dashboard for operations team.',
      'Attach error stack trace and payload metadata to DLQ records.'
    ],
    complianceImpact: ['Operational Integrity', 'SOC 2 Availability']
  },

  // PILLAR 5: High Availability & Disaster Recovery
  {
    id: 'HA-01',
    pillarId: 'ha-disaster-recovery',
    title: 'Multi-Availability-Zone High Availability & Regional Failover',
    category: 'Infrastructure Resilience',
    priority: 'P0 - Blocker',
    skeletonDefect: 'App and database deployed in a single cloud availability zone (e.g. `us-central1-a`). A power or fiber cut in that data center causes a complete company-wide blackout.',
    enterpriseStandard: 'Multi-AZ deployment across at least 3 availability zones with automated cross-zone load balancing. Primary database configured with synchronous standby replica in a second zone with automatic sub-60s failover.',
    targetMetric: 'Zero downtime during single-zone data center outage; 99.99% overall infrastructure availability SLA.',
    architectureMechanism: 'Multi-AZ Cloud Run / GKE + Multi-AZ Cloud SQL with automated failover.',
    remediationSteps: [
      'Enable High Availability (HA) on primary database instance with standby replica in secondary zone.',
      'Distribute container pods across at least 3 zones using topology spread constraints.',
      'Simulate zone failure in non-production environment to verify automatic DNS/load balancer failover.'
    ],
    complianceImpact: ['SOC 2 CC7.3', 'ISO 27001 A.17', 'Enterprise Tier-1 SLA']
  },
  {
    id: 'HA-02',
    pillarId: 'ha-disaster-recovery',
    title: 'Strict RPO (< 1 min) & RTO (< 15 min) Disaster Recovery SLA',
    category: 'Business Continuity',
    priority: 'P0 - Blocker',
    skeletonDefect: 'No written disaster recovery policy or automated recovery plan. If database gets corrupted or wiped, restoring depends on manual steps that can take days with catastrophic data loss.',
    enterpriseStandard: 'Formal RPO (Recovery Point Objective < 1 minute via Continuous Write-Ahead Log archiving) and RTO (Recovery Time Objective < 15 minutes via automated Infrastructure-as-Code reconstruction).',
    targetMetric: 'RPO <= 60 seconds; RTO <= 15 minutes validated via bi-annual Game Day disaster drills.',
    architectureMechanism: 'Continuous WAL archiving + Geo-redundant Object Storage + Terraform automated cluster spinup.',
    remediationSteps: [
      'Configure PostgreSQL Continuous Archiving (WAL archiving) to geo-redundant storage.',
      'Document automated runbooks for multi-region failover.',
      'Execute bi-annual disaster recovery simulation ("Game Day") to validate target RTO/RPO.'
    ],
    complianceImpact: ['SOC 2 A1.2', 'ISO 27001 A.17', 'Business Continuity Mandate']
  },
  {
    id: 'HA-03',
    pillarId: 'ha-disaster-recovery',
    title: 'Automated Point-in-Time Recovery (PITR) & Restore Drills',
    category: 'Data Protection',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Daily database dump backups that run at midnight. If ransomware or an accidental `DROP TABLE` happens at 11:59 PM, 24 hours of enterprise customer transactions are irreversibly destroyed.',
    enterpriseStandard: 'Continuous Point-in-Time Recovery (PITR) allowing restoration of the database to any specific microsecond in the past 35 days. Automated daily restore verification tests into an isolated test instance.',
    targetMetric: 'Zero data loss beyond 10 seconds; Automated backup verification executes every 24 hours.',
    architectureMechanism: 'Automated Cloud SQL / RDS PITR + Cloud Function daily automated restore testing.',
    remediationSteps: [
      'Enable Point-in-Time Recovery with continuous transaction log backup.',
      'Set backup retention window to minimum 30 days with multi-region backup replication.',
      'Create automated CI script that restores latest backup to a temporary database to verify backup integrity.'
    ],
    complianceImpact: ['SOC 2 CC7.4', 'ISO 27001 A.12.3']
  },
  {
    id: 'HA-04',
    pillarId: 'ha-disaster-recovery',
    title: 'Graceful Termination & Zero-Downtime Connection Draining',
    category: 'Runtime Lifecycle',
    priority: 'P1 - Critical',
    skeletonDefect: 'When new code deploys, orchestrator sends `SIGKILL` or instant shutdown. In-flight HTTP requests and database transactions are abruptly severed, throwing 502 Bad Gateway to active users.',
    enterpriseStandard: 'Graceful shutdown handling `SIGTERM`: stops accepting new connections, signals load balancer health check failure, waits up to 30 seconds for in-flight requests to complete, and safely flushes DB connection pools.',
    targetMetric: 'Zero HTTP 502/503 errors during rolling code deployments or node recycling.',
    architectureMechanism: 'Process signal handling (`SIGTERM`/`SIGINT`) + Readiness probe orchestration.',
    remediationSteps: [
      'Listen for `SIGTERM` in Node.js server and call `server.close()`.',
      'Set readiness probe to return 503 immediately after `SIGTERM` so load balancer stops routing new traffic.',
      'Wait for active database queries to complete with 15-30 second grace period before calling `process.exit(0)`.'
    ],
    complianceImpact: ['Availability SLA (99.99%)'],
    codeSampleRef: 'blueprint-server-config'
  },
  {
    id: 'HA-05',
    pillarId: 'ha-disaster-recovery',
    title: 'DNS Failover & Global Traffic Management (Anycast Geo-Routing)',
    category: 'Network Resilience',
    priority: 'P1 - Critical',
    skeletonDefect: 'Single static A-record in DNS pointing to one IP address. If the host becomes unreachable, DNS TTL caching prevents redirecting users for hours.',
    enterpriseStandard: 'Global Traffic Management (GTM) via Anycast DNS (Cloudflare / Route 53 / Google Cloud DNS) with automated health probes and sub-30-second automated failover to alternate region.',
    targetMetric: 'Global DNS failover triggers within 30 seconds of primary origin health check failure.',
    architectureMechanism: 'Anycast DNS health probes -> Active-Active or Active-Passive origin pool routing.',
    remediationSteps: [
      'Set DNS TTL to 60 seconds on production endpoints.',
      'Configure external synthetic health probes to ping `/health/ready` endpoint every 10 seconds from 5 global locations.',
      'Set up automatic failover routing to secondary region if probe fails 3 consecutive times.'
    ],
    complianceImpact: ['Availability SLA']
  },

  // PILLAR 6: Observability, Telemetry & APM
  {
    id: 'OBS-01',
    pillarId: 'observability-apm',
    title: 'OpenTelemetry (OTel) Distributed Tracing & W3C TraceContext',
    category: 'Tracing & Observability',
    priority: 'P0 - Blocker',
    skeletonDefect: 'When a user complains that a request took 15 seconds, engineers have no visibility into which microservice, database query, or 3rd-party API caused the delay.',
    enterpriseStandard: 'Full OpenTelemetry instrumentation propagating W3C `traceparent` headers across every HTTP, RPC, and queue boundary. Flame-graph waterfall visualization of every request span.',
    targetMetric: '100% of incoming requests tagged with unique Trace ID; P99 latency bottlenecks pinpointed in < 60 seconds.',
    architectureMechanism: 'OpenTelemetry SDK auto-instrumentation -> OTel Collector -> Jaeger / Cloud Trace / Datadog.',
    remediationSteps: [
      'Initialize OpenTelemetry Node SDK at application bootstrap before any other imports.',
      'Propagate `traceparent` and `tracestate` headers across outbound HTTP and message broker calls.',
      'Export traces to Google Cloud Trace, Datadog, or Grafana Tempo.'
    ],
    complianceImpact: ['SOC 2 CC7.2', 'ISO 27001 A.12.4'],
    codeSampleRef: 'blueprint-opentelemetry'
  },
  {
    id: 'OBS-02',
    pillarId: 'observability-apm',
    title: 'Standardized RED & USE Metrics Instrumentation',
    category: 'Telemetry & Metrics',
    priority: 'P1 - Critical',
    skeletonDefect: 'No application metrics. Engineers only discover issues after customers file support tickets or tweet about outages.',
    enterpriseStandard: 'Prometheus-compatible metrics: RED metrics for services (Rate [req/s], Errors [err/s], Duration [latency histograms]) and USE metrics for infrastructure (Utilization, Saturation, Errors).',
    targetMetric: 'Sub-second real-time metrics scraped every 15s; Granular P50, P95, P99, and P99.9 latency percentiles.',
    architectureMechanism: '`prom-client` exporter -> Prometheus / Google Cloud Monitoring -> Grafana Dashboards.',
    remediationSteps: [
      'Expose `/metrics` endpoint with `prom-client` protected by internal network token.',
      'Record histogram metrics for HTTP request duration with logarithmic buckets (10ms to 10,000ms).',
      'Track custom business metrics: active users, orders placed, queue lag, cache hit ratio.'
    ],
    complianceImpact: ['Operational SRE Mandate']
  },
  {
    id: 'OBS-03',
    pillarId: 'observability-apm',
    title: 'Structured JSON Logging with Correlation & Tenant Context',
    category: 'Logging & Auditing',
    priority: 'P1 - Critical',
    skeletonDefect: 'Plain text `console.log("Error occurred: " + err)` lacking timestamp, severity level, trace ID, or tenant ID, making log aggregation, indexing, and debugging impossible at scale.',
    enterpriseStandard: 'High-performance structured JSON logging (Pino / Winston) outputting standard schema: `level`, `time`, `trace_id`, `span_id`, `tenant_id`, `user_id`, `message`, `stack_trace`. Automatic PII masking.',
    targetMetric: '100% structured JSON logs; Queryable in Elasticsearch/BigQuery; 0 plaintext passwords or credit cards logged.',
    architectureMechanism: 'Fast Pino logger with redaction serializer -> stdout -> Cloud Logging agent.',
    remediationSteps: [
      'Replace all `console.log` with Pino logger configured for JSON output.',
      'Inject current Trace ID and Tenant ID into logger context on every request.',
      'Configure automatic redaction paths for sensitive fields (`password`, `token`, `secret`, `creditCard`).'
    ],
    complianceImpact: ['SOC 2 CC7.1', 'GDPR Article 32', 'PCI-DSS 3.4']
  },
  {
    id: 'OBS-04',
    pillarId: 'observability-apm',
    title: 'Service Level Objectives (SLOs) & Error Budget Alerting',
    category: 'SRE & Reliability',
    priority: 'P1 - Critical',
    skeletonDefect: 'Alerts fire on every raw CPU spike or transient 500 error, resulting in alert fatigue and ignored notifications, or alerts only trigger after total system collapse.',
    enterpriseStandard: 'Google SRE-style Service Level Objectives: Define SLI (Service Level Indicator, e.g. 99.9% of HTTP requests return 2xx in < 200ms) and burn-rate alerting based on 1-hour and 6-hour error budget consumption.',
    targetMetric: 'Alerts page on-call SRE only when error budget burn rate threatens monthly SLO target.',
    architectureMechanism: 'Prometheus Alertmanager / Google Cloud Monitoring alerting policies -> PagerDuty.',
    remediationSteps: [
      'Establish availability SLO (99.95%) and latency SLO (P95 < 200ms).',
      'Configure multi-window multi-burn-rate alerting rules in Prometheus or Cloud Monitoring.',
      'Route high-severity alerts to PagerDuty/Opsgenie and warnings to Slack/Teams.'
    ],
    complianceImpact: ['Enterprise Customer SLA Guarantees']
  },
  {
    id: 'OBS-05',
    pillarId: 'observability-apm',
    title: 'Automated Real User Monitoring (RUM) & Synthetic Probers',
    category: 'End-to-End Monitoring',
    priority: 'P2 - High',
    skeletonDefect: 'Backend thinks everything is healthy (green 200 OK), but frontend JavaScript broke on Safari or CDN DNS resolution failed in Europe, causing users to see blank white screens.',
    enterpriseStandard: 'Synthetic probers running automated headless browser journeys (Playwright) every 5 minutes from 6 global regions, combined with frontend Real User Monitoring (Web Vitals + Sentry).',
    targetMetric: 'Detect frontend regressions or regional DNS failures within 5 minutes without relying on user reports.',
    architectureMechanism: 'Synthetic Playwright check -> Cloud Monitoring / Datadog Synthetics.',
    remediationSteps: [
      'Write synthetic end-to-end check script verifying: Load Homepage -> Log in -> Fetch Dashboard -> Verify data.',
      'Run synthetic check every 5 minutes from multiple worldwide regions.',
      'Integrate frontend error reporting (Sentry) with source maps uploaded during CI build.'
    ],
    complianceImpact: ['Customer Experience SLA']
  },

  // PILLAR 7: Compliance, Governance & Data Sovereignty
  {
    id: 'COMP-01',
    pillarId: 'compliance-governance',
    title: 'SOC 2 Type II & ISO/IEC 27001 Certification Readiness',
    category: 'Regulatory & Trust',
    priority: 'P0 - Blocker',
    skeletonDefect: 'No evidence of change management, employee access control, vendor risk assessments, or disaster recovery documentation. Enterprise procurement security reviews will immediately disqualify the app.',
    enterpriseStandard: 'Continuous compliance monitoring platform (Vanta / Drata) integrated with cloud infrastructure, GitHub, and identity providers to continuously audit 100+ SOC 2 Trust Services Criteria.',
    targetMetric: '100% automated test compliance score in Vanta/Drata; Ready for annual SOC 2 Type II audit report.',
    architectureMechanism: 'Automated compliance agent monitoring GCP/AWS IAM, GitHub branch protections, and endpoint encryption.',
    remediationSteps: [
      'Implement mandatory multi-factor authentication (MFA) across all developer and admin accounts.',
      'Enforce branch protection rules: minimum 2 pull request approvals and passing automated tests before merge.',
      'Implement automated background checks and security awareness training for all contributors.'
    ],
    complianceImpact: ['SOC 2 Type II Security, Availability, Confidentiality', 'ISO 27001:2022']
  },
  {
    id: 'COMP-02',
    pillarId: 'compliance-governance',
    title: 'GDPR / CCPA Data Subject Access & Right to be Forgotten',
    category: 'Data Privacy',
    priority: 'P0 - Blocker',
    skeletonDefect: 'User data scattered across 15 unmapped database tables, Redis caches, log files, and analytical pipelines. When an EU customer requests data deletion under GDPR, compliance is legally impossible.',
    enterpriseStandard: 'Automated privacy orchestration: Unified customer identifier mapping with automated Right to Erasure (Article 17) and Data Portability (Article 20) batch processing completing within 30 days.',
    targetMetric: 'Execute complete customer data erasure and anonymization across all relational tables in < 5 minutes.',
    architectureMechanism: 'Automated privacy worker executing cascading anonymization across database and data warehouse.',
    remediationSteps: [
      'Maintain an exhaustive Data Inventory & Record of Processing Activities (RoPA).',
      'Implement an automated `/api/v1/user/export` and `/api/v1/user/erase` background orchestration job.',
      'Replace identifiable PII with cryptographic hashes or pseudonymized IDs in historical analytical tables.'
    ],
    complianceImpact: ['GDPR Article 15, 17, 20', 'CCPA/CPRA § 1798.105']
  },
  {
    id: 'COMP-03',
    pillarId: 'compliance-governance',
    title: 'Data Residency & Multi-Region Sovereignty Boundaries',
    category: 'Sovereignty & Isolation',
    priority: 'P1 - Critical',
    skeletonDefect: 'All customer data stored in a single US region. European, German, or Australian enterprise clients cannot legally use the service due to GDPR Schrems II data export restrictions.',
    enterpriseStandard: 'Tenant-level data pinning: European tenant databases physically hosted strictly in Frankfurt/Zurich (`europe-west3`); US tenant data hosted in Iowa/Virginia. Cross-region replication strictly blocked.',
    targetMetric: 'Zero customer PII traverses geographic boundaries; Strict compliance with EU Schrems II ruling.',
    architectureMechanism: 'Tenant routing gateway + geo-sharded databases with Cloud SQL regional isolation.',
    remediationSteps: [
      'Store tenant geographic preference during organization onboarding.',
      'Provision dedicated regional database clusters (US, EU, APAC).',
      'Enforce routing at the API Gateway based on tenant residency policy.'
    ],
    complianceImpact: ['GDPR Chapter V (International Transfers)', 'BSI C5', 'Australian Privacy Principles']
  },
  {
    id: 'COMP-04',
    pillarId: 'compliance-governance',
    title: 'Software Bill of Materials (SBOM) & Automated Vulnerability Gates',
    category: 'Supply Chain Security',
    priority: 'P1 - Critical',
    skeletonDefect: 'Using outdated npm packages with critical CVEs (e.g. Prototype Pollution, Remote Code Execution). No visibility into dependency tree vulnerabilities.',
    enterpriseStandard: 'Automated CI/CD dependency security gates: CycloneDX / SPDX Software Bill of Materials (SBOM) generated on every build. Snyk / Dependabot blocks merges on any High/Critical CVE.',
    targetMetric: 'Zero unresolved High or Critical CVEs in production; SBOM artifact published with every release.',
    architectureMechanism: 'GitHub Actions security scanner -> Snyk / Trivy container image scanning -> Artifact Registry.',
    remediationSteps: [
      'Enable Dependabot / Renovate automated security PRs in repository.',
      'Add Trivy container vulnerability scanner in CI pipeline to fail builds on Critical CVEs.',
      'Generate CycloneDX SBOM on release and store in signed artifact registry.'
    ],
    complianceImpact: ['US Executive Order 14028', 'SOC 2 CC6.8', 'ISO 27001 A.14']
  },
  {
    id: 'COMP-05',
    pillarId: 'compliance-governance',
    title: 'Strict Data Retention Policies & Cryptographic Erasure',
    category: 'Data Governance',
    priority: 'P1 - Critical',
    skeletonDefect: 'Temporary tokens, debug session dumps, and obsolete logs retained indefinitely, exposing the company to massive legal liability during discovery or breach.',
    enterpriseStandard: 'Cryptographic data erasure and strict retention limits: Web session tokens expire in 14 days, raw access logs purged after 90 days, audit logs retained for 7 years then cryptographically destroyed.',
    targetMetric: 'Automated TTL expiration on 100% of temporary data tables; 0 orphaned data records.',
    architectureMechanism: 'Database scheduled lifecycle jobs + Cloud Storage Object Lifecycle Management.',
    remediationSteps: [
      'Configure Cloud Storage bucket lifecycle rules: auto-delete raw logs older than 90 days.',
      'Implement scheduled database cleanup tasks for expired invites, password reset tokens, and unverified users.',
      'Document and publish enterprise Data Retention Policy to customers.'
    ],
    complianceImpact: ['GDPR Article 5(1)(e)', 'HIPAA § 164.316']
  },

  // PILLAR 8: CI/CD & Production Operations
  {
    id: 'OPS-01',
    pillarId: 'cicd-sre-operations',
    title: 'Zero-Downtime Blue/Green & Progressive Canary Deployments',
    category: 'Deployment Strategy',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Deployments stop the old container and start the new container directly. If a critical bug slipped into the build, 100% of users experience an immediate outage.',
    enterpriseStandard: 'Progressive Canary Deployments (Argo Rollouts / Cloud Run traffic splitting): Release to 5% of internal traffic -> verify error rate and latency for 10 minutes -> expand to 25% -> 50% -> 100%. Automatic instant rollback if errors spike.',
    targetMetric: 'Rollout failures automatically aborted in < 30 seconds affecting < 5% of users; Zero downtime.',
    architectureMechanism: 'Cloud Run / Kubernetes Service Mesh traffic weight splitting + automated metric analysis.',
    remediationSteps: [
      'Implement traffic splitting between `latest` and `stable` revisions in deployment pipeline.',
      'Configure automated rollback trigger if HTTP 5xx rate increases by > 0.5% during canary phase.',
      'Use feature flags (LaunchDarkly / Unleash) to decouple code deployment from feature release.'
    ],
    complianceImpact: ['Availability SLA (99.99%)', 'SOC 2 CC8.1']
  },
  {
    id: 'OPS-02',
    pillarId: 'cicd-sre-operations',
    title: 'Expand-and-Contract Zero-Downtime Database Migrations',
    category: 'Database Migrations',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Migrations rename or drop columns while older application code is still running, causing active pods to throw SQL errors during the deployment window.',
    enterpriseStandard: 'Expand-and-Contract migration pattern: 1) Add new nullable column (Expand), 2) Deploy app writing to both columns and reading from new, 3) Backfill historical data, 4) Remove old code reads, 5) Drop old column (Contract).',
    targetMetric: 'Zero database schema lock timeouts; 100% backwards compatibility during rolling releases.',
    architectureMechanism: 'Two-phase migration lifecycle scripts + Prisma/Drizzle migration safety linter.',
    remediationSteps: [
      'Prohibit destructive operations (`DROP COLUMN`, `RENAME COLUMN`) in single deployment PRs.',
      'Run database migrations in isolated pre-deploy step before new pods receive traffic.',
      'Add safety linter checking for dangerous locks (e.g. adding non-null columns without defaults).'
    ],
    complianceImpact: ['Availability SLA', 'Continuous Delivery Mandate']
  },
  {
    id: 'OPS-03',
    pillarId: 'cicd-sre-operations',
    title: 'GitOps Infrastructure-as-Code (Terraform / OpenTofu) & Drift Detection',
    category: 'Infrastructure as Code',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Cloud resources (databases, firewall rules, VPCs) configured manually clicking buttons in the Cloud Console. Nobody knows the exact configuration or can recreate it in another region.',
    enterpriseStandard: '100% declared in declarative Infrastructure-as-Code (Terraform/OpenTofu). Version controlled in Git, peer-reviewed via PR, deployed via CI/CD, and monitored for drift continuously.',
    targetMetric: 'Full production environment reconstructable from zero in any region in < 20 minutes.',
    architectureMechanism: 'Terraform modules with remote state locking in Google Cloud Storage + GitHub Actions automation.',
    remediationSteps: [
      'Export all manually created cloud infrastructure into modular Terraform definitions.',
      'Store Terraform state in encrypted Cloud Storage bucket with object versioning and state locking.',
      'Schedule daily drift detection workflow to catch any manual console tampering.'
    ],
    complianceImpact: ['SOC 2 CC6.8, CC8.1', 'ISO 27001 A.12.1'],
    codeSampleRef: 'blueprint-terraform'
  },
  {
    id: 'OPS-04',
    pillarId: 'cicd-sre-operations',
    title: 'Automated Load Testing (k6) & Chaos Engineering Resiliency Drills',
    category: 'Quality & Stress Testing',
    priority: 'P1 - Critical',
    skeletonDefect: 'App only tested with 1 developer on `localhost:3000`. Performance under peak Black Friday load is completely unknown until it crashes live.',
    enterpriseStandard: 'Automated performance benchmarks integrated into CI: k6 / Locust load tests simulating 50,000 requests/sec. Chaos engineering (Chaos Mesh / Gremlin) randomly killing pods and injecting network latency.',
    targetMetric: 'Pass sustained 5x peak traffic load tests with P99 < 150ms before major releases.',
    architectureMechanism: 'Scheduled k6 load testing pipeline against staging environment + Chaos testing schedule.',
    remediationSteps: [
      'Author k6 script simulating realistic user journeys (browsing, searching, checkout).',
      'Execute automated load test against pre-production environment on every minor/major release tag.',
      'Inject simulated database latency (500ms) to ensure circuit breakers and timeouts work properly.'
    ],
    complianceImpact: ['Capacity Planning SLA', 'SOC 2 Availability']
  },
  {
    id: 'OPS-05',
    pillarId: 'cicd-sre-operations',
    title: 'Multi-Environment Isolation & Least Privilege IAM Pipeline',
    category: 'Environment Governance',
    priority: 'P0 - Blocker',
    skeletonDefect: 'Developers have root admin credentials to production database; staging and production share the same database or VPC network.',
    enterpriseStandard: 'Strict separation of environments: Development, Staging, and Production live in isolated Cloud Projects/Accounts with dedicated VPC networks and zero shared credentials. CI/CD uses short-lived tokens via OIDC.',
    targetMetric: 'Zero human write access to production database except via audited break-glass procedure.',
    architectureMechanism: 'Separate GCP/AWS Projects + Workload Identity Federation for CI/CD + Just-In-Time access approval.',
    remediationSteps: [
      'Split environments into distinct Google Cloud Projects (`project-dev`, `project-staging`, `project-prod`).',
      'Revoke static IAM user keys and require Google Workload Identity Federation for GitHub Actions.',
      'Implement audited "Break-Glass" workflow with 4-hour automatic expiration for emergency production access.'
    ],
    complianceImpact: ['SOC 2 CC6.1, CC6.3', 'ISO 27001 A.9', 'PCI-DSS 7.1']
  }
];
