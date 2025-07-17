export enum AssessmentType {
  SEO = 'seo',
  READABILITY = 'readability'
}

export enum AssessmentStatus {
  GOOD = 'good',
  OK = 'ok',
  BAD = 'bad'
}

export interface AssessmentResult {
  id: string;
  type: AssessmentType;
  name: string;
  description: string;
  status: AssessmentStatus;
  score: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  details?: any;
}

export interface TestResults {
  seoScore: number;
  readabilityScore: number;
  overallScore: number;
  assessments: AssessmentResult[];
  timestamp: Date;
}

export interface TestRunResult {
  success: boolean;
  results?: TestResults;
  error?: string;
}