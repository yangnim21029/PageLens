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

// Assessment Configuration Types
export enum AvailableAssessments {
  // SEO Assessments
  SINGLE_H1 = 'h1-missing',
  MULTIPLE_H1 = 'multiple-h1',
  H1_KEYWORD = 'h1-keyword-missing',
  ALT_ATTRIBUTE = 'images-missing-alt',
  INTRODUCTION_KEYWORD = 'keyword-missing-first-paragraph',
  KEYWORD_DENSITY = 'keyword-density-low',
  META_DESCRIPTION_KEYWORD = 'meta-description-needs-improvement',
  META_DESCRIPTION_LENGTH = 'meta-description-missing',
  PAGE_TITLE_WIDTH = 'title-needs-improvement',
  TITLE_KEYWORD = 'title-missing',
  TEXT_LENGTH = 'content-length-short',
  
  // Readability Assessments
  FLESCH_READING_EASE = 'flesch-reading-ease',
  PARAGRAPH_TOO_LONG = 'paragraph-length-long',
  SENTENCE_LENGTH_IN_TEXT = 'sentence-length-long',
  SUBHEADING_DISTRIBUTION_TOO_LONG = 'subheading-distribution-poor',
  
  // Future Extended Assessments (for framework expansion)
  HEADING_STRUCTURE_ORDER = 'heading-structure-order',
  PASSIVE_VOICE = 'passive-voice',
  SENTENCE_BEGINNINGS = 'sentence-beginnings',
  SENTENCE_LENGTH_IN_DESCRIPTION = 'sentence-length-in-description',
  TEXT_PRESENCE = 'text-presence',
  TRANSITION_WORDS = 'transition-words',
  WORD_COMPLEXITY = 'word-complexity',
  FUNCTION_WORDS_IN_KEYPHRASE = 'function-words-in-keyphrase',
  INTERNAL_LINKS = 'internal-links',
  KEYPHRASE_LENGTH = 'keyphrase-length',
  KEYWORD_STOP_WORDS = 'keyword-stop-words',
  KEYPHRASE_DISTRIBUTION = 'keyphrase-distribution',
  OUTBOUND_LINKS = 'outbound-links',
  SUBHEADINGS_KEYWORD = 'subheadings-keyword',
  TEXT_COMPETING_LINKS = 'text-competing-links',
  TEXT_IMAGES = 'text-images',
  URL_KEYWORD = 'url-keyword'
}

export interface AssessmentConfiguration {
  enabledAssessments?: AvailableAssessments[];
  enableAllSEO?: boolean;
  enableAllReadability?: boolean;
  enableAll?: boolean;
}

export const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfiguration = {
  enableAll: true
};

export const SEO_ASSESSMENTS = [
  AvailableAssessments.SINGLE_H1,
  AvailableAssessments.MULTIPLE_H1,
  AvailableAssessments.H1_KEYWORD,
  AvailableAssessments.ALT_ATTRIBUTE,
  AvailableAssessments.INTRODUCTION_KEYWORD,
  AvailableAssessments.KEYWORD_DENSITY,
  AvailableAssessments.META_DESCRIPTION_KEYWORD,
  AvailableAssessments.META_DESCRIPTION_LENGTH,
  AvailableAssessments.PAGE_TITLE_WIDTH,
  AvailableAssessments.TITLE_KEYWORD,
  AvailableAssessments.TEXT_LENGTH
];

export const READABILITY_ASSESSMENTS = [
  AvailableAssessments.FLESCH_READING_EASE,
  AvailableAssessments.PARAGRAPH_TOO_LONG,
  AvailableAssessments.SENTENCE_LENGTH_IN_TEXT,
  AvailableAssessments.SUBHEADING_DISTRIBUTION_TOO_LONG
];

export const ALL_CURRENT_ASSESSMENTS = [
  ...SEO_ASSESSMENTS,
  ...READABILITY_ASSESSMENTS
];

export const EXTENDED_ASSESSMENTS = [
  AvailableAssessments.HEADING_STRUCTURE_ORDER,
  AvailableAssessments.PASSIVE_VOICE,
  AvailableAssessments.SENTENCE_BEGINNINGS,
  AvailableAssessments.SENTENCE_LENGTH_IN_DESCRIPTION,
  AvailableAssessments.TEXT_PRESENCE,
  AvailableAssessments.TRANSITION_WORDS,
  AvailableAssessments.WORD_COMPLEXITY,
  AvailableAssessments.FUNCTION_WORDS_IN_KEYPHRASE,
  AvailableAssessments.INTERNAL_LINKS,
  AvailableAssessments.KEYPHRASE_LENGTH,
  AvailableAssessments.KEYWORD_STOP_WORDS,
  AvailableAssessments.KEYPHRASE_DISTRIBUTION,
  AvailableAssessments.OUTBOUND_LINKS,
  AvailableAssessments.SUBHEADINGS_KEYWORD,
  AvailableAssessments.TEXT_COMPETING_LINKS,
  AvailableAssessments.TEXT_IMAGES,
  AvailableAssessments.URL_KEYWORD
];