import React, { useState, useEffect } from 'react';
import type { ViewMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import {
  Menu,
  X,
  ArrowRight,
  Key,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    fetch(getApiUrl('/api/health'))
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data?.hasGeminiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, [currentView]);

  const handleLogout = () => {
    logout();
    onNavigate('login');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="text-left font-display text-2xl font-black tracking-tight text-slate-900 hover:text-orange-600 transition-colors focus:outline-none flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                R
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text">
                  REQUIRE
                </span>
                <span className="text-[10px] tracking-widest font-bold uppercase text-orange-500">
                  AI Logic Auditor
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/50">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === 'landing'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('input')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === 'input'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Audit Studio
            </button>
            <button
              onClick={() => onNavigate('results')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === 'results'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Results Matrix
            </button>
          </nav>

          {/* Trailing Actions: API Status + Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Gemini Key Status Pill */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all hover:scale-102 active:scale-98 ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 hover:bg-emerald-100/60'
                  : 'bg-orange-50 text-orange-700 border-orange-200/70 hover:bg-orange-100/60'
              }`}
              title="Google Gemini AI Connection Status"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{hasApiKey ? 'Gemini AI Ready' : 'Gemini Key Config'}</span>
            </button>

            {/* Authenticated User Pill + Logout */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700 max-w-[110px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/60 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                  title="End current session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="btn-gradient-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-6 py-6 flex flex-col gap-4 animate-fadeIn shadow-xl">
            {isAuthenticated && user && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 to-indigo-50 border border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.name || 'User'}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-bold py-2.5 px-3 rounded-xl transition-colors ${
                currentView === 'landing' ? 'bg-orange-50 text-orange-600' : 'text-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                onNavigate('input');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-bold py-2.5 px-3 rounded-xl transition-colors ${
                currentView === 'input' ? 'bg-orange-50 text-orange-600' : 'text-slate-700'
              }`}
            >
              Audit Studio
            </button>
            <button
              onClick={() => {
                onNavigate('results');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-bold py-2.5 px-3 rounded-xl transition-colors ${
                currentView === 'results' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              Results Matrix
            </button>

            <button
              onClick={() => {
                setShowKeyModal(true);
                setMobileMenuOpen(false);
              }}
              className="text-left text-xs font-bold py-2 px-3 text-orange-600 flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>{hasApiKey ? 'Gemini AI Configured' : 'Configure Gemini API Key'}</span>
            </button>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-100 text-slate-800 text-xs font-bold text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onNavigate('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="btn-gradient-primary w-full py-3 text-xs font-bold text-center"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-100 max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-2xl ${
                  hasApiKey ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {hasApiKey ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  {hasApiKey ? 'Gemini AI Connected' : 'Gemini AI Setup'}
                </h3>
                <span className="text-xs text-slate-500 font-medium">Google Gemini 2.0 Flash Core</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {hasApiKey
                ? 'Your Google Gemini API key is loaded from .env. Real requirement audits run directly against Google Gemini AI.'
                : 'Add your Google Gemini API key to the .env file in the project root directory:'}
            </p>

            <div className="bg-slate-900 text-orange-400 p-4 rounded-2xl font-mono text-xs mb-4 select-all shadow-inner">
              GEMINI_API_KEY=AIzaSy...
            </div>

            <div className="mb-5">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold hover:underline"
              >
                <span>Get a free API key at Google AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={() => setShowKeyModal(false)}
              className="btn-gradient-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider text-center"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
