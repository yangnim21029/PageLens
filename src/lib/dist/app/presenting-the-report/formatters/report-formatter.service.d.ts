import { AuditReport, ReportGenerationResult } from '../types/report.types';
import { TestResults } from '../../running-the-tests/types/assessment.types';
export declare class ReportFormatter {
    generateReport(testResults: TestResults, url: string): ReportGenerationResult;
    private formatOverallScores;
    private formatDetailedIssues;
    private generateSummary;
    private scoreToGrade;
    private statusToRating;
    generateTextSummary(report: AuditReport): string;
    generateJSONReport(report: AuditReport): string;
}
