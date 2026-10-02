import React from 'react';
import { HelpCircle, AlertTriangle, Layers, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import type { ViewMode } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AnatomyGridProps {
  onNavigate: (view: ViewMode) => void;
}

export const AnatomyGrid: React.FC<AnatomyGridProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  const failureTypes = [
    {
      category: 'Contradictions',
      tag: 'Logical Deadlocks',
      emoji: '⚡',
      icon: Zap,
      badgeBg: 'bg-orange-100 text-orange-700 border-orange-200',
      accentGradient: 'from-orange-500 to-rose-500',
      description: 'Requirements that directly clash across separate sections, causing unresolvable development blockers.',
      example: '“Process all records in <5s” vs “Allow 45s latency tolerance at peak.”',
    },
    {
      category: 'Ambiguity',
      tag: 'Untestable Terms',
      emoji: '🔍',
      icon: HelpCircle,
      badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      accentGradient: 'from-indigo-500 to-sky-500',
      description: 'Fuzzy words and loose adjectives that leave critical system metrics open to arbitrary guesswork.',
      example: '“System must respond quickly” or “Integrate seamlessly with AS400.”',
    },
    {
      category: 'Incomplete Specs',
      tag: 'Missing Edge Cases',
      emoji: '🧩',
      icon: AlertTriangle,
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      accentGradient: 'from-emerald-500 to-teal-500',
      description: 'Missing failure states, recovery flows, retry ceilings, and compliance data retention rules.',
      example: '“Recover automatically on payment timeout” without specifying fallback steps.',
    },
    {
      category: 'Duplicates',
      tag: 'Sync Drift Risks',
      emoji: '👯',
      icon: Layers,
      badgeBg: 'bg-violet-100 text-violet-700 border-violet-200',
      accentGradient: 'from-violet-500 to-purple-500',
      description: 'Redundant requirements across multiple documents that silently diverge over future sprints.',
      example: 'Slightly different JSON logging formats specified in 3 separate chapters.',
    },
  ];

  const handleCTA = () => {
    if (isAuthenticated) {
      onNavigate('input');
    } else {
      onNavigate('login');
    }
  };

  return (
    <section id="methodology" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span>✨ The 4 Types of Flaws</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            The Anatomy of PRD Defects
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-600 max-w-md leading-relaxed">
          Over 68% of post-release bugs originate in conflicting specification clauses. Here is what REQUIRE checks automatically.
        </p>
      </div>

      {/* 4-Column Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {failureTypes.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="card-friendly p-7 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Category Badge */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${item.badgeBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.tag}</span>
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display group-hover:text-orange-600 transition-colors">
                  {item.category}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              {/* Example Callout Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Common Trap:
                </span>
                <span className="italic text-slate-700">&ldquo;{item.example}&rdquo;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Bottom Banner */}
      <div className="mt-16 bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 p-8 sm:p-12 rounded-3xl text-white shadow-xl shadow-orange-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ready in Seconds</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display">
            Ready to audit your specifications?
          </h3>
          <p className="text-white/90 text-sm sm:text-base mt-1 max-w-xl">
            Paste raw PRD bullet points or load our sample suite to see real AI diagnostics in action.
          </p>
        </div>

        <button
          onClick={handleCTA}
          className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0 flex items-center gap-2"
        >
          <span>{isAuthenticated ? 'Open Audit Studio' : 'Sign Up to Audit'}</span>
          <ArrowRight className="w-4 h-4 text-orange-500" />
        </button>
      </div>
    </section>
  );
};
