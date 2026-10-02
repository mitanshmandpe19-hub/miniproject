export type ViewMode = 'landing' | 'input' | 'analyzing' | 'results' | 'login' | 'signup';

export type IssueCategory = 'all' | 'contradiction' | 'ambiguous' | 'incomplete' | 'duplicate';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AnalysisIssue {
  id: string;
  reqCode: string;
  category: 'contradiction' | 'ambiguous' | 'incomplete' | 'duplicate';
  categoryLabel: string;
  originalText: string;
  issueDescription: string;
  suggestedFix: string;
  conflictingReqCode?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AnalysisSummary {
  totalAnalyzed: number;
  contradictions: number;
  ambiguous: number;
  incomplete: number;
  duplicates: number;
}
