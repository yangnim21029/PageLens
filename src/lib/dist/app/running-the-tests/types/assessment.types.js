"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTENDED_ASSESSMENTS = exports.ALL_CURRENT_ASSESSMENTS = exports.READABILITY_ASSESSMENTS = exports.SEO_ASSESSMENTS = exports.DEFAULT_ASSESSMENT_CONFIG = exports.AvailableAssessments = exports.AssessmentStatus = exports.AssessmentType = void 0;
var AssessmentType;
(function (AssessmentType) {
    AssessmentType["SEO"] = "seo";
    AssessmentType["READABILITY"] = "readability";
})(AssessmentType || (exports.AssessmentType = AssessmentType = {}));
var AssessmentStatus;
(function (AssessmentStatus) {
    AssessmentStatus["GOOD"] = "good";
    AssessmentStatus["OK"] = "ok";
    AssessmentStatus["BAD"] = "bad";
})(AssessmentStatus || (exports.AssessmentStatus = AssessmentStatus = {}));
var AvailableAssessments;
(function (AvailableAssessments) {
    AvailableAssessments["SINGLE_H1"] = "h1-missing";
    AvailableAssessments["MULTIPLE_H1"] = "multiple-h1";
    AvailableAssessments["H1_KEYWORD"] = "h1-keyword-missing";
    AvailableAssessments["ALT_ATTRIBUTE"] = "images-missing-alt";
    AvailableAssessments["INTRODUCTION_KEYWORD"] = "keyword-missing-first-paragraph";
    AvailableAssessments["KEYWORD_DENSITY"] = "keyword-density-low";
    AvailableAssessments["META_DESCRIPTION_KEYWORD"] = "meta-description-needs-improvement";
    AvailableAssessments["META_DESCRIPTION_LENGTH"] = "meta-description-missing";
    AvailableAssessments["PAGE_TITLE_WIDTH"] = "title-needs-improvement";
    AvailableAssessments["TITLE_KEYWORD"] = "title-missing";
    AvailableAssessments["TEXT_LENGTH"] = "content-length-short";
    AvailableAssessments["FLESCH_READING_EASE"] = "flesch-reading-ease";
    AvailableAssessments["PARAGRAPH_TOO_LONG"] = "paragraph-length-long";
    AvailableAssessments["SENTENCE_LENGTH_IN_TEXT"] = "sentence-length-long";
    AvailableAssessments["SUBHEADING_DISTRIBUTION_TOO_LONG"] = "subheading-distribution-poor";
    AvailableAssessments["HEADING_STRUCTURE_ORDER"] = "heading-structure-order";
    AvailableAssessments["PASSIVE_VOICE"] = "passive-voice";
    AvailableAssessments["SENTENCE_BEGINNINGS"] = "sentence-beginnings";
    AvailableAssessments["SENTENCE_LENGTH_IN_DESCRIPTION"] = "sentence-length-in-description";
    AvailableAssessments["TEXT_PRESENCE"] = "text-presence";
    AvailableAssessments["TRANSITION_WORDS"] = "transition-words";
    AvailableAssessments["WORD_COMPLEXITY"] = "word-complexity";
    AvailableAssessments["FUNCTION_WORDS_IN_KEYPHRASE"] = "function-words-in-keyphrase";
    AvailableAssessments["INTERNAL_LINKS"] = "internal-links";
    AvailableAssessments["KEYPHRASE_LENGTH"] = "keyphrase-length";
    AvailableAssessments["KEYWORD_STOP_WORDS"] = "keyword-stop-words";
    AvailableAssessments["KEYPHRASE_DISTRIBUTION"] = "keyphrase-distribution";
    AvailableAssessments["OUTBOUND_LINKS"] = "outbound-links";
    AvailableAssessments["SUBHEADINGS_KEYWORD"] = "subheadings-keyword";
    AvailableAssessments["TEXT_COMPETING_LINKS"] = "text-competing-links";
    AvailableAssessments["TEXT_IMAGES"] = "text-images";
    AvailableAssessments["URL_KEYWORD"] = "url-keyword";
})(AvailableAssessments || (exports.AvailableAssessments = AvailableAssessments = {}));
exports.DEFAULT_ASSESSMENT_CONFIG = {
    enableAll: true
};
exports.SEO_ASSESSMENTS = [
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
exports.READABILITY_ASSESSMENTS = [
    AvailableAssessments.FLESCH_READING_EASE,
    AvailableAssessments.PARAGRAPH_TOO_LONG,
    AvailableAssessments.SENTENCE_LENGTH_IN_TEXT,
    AvailableAssessments.SUBHEADING_DISTRIBUTION_TOO_LONG
];
exports.ALL_CURRENT_ASSESSMENTS = [
    ...exports.SEO_ASSESSMENTS,
    ...exports.READABILITY_ASSESSMENTS
];
exports.EXTENDED_ASSESSMENTS = [
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
//# sourceMappingURL=assessment.types.js.map