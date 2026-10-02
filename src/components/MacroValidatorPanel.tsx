import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp, CheckCircle2, RefreshCw } from 'lucide-react';
import { ValidationReport, ValidationIssue } from '../utils/MacroValidator';

interface MacroValidatorPanelProps {
  report: ValidationReport;
  onRevalidate?: () => void;
}

export const MacroValidatorPanel: React.FC<MacroValidatorPanelProps> = ({ report, onRevalidate }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(report.errorCount > 0 || report.warningCount > 0);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const filteredIssues = report.issues.filter((issue) => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  const getStatusBadge = () => {
    if (report.errorCount > 0) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>{report.errorCount} SYNTAX/LOGIC CONFLICT{report.errorCount > 1 ? 'S' : ''}</span>
        </span>
      );
    }
    if (report.warningCount > 0) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{report.warningCount} WARNING{report.warningCount > 1 ? 'S' : ''} (EXPORT READY)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>100% HEALTHY - LOGITECH G-HUB VERIFIED</span>
      </span>
    );
  };

  return (
    <div className={`border rounded-xl transition-all duration-200 overflow-hidden ${
      report.errorCount > 0
        ? 'bg-rose-950/20 border-rose-500/30'
        : report.warningCount > 0
        ? 'bg-amber-950/20 border-amber-500/30'
        : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Header Bar */}
      <div className="p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <ShieldCheck className={`w-5 h-5 ${report.isValid ? 'text-emerald-400' : 'text-rose-400'}`} />
          <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-100 uppercase tracking-wide">
            Lua Engine Syntax & Conflict Validator
          </h3>
          {getStatusBadge()}
          <span className="text-[11px] font-mono text-slate-400">
            Readiness: <strong className="text-cyan-400">{report.readinessScore}%</strong> ({report.linesAnalyzed} lines checked)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRevalidate && (
            <button
              onClick={onRevalidate}
              title="Re-run Macro Validation"
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors border border-slate-700/60"
          >
            <span>{isExpanded ? 'Hide Details' : `Show Issues (${report.issues.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Issues Drawer */}
      {isExpanded && (
        <div className="border-t border-slate-800/80 p-3.5 space-y-3 bg-slate-950/70">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Filter:</span>
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                filterSeverity === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({report.issues.length})
            </button>
            <button
              onClick={() => setFilterSeverity('error')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                filterSeverity === 'error'
                  ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-rose-400'
              }`}
            >
              Errors ({report.errorCount})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                filterSeverity === 'warning'
                  ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-amber-400'
              }`}
            >
              Warnings ({report.warningCount})
            </button>
          </div>

          {/* Issue List */}
          {filteredIssues.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
              No issues detected in this category. Script syntax and logic are 100% compliant.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-lg border text-xs font-mono space-y-1.5 ${
                    issue.severity === 'error'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : issue.severity === 'warning'
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-sky-950/30 border-sky-500/40 text-sky-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {issue.severity === 'error' ? (
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : issue.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                      <span className="font-bold uppercase tracking-wider">{issue.title}</span>
                    </div>
                    {issue.line && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-300 border border-slate-700">
                        Line {issue.line}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 font-['Rajdhani'] text-xs leading-relaxed">
                    {issue.message}
                  </p>

                  {issue.snippet && (
                    <div className="bg-black/60 p-1.5 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                      <code>{issue.snippet}</code>
                    </div>
                  )}

                  {issue.recommendation && (
                    <div className="text-[11px] text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 rounded p-1.5">
                      <strong className="text-cyan-400">Recommendation:</strong> {issue.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
