import React, { useState } from 'react';
import type { AnalysisIssue } from '../../types';
import {
  ChevronDown,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface RequirementCardProps {
  issue: AnalysisIssue;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
  onApplyFix: (id: string, fixedText: string) => void;
  isApplied: boolean;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  issue,
  isExpanded,
  onToggle,
  index,
  onApplyFix,
  isApplied,
}) => {
  const [copied, setCopied] = useState(false);

  const getCategoryConfig = (category: AnalysisIssue['category']) => {
    switch (category) {
      case 'contradiction':
        return {
          icon: Zap,
          emoji: '⚡',
          badgeBg: 'bg-orange-100 text-orange-700 border-orange-200',
          accentBorder: 'border-orange-200',
          highlightBg: 'bg-orange-50/50',
          chipColor: 'text-orange-600',
        };
      case 'ambiguous':
        return {
          icon: HelpCircle,
          emoji: '🔍',
          badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          accentBorder: 'border-indigo-200',
          highlightBg: 'bg-indigo-50/50',
          chipColor: 'text-indigo-600',
        };
      case 'incomplete':
        return {
          icon: AlertTriangle,
          emoji: '🧩',
          badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          accentBorder: 'border-emerald-200',
          highlightBg: 'bg-emerald-50/50',
          chipColor: 'text-emerald-600',
        };
      case 'duplicate':
        return {
          icon: Layers,
          emoji: '👯',
          badgeBg: 'bg-violet-100 text-violet-700 border-violet-200',
          accentBorder: 'border-violet-200',
          highlightBg: 'bg-violet-50/50',
          chipColor: 'text-violet-600',
        };
      default:
        return {
          icon: AlertCircle,
          emoji: '⚠️',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          accentBorder: 'border-slate-200',
          highlightBg: 'bg-slate-50',
          chipColor: 'text-slate-600',
        };
    }
  };

  const config = getCategoryConfig(issue.category);
  const CategoryIcon = config.icon;

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(issue.suggestedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApplyFix(issue.id, issue.suggestedFix);
  };

  return (
    <div
      className={`card-friendly mb-4 overflow-hidden border transition-all duration-200 ${
        isExpanded
          ? 'shadow-card-hover border-orange-200 bg-white ring-2 ring-orange-500/10'
          : 'hover:border-slate-300'
      }`}
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      {/* Clickable Header Area */}
      <div
        onClick={onToggle}
        className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group"
      >
        <div className="flex-grow pr-2">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              {issue.reqCode}
            </span>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border flex items-center gap-1.5 ${config.badgeBg}`}
            >
              <span>{config.emoji}</span>
              <span>{issue.categoryLabel}</span>
            </span>

            {issue.conflictingReqCode && (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Clashes with {issue.conflictingReqCode}</span>
              </span>
            )}

            {isApplied && (
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Fix Accepted
              </span>
            )}
          </div>

          {/* Original Statement */}
          <p
            className={`text-base sm:text-lg font-medium text-slate-900 leading-relaxed transition-all duration-150 ${
              isApplied ? 'line-through text-slate-400' : ''
            }`}
          >
            {issue.originalText}
          </p>

          {isApplied && (
            <p className="text-sm text-emerald-700 font-semibold mt-2 flex items-center gap-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
              <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Adopted: &ldquo;{issue.suggestedFix}&rdquo;</span>
            </p>
          )}
        </div>

        {/* Chevron Button */}
        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <span className="text-xs font-bold text-slate-500 group-hover:text-orange-600 transition-colors hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Inspect Fix'}
          </span>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isExpanded
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 rotate-180'
                : 'bg-slate-100 text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-600'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      <div className={`accordion-grid ${isExpanded ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
              {/* Left Box: Structural Diagnosis */}
              <div className="flex flex-col h-full bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CategoryIcon className="w-4 h-4 text-orange-500" />
                    <span>Structural Diagnosis</span>
                  </h4>
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      issue.severity === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : issue.severity === 'medium'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {issue.severity} severity
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  &ldquo;{issue.originalText}&rdquo;
                </div>

                <div className="text-xs text-slate-700 leading-relaxed pt-2">
                  <strong className="block text-slate-900 font-bold mb-1">Identified Flaw:</strong>
                  {issue.issueDescription}
                </div>
              </div>

              {/* Right Box: Suggested Precision Replacement */}
              <div className="flex flex-col h-full bg-gradient-to-br from-orange-50/70 to-rose-50/60 p-5 rounded-2xl border border-orange-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>Suggested Replacement</span>
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Verified Specification
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-white/90 p-3.5 rounded-xl border border-orange-100 mb-4 shadow-sm">
                  {issue.suggestedFix}
                </p>

                <div className="flex items-center justify-between gap-3 mt-auto pt-2">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-full transition-all active:scale-95 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Clause'}</span>
                  </button>

                  <button
                    onClick={handleApply}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full transition-all active:scale-95 shadow-sm ${
                      isApplied
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'btn-gradient-primary'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isApplied ? 'Fix Adopted' : 'Apply Fix'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
