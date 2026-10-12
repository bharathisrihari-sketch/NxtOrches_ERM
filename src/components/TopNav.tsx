import React from 'react';
import { Layers, FileText } from 'lucide-react';

export type ActiveTab = 'checklist' | 'topology' | 'simulator' | 'workflows' | 'blueprints' | 'diagnostic';

interface TopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenReport: () => void;
  completedChecksCount: number;
  totalChecksCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  completedChecksCount,
  totalChecksCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (single text element wordmark in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <button
            onClick={() => setActiveTab('checklist')}
            className="text-left font-bold tracking-tight text-white text-base hover:text-indigo-300 transition-colors whitespace-nowrap shrink-0"
          >
            Nxt Orchestrator
          </button>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'checklist'
                ? 'text-white border-b-2 border-indigo-500 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Readiness Matrix
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'topology'
                ? 'text-white border-b-2 border-indigo-500 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Architecture Topology
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'simulator'
                ? 'text-white border-b-2 border-indigo-500 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Stress Simulator
          </button>

          <button
            onClick={() => setActiveTab('workflows')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'workflows'
                ? 'text-white border-b-2 border-indigo-500 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Saga Engine
          </button>

          <button
            onClick={() => setActiveTab('blueprints')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'blueprints'
                ? 'text-white border-b-2 border-indigo-500 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Code Blueprints
          </button>

          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'diagnostic'
                ? 'text-white border-b-2 border-indigo-500 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            Stack Diagnostic
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span>Verified Checks</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-200 font-semibold">
              {completedChecksCount} / {totalChecksCount}
            </span>
          </div>

          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Audit Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
