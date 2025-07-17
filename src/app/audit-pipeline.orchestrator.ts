import { IngredientsGatherer } from './gathering-ingredients/services/ingredients-gatherer.service';
import { ReportFormatter } from './presenting-the-report/formatters/report-formatter.service';
import { TestRunner } from './running-the-tests/assessments/test-runner.service';
import {
  ContentExtractionOptions,
  ContentExtractor
} from './understanding-the-page/extractors/content-extractor.service';
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

export class AuditPipelineOrchestrator {
  private ingredientsGatherer: IngredientsGatherer;
  private contentExtractor: ContentExtractor;
  private testRunner: TestRunner;
  private reportFormatter: ReportFormatter;

  constructor() {
    this.ingredientsGatherer = new IngredientsGatherer();
    this.contentExtractor = new ContentExtractor();
    this.testRunner = new TestRunner();
    this.reportFormatter = new ReportFormatter();
  }

  async executeAuditPipeline(
    input: AuditPipelineInput,
    options: AuditPipelineOptions = {}
  ): Promise<AuditPipelineResult> {
    const startTime = Date.now();

    try {
      // Step 1: Gathering Ingredients
      const ingredientsResult =
        await this.ingredientsGatherer.gatherIngredients(input);
      if (!ingredientsResult.success || !ingredientsResult.ingredients) {
        return {
          success: false,
          error: `Ingredients gathering failed: ${ingredientsResult.error}`,
          processingTime: Date.now() - startTime
        };
      }

      // Step 2: Understanding the Page
      const extractionOptions: ContentExtractionOptions = {
        contentSelectors: options.contentSelectors,
        excludeSelectors: options.excludeSelectors,
        baseUrl: options.baseUrl || input.pageDetails.url,
        extractMainContent: options.extractMainContent
      };

      const extractionResult = await this.contentExtractor.extractContent(
        input.htmlContent,
        extractionOptions
      );
      if (!extractionResult.success || !extractionResult.parsedContent) {
        return {
          success: false,
          error: `Content extraction failed: ${extractionResult.error}`,
          processingTime: Date.now() - startTime
        };
      }

      // Step 3: Running the Tests
      const testResult = await this.testRunner.runTests(
        extractionResult.parsedContent,
        ingredientsResult.ingredients,
        options.assessmentConfig
      );
      if (!testResult.success || !testResult.results) {
        return {
          success: false,
          error: `Test execution failed: ${testResult.error}`,
          processingTime: Date.now() - startTime
        };
      }

      // Step 4: Presenting the Report
      const reportResult = this.reportFormatter.generateReport(
        testResult.results,
        input.pageDetails.url
      );
      if (!reportResult.success || !reportResult.report) {
        return {
          success: false,
          error: `Report generation failed: ${reportResult.error}`,
          processingTime: Date.now() - startTime
        };
      }

      return {
        success: true,
        report: reportResult.report,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error in audit pipeline',
        processingTime: Date.now() - startTime
      };
    }
  }

  // Helper method to get processing statistics
  getProcessingStats(): any {
    return {
      pipelineSteps: [
        'Gathering Ingredients',
        'Understanding the Page',
        'Running the Tests',
        'Presenting the Report'
      ],
      supportedChecks: {
        seo: [
          'H1 Tag Validation',
          'Image Alt Text',
          'Keyword Optimization',
          'Meta Elements',
          'Content Length'
        ],
        readability: [
          'Sentence Length',
          'Flesch Reading Ease',
          'Paragraph Length',
          'Subheading Distribution'
        ]
      }
    };
  }
}
