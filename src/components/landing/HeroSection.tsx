import React from 'react';
import type { ViewMode } from '../../types';
import { ArrowRight, Sparkles, FileCheck2, Cpu, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeroSectionProps {
  onNavigate: (view: ViewMode) => void;
  onLoadSampleAndAnalyze: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onLoadSampleAndAnalyze,
}) => {
  const { isAuthenticated } = useAuth();

  const handleStartAudit = () => {
    if (isAuthenticated) {
      onNavigate('input');
    } else {
      onNavigate('login');
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-300/25 via-rose-300/20 to-indigo-300/25 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Top Pre-header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/90 backdrop-blur-md border border-orange-200/80 rounded-full shadow-sm animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            AI Specification Logic & Consistency Auditor
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] max-w-4xl mb-6 font-display">
          Catch requirement flaws{' '}
          <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
            before they turn into code bugs.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl font-normal text-slate-600 max-w-2xl leading-relaxed mb-10">
          REQUIRE instantly correlates your user stories and specifications—flagging contradictory rules, vague thresholds, missing edge cases, and redundant clauses in seconds.
        </p>

        {/* Action Button Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16 w-full max-w-md justify-center">
          <button
            onClick={handleStartAudit}
            className="btn-gradient-primary px-8 py-4 text-sm font-bold flex items-center justify-center gap-3 shadow-glow-orange"
          >
            <span>{isAuthenticated ? 'Open Requirement Studio' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLoadSampleAndAnalyze}
            className="btn-glass px-8 py-4 text-sm font-bold flex items-center justify-center gap-2 text-slate-700"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Try Sample PRD</span>
          </button>
        </div>

        {/* Proof Cards / Micro Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="p-6 rounded-3xl bg-white/90 border border-slate-100 shadow-soft hover:shadow-card transition-all text-left flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-orange-100 text-orange-600 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Contradiction Traps</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Catches opposing latency, conflicting auth rules, and irreconcilable state transitions.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 border border-slate-100 shadow-soft hover:shadow-card transition-all text-left flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-100 text-indigo-600 shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Clarity & Precision</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Eliminates fuzzy qualifiers like &ldquo;fast&rdquo;, &ldquo;seamless&rdquo;, or &ldquo;user-friendly&rdquo;.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 border border-slate-100 shadow-soft hover:shadow-card transition-all text-left flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-600 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Instant AI Rewrites</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generates verifiable, testable replacement clauses ready for immediate engineering signoff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
