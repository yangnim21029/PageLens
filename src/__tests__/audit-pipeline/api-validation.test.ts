/**
 * API 驗證測試
 * 驗證新架構的 API 接口正確性
 */

import { AuditPipelineOrchestrator } from '@/app';
import type { 
  AuditPipelineInput, 
  AuditPipelineOptions, 
  AuditPipelineResult 
} from '@/app';

describe('API 驗證測試', () => {
  let orchestrator: AuditPipelineOrchestrator;

  beforeEach(() => {
    orchestrator = new AuditPipelineOrchestrator();
  });

  describe('輸入驗證', () => {
    test('應該接受最小必要輸入', async () => {
      const input: AuditPipelineInput = {
        htmlContent: '<html><body><h1>Test</h1><p>This is a test paragraph to make the content long enough to pass the validation.</p></body></html>',
        pageDetails: {
          url: 'https://example.com/test',
          title: 'Test Page'
        },
        focusKeyword: 'test'
      };

      const result = await orchestrator.executeAuditPipeline(input);
      expect(result.success).toBe(true);
    });

    test('應該接受完整輸入', async () => {
      const input: AuditPipelineInput = {
        htmlContent: '<html><head><title>Test</title></head><body><h1>Test</h1><p>This is a test paragraph to make the content long enough to pass the validation.</p></body></html>',
        pageDetails: {
          url: 'https://example.com/test',
          title: 'Test Page',
          description: 'Test description',
          language: 'zh-TW',
          author: 'Test Author',
          category: 'Test Category',
          tags: ['test', 'seo']
        },
        focusKeyword: 'test',
        synonyms: ['testing', 'examination']
      };

      const options: AuditPipelineOptions = {
        contentSelectors: ['main', 'article'],
        excludeSelectors: ['nav', 'footer'],
        baseUrl: 'https://example.com'
      };

      const result = await orchestrator.executeAuditPipeline(input, options);
      expect(result.success).toBe(true);
    });
  });

  describe('輸出驗證', () => {
    test('成功結果應該包含所有必要字段', async () => {
      const input: AuditPipelineInput = {
        htmlContent: '<html><body><h1>Test</h1><p>This is a test paragraph to make the content long enough to pass the validation.</p></body></html>',
        pageDetails: {
          url: 'https://example.com/test',
          title: 'Test Page'
        },
        focusKeyword: 'test'
      };

      const result: AuditPipelineResult = await orchestrator.executeAuditPipeline(input);

      // 驗證基本結構
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('processingTime');
      expect(result.success).toBe(true);
      expect(typeof result.processingTime).toBe('number');

      // 驗證報告結構
      expect(result).toHaveProperty('report');
      expect(result.report).toHaveProperty('url');
      expect(result.report).toHaveProperty('timestamp');
      expect(result.report).toHaveProperty('overallScores');
      expect(result.report).toHaveProperty('detailedIssues');
      expect(result.report).toHaveProperty('summary');

      // 驗證分數結構
      expect(result.report!.overallScores).toHaveProperty('seoScore');
      expect(result.report!.overallScores).toHaveProperty('readabilityScore');
      expect(result.report!.overallScores).toHaveProperty('overallScore');
      expect(result.report!.overallScores).toHaveProperty('seoGrade');
      expect(result.report!.overallScores).toHaveProperty('readabilityGrade');
      expect(result.report!.overallScores).toHaveProperty('overallGrade');

      // 驗證摘要結構
      expect(result.report!.summary).toHaveProperty('totalIssues');
      expect(result.report!.summary).toHaveProperty('goodIssues');
      expect(result.report!.summary).toHaveProperty('okIssues');
      expect(result.report!.summary).toHaveProperty('badIssues');
      expect(result.report!.summary).toHaveProperty('criticalIssues');
      expect(result.report!.summary).toHaveProperty('quickWins');
    });

    test('失敗結果應該包含錯誤信息', async () => {
      const input: AuditPipelineInput = {
        htmlContent: '',
        pageDetails: {
          url: 'https://example.com/test',
          title: 'Test Page'
        },
        focusKeyword: 'test'
      };

      const result: AuditPipelineResult = await orchestrator.executeAuditPipeline(input);

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('processingTime');
      expect(typeof result.error).toBe('string');
      expect(result.error!.length).toBeGreaterThan(0);
    });
  });

  describe('類型安全驗證', () => {
    test('應該正確處理 TypeScript 類型', () => {
      // 這個測試主要是編譯時檢查，如果能編譯通過就表示類型正確
      const input: AuditPipelineInput = {
        htmlContent: '<html><body><h1>Test</h1><p>This is a test paragraph to make the content long enough to pass the validation.</p></body></html>',
        pageDetails: {
          url: 'https://example.com/test',
          title: 'Test Page'
        },
        focusKeyword: 'test'
      };

      const options: AuditPipelineOptions = {
        contentSelectors: ['main'],
        excludeSelectors: ['nav']
      };

      // 如果這些賦值沒有 TypeScript 錯誤，測試就通過
      expect(typeof input.htmlContent).toBe('string');
      expect(typeof input.pageDetails.url).toBe('string');
      expect(typeof input.focusKeyword).toBe('string');
      expect(Array.isArray(options.contentSelectors)).toBe(true);
    });
  });

  describe('邊界條件驗證', () => {
    test('應該處理極小的 HTML 內容', async () => {
      const input: AuditPipelineInput = {
        htmlContent: '<html><body><h1>A</h1><p>This is a test paragraph to make the content long enough to pass the validation.</p></body></html>',
        pageDetails: {
          url: 'https://example.com/test',
          title: 'A'
        },
        focusKeyword: 'A'
      };

      const result = await orchestrator.executeAuditPipeline(input);
      expect(result.success).toBe(true);
    });

    test('應該處理很長的關鍵字', async () => {
      const longKeyword = 'A'.repeat(100);
      const input: AuditPipelineInput = {
        htmlContent: `<html><body><h1>${longKeyword}</h1></body></html>`,
        pageDetails: {
          url: 'https://example.com/test',
          title: 'Test Page'
        },
        focusKeyword: longKeyword
      };

      const result = await orchestrator.executeAuditPipeline(input);
      expect(result.success).toBe(true);
    });

    test('應該處理多個同義詞', async () => {
      const synonyms = Array.from({length: 10}, (_, i) => `synonym${i}`);
      const input: AuditPipelineInput = {
        htmlContent: '<html><body><h1>Test</h1><p>This is a test paragraph to make the content long enough to pass the validation.</p></body></html>',
        pageDetails: {
          url: 'https://example.com/test',
          title: 'Test Page'
        },
        focusKeyword: 'test',
        synonyms
      };

      const result = await orchestrator.executeAuditPipeline(input);
      expect(result.success).toBe(true);
    });
  });

  describe('工具方法驗證', () => {
    test('getProcessingStats 應該返回正確的統計信息', () => {
      const stats = orchestrator.getProcessingStats();
      
      expect(stats).toHaveProperty('pipelineSteps');
      expect(stats).toHaveProperty('supportedChecks');
      expect(Array.isArray(stats.pipelineSteps)).toBe(true);
      expect(stats.pipelineSteps).toHaveLength(4);
      expect(stats.supportedChecks).toHaveProperty('seo');
      expect(stats.supportedChecks).toHaveProperty('readability');
    });
  });
});