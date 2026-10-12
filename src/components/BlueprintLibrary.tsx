import React, { useState } from 'react';
import { CODE_BLUEPRINTS } from '../data/codeBlueprints';
import { CodeBlueprint } from '../types/orchestrator';
import { Check, Copy, FileCode, Info } from 'lucide-react';

interface BlueprintLibraryProps {
  initialBlueprintId?: string | null;
}

export const BlueprintLibrary: React.FC<BlueprintLibraryProps> = ({ initialBlueprintId }) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialBlueprintId || CODE_BLUEPRINTS[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  const selectedBlueprint: CodeBlueprint = 
    CODE_BLUEPRINTS.find((b) => b.id === selectedId) || CODE_BLUEPRINTS[0];

  const handleCopy = () => {
    if (!selectedBlueprint) return;
    navigator.clipboard.writeText(selectedBlueprint.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Enterprise Code Blueprints &amp; Infrastructure
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Production-tested modules, middleware, and Infrastructure-as-Code definitions to replace prototype skeleton patterns with hardened enterprise standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Blueprint Selector Column */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Architecture Blueprints
          </div>

          <div className="space-y-1.5">
            {CODE_BLUEPRINTS.map((bp) => {
              const isSelected = bp.id === selectedBlueprint.id;

              return (
                <button
                  key={bp.id}
                  onClick={() => setSelectedId(bp.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500/80 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-white truncate">
                      {bp.title}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {bp.language}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">
                    {bp.filename}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Inspector & Production Notes */}
        <div className="lg:col-span-8 space-y-4">
          {/* Metadata Header */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedBlueprint.title}
                </h2>
                <div className="text-xs font-mono text-indigo-400 mt-0.5">
                  {selectedBlueprint.filename}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedBlueprint.description}
            </p>

            {/* Production Engineering Notes */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Production Invariants &amp; Hardening Checklist</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                {selectedBlueprint.productionNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-500" />
                <span>{selectedBlueprint.filename}</span>
              </div>
              <span>{selectedBlueprint.language}</span>
            </div>

            <div className="p-4 overflow-x-auto max-h-[540px]">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                <code>{selectedBlueprint.snippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
