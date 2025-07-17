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

// Assessment Configuration Types - Internal enum names for code organization
export enum AssessmentType {
  // SEO Assessments
  SEO_SINGLE_H1_CHECK = 'h1-missing',
  SEO_MULTIPLE_H1_CHECK = 'multiple-h1',
  SEO_H1_KEYWORD_CHECK = 'h1-keyword-missing',
  SEO_ALT_ATTRIBUTE_CHECK = 'images-missing-alt',
  SEO_INTRODUCTION_KEYWORD_CHECK = 'keyword-missing-first-paragraph',
  SEO_KEYWORD_DENSITY_CHECK = 'keyword-density-low',
  SEO_META_DESCRIPTION_KEYWORD_CHECK = 'meta-description-needs-improvement',
  SEO_META_DESCRIPTION_LENGTH_CHECK = 'meta-description-missing',
  SEO_PAGE_TITLE_WIDTH_CHECK = 'title-needs-improvement',
  SEO_TITLE_KEYWORD_CHECK = 'title-missing',
  SEO_TEXT_LENGTH_CHECK = 'content-length-short',
  
  // Readability Assessments
  READABILITY_FLESCH_READING_EASE_CHECK = 'flesch-reading-ease',
  READABILITY_PARAGRAPH_TOO_LONG_CHECK = 'paragraph-length-long',
  READABILITY_SENTENCE_LENGTH_IN_TEXT_CHECK = 'sentence-length-long',
  READABILITY_SUBHEADING_DISTRIBUTION_CHECK = 'subheading-distribution-poor',
  
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
  enabledAssessments?: AvailableAssessments[];
  enableAllSEO?: boolean;
  enableAllReadability?: boolean;
  enableAll?: boolean;
}

export const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfiguration = {
  enableAll: true
};

export const SEO_ASSESSMENTS = [
  AvailableAssessments.SEO_SINGLE_H1_CHECK,
  AvailableAssessments.SEO_MULTIPLE_H1_CHECK,
  AvailableAssessments.SEO_H1_KEYWORD_CHECK,
  AvailableAssessments.SEO_ALT_ATTRIBUTE_CHECK,
  AvailableAssessments.SEO_INTRODUCTION_KEYWORD_CHECK,
  AvailableAssessments.SEO_KEYWORD_DENSITY_CHECK,
  AvailableAssessments.SEO_META_DESCRIPTION_KEYWORD_CHECK,
  AvailableAssessments.SEO_META_DESCRIPTION_LENGTH_CHECK,
  AvailableAssessments.SEO_PAGE_TITLE_WIDTH_CHECK,
  AvailableAssessments.SEO_TITLE_KEYWORD_CHECK,
  AvailableAssessments.SEO_TEXT_LENGTH_CHECK
];

export const READABILITY_ASSESSMENTS = [
  AvailableAssessments.READABILITY_FLESCH_READING_EASE_CHECK,
  AvailableAssessments.READABILITY_PARAGRAPH_TOO_LONG_CHECK,
  AvailableAssessments.READABILITY_SENTENCE_LENGTH_IN_TEXT_CHECK,
  AvailableAssessments.READABILITY_SUBHEADING_DISTRIBUTION_CHECK
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