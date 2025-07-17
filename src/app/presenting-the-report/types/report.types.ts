import { AssessmentResult } from '../../running-the-tests/types/assessment.types';

export interface OverallScores {
  seoScore: number;
  readabilityScore: number;
  overallScore: number;
  seoGrade: ScoreGrade;
  readabilityGrade: ScoreGrade;
  overallGrade: ScoreGrade;
}

export interface DetailedIssue {
  id: string;
  name: string;
  description: string;
  rating: IssueRating;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  assessmentType: 'seo' | 'readability';
  score: number;
  details?: any;
  category?: 'seo' | 'readability' | 'technical' | 'performance' | 'technical-seo' | 'social-media' | 'structured-data' | 'links' | 'advanced-readability' | 'content-structure' | 'visual-design';
  status?: 'good' | 'ok' | 'bad';
}

export enum ScoreGrade {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEEDS_IMPROVEMENT = 'needs-improvement',
  POOR = 'poor'
}

export enum IssueRating {
  GOOD = 'good',
  OK = 'ok',
  BAD = 'bad'
}

export interface AuditReport {
  url: string;
  timestamp: Date;
  overallScores: OverallScores;
  detailedIssues: DetailedIssue[];
  summary: ReportSummary;
}

export interface ReportSummary {
  totalIssues: number;
  goodIssues: number;
  okIssues: number;
  badIssues: number;
  criticalIssues: DetailedIssue[];
  quickWins: DetailedIssue[];
}

export interface ReportGenerationResult {
  success: boolean;
  report?: AuditReport;
  error?: string;
}