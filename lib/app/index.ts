// Main orchestrator
export { AuditPipelineOrchestrator } from './audit-pipeline.orchestrator';
export type {
  AuditPipelineInput,
  AuditPipelineOptions,
  AuditPipelineResult
} from './audit-pipeline.orchestrator';

// Types
export type {
  PageDetails,
  PageIngredients
} from './gathering-ingredients/types/ingredients.types';
export {
  IssueRating,
  ScoreGrade
} from './presenting-the-report/types/report.types';
export type {
  AuditReport,
  DetailedIssue,
  OverallScores,
  ReportSummary
} from './presenting-the-report/types/report.types';
export {
  AssessmentStatus,
  AssessmentType
} from './running-the-tests/types/assessment.types';
export type {
  AssessmentResult,
  TestResults
} from './running-the-tests/types/assessment.types';
export type {
  HeadingStructure,
  ImageInfo,
  LinkInfo,
  ParsedContent
} from './understanding-the-page/types/parsed-content.types';

// Services (if needed for advanced usage)
export { IngredientsGatherer } from './gathering-ingredients/services/ingredients-gatherer.service';
export { ReportFormatter } from './presenting-the-report/formatters/report-formatter.service';
export { ReadabilityAssessor } from './running-the-tests/assessments/readability-checks/readability-assessor.service';
export { SEOAssessor } from './running-the-tests/assessments/seo-checks/seo-assessor.service';
export { TestRunner } from './running-the-tests/assessments/test-runner.service';
export { ContentExtractor } from './understanding-the-page/extractors/content-extractor.service';
export { HTMLParser } from './understanding-the-page/parsers/html-parser.service';

// Utils
export { KeywordMatcher } from './utils/keyword-matcher';
export type { KeywordAnalysis, KeywordMatch } from './utils/keyword-matcher';

// Additional types
export type { ContentExtractionOptions } from './understanding-the-page/extractors/content-extractor.service';
export type { ContentSelectors } from './understanding-the-page/parsers/html-parser.service';
export type {
  TextStats,
  VideoInfo
} from './understanding-the-page/types/parsed-content.types';
