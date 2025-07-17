# PageLens 新架構驗證指南

## 🚀 快速驗證

### 1. 執行測試套件
```bash
# 執行所有測試
npm test

# 執行特定的驗證測試
npm test -- --testPathPattern="audit-pipeline"

# 執行兼容性測試
npm test -- --testPathPattern="legacy-compatibility"
```

### 2. 手動驗證範例
```typescript
// 創建檔案: manual-validation.ts
import { AuditPipelineOrchestrator } from './src/audit-pipeline';

const orchestrator = new AuditPipelineOrchestrator();

const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>測試頁面 - SEO 優化指南</title>
    <meta name="description" content="這是一個關於 SEO 優化的測試頁面，包含各種 SEO 元素。">
</head>
<body>
    <h1>SEO 優化完整指南</h1>
    <h2>什麼是 SEO 優化？</h2>
    <p>SEO 優化是提高網站在搜索引擎中排名的重要技術。</p>
    <img src="seo-guide.jpg" alt="SEO 優化指南圖片">
    <h2>SEO 優化的重要性</h2>
    <p>良好的 SEO 優化可以帶來更多的自然流量。</p>
</body>
</html>
`;

async function validateNewArchitecture() {
    const result = await orchestrator.executeAuditPipeline({
        htmlContent: testHTML,
        pageDetails: {
            url: 'https://example.com/seo-guide',
            title: '測試頁面 - SEO 優化指南'
        },
        focusKeyword: 'SEO 優化',
        synonyms: ['搜索引擎優化', '搜尋引擎最佳化']
    });

    console.log('驗證結果:', result.success);
    console.log('處理時間:', result.processingTime, 'ms');
    console.log('SEO 分數:', result.report?.overallScores.seoScore);
    console.log('可讀性分數:', result.report?.overallScores.readabilityScore);
    console.log('問題數量:', result.report?.summary.totalIssues);
}

validateNewArchitecture();
```

## 🔍 驗證檢查清單

### ✅ 基本功能驗證

#### 1. Gathering Ingredients (收集原料)
- [ ] 能接收 HTML 內容
- [ ] 能接收頁面詳細資訊
- [ ] 能接收焦點關鍵字
- [ ] 能接收同義詞列表
- [ ] 能驗證輸入數據完整性

#### 2. Understanding the Page (理解頁面)
- [ ] 能解析 HTML 結構
- [ ] 能提取標題和 meta 資訊
- [ ] 能識別所有標題層級 (H1-H6)
- [ ] 能提取圖片及其 alt 文字
- [ ] 能區分內部和外部連結
- [ ] 能提取純文字內容
- [ ] 能計算字數統計
- [ ] 能使用自定義內容選取器

#### 3. Running the Tests (執行測試)
**SEO 檢查:**
- [ ] H1 標籤驗證
- [ ] 圖片 alt 文字檢查
- [ ] 關鍵字優化檢查
- [ ] Meta 元素檢查
- [ ] 內容長度檢查

**可讀性檢查:**
- [ ] 句子長度分析
- [ ] Flesch 閱讀難度計算
- [ ] 段落長度檢查
- [ ] 副標題分佈檢查

#### 4. Presenting the Report (呈現報告)
- [ ] 總體分數計算
- [ ] 詳細問題列表
- [ ] 評級系統 (Good/OK/Bad)
- [ ] 改進建議
- [ ] 摘要統計

### ✅ 舊功能兼容性驗證

#### HTML Parser 兼容性
- [ ] `parseH1Elements()` 功能正常
- [ ] `parseH2Elements()` 功能正常
- [ ] `parseImageElements()` 功能正常
- [ ] `parseInternalLinks()` 功能正常
- [ ] `parseExternalLinks()` 功能正常
- [ ] `parseSemanticContent()` 功能正常
- [ ] `findKeywordInElements()` 功能正常

#### Keyword Matcher 兼容性
- [ ] `checkIfContainsKeyword()` 功能正常
- [ ] `calculateKeywordDensity()` 功能正常
- [ ] `findKeywordPositions()` 功能正常
- [ ] `generateKeywordVariants()` 功能正常
- [ ] `checkMultipleKeywords()` 功能正常

#### SEO Auditor 兼容性
- [ ] 標題長度檢查 (30-60 字符)
- [ ] 描述長度檢查 (150-160 字符)
- [ ] H1 標籤檢查
- [ ] 圖片 alt 文字檢查
- [ ] 關鍵字密度檢查 (0.5-2.5%)
- [ ] 內容最小長度檢查 (300 字)

## 🔧 性能驗證

### 1. 執行時間測試
```bash
# 運行性能測試
npm run test -- --testPathPattern="performance"
```

**預期結果:**
- [ ] 單次審核 < 5 秒
- [ ] 內存使用合理
- [ ] 無明顯內存洩漏

### 2. 負載測試
```typescript
// 批量測試範例
const testBatch = async () => {
    const promises = [];
    for (let i = 0; i < 10; i++) {
        promises.push(orchestrator.executeAuditPipeline(testInput));
    }
    const results = await Promise.all(promises);
    console.log('批量處理成功率:', results.filter(r => r.success).length / results.length);
};
```

## 🛠️ 故障排除

### 常見問題

#### 1. 測試失敗
```bash
# 檢查依賴
npm install

# 清除快取
npm run clean && npm run build

# 重新執行測試
npm test
```

#### 2. 性能問題
- 檢查 HTML 內容大小
- 驗證關鍵字長度
- 確認內容選取器效率

#### 3. 記憶體問題
- 監控 HTML 解析過程
- 檢查是否有循環引用
- 驗證大型文檔處理

## 📊 驗證報告範例

### 成功的驗證結果應該包含:

```json
{
  "success": true,
  "processingTime": 1234,
  "report": {
    "url": "https://example.com/test",
    "overallScores": {
      "seoScore": 85,
      "readabilityScore": 78,
      "overallScore": 82
    },
    "summary": {
      "totalIssues": 12,
      "goodIssues": 8,
      "okIssues": 3,
      "badIssues": 1
    },
    "detailedIssues": [
      {
        "id": "h1-keyword-good",
        "name": "H1 Contains Focus Keyword",
        "rating": "good",
        "score": 100,
        "recommendation": "Great! Your H1 contains the focus keyword."
      }
    ]
  }
}
```

## 🎯 驗證通過標準

### 必須通過的驗證項目:
1. ✅ 所有單元測試通過
2. ✅ 所有集成測試通過
3. ✅ 所有舊功能兼容性測試通過
4. ✅ 處理時間在可接受範圍內
5. ✅ 內存使用正常
6. ✅ 錯誤處理正確
7. ✅ 報告格式正確

### 可選的驗證項目:
- [ ] 多語言支援測試
- [ ] 大型文檔處理測試
- [ ] 併發處理測試
- [ ] 邊界條件測試

## 🚀 部署前最終檢查

```bash
# 1. 執行完整測試套件
npm test

# 2. 執行 TypeScript 類型檢查
npm run typecheck

# 3. 執行 ESLint 檢查
npm run lint

# 4. 執行構建
npm run build

# 5. 手動驗證關鍵功能
node manual-validation.js
```

---

**注意:** 這個驗證指南確保新架構能夠完全替代舊架構，並提供更好的性能和可維護性。