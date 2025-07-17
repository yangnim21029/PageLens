export enum AssessmentCategory {
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
  type: AssessmentCategory;
  name: string;
  description: string;
  status: AssessmentStatus;
  score: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  details?: any;
  rating?: 'good' | 'ok' | 'bad';
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

// Assessment Configuration Types - Unified enum names and values
export enum AssessmentType {
  // SEO Assessments
  H1_MISSING = 'H1_MISSING',
  MULTIPLE_H1 = 'MULTIPLE_H1',
  H1_KEYWORD_MISSING = 'H1_KEYWORD_MISSING',
  IMAGES_MISSING_ALT = 'IMAGES_MISSING_ALT',
  KEYWORD_MISSING_FIRST_PARAGRAPH = 'KEYWORD_MISSING_FIRST_PARAGRAPH',
  KEYWORD_DENSITY_LOW = 'KEYWORD_DENSITY_LOW',
  META_DESCRIPTION_NEEDS_IMPROVEMENT = 'META_DESCRIPTION_NEEDS_IMPROVEMENT',
  META_DESCRIPTION_MISSING = 'META_DESCRIPTION_MISSING',
  TITLE_NEEDS_IMPROVEMENT = 'TITLE_NEEDS_IMPROVEMENT',
  TITLE_MISSING = 'TITLE_MISSING',
  CONTENT_LENGTH_SHORT = 'CONTENT_LENGTH_SHORT',

  // Readability Assessments
  FLESCH_READING_EASE = 'FLESCH_READING_EASE',
  PARAGRAPH_LENGTH_LONG = 'PARAGRAPH_LENGTH_LONG',
  SENTENCE_LENGTH_LONG = 'SENTENCE_LENGTH_LONG',
  SUBHEADING_DISTRIBUTION_POOR = 'SUBHEADING_DISTRIBUTION_POOR',

  // Future Extended Assessments (for framework expansion)
  EXTENDED_HEADING_STRUCTURE_ORDER_CHECK = 'heading-structure-order',
  EXTENDED_PASSIVE_VOICE_CHECK = 'passive-voice',
  EXTENDED_SENTENCE_BEGINNINGS_CHECK = 'sentence-beginnings',
  EXTENDED_SENTENCE_LENGTH_IN_DESCRIPTION_CHECK = 'sentence-length-in-description',
  EXTENDED_TEXT_PRESENCE_CHECK = 'text-presence',
  EXTENDED_TRANSITION_WORDS_CHECK = 'transition-words',
  EXTENDED_WORD_COMPLEXITY_CHECK = 'word-complexity',
  EXTENDED_FUNCTION_WORDS_IN_KEYPHRASE_CHECK = 'function-words-in-keyphrase',
  EXTENDED_INTERNAL_LINKS_CHECK = 'internal-links',
  EXTENDED_KEYPHRASE_LENGTH_CHECK = 'keyphrase-length',
  EXTENDED_KEYWORD_STOP_WORDS_CHECK = 'keyword-stop-words',
  EXTENDED_KEYPHRASE_DISTRIBUTION_CHECK = 'keyphrase-distribution',
  EXTENDED_OUTBOUND_LINKS_CHECK = 'outbound-links',
  EXTENDED_SUBHEADINGS_KEYWORD_CHECK = 'subheadings-keyword',
  EXTENDED_TEXT_COMPETING_LINKS_CHECK = 'text-competing-links',
  EXTENDED_TEXT_IMAGES_CHECK = 'text-images',
  EXTENDED_URL_KEYWORD_CHECK = 'url-keyword'
}

// Keep backward compatibility
export const AvailableAssessments = AssessmentType;

export interface AssessmentConfiguration {
  enabledAssessments?: string[];
  enableAllSEO?: boolean;
  enableAllReadability?: boolean;
  enableAll?: boolean;
}

export const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfiguration = {
  enableAll: true
};

export const SEO_ASSESSMENTS = [
  AvailableAssessments.H1_MISSING,
  AvailableAssessments.MULTIPLE_H1,
  AvailableAssessments.H1_KEYWORD_MISSING,
  AvailableAssessments.IMAGES_MISSING_ALT,
  AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
  AvailableAssessments.KEYWORD_DENSITY_LOW,
  AvailableAssessments.META_DESCRIPTION_NEEDS_IMPROVEMENT,
  AvailableAssessments.META_DESCRIPTION_MISSING,
  AvailableAssessments.TITLE_NEEDS_IMPROVEMENT,
  AvailableAssessments.TITLE_MISSING,
  AvailableAssessments.CONTENT_LENGTH_SHORT
];

export const READABILITY_ASSESSMENTS = [
  AvailableAssessments.FLESCH_READING_EASE,
  AvailableAssessments.PARAGRAPH_LENGTH_LONG,
  AvailableAssessments.SENTENCE_LENGTH_LONG,
  AvailableAssessments.SUBHEADING_DISTRIBUTION_POOR
];

export const ALL_CURRENT_ASSESSMENTS = [
  ...SEO_ASSESSMENTS,
  ...READABILITY_ASSESSMENTS
];

export const EXTENDED_ASSESSMENTS = [
  AvailableAssessments.EXTENDED_HEADING_STRUCTURE_ORDER_CHECK,
  AvailableAssessments.EXTENDED_PASSIVE_VOICE_CHECK,
  AvailableAssessments.EXTENDED_SENTENCE_BEGINNINGS_CHECK,
  AvailableAssessments.EXTENDED_SENTENCE_LENGTH_IN_DESCRIPTION_CHECK,
  AvailableAssessments.EXTENDED_TEXT_PRESENCE_CHECK,
  AvailableAssessments.EXTENDED_TRANSITION_WORDS_CHECK,
  AvailableAssessments.EXTENDED_WORD_COMPLEXITY_CHECK,
  AvailableAssessments.EXTENDED_FUNCTION_WORDS_IN_KEYPHRASE_CHECK,
  AvailableAssessments.EXTENDED_INTERNAL_LINKS_CHECK,
  AvailableAssessments.EXTENDED_KEYPHRASE_LENGTH_CHECK,
  AvailableAssessments.EXTENDED_KEYWORD_STOP_WORDS_CHECK,
  AvailableAssessments.EXTENDED_KEYPHRASE_DISTRIBUTION_CHECK,
  AvailableAssessments.EXTENDED_OUTBOUND_LINKS_CHECK,
  AvailableAssessments.EXTENDED_SUBHEADINGS_KEYWORD_CHECK,
  AvailableAssessments.EXTENDED_TEXT_COMPETING_LINKS_CHECK,
  AvailableAssessments.EXTENDED_TEXT_IMAGES_CHECK,
  AvailableAssessments.EXTENDED_URL_KEYWORD_CHECK
];
