import { AssessmentConfiguration } from './running-the-tests/types/assessment.types';
import { PageDetails } from './gathering-ingredients/types/ingredients.types';
import { AuditReport } from './presenting-the-report/types/report.types';
export interface AuditPipelineInput {
    htmlContent: string;
    pageDetails: PageDetails;
    focusKeyword: string;
    synonyms?: string[];
}
export interface AuditPipelineOptions {
    contentSelectors?: string[];
    excludeSelectors?: string[];
    extractMainContent?: boolean;
    baseUrl?: string;
    assessmentConfig?: AssessmentConfiguration;
}
export interface AuditPipelineResult {
    success: boolean;
    report?: AuditReport;
    error?: string;
    processingTime?: number;
}
export declare class AuditPipelineOrchestrator {
    private ingredientsGatherer;
    private contentExtractor;
    private testRunner;
    private reportFormatter;
    constructor();
    executeAuditPipeline(input: AuditPipelineInput, options?: AuditPipelineOptions): Promise<AuditPipelineResult>;
    getProcessingStats(): any;
}
