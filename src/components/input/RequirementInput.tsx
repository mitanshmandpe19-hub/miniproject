import React, { useRef } from 'react';
import {
  Upload,
  Sparkles,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCode2,
  RefreshCw,
} from 'lucide-react';
import { SAMPLE_INPUT_TEXT } from '../../data/sampleRequirements';

interface RequirementInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onStartAnalysis: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const RequirementInput: React.FC<RequirementInputProps> = ({
  inputText,
  setInputText,
  onStartAnalysis,
  isLoading = false,
  errorMessage = null,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lines = inputText
    .split('\n')
    .filter((line) => line.trim().length > 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInputText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInputText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>Step 01 / Specification Ingestion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display mb-3">
          Paste your requirements
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Enter one requirement per line (numbered or bulleted). Gemini AI will correlate every rule against the entire set.
        </p>
      </header>

      {/* Error Banner with Retry */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-sans text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-900 font-bold mb-0.5">Analysis Notice:</strong>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          {inputText.trim().length > 0 && (
            <button
              onClick={onStartAnalysis}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold transition-all text-xs active:scale-95 shrink-0 self-start sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
          )}
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_15px_45px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        {/* Toolbar above Editor */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold">
              {lines.length} statement{lines.length === 1 ? '' : 's'}
            </span>
            <span>•</span>
            <span>{inputText.length} characters</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputText(SAMPLE_INPUT_TEXT)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full transition-all text-xs font-bold active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Load Sample Specs</span>
            </button>

            {inputText.length > 0 && (
              <button
                onClick={() => setInputText('')}
                className="inline-flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-full transition-all text-xs font-bold active:scale-95"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Area & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative group border-2 border-dashed border-slate-200 hover:border-orange-300 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 rounded-2xl bg-slate-50/50 transition-all duration-200"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="1. The system shall process financial transactions within 5 seconds...
2. Under peak load, latency may extend up to 45 seconds...
3. Password length must be exactly 8 characters...
4. User passwords must be at least 12 characters to satisfy SOC2 compliance..."
            className="w-full h-80 sm:h-96 p-6 font-sans text-sm sm:text-base text-slate-800 bg-transparent resize-y focus:outline-none placeholder:text-slate-400 leading-relaxed disabled:opacity-60"
          />

          {inputText.length === 0 && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center opacity-40">
              <FileCode2 className="w-12 h-12 text-orange-500 mb-2" />
              <p className="font-bold text-base text-slate-700">Drop a .txt, .md, or .json file here</p>
              <p className="text-xs text-slate-500 mt-1">or type your requirement statements directly</p>
            </div>
          )}
        </div>

        {/* Action Controls & CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 rounded-full transition-all active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Import File</span>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Plain text or markdown lists
            </span>
          </div>

          <button
            onClick={onStartAnalysis}
            disabled={inputText.trim().length === 0 || isLoading}
            className={`btn-gradient-primary px-8 py-4 text-sm font-bold flex items-center justify-center gap-3 shadow-glow-orange disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin-fast text-white" />
                <span>Auditing with Gemini AI…</span>
              </>
            ) : (
              <>
                <span>Analyze Specifications</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Protocol Advice Box */}
      <div className="mt-8 p-5 bg-gradient-to-r from-orange-50/60 to-indigo-50/60 border border-orange-100 rounded-2xl text-xs text-slate-600 flex items-start gap-3.5 shadow-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900 font-bold">Holistic AI Correlation:</strong> Your statements are audited collectively using Google Gemini 2.5 Flash with automatic retry backoff, chunking, and instant hash caching.
        </p>
      </div>
    </div>
  );
};
