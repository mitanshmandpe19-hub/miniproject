import React, { useState, useMemo } from 'react';
import type { AnalysisIssue, IssueCategory, ViewMode } from '../../types';
import { RequirementCard } from './RequirementCard';
import {
  Download,
  Search,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsDashboardProps {
  issues: AnalysisIssue[];
  totalAnalyzed?: number;
  onNavigate: (view: ViewMode) => void;
  rawInput?: string;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  issues,
  totalAnalyzed,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([issues[0]?.id || '']));
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Metrics calculation
  const metrics = useMemo(() => {
    const contradictions = issues.filter((i) => i.category === 'contradiction').length;
    const ambiguous = issues.filter((i) => i.category === 'ambiguous').length;
    const incomplete = issues.filter((i) => i.category === 'incomplete').length;
    const duplicates = issues.filter((i) => i.category === 'duplicate').length;
    return {
      total: issues.length,
      contradictions,
      ambiguous,
      incomplete,
      duplicates,
    };
  }, [issues]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesCategory =
        selectedCategory === 'all' || issue.category === selectedCategory;
      const matchesSearch =
        issue.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.suggestedFix.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.reqCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [issues, selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApplyFix = (id: string) => {
    setAppliedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f97316', '#6366f1', '#10b981', '#ec4899'],
        });
      }
      return next;
    });
  };

  const handleApplyAll = () => {
    setAppliedIds(new Set(issues.map((i) => i.id)));
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f97316', '#6366f1', '#10b981', '#fb7185', '#8b5cf6'],
    });
  };

  const handleExportMarkdown = () => {
    let output = `# REQUIRE Specification Audit Report\n`;
    output += `Generated on: ${new Date().toISOString()}\n`;
    output += `Audited with: Google Gemini AI (Gemini 2.0 Flash)\n\n`;
    output += `## Summary Metrics\n`;
    output += `- Total Statements Scanned: ${totalAnalyzed || issues.length}\n`;
    output += `- Total Structural Defects: ${issues.length}\n`;
    output += `- Contradictions: ${metrics.contradictions}\n`;
    output += `- Ambiguous Statements: ${metrics.ambiguous}\n`;
    output += `- Incomplete Edge Cases: ${metrics.incomplete}\n`;
    output += `- Duplicate Specs: ${metrics.duplicates}\n\n`;
    output += `## Rectified Requirements List\n\n`;

    issues.forEach((issue) => {
      const status = appliedIds.has(issue.id) ? '[RECTIFIED]' : '[FLAGGED]';
      output += `### ${issue.reqCode} - ${issue.categoryLabel} ${status}\n`;
      output += `**Original Statement:**\n> ${issue.originalText}\n\n`;
      output += `**Defect Breakdown:**\n${issue.issueDescription}\n\n`;
      output += `**Rectified Precision Replacement:**\n\`\`\`text\n${issue.suggestedFix}\n\`\`\`\n\n---\n\n`;
    });

    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `REQUIRE_Rectified_Specs_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-indigo-50 border border-orange-200/80 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Audit Report • {totalAnalyzed || issues.length} Statements Scanned
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Analysis Results
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl">
            {issues.length > 0
              ? `Discovered ${issues.length} structural defects across your specification statements.`
              : 'Zero specification contradictions or ambiguities detected. Your document satisfies semantic consistency rules.'}
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('input')}
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Input</span>
          </button>

          {issues.length > 0 && (
            <button
              onClick={handleApplyAll}
              className="px-5 py-2.5 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Accept All ({issues.length})</span>
            </button>
          )}

          <button
            onClick={handleExportMarkdown}
            className="btn-gradient-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (.md)</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setSelectedCategory('contradiction')}
          className={`p-5 rounded-3xl border text-left transition-all duration-200 ${
            selectedCategory === 'contradiction'
              ? 'border-orange-400 bg-orange-50/80 ring-2 ring-orange-500/20 shadow-sm'
              : 'border-slate-100 bg-white hover:border-orange-200 hover:shadow-card shadow-soft'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              Contradictions
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {metrics.contradictions}{' '}
            <span className="text-xs font-normal text-slate-400">flags</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedCategory('ambiguous')}
          className={`p-5 rounded-3xl border text-left transition-all duration-200 ${
            selectedCategory === 'ambiguous'
              ? 'border-indigo-400 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-sm'
              : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-card shadow-soft'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔍</span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Ambiguous
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {metrics.ambiguous}{' '}
            <span className="text-xs font-normal text-slate-400">flags</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedCategory('incomplete')}
          className={`p-5 rounded-3xl border text-left transition-all duration-200 ${
            selectedCategory === 'incomplete'
              ? 'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-sm'
              : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-card shadow-soft'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🧩</span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Incomplete
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {metrics.incomplete}{' '}
            <span className="text-xs font-normal text-slate-400">flags</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedCategory('duplicate')}
          className={`p-5 rounded-3xl border text-left transition-all duration-200 ${
            selectedCategory === 'duplicate'
              ? 'border-violet-400 bg-violet-50/80 ring-2 ring-violet-500/20 shadow-sm'
              : 'border-slate-100 bg-white hover:border-violet-200 hover:shadow-card shadow-soft'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👯</span>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
              Duplicates
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {metrics.duplicates}{' '}
            <span className="text-xs font-normal text-slate-400">flags</span>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Category Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full transition-all duration-150 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Issues ({issues.length})
          </button>
          <button
            onClick={() => setSelectedCategory('contradiction')}
            className={`px-4 py-2 rounded-full transition-all duration-150 ${
              selectedCategory === 'contradiction'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            ⚡ Contradictions ({metrics.contradictions})
          </button>
          <button
            onClick={() => setSelectedCategory('ambiguous')}
            className={`px-4 py-2 rounded-full transition-all duration-150 ${
              selectedCategory === 'ambiguous'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            🔍 Ambiguous ({metrics.ambiguous})
          </button>
          <button
            onClick={() => setSelectedCategory('incomplete')}
            className={`px-4 py-2 rounded-full transition-all duration-150 ${
              selectedCategory === 'incomplete'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            🧩 Incomplete ({metrics.incomplete})
          </button>
          <button
            onClick={() => setSelectedCategory('duplicate')}
            className={`px-4 py-2 rounded-full transition-all duration-150 ${
              selectedCategory === 'duplicate'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
            }`}
          >
            👯 Duplicates ({metrics.duplicates})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specs or fixes…"
            className="w-full pl-11 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 text-slate-800 placeholder:text-slate-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Issues List Container */}
      <div key={selectedCategory} className="tab-content-enter">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue, index) => (
            <RequirementCard
              key={issue.id}
              issue={issue}
              isExpanded={expandedIds.has(issue.id)}
              onToggle={() => toggleExpand(issue.id)}
              index={index}
              onApplyFix={handleApplyFix}
              isApplied={appliedIds.has(issue.id)}
            />
          ))
        ) : issues.length === 0 && (totalAnalyzed || 0) === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-display">No Analysis Run Yet</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              You haven&apos;t analyzed any specifications yet. Enter requirements in the Audit Studio or load the sample specs to generate an audit report.
            </p>
            <button
              onClick={() => onNavigate('input')}
              className="btn-gradient-primary px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 mt-6"
            >
              <span>Go to Audit Studio</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-display">100% Specification Rigor Passed</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              No mutual contradictions, untestable qualifiers, missing edge cases, or duplicate rules were detected in your specifications.
            </p>
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <Filter className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-bold text-slate-800 font-display">No issues found in &ldquo;{selectedCategory}&rdquo;</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different category or clearing the search query.</p>
          </div>
        )}
      </div>

      {/* Progress Resolution Footer Card */}
      {issues.length > 0 && (
        <div className="mt-10 p-6 sm:p-8 bg-gradient-to-r from-orange-50/90 via-rose-50/70 to-indigo-50/90 border border-orange-100 rounded-3xl shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 font-display">
                {appliedIds.size} of {issues.length} Fixes Adopted
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                {appliedIds.size === issues.length
                  ? 'All specification conflicts resolved! Your document is ready for engineering signoff.'
                  : 'Click "Apply Fix" or "Accept All" to adopt verified specifications.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleExportMarkdown}
            className="btn-gradient-primary px-7 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-glow-orange"
          >
            <Download className="w-4 h-4" />
            <span>Download Rectified Specs (.md)</span>
          </button>
        </div>
      )}
    </main>
  );
};
