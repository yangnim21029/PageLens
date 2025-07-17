/**
 * 舊架構功能兼容性測試
 * 驗證所有舊功能在新架構中都有對應實現
 */

import { HTMLParser } from '@/app/understanding-the-page/parsers/html-parser.service';
import { KeywordMatcher } from '@/app/utils/keyword-matcher';
import { SEOAssessor } from '@/app/running-the-tests/assessments/seo-checks/seo-assessor.service';
import { ReadabilityAssessor } from '@/app/running-the-tests/assessments/readability-checks/readability-assessor.service';

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>測試頁面標題</title>
    <meta name="description" content="這是測試頁面的描述">
</head>
<body>
    <h1>主要標題包含SEO優化</h1>
    <h2>副標題一</h2>
    <h2>副標題二包含SEO優化</h2>
    <p>第一段內容包含SEO優化關鍵字。</p>
    <p>第二段內容也包含SEO優化。</p>
    <img src="image1.jpg" alt="SEO優化圖片">
    <img src="image2.jpg" alt="">
    <img src="image3.jpg">
    <a href="/internal">內部連結</a>
    <a href="https://external.com">外部連結</a>
</body>
</html>
`;

describe('舊架構功能兼容性測試', () => {
  let htmlParser: HTMLParser;
  let keywordMatcher: KeywordMatcher;
  let seoAssessor: SEOAssessor;
  let readabilityAssessor: ReadabilityAssessor;

  beforeEach(() => {
    htmlParser = new HTMLParser();
    keywordMatcher = new KeywordMatcher();
    seoAssessor = new SEOAssessor();
    readabilityAssessor = new ReadabilityAssessor();
  });

  describe('HTML Parser 功能對應', () => {
    test('parseH1Elements() 功能應該正常工作', () => {
      const h1Elements = htmlParser.parseH1Elements(SAMPLE_HTML);
      
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0].text).toBe('主要標題包含SEO優化');
    });

    test('parseH2Elements() 功能應該正常工作', () => {
      const h2Elements = htmlParser.parseH2Elements(SAMPLE_HTML);
      
      expect(h2Elements).toHaveLength(2);
      expect(h2Elements[0].text).toBe('副標題一');
      expect(h2Elements[1].text).toBe('副標題二包含SEO優化');
    });

    test('parseImageElements() 功能應該正常工作', () => {
      const imageElements = htmlParser.parseImageElements(SAMPLE_HTML);
      
      expect(imageElements).toHaveLength(3);
      expect(imageElements[0].src).toBe('image1.jpg');
      expect(imageElements[0].text).toBe('SEO優化圖片');
      expect(imageElements[1].text).toBe('');
      expect(imageElements[2].text).toBe('');
    });

    test('parseInternalLinks() 功能應該正常工作', () => {
      const internalLinks = htmlParser.parseInternalLinks(SAMPLE_HTML);
      
      expect(internalLinks).toHaveLength(1);
      expect(internalLinks[0].href).toBe('/internal');
      expect(internalLinks[0].text).toBe('內部連結');
    });

    test('parseExternalLinks() 功能應該正常工作', () => {
      const externalLinks = htmlParser.parseExternalLinks(SAMPLE_HTML);
      
      expect(externalLinks).toHaveLength(1);
      expect(externalLinks[0].href).toBe('https://external.com');
      expect(externalLinks[0].text).toBe('外部連結');
    });

    test('parseSemanticContent() 功能應該正常工作', () => {
      const semanticContent = htmlParser.parseSemanticContent(SAMPLE_HTML);
      
      expect(semanticContent.text).toContain('主要標題包含SEO優化');
      expect(semanticContent.text).toContain('第一段內容包含SEO優化關鍵字');
    });

    test('findKeywordInElements() 功能應該正常工作', () => {
      const keywordAnalysis = htmlParser.findKeywordInElements(SAMPLE_HTML, 'SEO優化');
      
      expect(keywordAnalysis.inTitle).toBe(true);
      expect(keywordAnalysis.inH2).toBe(true);
      expect(keywordAnalysis.inImages).toBe(true);
      expect(keywordAnalysis.inLinks).toBe(false);
      expect(keywordAnalysis.inContent).toBe(true);
    });
  });

  describe('Keyword Matcher 功能對應', () => {
    test('checkIfContainsKeyword() 功能應該正常工作', () => {
      const text = '這是一段包含SEO優化的測試文本';
      const keyword = 'SEO優化';
      
      const result = keywordMatcher.checkIfContainsKeyword(text, keyword);
      expect(result).toBe(true);
    });

    test('calculateKeywordDensity() 功能應該正常工作', () => {
      const text = 'SEO優化 是重要的 SEO優化 技術';
      const keyword = 'SEO優化';
      
      const density = keywordMatcher.calculateKeywordDensity(text, keyword);
      expect(density).toBeGreaterThan(0);
      expect(density).toBeLessThanOrEqual(100);
    });

    test('findKeywordPositions() 功能應該正常工作', () => {
      const text = 'SEO優化是重要的SEO優化技術';
      const keyword = 'SEO優化';
      
      const positions = keywordMatcher.findKeywordPositions(text, keyword);
      expect(positions).toHaveLength(2);
      expect(positions[0].start).toBe(0);
      expect(positions[1].start).toBeGreaterThan(0);
    });

    test('generateKeywordVariants() 功能應該正常工作', () => {
      const keyword = 'SEO優化';
      const variants = keywordMatcher.generateKeywordVariants(keyword);
      
      expect(variants).toContain(keyword);
    });

    test('checkMultipleKeywords() 功能應該正常工作', () => {
      const text = '這是關於SEO優化和搜索引擎優化的文章';
      const keywords = ['SEO優化', '搜索引擎優化', '網站優化'];
      
      const results = keywordMatcher.checkMultipleKeywords(text, keywords);
      expect(results).toHaveLength(3);
      expect(results[0].found).toBe(true);
      expect(results[1].found).toBe(true);
      expect(results[2].found).toBe(false);
    });
  });

  describe('SEO Assessor 功能對應', () => {
    test('應該能夠執行完整的 SEO 檢查', async () => {
      const parsedContent = htmlParser.parse(SAMPLE_HTML);
      const ingredients = {
        htmlContent: SAMPLE_HTML,
        pageDetails: {
          url: 'https://example.com/test',
          title: '測試頁面標題'
        },
        focusKeyword: 'SEO優化',
        synonyms: ['搜索引擎優化']
      };

      const assessments = await seoAssessor.runSEOChecks(parsedContent, ingredients);
      
      expect(assessments.length).toBeGreaterThan(0);
      
      // 驗證包含 H1 檢查
      const h1Assessment = assessments.find(a => a.id.includes('h1'));
      expect(h1Assessment).toBeDefined();
      
      // 驗證包含圖片檢查
      const imageAssessment = assessments.find(a => a.id.includes('image'));
      expect(imageAssessment).toBeDefined();
      
      // 驗證包含關鍵字檢查
      const keywordAssessment = assessments.find(a => a.id.includes('keyword'));
      expect(keywordAssessment).toBeDefined();
    });
  });

  describe('Readability Assessor 功能對應', () => {
    test('應該能夠執行完整的可讀性檢查', async () => {
      const parsedContent = htmlParser.parse(SAMPLE_HTML);
      
      const assessments = await readabilityAssessor.runReadabilityChecks(parsedContent);
      
      expect(assessments.length).toBeGreaterThan(0);
      
      // 驗證包含句子長度檢查
      const sentenceAssessment = assessments.find(a => a.id.includes('sentence'));
      expect(sentenceAssessment).toBeDefined();
      
      // 驗證包含 Flesch 閱讀難度檢查
      const fleschAssessment = assessments.find(a => a.id.includes('flesch'));
      expect(fleschAssessment).toBeDefined();
    });
  });

  describe('數據結構兼容性', () => {
    test('新架構應該支援舊架構的數據格式', () => {
      const parsedContent = htmlParser.parse(SAMPLE_HTML);
      
      // 驗證新架構產生的數據結構
      expect(parsedContent.title).toBeDefined();
      expect(parsedContent.metaDescription).toBeDefined();
      expect(parsedContent.headings).toBeDefined();
      expect(parsedContent.images).toBeDefined();
      expect(parsedContent.links).toBeDefined();
      expect(parsedContent.textContent).toBeDefined();
      expect(parsedContent.wordCount).toBeDefined();
      expect(parsedContent.paragraphs).toBeDefined();
      
      // 驗證數據類型
      expect(Array.isArray(parsedContent.headings)).toBe(true);
      expect(Array.isArray(parsedContent.images)).toBe(true);
      expect(Array.isArray(parsedContent.links)).toBe(true);
      expect(Array.isArray(parsedContent.paragraphs)).toBe(true);
      expect(typeof parsedContent.wordCount).toBe('number');
    });
  });

  describe('舊架構常數和規則兼容性', () => {
    test('應該保持相同的 SEO 評估標準', async () => {
      const parsedContent = htmlParser.parse(`
        <html>
          <head><title>短標題</title></head>
          <body><h1>測試</h1><p>短內容</p></body>
        </html>
      `);
      
      const ingredients = {
        htmlContent: SAMPLE_HTML,
        pageDetails: {
          url: 'https://example.com/test',
          title: '短標題'
        },
        focusKeyword: 'test',
        synonyms: []
      };

      const assessments = await seoAssessor.runSEOChecks(parsedContent, ingredients);
      
      // 驗證標題長度檢查
      const titleAssessment = assessments.find(a => a.id.includes('title'));
      expect(titleAssessment).toBeDefined();
      
      // 驗證內容長度檢查
      const contentAssessment = assessments.find(a => a.id.includes('content-length'));
      expect(contentAssessment).toBeDefined();
    });
  });
});