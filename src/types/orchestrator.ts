export type PillarId = 
  | 'scale-concurrency'
  | 'heavy-data'
  | 'zero-trust-security'
  | 'workflow-resilience'
  | 'ha-disaster-recovery'
  | 'observability-apm'
  | 'compliance-governance'
  | 'cicd-sre-operations';

export type PriorityLevel = 'P0 - Blocker' | 'P1 - Critical' | 'P2 - High';

export type AuditStatus = 'not-started' | 'in-progress' | 'compliant' | 'not-applicable';

export interface EnterpriseCheckItem {
  id: string;
  pillarId: PillarId;
  title: string;
  category: string;
  priority: PriorityLevel;
  skeletonDefect: string;
  enterpriseStandard: string;
  targetMetric: string;
  architectureMechanism: string;
  remediationSteps: string[];
  codeSampleRef?: string;
  complianceImpact: string[];
}

export interface PillarMeta {
  id: PillarId;
  name: string;
  shortTitle: string;
  tagline: string;
  iconName: string;
  itemCount: number;
}

export interface CodeBlueprint {
  id: string;
  title: string;
  pillarId: PillarId;
  language: 'typescript' | 'sql' | 'hcl' | 'yaml';
  filename: string;
  description: string;
  snippet: string;
  productionNotes: string[];
}

export interface SimulationResult {
  concurrentUsers: number;
  requestsPerSecond: number;
  skeletonState: {
    status: 'Healthy' | 'Degraded' | 'Catastrophic Failure';
    latencyMs: number;
    errorRate: number;
    dbConnections: number;
    failureRootCause?: string;
  };
  enterpriseState: {
    status: 'Healthy' | 'Auto-Scaling' | 'Throttled (Safe)';
    latencyMs: number;
    errorRate: number;
    dbConnections: number;
    cdnHitRatio: number;
    cacheHitRatio: number;
    activeReplicas: number;
  };
}
