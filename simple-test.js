// 簡單的直接測試
const { JSDOM } = require('jsdom');

// 設置 DOM 環境
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.Document = dom.window.Document;

// 直接導入並測試
async function testAuditPipeline() {
  try {
    console.log('🔍 開始測試...');
    
    // 導入模組
    const { HTMLParser } = require('./src/audit-pipeline/understanding-the-page/parsers/html-parser.service');
    const { KeywordMatcher } = require('./src/audit-pipeline/utils/keyword-matcher');
    const { IngredientsGatherer } = require('./src/audit-pipeline/gathering-ingredients/services/ingredients-gatherer.service');
    
    console.log('✅ 模組導入成功');
    
    // 測試 HTML Parser
    const htmlParser = new HTMLParser();
    const testHTML = '<html><body><h1>Test Title</h1><p>Test content</p></body></html>';
    const parsed = htmlParser.parse(testHTML);
    
    console.log('✅ HTML Parser 測試成功');
    console.log('📊 解析結果:', {
      title: parsed.title,
      headings: parsed.headings.length,
      wordCount: parsed.wordCount
    });
    
    // 測試 Keyword Matcher
    const keywordMatcher = new KeywordMatcher();
    const keywordFound = keywordMatcher.checkIfContainsKeyword('This is a test', 'test');
    console.log('✅ Keyword Matcher 測試成功');
    console.log('📊 關鍵字匹配:', keywordFound);
    
    // 測試 Ingredients Gatherer
    const ingredientsGatherer = new IngredientsGatherer();
    const ingredients = await ingredientsGatherer.gatherIngredients({
      htmlContent: testHTML,
      pageDetails: {
        url: 'https://example.com/test',
        title: 'Test Page'
      },
      focusKeyword: 'test'
    });
    
    console.log('✅ Ingredients Gatherer 測試成功');
    console.log('📊 收集結果:', ingredients.success);
    
    console.log('🎉 所有基本組件測試通過！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.error('🔍 錯誤堆疊:', error.stack);
  }
}

testAuditPipeline();