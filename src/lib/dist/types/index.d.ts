export * from './errors';
export * from './wordpress';
export type { AssessmentResult, TestResults, AssessmentType, AssessmentStatus } from '../app/running-the-tests/types/assessment.types';
export type { AuditReport, OverallScores, DetailedIssue, ReportSummary, ScoreGrade, IssueRating } from '../app/presenting-the-report/types/report.types';
export type { PageIngredients, PageDetails } from '../app/gathering-ingredients/types/ingredients.types';
export type { ParsedContent, HeadingStructure, ImageInfo, LinkInfo } from '../app/understanding-the-page/types/parsed-content.types';
export interface ServiceConfig {
    port: number;
    enableCors: boolean;
    enableLogging: boolean;
    rateLimit: {
        windowMs: number;
        max: number;
    };
}
