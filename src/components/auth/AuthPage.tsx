import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { ViewMode } from '../../types';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onSuccess: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigate,
}) => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email format (e.g. user@example.com).';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      const res = await login(email.trim(), password);
      setIsLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Failed to log in. Please check your credentials.');
      }
    } else {
      const res = await signup(email.trim(), password, name.trim());
      setIsLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Failed to sign up. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Colorful Glow Background Element */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-gradient-to-br from-orange-400/20 to-rose-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Main Card Container */}
          <div className="relative bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl p-8 sm:p-10 transition-all duration-300">
            {/* Header Badge & Brand */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-indigo-50 border border-orange-100/60 mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  {isLogin ? 'Welcome Back' : 'Create Free Account'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-display">
                {isLogin ? 'Log in to REQUIRE' : 'Start Auditing Specs'}
              </h1>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                {isLogin
                  ? 'Access your saved requirements, run AI checks, and rectify specifications.'
                  : 'Join to scan PRDs for mutual contradictions, ambiguity, and logic defects.'}
              </p>
            </div>

            {/* Mode Toggle Switch */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl mb-6 text-sm font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                  setValidationErrors({});
                }}
                className={`py-2.5 rounded-xl transition-all duration-200 ${
                  isLogin
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                  setValidationErrors({});
                }}
                className={`py-2.5 rounded-xl transition-all duration-200 ${
                  !isLogin
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Global Error Notice */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block mb-0.5">Authentication Error</span>
                  {error}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="you@company.com"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      validationErrors.email
                        ? 'border-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-orange-500/30 focus:border-orange-500'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  {!isLogin && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Min. 8 characters
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    placeholder={isLogin ? '••••••••' : 'At least 8 characters'}
                    className={`w-full pl-11 pr-11 py-3 bg-slate-50 border rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      validationErrors.password
                        ? 'border-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-orange-500/30 focus:border-orange-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">
                    {validationErrors.password}
                  </p>
                )}

                {/* Password strength indicators on signup */}
                {!isLogin && password.length > 0 && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        password.length >= 8
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span
                      className={
                        password.length >= 8 ? 'text-emerald-700 font-medium' : 'text-slate-500'
                      }
                    >
                      {password.length >= 8
                        ? 'Password meets minimum length requirement'
                        : `${8 - password.length} more character${8 - password.length === 1 ? '' : 's'} needed`}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gradient-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin-fast" />
                    <span>{isLogin ? 'Authenticating…' : 'Creating Account…'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Log In to Studio' : 'Create Account & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security / Switch Hint */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Encrypted bcrypt credentials • Accounts persist on server</span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="text-xs text-slate-400 hover:text-orange-600 font-medium transition-colors"
              >
                ← Return to Overview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
