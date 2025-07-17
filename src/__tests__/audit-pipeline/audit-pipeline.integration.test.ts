/**
 * 新架構 Audit Pipeline 集成測試
 * 驗證整個管道的正確性
 */

import { AuditPipelineOrchestrator } from '@/app';
import type { AuditPipelineInput, AuditPipelineOptions } from '@/app';
import { DetailedIssue } from '@/app/presenting-the-report/types/report.types';

// 測試用的 HTML 內容
const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>SEO 測試頁面</title>
    <meta name="description" content="這是一個用於測試 SEO 審核功能的頁面描述">
</head>
<body>
    <main>
        <h1>SEO 優化測試</h1>
        <p>這是第一段內容，包含我們的焦點關鍵字 SEO 優化。這段文字提供了關於搜索引擎優化的基本信息。</p>
        
        <h2>關鍵字密度測試</h2>
        <p>在這個段落中，我們再次提到 SEO 優化，以測試關鍵字密度的計算。好的 SEO 優化需要適當的關鍵字分佈。</p>
        
        <h2>圖片測試</h2>
        <img src="test-image.jpg" alt="SEO 優化圖片" title="測試圖片">
        <img src="no-alt.jpg" title="沒有alt文字的圖片">
        
        <h2>連結測試</h2>
        <a href="/internal-page">內部連結</a>
        <a href="https://example.com">外部連結</a>
        <a href="https://google.com" rel="nofollow">外部 nofollow 連結</a>
        
        <h2>段落測試</h2>
        <p>這是一個比較長的段落，用來測試可讀性檢查。這個段落包含了足夠的文字來測試句子長度和段落結構。我們需要確保這個段落不會太長，以保持良好的可讀性。</p>
    </main>
</body>
</html>
`;

describe('AuditPipelineOrchestrator 集成測試', () => {
  let orchestrator: AuditPipelineOrchestrator;

  beforeEach(() => {
    orchestrator = new AuditPipelineOrchestrator();
  });

  describe('基本功能驗證', () => {
    test('應該能夠執行完整的審核流程', async () => {
      const input: AuditPipelineInput = {
        htmlContent: SAMPLE_HTML,
        pageDetails: {
          url: 'https://example.com/test-page',
          title: 'SEO 測試頁面',
          description: '這是一個用於測試 SEO 審核功能的頁面描述'
        },
        focusKeyword: 'SEO 優化',
        synonyms: ['搜索引擎優化', '搜尋引擎最佳化']
      };

      const result = await orchestrator.executeAuditPipeline(input);

      // 驗證基本結構
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();

      // 驗證報告結構
      const report = result.report!;
      expect(report.url).toBe(input.pageDetails.url);
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.overallScores).toBeDefined();
      expect(report.detailedIssues).toBeDefined();
      expect(report.summary).toBeDefined();
    });

    test('應該包含所有必要的評估項目', async () => {
      const input: AuditPipelineInput = {
        htmlContent: SAMPLE_HTML,
        pageDetails: {
          url: 'https://example.com/test-page',
          title: 'SEO 測試頁面'
        },
        focusKeyword: 'SEO 優化'
      };

      const result = await orchestrator.executeAuditPipeline(input);
      const report = result.report!;

      // 驗證 SEO 檢查項目
      const seoAssessments = report.detailedIssues.filter((issue: DetailedIssue) => issue.category === 'seo');
      expect(seoAssessments.length).toBeGreaterThan(0);
      
      // 驗證可讀性檢查項目
      const readabilityAssessments = report.detailedIssues.filter((issue: DetailedIssue) => issue.category === 'readability');
      expect(readabilityAssessments.length).toBeGreaterThan(0);

      // 驗證分數範圍
      expect(report.overallScores.seoScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScores.seoScore).toBeLessThanOrEqual(100);
      expect(report.overallScores.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScores.readabilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('內容選取器功能驗證', () => {
    test('應該能夠使用自定義內容選取器', async () => {
      const input: AuditPipelineInput = {
        htmlContent: SAMPLE_HTML,
        pageDetails: {
          url: 'https://example.com/test-page',
          title: 'SEO 測試頁面'
        },
        focusKeyword: 'SEO 優化'
      };

      const options: AuditPipelineOptions = {
        contentSelectors: ['main', 'article', '.content'],
        excludeSelectors: ['nav', 'footer', '.sidebar']
      };

      const result = await orchestrator.executeAuditPipeline(input, options);
      
      expect(result.success).toBe(true);
      expect(result.report).toBeDefined();
    });
  });

  describe('錯誤處理驗證', () => {
    test('應該處理空的 HTML 內容', async () => {
      const input: AuditPipelineInput = {
        htmlContent: '',
        pageDetails: {
          url: 'https://example.com/test-page',
          title: 'Empty Page'
        },
        focusKeyword: 'test'
      };

      const result = await orchestrator.executeAuditPipeline(input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Ingredients gathering failed: HTML content is required');
    });

    test('應該處理無效的 HTML 內容', async () => {
      const input: AuditPipelineInput = {
        htmlContent: '<html><body><h1>Test</h1></body></html>',
        pageDetails: {
          url: 'https://example.com/test-page',
          title: 'Invalid Page'
        },
        focusKeyword: ''
      };

      const result = await orchestrator.executeAuditPipeline(input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('性能驗證', () => {
    test('應該在合理時間內完成審核', async () => {
      const input: AuditPipelineInput = {
        htmlContent: SAMPLE_HTML,
        pageDetails: {
          url: 'https://example.com/test-page',
          title: 'SEO 測試頁面'
        },
        focusKeyword: 'SEO 優化'
      };

      const startTime = Date.now();
      const result = await orchestrator.executeAuditPipeline(input);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // 應該在 5 秒內完成
      expect(result.processingTime).toBeLessThan(5000);
    });
  });

  describe('數據完整性驗證', () => {
    test('應該正確解析 HTML 元素', async () => {
      const input: AuditPipelineInput = {
        htmlContent: SAMPLE_HTML,
        pageDetails: {
          url: 'https://example.com/test-page',
          title: 'SEO 測試頁面'
        },
        focusKeyword: 'SEO 優化'
      };

      const result = await orchestrator.executeAuditPipeline(input);
      const report = result.report!;

      // 檢查是否有 H1 相關的評估
      const h1Assessments = report.detailedIssues.filter((issue: DetailedIssue) => 
        issue.id.includes('h1') || issue.name.includes('H1')
      );
      expect(h1Assessments.length).toBeGreaterThan(0);

      // 檢查是否有圖片相關的評估
      const imageAssessments = report.detailedIssues.filter((issue: DetailedIssue) => 
        issue.id.includes('image') || issue.name.includes('Image')
      );
      expect(imageAssessments.length).toBeGreaterThan(0);

      // 檢查是否有關鍵字相關的評估
      const keywordAssessments = report.detailedIssues.filter((issue: DetailedIssue) => 
        issue.id.includes('keyword') || issue.name.includes('Keyword')
      );
      expect(keywordAssessments.length).toBeGreaterThan(0);
    });

    test('應該正確計算摘要統計', async () => {
      const input: AuditPipelineInput = {
        htmlContent: SAMPLE_HTML,
        pageDetails: {
          url: 'https://example.com/test-page',
          title: 'SEO 測試頁面'
        },
        focusKeyword: 'SEO 優化'
      };

      const result = await orchestrator.executeAuditPipeline(input);
      const report = result.report!;
      const summary = report.summary;

      // 驗證摘要數據
      expect(summary.totalIssues).toBe(report.detailedIssues.length);
      expect(summary.goodIssues + summary.okIssues + summary.badIssues).toBe(summary.totalIssues);
      expect(summary.criticalIssues).toBeDefined();
      expect(summary.quickWins).toBeDefined();
    });
  });
});