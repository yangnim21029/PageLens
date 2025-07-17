"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditPipelineOrchestrator = void 0;
const ingredients_gatherer_service_1 = require("./gathering-ingredients/services/ingredients-gatherer.service");
const report_formatter_service_1 = require("./presenting-the-report/formatters/report-formatter.service");
const test_runner_service_1 = require("./running-the-tests/assessments/test-runner.service");
const content_extractor_service_1 = require("./understanding-the-page/extractors/content-extractor.service");
class AuditPipelineOrchestrator {
    constructor() {
        this.ingredientsGatherer = new ingredients_gatherer_service_1.IngredientsGatherer();
        this.contentExtractor = new content_extractor_service_1.ContentExtractor();
        this.testRunner = new test_runner_service_1.TestRunner();
        this.reportFormatter = new report_formatter_service_1.ReportFormatter();
    }
    async executeAuditPipeline(input, options = {}) {
        const startTime = Date.now();
        try {
            const ingredientsResult = await this.ingredientsGatherer.gatherIngredients(input);
            if (!ingredientsResult.success || !ingredientsResult.ingredients) {
                return {
                    success: false,
                    error: `Ingredients gathering failed: ${ingredientsResult.error}`,
                    processingTime: Date.now() - startTime
                };
            }
            const extractionOptions = {
                contentSelectors: options.contentSelectors,
                excludeSelectors: options.excludeSelectors,
                baseUrl: options.baseUrl || input.pageDetails.url,
                extractMainContent: options.extractMainContent
            };
            const extractionResult = await this.contentExtractor.extractContent(input.htmlContent, extractionOptions);
            if (!extractionResult.success || !extractionResult.parsedContent) {
                return {
                    success: false,
                    error: `Content extraction failed: ${extractionResult.error}`,
                    processingTime: Date.now() - startTime
                };
            }
            const testResult = await this.testRunner.runTests(extractionResult.parsedContent, ingredientsResult.ingredients, options.assessmentConfig);
            if (!testResult.success || !testResult.results) {
                return {
                    success: false,
                    error: `Test execution failed: ${testResult.error}`,
                    processingTime: Date.now() - startTime
                };
            }
            const reportResult = this.reportFormatter.generateReport(testResult.results, input.pageDetails.url);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : 'Unknown error in audit pipeline',
                processingTime: Date.now() - startTime
            };
        }
    }
    getProcessingStats() {
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
exports.AuditPipelineOrchestrator = AuditPipelineOrchestrator;
//# sourceMappingURL=audit-pipeline.orchestrator.js.map