export declare enum AssessmentType {
    SEO = "seo",
    READABILITY = "readability"
}
export declare enum AssessmentStatus {
    GOOD = "good",
    OK = "ok",
    BAD = "bad"
}
export interface AssessmentResult {
    id: string;
    type: AssessmentType;
    name: string;
    description: string;
    status: AssessmentStatus;
    score: number;
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
export declare enum AvailableAssessments {
    SINGLE_H1 = "h1-missing",
    MULTIPLE_H1 = "multiple-h1",
    H1_KEYWORD = "h1-keyword-missing",
    ALT_ATTRIBUTE = "images-missing-alt",
    INTRODUCTION_KEYWORD = "keyword-missing-first-paragraph",
    KEYWORD_DENSITY = "keyword-density-low",
    META_DESCRIPTION_KEYWORD = "meta-description-needs-improvement",
    META_DESCRIPTION_LENGTH = "meta-description-missing",
    PAGE_TITLE_WIDTH = "title-needs-improvement",
    TITLE_KEYWORD = "title-missing",
    TEXT_LENGTH = "content-length-short",
    FLESCH_READING_EASE = "flesch-reading-ease",
    PARAGRAPH_TOO_LONG = "paragraph-length-long",
    SENTENCE_LENGTH_IN_TEXT = "sentence-length-long",
    SUBHEADING_DISTRIBUTION_TOO_LONG = "subheading-distribution-poor",
    HEADING_STRUCTURE_ORDER = "heading-structure-order",
    PASSIVE_VOICE = "passive-voice",
    SENTENCE_BEGINNINGS = "sentence-beginnings",
    SENTENCE_LENGTH_IN_DESCRIPTION = "sentence-length-in-description",
    TEXT_PRESENCE = "text-presence",
    TRANSITION_WORDS = "transition-words",
    WORD_COMPLEXITY = "word-complexity",
    FUNCTION_WORDS_IN_KEYPHRASE = "function-words-in-keyphrase",
    INTERNAL_LINKS = "internal-links",
    KEYPHRASE_LENGTH = "keyphrase-length",
    KEYWORD_STOP_WORDS = "keyword-stop-words",
    KEYPHRASE_DISTRIBUTION = "keyphrase-distribution",
    OUTBOUND_LINKS = "outbound-links",
    SUBHEADINGS_KEYWORD = "subheadings-keyword",
    TEXT_COMPETING_LINKS = "text-competing-links",
    TEXT_IMAGES = "text-images",
    URL_KEYWORD = "url-keyword"
}
export interface AssessmentConfiguration {
    enabledAssessments?: AvailableAssessments[];
    enableAllSEO?: boolean;
    enableAllReadability?: boolean;
    enableAll?: boolean;
}
export declare const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfiguration;
export declare const SEO_ASSESSMENTS: AvailableAssessments[];
export declare const READABILITY_ASSESSMENTS: AvailableAssessments[];
export declare const ALL_CURRENT_ASSESSMENTS: AvailableAssessments[];
export declare const EXTENDED_ASSESSMENTS: AvailableAssessments[];
