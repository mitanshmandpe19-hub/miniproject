import React, { useState } from 'react';
import type { ViewMode, AnalysisIssue } from './types';
import { SAMPLE_INPUT_TEXT } from './data/sampleRequirements';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { AnatomyGrid } from './components/landing/AnatomyGrid';
import { RequirementInput } from './components/input/RequirementInput';
import { AnalyzingView } from './components/analyzing/AnalyzingView';
import { ResultsDashboard } from './components/results/ResultsDashboard';
import { AuthPage } from './components/auth/AuthPage';
import { getApiUrl } from './config/api';

export const App: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [targetViewAfterAuth, setTargetViewAfterAuth] = useState<ViewMode>('input');
  const [inputText, setInputText] = useState<string>('');
  const [issues, setIssues] = useState<AnalysisIssue[]>([]);
  const [totalAnalyzed, setTotalAnalyzed] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [attemptInfo, setAttemptInfo] = useState<{ current: number; max: number }>({ current: 1, max: 3 });

  const handleNavigate = (view: ViewMode) => {
    if ((view === 'input' || view === 'results') && !isAuthenticated) {
      setTargetViewAfterAuth(view);
      setCurrentView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    const nextView = targetViewAfterAuth || 'input';
    setCurrentView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (inputText === SAMPLE_INPUT_TEXT && nextView === 'input') {
      handleRunAnalysis(SAMPLE_INPUT_TEXT);
    }
  };

  const handleRunAnalysis = async (textToProcess: string) => {
    if (!isAuthenticated) {
      setTargetViewAfterAuth('input');
      setCurrentView('login');
      return;
    }

    const text = textToProcess.trim();
    if (!text) {
      setAnalysisError('Please enter at least one requirement statement to analyze.');
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);
    setProgressText('Analyzing… starting audit');
    setAttemptInfo({ current: 1, max: 3 });
    setCurrentView('analyzing');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream, application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(getApiUrl('/api/analyze?stream=true'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let receivedComplete = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const rawChunks = buffer.split('\n\n');
          buffer = rawChunks.pop() || '';

          for (const rawChunk of rawChunks) {
            if (!rawChunk.trim()) continue;

            let eventName = 'message';
            let dataStr = '';

            const lines = rawChunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataStr += line.slice(5).trim();
              }
            }

            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (eventName === 'progress') {
                if (data.message) {
                  setProgressText(data.message);
                }
                if (data.attempt) {
                  setAttemptInfo({
                    current: data.attempt,
                    max: data.maxAttempts || 3,
                  });
                }
              } else if (eventName === 'complete') {
                receivedComplete = true;
                setIssues(data.issues || []);
                setTotalAnalyzed(data.totalAnalyzed || 0);

                setTimeout(() => {
                  setIsAnalyzing(false);
                  setCurrentView('results');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 500);
              } else if (eventName === 'error') {
                throw new Error(data.error || 'Failed to complete requirement analysis.');
              }
            } catch (err: any) {
              if (eventName === 'error' || err.message?.includes('Failed') || err.message?.includes('Google Gemini')) {
                throw err;
              }
            }
          }
        }

        if (!receivedComplete && !response.ok) {
          throw new Error('Analysis connection closed before completing.');
        }
      } else {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to complete requirement analysis.');
        }

        setIssues(data.issues || []);
        setTotalAnalyzed(data.totalAnalyzed || 0);

        setTimeout(() => {
          setIsAnalyzing(false);
          setCurrentView('results');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);

      let userFriendlyMsg = 'The AI service is currently experiencing high demand. Please click Retry below to try again.';
      const raw = String(err.message || '');
      if (raw.includes('API Key') || raw.includes('API_KEY')) {
        userFriendlyMsg = 'Google Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file.';
      } else if (raw.includes('timed out') || raw.includes('timeout')) {
        userFriendlyMsg = 'The AI analysis request timed out while processing requirements. Please click Retry below to try again.';
      } else if (raw.length > 0 && !raw.includes('[GoogleGenerativeAI') && !raw.includes('503 Service') && !raw.includes('FetchError')) {
        userFriendlyMsg = raw;
      }

      setAnalysisError(userFriendlyMsg);
    }
  };

  const handleLoadSampleAndAnalyze = () => {
    setInputText(SAMPLE_INPUT_TEXT);
    if (!isAuthenticated) {
      setTargetViewAfterAuth('input');
      setCurrentView('login');
    } else {
      handleRunAnalysis(SAMPLE_INPUT_TEXT);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-mesh text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main View Switcher */}
      <div className="flex-grow pt-20">
        {currentView === 'landing' && (
          <div className="animate-fadeIn">
            <HeroSection
              onNavigate={handleNavigate}
              onLoadSampleAndAnalyze={handleLoadSampleAndAnalyze}
            />
            <AnatomyGrid onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'login' && (
          <div className="animate-fadeIn">
            <AuthPage
              initialMode="login"
              onSuccess={handleAuthSuccess}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {currentView === 'signup' && (
          <div className="animate-fadeIn">
            <AuthPage
              initialMode="signup"
              onSuccess={handleAuthSuccess}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {currentView === 'input' && (
          <div className="animate-fadeIn">
            <RequirementInput
              inputText={inputText}
              setInputText={setInputText}
              onStartAnalysis={() => handleRunAnalysis(inputText)}
              isLoading={isAnalyzing}
              errorMessage={analysisError}
            />
          </div>
        )}

        {currentView === 'analyzing' && (
          <div className="animate-fadeIn">
            <AnalyzingView
              errorMessage={analysisError}
              progressText={progressText}
              attemptNumber={attemptInfo.current}
              maxAttempts={attemptInfo.max}
              onReturnToInput={() => handleNavigate('input')}
              onRetry={() => handleRunAnalysis(inputText)}
            />
          </div>
        )}

        {currentView === 'results' && (
          <div className="animate-fadeIn">
            <ResultsDashboard
              issues={issues}
              totalAnalyzed={totalAnalyzed}
              onNavigate={handleNavigate}
              rawInput={inputText}
            />
          </div>
        )}
      </div>

      {/* Footer (hidden only during active analysis) */}
      {currentView !== 'analyzing' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
};

export default App;
