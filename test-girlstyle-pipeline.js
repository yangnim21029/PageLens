/**
 * 測試 GirlStyle 頁面的 audit pipeline
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// 設置 DOM 環境
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.Document = dom.window.Document;

// 編譯 TypeScript 文件
const { execSync } = require('child_process');
try {
  console.log('📦 正在編譯 TypeScript 文件...');
  execSync('npx tsc --project tsconfig.pipeline.json', { stdio: 'inherit' });
  console.log('✅ TypeScript 編譯成功');
} catch (error) {
  console.error('❌ TypeScript 編譯失敗:', error.message);
  process.exit(1);
}

async function testGirlStylePipeline() {
  try {
    console.log('🔍 開始測試 GirlStyle 頁面...');
    
    // 讀取 GirlStyle 頁面內容
    const htmlContent = fs.readFileSync(path.join(__dirname, 'girlstyle_page.html'), 'utf8');
    console.log('📄 頁面內容長度:', htmlContent.length);
    
    // 導入 audit pipeline
    const { AuditPipelineOrchestrator } = require('./dist/audit-pipeline/audit-pipeline.orchestrator');
    
    const orchestrator = new AuditPipelineOrchestrator();
    
    // 設置測試輸入
    const input = {
      htmlContent: htmlContent,
      pageDetails: {
        url: 'https://girlstyle.com/tw/article/513255/',
        title: '你最愛的狐狸+兔子等了9年回來了！迪士尼《動物方城市2》11/26上映'
      },
      focusKeyword: '動物方城市2',
      synonyms: ['動物方城市', 'Zootopia', 'Zootopia 2', '動物城市', '動物方城市二']
    };
    
    console.log('🎯 測試關鍵字: "動物方城市2"');
    console.log('📋 同義詞:', input.synonyms);
    
    // 執行 audit pipeline
    const startTime = Date.now();
    const result = await orchestrator.executeAuditPipeline(input);
    const endTime = Date.now();
    
    console.log(`⏱️ 執行時間: ${endTime - startTime}ms`);
    
    if (!result.success) {
      console.error('❌ 執行失敗:', result.error);
      return;
    }
    
    console.log('✅ 執行成功！');
    console.log('\n📋 執行結果結構:');
    console.log('Result keys:', Object.keys(result));
    if (result.data) {
      console.log('Data keys:', Object.keys(result.data));
    }
    console.log('\n📊 完整結果:');
    console.log(JSON.stringify(result, null, 2));
    
    // 如果有 report 數據，顯示詳細信息
    if (result.data && result.data.report) {
      console.log('\n📊 整體分數:');
      console.log(`SEO 分數: ${result.data.report.overallScores.seo}/100`);
      console.log(`可讀性分數: ${result.data.report.overallScores.readability}/100`);
      console.log(`整體分數: ${result.data.report.overallScores.overall}/100`);
      
      console.log('\n🎯 關鍵字分析:');
      result.data.report.detailedIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.title} - ${issue.rating} (${issue.score}/100)`);
        if (issue.description) {
          console.log(`   說明: ${issue.description}`);
        }
      });
    }
    
    // 檢查關鍵字是否在重要位置
    const htmlParser = require('./dist/audit-pipeline/understanding-the-page/parsers/html-parser.service');
    const parser = new htmlParser.HTMLParser();
    const parsedContent = parser.parse(htmlContent);
    
    console.log('\n🔍 頁面內容分析:');
    console.log(`標題: ${parsedContent.title}`);
    console.log(`H1 標題數量: ${parsedContent.headings.filter(h => h.level === 1).length}`);
    console.log(`H2 標題數量: ${parsedContent.headings.filter(h => h.level === 2).length}`);
    console.log(`圖片數量: ${parsedContent.images.length}`);
    console.log(`文字總數: ${parsedContent.wordCount}`);
    
    // 檢查關鍵字在標題中的出現
    const h1Titles = parsedContent.headings.filter(h => h.level === 1);
    const keywordInH1 = h1Titles.some(h1 => h1.text.includes('動物方城市2'));
    console.log(`關鍵字在 H1 中: ${keywordInH1 ? '✅ 是' : '❌ 否'}`);
    
    // 檢查關鍵字在 meta 描述中的出現
    const metaDescription = parsedContent.metaDescription;
    const keywordInMeta = metaDescription && metaDescription.includes('動物方城市2');
    console.log(`關鍵字在 meta 描述中: ${keywordInMeta ? '✅ 是' : '❌ 否'}`);
    
    console.log('\n🎉 測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.error('🔍 錯誤堆疊:', error.stack);
  }
}

testGirlStylePipeline();