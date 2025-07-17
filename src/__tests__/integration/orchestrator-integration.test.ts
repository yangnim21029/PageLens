/**
 * Integration Tests for Audit Pipeline Orchestrator
 */

import { AuditPipelineOrchestrator } from '@/app';
import { AuditPipelineInput, AuditPipelineOptions } from '@/app/audit-pipeline.orchestrator';
import { DetailedIssue } from '@/app/presenting-the-report/types/report.types';

describe('Audit Pipeline Orchestrator Integration', () => {
  let orchestrator: AuditPipelineOrchestrator;

  beforeEach(() => {
    orchestrator = new AuditPipelineOrchestrator();
  });

  const basicInput: AuditPipelineInput = {
    htmlContent: `
      <html>
        <head>
          <title>Integration Test Page with Keyword</title>
          <meta name="description" content="Test page description with keyword for integration testing">
        </head>
        <body>
          <h1>Main Title with Keyword</h1>
          <h2>Section About Keyword</h2>
          <p>This is the first paragraph containing the keyword. This paragraph provides detailed information about the keyword topic.</p>
          <p>This is additional content that helps with content length and provides more context about the keyword usage.</p>
          <img src="test1.jpg" alt="Test image with keyword">
          <img src="test2.jpg" alt="Another test image">
          <a href="https://example.com">External link about keyword</a>
          <h3>More Information</h3>
          <p>Additional paragraph with more content to ensure adequate word count for SEO assessment.</p>
        </body>
      </html>
    `,
    pageDetails: {
      url: 'https://example.com/integration-test',
      title: 'Integration Test Page with Keyword'
    },
    focusKeyword: 'keyword',
    synonyms: ['term', 'phrase', 'word']
  };

  describe('executeAuditPipeline', () => {
    it('should execute complete audit pipeline successfully', async () => {
      const result = await orchestrator.executeAuditPipeline(basicInput);
      
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
      
      // Verify report structure
      expect(result.report?.url).toBe(basicInput.pageDetails.url);
      expect(result.report?.timestamp).toBeDefined();
      expect(result.report?.overallScores).toBeDefined();
      expect(result.report?.detailedIssues).toBeInstanceOf(Array);
      expect(result.report?.summary).toBeDefined();
    });

    it('should handle content selectors option', async () => {
      const htmlWithSelectors = `
        <html>
          <body>
            <div class="header">Header content to exclude</div>
            <div class="main-content">
              <h1>Main Title with Keyword</h1>
              <p>Main content paragraph with keyword.</p>
            </div>
            <div class="sidebar">Sidebar content to exclude</div>
            <div class="footer">Footer content to exclude</div>
          </body>
        </html>
      `;

      const input = {
        ...basicInput,
        htmlContent: htmlWithSelectors
      };

      const options: AuditPipelineOptions = {
        contentSelectors: ['.main-content'],
      };

      const result = await orchestrator.executeAuditPipeline(input, options);
      
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      
      // Content should only include main-content area
      const h1Assessment = result.report!.detailedIssues.find(i => i.id.includes('h1'));
      expect(h1Assessment?.rating).toBe('good');
    });

    it('should handle Chinese content', async () => {
      const chineseInput: AuditPipelineInput = {
        htmlContent: `
          <html>
            <head>
              <title>動物方城市2電影介紹</title>
              <meta name="description" content="迪士尼動畫動物方城市2最新電影資訊和上映時間">
            </head>
            <body>
              <h1>動物方城市2正式上映</h1>
              <h2>電影劇情介紹</h2>
              <p>經過九年的等待，動物方城市2終於要上映了！這部迪士尼動畫續集將為觀眾帶來全新的冒險故事。</p>
              <p>在這個續集中，哈茱蒂和胡尼克將面對新的挑戰，動物方城市2的故事更加精彩。</p>
              <img src="zootopia2-poster.jpg" alt="動物方城市2電影海報">
              <img src="characters.jpg" alt="動物方城市2角色介紹">
            </body>
          </html>
        `,
        pageDetails: {
          url: 'https://example.com/zootopia2-info',
          title: '動物方城市2電影介紹'
        },
        focusKeyword: '動物方城市2',
        synonyms: ['動物方城市', 'Zootopia 2', '動物城市2']
      };

      const result = await orchestrator.executeAuditPipeline(chineseInput);
      
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      
      // Check Chinese keyword processing
      const h1Assessment = result.report!.detailedIssues.find(i => i.id.includes('h1'));
      expect(h1Assessment?.rating).toBe('good');
      
      // Verify overall scores
      expect(result.report?.overallScores.seoScore).toBeGreaterThanOrEqual(0);
      expect(result.report?.overallScores.readabilityScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty or minimal content', async () => {
      const minimalInput: AuditPipelineInput = {
        htmlContent: '<html><body><h1>Title</h1><p>Short content.</p></body></html>',
        pageDetails: {
          url: 'https://example.com/minimal',
          title: 'Minimal Page'
        },
        focusKeyword: 'content',
        synonyms: []
      };

      const result = await orchestrator.executeAuditPipeline(minimalInput);
      
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      
      // Should identify content length issues
      const contentLengthIssue = result.report!.detailedIssues.find(i => i.id.includes('content-length'));
      expect(contentLengthIssue?.status).toBe('bad');
    });

    it('should handle invalid HTML gracefully', async () => {
      const invalidInput: AuditPipelineInput = {
        htmlContent: '',
        pageDetails: {
          url: 'https://example.com/invalid',
          title: 'Invalid Page'
        },
        focusKeyword: 'test',
        synonyms: []
      };

      const result = await orchestrator.executeAuditPipeline(invalidInput);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should maintain performance standards', async () => {
      const startTime = Date.now();
      const result = await orchestrator.executeAuditPipeline(basicInput);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(result.processingTime).toBeLessThan(1000); // Should complete within 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle large content efficiently', async () => {
      const largeContent = `
        <html>
          <head>
            <title>Large Content Page with Keyword</title>
            <meta name="description" content="Large content page for performance testing with keyword">
          </head>
          <body>
            <h1>Large Content with Keyword</h1>
            ${Array.from({ length: 100 }, (_, i) => `
              <h2>Section ${i + 1}</h2>
              <p>This is paragraph ${i + 1} with keyword content. ${'Content '.repeat(50)}</p>
            `).join('')}
            <img src="large-image.jpg" alt="Large content image with keyword">
          </body>
        </html>
      `;

      const largeInput = {
        ...basicInput,
        htmlContent: largeContent
      };

      const result = await orchestrator.executeAuditPipeline(largeInput);
      
      expect(result.success).toBe(true);
      expect(result.processingTime).toBeLessThan(2000); // Should handle large content within 2 seconds
    });

    it('should provide consistent results for same input', async () => {
      const result1 = await orchestrator.executeAuditPipeline(basicInput);
      const result2 = await orchestrator.executeAuditPipeline(basicInput);
      
      expect(result1.success).toBe(result2.success);
      expect(result1.report?.overallScores.seoScore).toBe(result2.report?.overallScores.seoScore);
      expect(result1.report?.overallScores.readabilityScore).toBe(result2.report?.overallScores.readabilityScore);
      expect(result1.report?.detailedIssues.length).toBe(result2.report?.detailedIssues.length);
    });

    it('should handle synonym processing', async () => {
      const inputWithSynonyms = {
        ...basicInput,
        synonyms: ['term', 'phrase', 'word', 'concept']
      };

      const result = await orchestrator.executeAuditPipeline(inputWithSynonyms);
      
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      
      // Synonyms should be processed in keyword analysis
      const keywordAssessments = result.report?.detailedIssues.filter(i => 
        i.id.includes('keyword') || i.id.includes('synonym')
      );
      expect(keywordAssessments.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle missing required fields', async () => {
      const invalidInput = {
        htmlContent: '',
        pageDetails: {
          url: '',
          title: ''
        },
        focusKeyword: '',
        synonyms: []
      } as AuditPipelineInput;

      const result = await orchestrator.executeAuditPipeline(invalidInput);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle malformed HTML', async () => {
      const malformedInput = {
        ...basicInput,
        htmlContent: '<html><body><h1>Unclosed heading<p>Malformed content</body>'
      };

      const result = await orchestrator.executeAuditPipeline(malformedInput);
      
      // Should handle gracefully and still provide results
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
    });

    it('should handle extremely long keywords', async () => {
      const longKeywordInput = {
        ...basicInput,
        focusKeyword: 'a'.repeat(1000)
      };

      const result = await orchestrator.executeAuditPipeline(longKeywordInput);
      
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
    });
  });

  describe('report quality', () => {
    it('should generate comprehensive report data', async () => {
      const result = await orchestrator.executeAuditPipeline(basicInput);
      
      expect(result.success).toBe(true);
      
      // Check overall scores
      expect(result.report?.overallScores.seoScore).toBeGreaterThanOrEqual(0);
      expect(result.report?.overallScores.seoScore).toBeLessThanOrEqual(100);
      expect(result.report?.overallScores.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.report?.overallScores.readabilityScore).toBeLessThanOrEqual(100);
      
      // Check detailed issues
      expect(result.report?.detailedIssues.length).toBeGreaterThan(0);
      result.report?.detailedIssues.forEach(issue => {
        expect(issue.id).toBeDefined();
        expect(issue.name).toBeDefined();
        expect(issue.rating).toMatch(/^(good|ok|bad)$/);
        expect(issue.score).toBeGreaterThanOrEqual(0);
        expect(issue.score).toBeLessThanOrEqual(100);
      });
      
      // Check summary
      expect(result.report?.summary.totalIssues).toBe(result.report?.detailedIssues.length);
      expect(result.report?.summary.criticalIssues).toBeInstanceOf(Array);
      expect(result.report?.summary.quickWins).toBeInstanceOf(Array);
    });

    it('should categorize issues correctly', async () => {
      const result = await orchestrator.executeAuditPipeline(basicInput);
      
      expect(result.success).toBe(true);
      
      const seoIssues = result.report?.detailedIssues.filter(i => i.category === 'seo');
      const readabilityIssues = result.report?.detailedIssues.filter(i => i.category === 'readability');
      
      expect(seoIssues?.length).toBeGreaterThan(0);
      expect(readabilityIssues?.length).toBeGreaterThan(0);
      
      // Check that summary counts match
      expect(result.report?.summary.goodIssues + result.report?.summary.okIssues + result.report?.summary.badIssues)
        .toBe(result.report?.summary.totalIssues);
    });
  });
});