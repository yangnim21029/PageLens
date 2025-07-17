/**
 * 快速驗證腳本
 * 用於快速驗證新架構的核心功能
 */

const { AuditPipelineOrchestrator } = require('./dist/audit-pipeline');

// 測試用的 HTML 內容
const testHTML = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <title>SEO 優化測試頁面 - 完整指南</title>
    <meta name="description" content="這是一個完整的 SEO 優化測試頁面，包含各種 SEO 元素用於測試審核功能。">
</head>
<body>
    <main>
        <h1>SEO 優化完整指南</h1>
        
        <h2>什麼是 SEO 優化？</h2>
        <p>SEO 優化是搜索引擎優化的簡稱，是提高網站在搜索引擎中排名的重要技術。良好的 SEO 優化可以帶來更多的自然流量。</p>
        
        <h2>SEO 優化的重要性</h2>
        <p>在當今的數位時代，SEO 優化已成為網站成功的關鍵因素。通過有效的 SEO 優化策略，網站可以獲得更好的搜索引擎排名。</p>
        
        <h2>圖片優化</h2>
        <img src="seo-guide.jpg" alt="SEO 優化指南圖片" title="SEO 優化">
        <img src="optimization-tips.jpg" alt="SEO 優化技巧">
        <img src="no-alt-image.jpg" title="沒有alt文字的圖片">
        
        <h2>內部連結策略</h2>
        <p>有效的內部連結可以提升 SEO 優化效果。</p>
        <a href="/seo-tips">SEO 優化技巧</a>
        <a href="/keyword-research">關鍵字研究</a>
        
        <h2>外部連結</h2>
        <a href="https://developers.google.com/search/docs">Google 搜索文檔</a>
        <a href="https://moz.com/beginners-guide-to-seo" rel="nofollow">Moz SEO 指南</a>
        
        <h2>結論</h2>
        <p>SEO 優化是一個持續的過程，需要不斷地學習和改進。通過遵循最佳實踐，您可以提高網站的搜索引擎可見性。</p>
    </main>
</body>
</html>
`;

async function runQuickValidation() {
    console.log('🚀 開始快速驗證新架構...\n');
    
    try {
        const orchestrator = new AuditPipelineOrchestrator();
        
        // 測試基本功能
        console.log('📋 測試 1: 基本審核功能');
        const startTime = Date.now();
        
        const result = await orchestrator.executeAuditPipeline({
            htmlContent: testHTML,
            pageDetails: {
                url: 'https://example.com/seo-guide',
                title: 'SEO 優化測試頁面 - 完整指南',
                description: '這是一個完整的 SEO 優化測試頁面，包含各種 SEO 元素用於測試審核功能。'
            },
            focusKeyword: 'SEO 優化',
            synonyms: ['搜索引擎優化', '搜尋引擎最佳化']
        });
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        // 驗證結果
        if (result.success) {
            console.log('✅ 基本功能測試通過');
            console.log(`⏱️  處理時間: ${processingTime}ms`);
            console.log(`📊 SEO 分數: ${result.report.overallScores.seoScore}/100`);
            console.log(`📖 可讀性分數: ${result.report.overallScores.readabilityScore}/100`);
            console.log(`🎯 總分: ${result.report.overallScores.overallScore}/100`);
            console.log(`🔍 檢查項目: ${result.report.summary.totalIssues} 個`);
        } else {
            console.log('❌ 基本功能測試失敗:', result.error);
            return;
        }
        
        // 測試內容選取器
        console.log('\n📋 測試 2: 內容選取器功能');
        const selectorResult = await orchestrator.executeAuditPipeline({
            htmlContent: testHTML,
            pageDetails: {
                url: 'https://example.com/seo-guide',
                title: 'SEO 優化測試頁面 - 完整指南'
            },
            focusKeyword: 'SEO 優化'
        }, {
            contentSelectors: ['main', 'article', '.content'],
            excludeSelectors: ['nav', 'footer', '.sidebar']
        });
        
        if (selectorResult.success) {
            console.log('✅ 內容選取器測試通過');
        } else {
            console.log('❌ 內容選取器測試失敗:', selectorResult.error);
        }
        
        // 測試錯誤處理
        console.log('\n📋 測試 3: 錯誤處理');
        const errorResult = await orchestrator.executeAuditPipeline({
            htmlContent: '',
            pageDetails: {
                url: 'https://example.com/empty',
                title: 'Empty Page'
            },
            focusKeyword: 'test'
        });
        
        if (!errorResult.success) {
            console.log('✅ 錯誤處理測試通過');
            console.log(`🚨 錯誤訊息: ${errorResult.error}`);
        } else {
            console.log('❌ 錯誤處理測試失敗: 應該返回錯誤');
        }
        
        // 詳細分析
        console.log('\n📊 詳細分析:');
        const report = result.report;
        
        console.log('\n🔍 SEO 檢查結果:');
        const seoIssues = report.detailedIssues.filter(issue => issue.category === 'seo');
        seoIssues.forEach(issue => {
            const status = issue.rating === 'good' ? '✅' : issue.rating === 'ok' ? '⚠️' : '❌';
            console.log(`${status} ${issue.name}: ${issue.score}/100`);
        });
        
        console.log('\n📖 可讀性檢查結果:');
        const readabilityIssues = report.detailedIssues.filter(issue => issue.category === 'readability');
        readabilityIssues.forEach(issue => {
            const status = issue.rating === 'good' ? '✅' : issue.rating === 'ok' ? '⚠️' : '❌';
            console.log(`${status} ${issue.name}: ${issue.score}/100`);
        });
        
        // 統計摘要
        console.log('\n📈 統計摘要:');
        console.log(`🎯 總檢查項目: ${report.summary.totalIssues}`);
        console.log(`✅ 良好項目: ${report.summary.goodIssues}`);
        console.log(`⚠️  需改進項目: ${report.summary.okIssues}`);
        console.log(`❌ 問題項目: ${report.summary.badIssues}`);
        console.log(`🚨 關鍵問題: ${report.summary.criticalIssues.length}`);
        console.log(`⚡ 快速修復: ${report.summary.quickWins.length}`);
        
        // 性能驗證
        console.log('\n⚡ 性能驗證:');
        if (processingTime < 5000) {
            console.log('✅ 處理時間符合要求 (< 5 秒)');
        } else {
            console.log('⚠️  處理時間可能需要優化');
        }
        
        console.log('\n🎉 快速驗證完成！');
        console.log('\n📝 建議下一步:');
        console.log('1. 執行完整測試套件: npm test');
        console.log('2. 執行類型檢查: npm run typecheck');
        console.log('3. 執行 ESLint 檢查: npm run lint');
        console.log('4. 查看完整驗證指南: validation-guide.md');
        
    } catch (error) {
        console.error('❌ 驗證過程中發生錯誤:', error.message);
        console.error('🔍 錯誤詳情:', error.stack);
    }
}

// 執行驗證
runQuickValidation();