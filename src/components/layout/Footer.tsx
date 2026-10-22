import React from 'react';
import type { ViewMode } from '../../types';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full py-14 border-t border-slate-100 bg-white/70 backdrop-blur-md text-slate-700 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8">
        {/* Brand & Mission Statement */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 text-base">
              R
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900 font-display flex items-center gap-1.5">
                <span>REQUIRE</span>
                <span className="text-orange-500">•</span>
                <span className="text-xs font-semibold text-slate-500">AI Specification Auditor</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Preventing specification defects and logic contradictions with Google Gemini AI.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider text-slate-600">
            <button onClick={() => onNavigate('landing')} className="hover:text-orange-600 transition-colors">
              Overview
            </button>
            <button onClick={() => onNavigate('input')} className="hover:text-orange-600 transition-colors">
              Audit Studio
            </button>
            <button onClick={() => onNavigate('results')} className="hover:text-orange-600 transition-colors">
              Results Matrix
            </button>
            <a href="#methodology" className="hover:text-orange-600 transition-colors">
              Taxonomy
            </a>
          </div>
        </div>

        {/* Footnote & Copyright */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} REQUIRE Intelligent Systems. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
