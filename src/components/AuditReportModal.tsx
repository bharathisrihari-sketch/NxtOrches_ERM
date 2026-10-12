import React, { useState } from 'react';
import { PillarMeta, EnterpriseCheckItem, AuditStatus } from '../types/orchestrator';
import { X, Download, Copy, Check, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillars: PillarMeta[];
  items: EnterpriseCheckItem[];
  auditStatusMap: Record<string, AuditStatus>;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  pillars,
  items,
  auditStatusMap,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalCount = items.length;
  const compliantCount = items.filter((i) => auditStatusMap[i.id] === 'compliant').length;
  const inProgressCount = items.filter((i) => auditStatusMap[i.id] === 'in-progress').length;
  const gapCount = items.filter((i) => !auditStatusMap[i.id] || auditStatusMap[i.id] === 'not-started').length;
  const naCount = items.filter((i) => auditStatusMap[i.id] === 'not-applicable').length;

  const applicableTotal = totalCount - naCount;
  const readinessScore = applicableTotal > 0 ? Math.round((compliantCount / applicableTotal) * 100) : 0;

  // Find remaining P0 blockers
  const p0Blockers = items.filter(
    (i) => i.priority === 'P0 - Blocker' && auditStatusMap[i.id] !== 'compliant' && auditStatusMap[i.id] !== 'not-applicable'
  );

  const generateMarkdownReport = () => {
    let md = `# Enterprise Readiness Audit Report — Nxt Orchestrator\n`;
    md += `Generated: ${new Date().toISOString()}\n`;
    md += `Overall Enterprise Readiness Score: ${readinessScore}%\n`;
    md += `Verified Compliant: ${compliantCount} / ${totalCount} checks (${gapCount} gaps, ${inProgressCount} in progress)\n\n`;

    md += `## P0 Blockers Remaining (${p0Blockers.length})\n`;
    p0Blockers.forEach((b) => {
      md += `- [ ] **${b.id} ${b.title}** (${b.category})\n  *Gap:* ${b.skeletonDefect}\n  *Enterprise Standard:* ${b.enterpriseStandard}\n\n`;
    });

    md += `## Pillar Breakdown\n`;
    pillars.forEach((p) => {
      const pItems = items.filter((i) => i.pillarId === p.id);
      const pCompliant = pItems.filter((i) => auditStatusMap[i.id] === 'compliant').length;
      md += `### ${p.name}: ${pCompliant}/${pItems.length} Verified\n`;
      pItems.forEach((i) => {
        const st = auditStatusMap[i.id] || 'not-started';
        md += `- [${st === 'compliant' ? 'x' : ' '}] ${i.id}: ${i.title} [${st.toUpperCase()}]\n`;
      });
      md += `\n`;
    });

    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateMarkdownReport()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `enterprise-readiness-audit-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Executive Enterprise Readiness Audit Report
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive compliance, scaling, and architectural gap audit for enterprise procurement.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs text-slate-500 uppercase">Readiness Score</div>
            <div className={`text-2xl font-bold tabular-nums mt-1 ${
              readinessScore >= 80 ? 'text-emerald-400' : readinessScore >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {readinessScore}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs text-slate-500 uppercase">Verified Pass</div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">
              {compliantCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs text-slate-500 uppercase">In Development</div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums mt-1">
              {inProgressCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs text-slate-500 uppercase">P0 Blockers</div>
            <div className={`text-2xl font-bold tabular-nums mt-1 ${
              p0Blockers.length === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {p0Blockers.length}
            </div>
          </div>
        </div>

        {/* P0 Blocker Callout if any */}
        {p0Blockers.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{p0Blockers.length} P0 Blockers Must Be Resolved Before Enterprise Launch</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              {p0Blockers.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-start gap-2">
                  <span className="text-rose-400 font-mono font-bold">{b.id}:</span>
                  <span>{b.title}</span>
                </li>
              ))}
              {p0Blockers.length > 5 && (
                <li className="text-slate-500 italic">
                  + {p0Blockers.length - 5} more P0 blocker items...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Pillar Breakdown Matrix */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pillar Compliance Breakdown
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pillars.map((pillar) => {
              const pItems = items.filter((i) => i.pillarId === pillar.id);
              const pCompliant = pItems.filter((i) => auditStatusMap[i.id] === 'compliant').length;
              const pPct = Math.round((pCompliant / pItems.length) * 100);

              return (
                <div key={pillar.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{pillar.shortTitle}</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {pCompliant} / {pItems.length} passed
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold ${
                      pPct === 100 ? 'text-emerald-400' : pPct > 50 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {pPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Export format compatible with Markdown audit documentation &amp; Jira.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
