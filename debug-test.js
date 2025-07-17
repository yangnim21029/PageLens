/**
 * 調試測試腳本
 */

const { AuditPipelineOrchestrator } = require('./dist/app/audit-pipeline.orchestrator');

async function debugTest() {
  try {
    console.log('🔍 開始調試新架構...');
    
    const orchestrator = new AuditPipelineOrchestrator();
    
    const input = {
      htmlContent: `
        <html>
          <head>
            <title>Test Page with Keyword</title>
            <meta name="description" content="Test page description with keyword for testing">
          </head>
          <body>
            <h1>Main Title with Test Keyword</h1>
            <h2>Section About Test</h2>
            <p>This is the first paragraph containing the test keyword. This paragraph provides detailed information about the test topic and contains enough content for analysis.</p>
            <p>This is additional content that helps with content length and provides more context about the test keyword usage in SEO optimization.</p>
            <p>Another paragraph with test keyword to ensure we have sufficient content for the analysis to pass the minimum content requirements.</p>
            <img src="test1.jpg" alt="Test image with keyword">
            <img src="test2.jpg" alt="Another test image">
            <a href="https://example.com">External link about test</a>
            <h3>More Information About Test</h3>
            <p>Additional paragraph with more content to ensure adequate word count for SEO assessment and testing purposes.</p>
            <p>Final paragraph to complete the test content with sufficient length and keyword density for proper analysis.</p>
          </body>
        </html>
      `,
      pageDetails: {
        url: 'https://example.com/test',
        title: 'Test Page'
      },
      focusKeyword: 'test'
    };
    
    console.log('📋 輸入數據:', JSON.stringify(input, null, 2));
    
    const result = await orchestrator.executeAuditPipeline(input);
    
    console.log('📊 執行結果:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error('❌ 執行失敗:', result.error);
    } else {
      console.log('✅ 執行成功');
    }
    
  } catch (error) {
    console.error('💥 發生錯誤:', error);
  }
}

debugTest();