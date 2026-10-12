import React, { useState, useMemo } from 'react';
import { 
  PillarMeta, 
  EnterpriseCheckItem, 
  AuditStatus, 
  PillarId 
} from '../types/orchestrator';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MinusCircle, 
  Code2, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface PillarChecklistProps {
  pillars: PillarMeta[];
  items: EnterpriseCheckItem[];
  auditStatusMap: Record<string, AuditStatus>;
  onUpdateStatus: (id: string, status: AuditStatus) => void;
  onNavigateToBlueprint: (refId: string) => void;
}

export const PillarChecklist: React.FC<PillarChecklistProps> = ({
  pillars,
  items,
  auditStatusMap,
  onUpdateStatus,
  onNavigateToBlueprint,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<PillarId | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(items[0]?.id || null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesPillar = selectedPillar === 'all' || item.pillarId === selectedPillar;
      const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.skeletonDefect.toLowerCase().includes(query) ||
        item.enterpriseStandard.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.architectureMechanism.toLowerCase().includes(query);

      return matchesPillar && matchesPriority && matchesSearch;
    });
  }, [items, selectedPillar, selectedPriority, searchQuery]);

  // Pillar statistics
  const pillarStats = useMemo(() => {
    const stats: Record<string, { total: number; compliant: number }> = {};
    for (const p of pillars) {
      const pItems = items.filter((i) => i.pillarId === p.id);
      const compliantCount = pItems.filter((i) => auditStatusMap[i.id] === 'compliant').length;
      stats[p.id] = { total: pItems.length, compliant: compliantCount };
    }
    return stats;
  }, [pillars, items, auditStatusMap]);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Enterprise Transformation Matrix
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Comprehensive production readiness specification to transition prototype web applications into high-availability enterprise platforms capable of handling millions of concurrent users, heavy transactional volumes, and zero-trust security audits.
        </p>
      </div>

      {/* Pillar Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          onClick={() => setSelectedPillar('all')}
          className={`p-3 text-left rounded-lg transition-all border ${
            selectedPillar === 'all'
              ? 'bg-slate-800 border-indigo-500/80 text-white shadow-sm'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider mb-1">Overview</div>
          <div className="text-sm font-bold text-white whitespace-nowrap">All Pillars</div>
          <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            {items.length} checks
          </div>
        </button>

        {pillars.map((pillar) => {
          const stat = pillarStats[pillar.id] || { total: 0, compliant: 0 };
          const isSelected = selectedPillar === pillar.id;

          return (
            <button
              key={pillar.id}
              onClick={() => setSelectedPillar(pillar.id)}
              className={`p-3 text-left rounded-lg transition-all border ${
                isSelected
                  ? 'bg-slate-800 border-indigo-500/80 text-white shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 truncate">
                {pillar.shortTitle}
              </div>
              <div className="text-xs font-bold text-white truncate">
                {pillar.name.split('. ')[1] || pillar.name}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                {stat.compliant}/{stat.total} verified
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search checks by keyword (e.g., Redis, PgBouncer, SAML, mTLS, Saga, DLQ, HSTS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
            {['all', 'P0 - Blocker', 'P1 - Critical', 'P2 - High'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedPriority === p
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === 'all' ? 'All' : p.split(' - ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Items Accordion / Matrix */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-400 text-sm">No enterprise checks match your current filter query.</p>
            <button
              onClick={() => { setSelectedPillar('all'); setSelectedPriority('all'); setSearchQuery(''); }}
              className="mt-3 text-xs text-indigo-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const currentStatus = auditStatusMap[item.id] || 'not-started';
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'bg-slate-900/90 border-slate-700 shadow-lg'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                {/* Collapsed Bar / Summary Row */}
                <div className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="font-mono text-xs text-indigo-400 shrink-0 pt-0.5">
                      {item.id}
                    </span>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-100">
                          {item.title}
                        </h2>
                        
                        <span className={`text-xs font-medium ${
                          item.priority.includes('P0') 
                            ? 'text-rose-400' 
                            : item.priority.includes('P1') 
                            ? 'text-amber-400' 
                            : 'text-sky-400'
                        }`}>
                          {item.priority}
                        </span>

                        <span className="text-xs text-slate-500">
                          · {item.category}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Target Standard:</span>
                        <span className="font-mono tabular-nums text-slate-300">{item.targetMetric}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle & Details Trigger */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Segmented Status Selector */}
                    <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                      <button
                        title="Mark Verified & Compliant"
                        onClick={() => onUpdateStatus(item.id, 'compliant')}
                        className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                          currentStatus === 'compliant'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Pass</span>
                      </button>

                      <button
                        title="Mark Work In Progress"
                        onClick={() => onUpdateStatus(item.id, 'in-progress')}
                        className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                          currentStatus === 'in-progress'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">In Dev</span>
                      </button>

                      <button
                        title="Mark Gap / Not Started"
                        onClick={() => onUpdateStatus(item.id, 'not-started')}
                        className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                          currentStatus === 'not-started'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Gap</span>
                      </button>

                      <button
                        title="Mark Not Applicable"
                        onClick={() => onUpdateStatus(item.id, 'not-applicable')}
                        className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                          currentStatus === 'not-applicable'
                            ? 'bg-slate-800 text-slate-300'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">N/A</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Drawer: The Gap Analysis & Enterprise Specification */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/60 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: The Prototype / AI Studio Skeleton Defect */}
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Prototype / AI Studio Skeleton Gap</span>
                        </div>
                        <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 text-sm text-slate-300 leading-relaxed">
                          {item.skeletonDefect}
                        </div>
                      </div>

                      {/* Right: The Enterprise Standard */}
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enterprise Tier-1 Standard</span>
                        </div>
                        <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-sm text-slate-300 leading-relaxed">
                          {item.enterpriseStandard}
                        </div>
                      </div>
                    </div>

                    {/* Architectural Mechanism */}
                    <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Architectural Mechanism & Invariants
                      </div>
                      <p className="text-sm font-mono text-indigo-300">
                        {item.architectureMechanism}
                      </p>
                    </div>

                    {/* Step-by-Step Remediation Plan */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Engineered Remediation Steps
                      </div>
                      <ol className="space-y-2">
                        {item.remediationSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="font-mono text-xs text-slate-500 font-semibold pt-0.5">
                              0{idx + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Compliance & Code Blueprint Action */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-slate-300">Compliance Frameworks:</span>
                        {item.complianceImpact.map((comp, idx) => (
                          <span key={idx} className="text-slate-400">
                            {idx > 0 && '·'} {comp}
                          </span>
                        ))}
                      </div>

                      {item.codeSampleRef && (
                        <button
                          onClick={() => onNavigateToBlueprint(item.codeSampleRef!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 rounded-lg hover:bg-indigo-900/40 transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>View Enterprise Code Blueprint</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
