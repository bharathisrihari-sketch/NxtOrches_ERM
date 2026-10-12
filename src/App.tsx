/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNav, ActiveTab } from './components/TopNav';
import { PillarChecklist } from './components/PillarChecklist';
import { ArchitectureComparison } from './components/ArchitectureComparison';
import { ScaleSimulator } from './components/ScaleSimulator';
import { SagaOrchestratorVisualizer } from './components/SagaOrchestratorVisualizer';
import { BlueprintLibrary } from './components/BlueprintLibrary';
import { StackDiagnostic } from './components/StackDiagnostic';
import { AuditReportModal } from './components/AuditReportModal';
import { PILLARS, ENTERPRISE_CHECK_ITEMS } from './data/enterpriseMatrixData';
import { AuditStatus } from './types/orchestrator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('checklist');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBlueprintRef, setSelectedBlueprintRef] = useState<string | null>(null);

  // Persistent Audit Status Map
  const [auditStatusMap, setAuditStatusMap] = useState<Record<string, AuditStatus>>(() => {
    try {
      const saved = localStorage.getItem('nxt_enterprise_audit_state');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore fallback
    }
    // Default initial seed: 3 sample items compliant, 3 in progress to give immediate life
    return {
      'SCALE-01': 'compliant',
      'SCALE-04': 'in-progress',
      'DATA-01': 'compliant',
      'SEC-01': 'in-progress',
      'SEC-05': 'compliant',
      'ORCH-01': 'in-progress',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('nxt_enterprise_audit_state', JSON.stringify(auditStatusMap));
    } catch {
      // Fallback
    }
  }, [auditStatusMap]);

  const handleUpdateStatus = (id: string, status: AuditStatus) => {
    setAuditStatusMap((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const handleNavigateToBlueprint = (blueprintId: string) => {
    setSelectedBlueprintRef(blueprintId);
    setActiveTab('blueprints');
  };

  const completedChecksCount = ENTERPRISE_CHECK_ITEMS.filter(
    (item) => auditStatusMap[item.id] === 'compliant'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 3-Zone Top Navigation Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        completedChecksCount={completedChecksCount}
        totalChecksCount={ENTERPRISE_CHECK_ITEMS.length}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {activeTab === 'checklist' && (
          <PillarChecklist
            pillars={PILLARS}
            items={ENTERPRISE_CHECK_ITEMS}
            auditStatusMap={auditStatusMap}
            onUpdateStatus={handleUpdateStatus}
            onNavigateToBlueprint={handleNavigateToBlueprint}
          />
        )}

        {activeTab === 'topology' && <ArchitectureComparison />}

        {activeTab === 'simulator' && <ScaleSimulator />}

        {activeTab === 'workflows' && <SagaOrchestratorVisualizer />}

        {activeTab === 'blueprints' && (
          <BlueprintLibrary initialBlueprintId={selectedBlueprintRef} />
        )}

        {activeTab === 'diagnostic' && <StackDiagnostic />}
      </main>

      {/* Audit Report Modal */}
      <AuditReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        pillars={PILLARS}
        items={ENTERPRISE_CHECK_ITEMS}
        auditStatusMap={auditStatusMap}
      />

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Nxt Orchestrator</span>
            <span>—</span>
            <span>Enterprise Application Readiness &amp; Architecture Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('checklist')}
              className="hover:text-slate-300 transition-colors"
            >
              Checklist Matrix
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('topology')}
              className="hover:text-slate-300 transition-colors"
            >
              Topology
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('workflows')}
              className="hover:text-slate-300 transition-colors"
            >
              Saga Engine
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('blueprints')}
              className="hover:text-slate-300 transition-colors"
            >
              Code Blueprints
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
