import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Activity } from 'lucide-react';

interface AnalyzingViewProps {
  errorMessage?: string | null;
  onReturnToInput?: () => void;
  onRetry?: () => void;
  progressText?: string | null;
  attemptNumber?: number;
  maxAttempts?: number;
}

export const AnalyzingView: React.FC<AnalyzingViewProps> = ({
  errorMessage,
  onReturnToInput,
  onRetry,
  progressText,
  attemptNumber,
  maxAttempts = 3,
}) => {
  const defaultSteps = [
    { title: 'Parsing specification statements…', desc: 'Normalizing clauses and establishing unique requirement IDs.' },
    { title: 'Correlating cross-statement logic…', desc: 'Evaluating semantic overlap, latency rules, and state transitions.' },
    { title: 'Flagging structural defects…', desc: 'Isolating contradictions, ambiguous terms, and missing edge cases via Gemini AI.' },
    { title: 'Synthesizing precision rewrites…', desc: 'Drafting verifiable, testable replacement clauses ready for signoff.' },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentStepIndex((prev) => (prev < defaultSteps.length - 1 ? prev + 1 : prev));
        setFadeState('in');
      }, 200);
    }, 1800);

    return () => {
      clearInterval(stepInterval);
    };
  }, [defaultSteps.length]);

  if (errorMessage) {
    return (
      <main className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20 animate-fadeIn">
        <div className="flex flex-col items-center text-center max-w-lg mx-auto p-8 sm:p-10 bg-white border border-rose-200/80 rounded-3xl shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">Analysis Notice</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {errorMessage}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-gradient-primary w-full sm:w-auto px-7 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-orange"
              >
                <RefreshCw className="w-4 h-4 animate-spin-hover" />
                <span>Retry Analysis</span>
              </button>
            )}

            {onReturnToInput && (
              <button
                onClick={onReturnToInput}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Input</span>
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const activeTitle = progressText || defaultSteps[currentStepIndex].title;
  const activeDesc = progressText
    ? (attemptNumber && attemptNumber > 1
        ? `Model is under load, running exponential backoff attempt ${attemptNumber} of ${maxAttempts}…`
        : 'Cross-analyzing requirement statements against consistency rules.')
    : defaultSteps[currentStepIndex].desc;

  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20 relative">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-orange-400/20 via-rose-400/20 to-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-white/90 backdrop-blur-xl border border-slate-100 p-8 sm:p-12 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex flex-col items-center text-center max-w-lg mx-auto w-full">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center mb-6 shadow-glow-orange animate-bounce">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        {/* Dynamic Progress Bar */}
        <div className="progress-bar-container mb-6 w-full">
          <div className="progress-indicator"></div>
        </div>

        {/* Dynamic Status Text */}
        <div className="min-h-[100px] flex flex-col items-center justify-center">
          <h2
            aria-live="polite"
            className={`text-2xl sm:text-3xl font-extrabold text-slate-900 font-display transition-all duration-200 transform ${
              fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {activeTitle}
          </h2>

          <p
            className={`text-sm text-slate-500 mt-2 max-w-md transition-all duration-200 ${
              fadeState === 'in' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {activeDesc}
          </p>
        </div>

        {/* Live Status Badge */}
        {progressText && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse text-orange-500" />
            <span>{progressText}</span>
          </div>
        )}

        {/* Step Indicator Dots */}
        <div className="flex items-center gap-2 mt-6">
          {defaultSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index <= currentStepIndex
                  ? 'w-8 bg-gradient-to-r from-orange-500 to-rose-500'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Checklist summary */}
        <div className="mt-8 w-full pt-6 border-t border-slate-100 flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${currentStepIndex >= 0 ? 'text-orange-500' : 'text-slate-200'}`} />
            Lexical
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${currentStepIndex >= 1 ? 'text-orange-500' : 'text-slate-200'}`} />
            Semantic
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${currentStepIndex >= 2 ? 'text-indigo-500' : 'text-slate-200'}`} />
            Gemini Core
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${currentStepIndex >= 3 ? 'text-emerald-500' : 'text-slate-200'}`} />
            Synthesis
          </span>
        </div>
      </div>
    </main>
  );
};
