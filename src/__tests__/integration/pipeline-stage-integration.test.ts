import { IngredientsGatherer } from '@/app/gathering-ingredients/services/ingredients-gatherer.service';
import { HTMLParser } from '@/app/understanding-the-page/parsers/html-parser.service';
import { SEOAssessor } from '@/app/running-the-tests/assessments/seo-checks/seo-assessor.service';
import { ReadabilityAssessor } from '@/app/running-the-tests/assessments/readability-checks/readability-assessor.service';
import { ReportFormatter } from '@/app/presenting-the-report/formatters/report-formatter.service';
import { DetailedIssue } from '@/app/presenting-the-report/types/report.types';
import { TestResults } from '@/app/running-the-tests/types/assessment.types';

describe('Pipeline Stage Integration', () => {
  let ingredientsGatherer: IngredientsGatherer;
  let htmlParser: HTMLParser;
  let seoAssessor: SEOAssessor;
  let readabilityAssessor: ReadabilityAssessor;
  let reportFormatter: ReportFormatter;

  beforeEach(() => {
    ingredientsGatherer = new IngredientsGatherer();
    htmlParser = new HTMLParser();
    seoAssessor = new SEOAssessor();
    readabilityAssessor = new ReadabilityAssessor();
    reportFormatter = new ReportFormatter();
  });

  const testInput = {
    htmlContent: `
      <html>
        <head>
          <title>Test SEO Page with Keyword</title>
          <meta name="description" content="This is a test page description with keyword for SEO testing purposes.">
        </head>
        <body>
          <h1>Main Title with Keyword</h1>
          <h2>Subtitle for Better Structure</h2>
          <p>This is the first paragraph that contains the keyword. This paragraph provides context and information about the keyword topic.</p>
          <p>This is the second paragraph with more content. It provides additional information and helps with content length.</p>
          <img src="image1.jpg" alt="Test image with keyword">
          <img src="image2.jpg" alt="Another test image">
          <a href="https://example.com">External link</a>
          <a href="/internal">Internal link</a>
          <h3>Additional Section</h3>
          <p>More content to reach adequate word count. This content helps with SEO and readability assessments.</p>
        </body>
      </html>
    `,
    pageDetails: {
      url: 'https://example.com/test-page',
      title: 'Test SEO Page with Keyword'
    },
    focusKeyword: 'keyword',
    synonyms: ['term', 'phrase', 'word']
  };

  describe('Stage 1 → Stage 2 Integration', () => {
    it('should pass ingredients from gathering to understanding stage', async () => {
      // Stage 1: Gather ingredients
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(testInput);
      expect(ingredientsResult.success).toBe(true);
      
      // Stage 2: Parse HTML using gathered ingredients
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent);
      
      // Verify data flow
      expect(parsedContent.title).toBe('Test SEO Page with Keyword');
      expect(parsedContent.headings.length).toBeGreaterThan(0);
      expect(parsedContent.images.length).toBe(2);
      expect(parsedContent.links.length).toBe(2);
      expect(parsedContent.wordCount).toBeGreaterThan(0);
    });

    it('should handle content selectors between stages', async () => {
      const inputWithSelectors = {
        ...testInput,
        htmlContent: `
          <html>
            <body>
              <div class="header">Header content</div>
              <div class="main-content">
                <h1>Main Title</h1>
                <p>Main paragraph content</p>
              </div>
              <div class="sidebar">Sidebar content</div>
            </body>
          </html>
        `
      };

      const ingredientsResult = await ingredientsGatherer.gatherIngredients(inputWithSelectors);
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent, {
        contentSelectors: ['.main-content'],
        excludeSelectors: ['.sidebar']
      });

      expect(parsedContent.textContent).toContain('Main paragraph content');
      expect(parsedContent.textContent).not.toContain('Sidebar content');
    });
  });

  describe('Stage 2 → Stage 3 Integration', () => {
    it('should pass parsed content to assessment stage', async () => {
      // Stage 1 & 2: Gather and parse
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(testInput);
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent);
      
      // Stage 3: Run assessments
      const seoResults = await seoAssessor.runSEOChecks(parsedContent, ingredientsResult.ingredients!);
      const readabilityResults = await readabilityAssessor.runReadabilityChecks(parsedContent);
      
      // Verify assessment results
      expect(seoResults.length).toBeGreaterThan(0);
      expect(readabilityResults.length).toBeGreaterThan(0);
      
      // Check that assessments can access parsed data
      const h1Assessment = seoResults.find(r => r.id.includes('h1'));
      expect(h1Assessment).toBeDefined();
      expect(h1Assessment?.status).toBe('good'); // H1 contains keyword
      
      const sentenceAssessment = readabilityResults.find(r => r.id.includes('sentence'));
      expect(sentenceAssessment).toBeDefined();
    });

    it('should maintain data consistency between parsing and assessment', async () => {
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(testInput);
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent);
      
      // Run assessments
      const seoResults = await seoAssessor.runSEOChecks(parsedContent, ingredientsResult.ingredients!);
      
      // Check that assessments use correct parsed data
      const imageAssessment = seoResults.find(r => r.id.includes('image'));
      expect(imageAssessment?.details?.imageCount).toBe(parsedContent.images.length);
      
      const titleAssessment = seoResults.find(r => r.id.includes('title'));
      expect(titleAssessment?.details?.title).toBe(parsedContent.title);
    });
  });

  describe('Stage 3 → Stage 4 Integration', () => {
    it('should format assessment results into final report', async () => {
      // Stages 1-3: Full pipeline through assessments
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(testInput);
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent);
      const seoResults = await seoAssessor.runSEOChecks(parsedContent, ingredientsResult.ingredients!);
      const readabilityResults = await readabilityAssessor.runReadabilityChecks(parsedContent);
      
      // Stage 4: Format report
      const testResults: TestResults = {
        seoScore: 0, // Placeholder, actual score calculated by ReportFormatter
        readabilityScore: 0, // Placeholder
        overallScore: 0, // Placeholder
        assessments: [...seoResults, ...readabilityResults],
        timestamp: new Date()
      };
      const report = reportFormatter.generateReport(testResults, testInput.pageDetails.url);
      
      // Verify report structure
      expect(report.success).toBe(true);
      expect(report.report?.url).toBe(testInput.pageDetails.url);
      expect(report.report?.overallScores).toBeDefined();
      expect(report.report?.detailedIssues).toBeDefined();
      expect(report.report?.summary).toBeDefined();
      
      // Check score calculations
      expect(report.report?.overallScores.seoScore).toBeGreaterThanOrEqual(0);
      expect(report.report?.overallScores.seoScore).toBeLessThanOrEqual(100);
      expect(report.report?.overallScores.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(report.report?.overallScores.readabilityScore).toBeLessThanOrEqual(100);
    });

    it('should preserve assessment details in report', async () => {
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(testInput);
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent);
      const seoResults = await seoAssessor.runSEOChecks(parsedContent, ingredientsResult.ingredients!);
      const readabilityResults = await readabilityAssessor.runReadabilityChecks(parsedContent);
      
      const testResults: TestResults = {
        seoScore: 0, // Placeholder, actual score calculated by ReportFormatter
        readabilityScore: 0, // Placeholder
        overallScore: 0, // Placeholder
        assessments: [...seoResults, ...readabilityResults],
        timestamp: new Date()
      };
      const report = reportFormatter.generateReport(testResults, testInput.pageDetails.url);
      
      // Check that original assessment details are preserved
      const reportIssues = report.report?.detailedIssues;
      const originalSeoIssue = seoResults[0];
      const reportSeoIssue = reportIssues?.find((i: DetailedIssue) => i.id === originalSeoIssue.id);
      
      expect(reportSeoIssue).toBeDefined();
      expect(reportSeoIssue?.score).toBe(originalSeoIssue.score);
      expect(reportSeoIssue?.rating).toBe(originalSeoIssue.rating);
      expect(reportSeoIssue?.details).toEqual(originalSeoIssue.details);
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should run complete pipeline from input to output', async () => {
      // Complete pipeline simulation
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(testInput);
      expect(ingredientsResult.success).toBe(true);
      
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent);
      expect(parsedContent.title).toBeTruthy();
      
      const seoResults = await seoAssessor.runSEOChecks(parsedContent, ingredientsResult.ingredients!);
      const readabilityResults = await readabilityAssessor.runReadabilityChecks(parsedContent);
      expect(seoResults.length).toBeGreaterThan(0);
      expect(readabilityResults.length).toBeGreaterThan(0);
      
      const testResults: TestResults = {
        seoScore: 0, // Placeholder, actual score calculated by ReportFormatter
        readabilityScore: 0, // Placeholder
        overallScore: 0, // Placeholder
        assessments: [...seoResults, ...readabilityResults],
        timestamp: new Date()
      };
      const report = reportFormatter.generateReport(testResults, testInput.pageDetails.url);
      expect(report.success).toBe(true);
      
      // Verify end-to-end data flow
      expect(report.report?.detailedIssues.length).toBe(seoResults.length + readabilityResults.length);
    });

    it('should handle Chinese content through full pipeline', async () => {
      const chineseInput = {
        htmlContent: `
          <html>
            <head>
              <title>動物方城市2電影資訊</title>
              <meta name="description" content="迪士尼動畫電影動物方城市2即將上映的最新資訊">
            </head>
            <body>
              <h1>動物方城市2上映時間</h1>
              <p>經過九年的等待，動物方城市2終於要上映了！這部迪士尼動畫續集將為觀眾帶來全新的冒險故事。</p>
              <img src="zootopia2.jpg" alt="動物方城市2電影海報">
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/zootopia2',
          title: '動物方城市2電影資訊'
        },
        focusKeyword: '動物方城市2',
        synonyms: ['動物方城市', 'Zootopia 2']
      };

      // Full pipeline with Chinese content
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(chineseInput);
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent);
      const seoResults = await seoAssessor.runSEOChecks(parsedContent, ingredientsResult.ingredients!);
      const readabilityResults = await readabilityAssessor.runReadabilityChecks(parsedContent);
      const testResults: TestResults = {
        seoScore: 0, // Placeholder, actual score calculated by ReportFormatter
        readabilityScore: 0, // Placeholder
        overallScore: 0, // Placeholder
        assessments: [...seoResults, ...readabilityResults],
        timestamp: new Date()
      };
      const report = reportFormatter.generateReport(testResults, chineseInput.pageDetails.url);

      expect(report.success).toBe(true);
      expect(report.report?.detailedIssues.length).toBeGreaterThan(0);
      
      // Check Chinese keyword handling
      const h1Assessment = report.report?.detailedIssues.find((i: DetailedIssue) => i.id.includes('h1'));
      expect(h1Assessment?.status).toBe('good');
    });

    it('should handle error propagation through stages', async () => {
      const invalidInput = {
        htmlContent: '', // Empty HTML should cause issues
        pageDetails: {
          url: 'https://example.com/invalid',
          title: 'Invalid Page'
        },
        focusKeyword: 'keyword',
        synonyms: []
      };

      // Should handle empty content gracefully
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(invalidInput);
      expect(ingredientsResult.success).toBe(false);
    });
  });

  describe('Performance Integration', () => {
    it('should maintain reasonable performance through pipeline', async () => {
      const startTime = Date.now();
      
      const ingredientsResult = await ingredientsGatherer.gatherIngredients(testInput);
      const parsedContent = htmlParser.parse(ingredientsResult.ingredients!.htmlContent);
      const seoResults = await seoAssessor.runSEOChecks(parsedContent, ingredientsResult.ingredients!);
      const readabilityResults = await readabilityAssessor.runReadabilityChecks(parsedContent);
      const testResults: TestResults = {
        seoScore: 0, // Placeholder, actual score calculated by ReportFormatter
        readabilityScore: 0, // Placeholder
        overallScore: 0, // Placeholder
        assessments: [...seoResults, ...readabilityResults],
        timestamp: new Date()
      };
      const report = reportFormatter.generateReport(testResults, testInput.pageDetails.url);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
      expect(report.success).toBe(true);
    });
  });
});