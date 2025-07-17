# PageLens API 文檔

## 概述
PageLens 是一個 SEO 和可讀性分析服務，可以分析網頁內容並提供詳細的優化建議。

## 基本信息
- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`

## API 端點

### 1. 分析網頁
**POST** `/api/v1/pagelens`

#### 請求參數
```json
{
  "html": "網頁的完整 HTML 內容",
  "url": "網頁的 URL",
  "focusKeyword": "要優化的關鍵字 (可選，空白時跳過關鍵字相關分析)",
  "synonyms": ["同義詞陣列 (可選)"],
  "options": {
    "assessmentConfig": {
      "enableAll": true,
      "enableAllSEO": true,
      "enableAllReadability": true,
      "enabledAssessments": ["特定檢測項目陣列"]
    }
  }
}
```

#### 請求範例
```json
{
  "html": "<html><head><title>我的網頁</title></head><body><h1>Hello World</h1><p>這是內容</p></body></html>",
  "url": "https://example.com/my-page",
  "focusKeyword": "網頁優化",
  "synonyms": ["SEO", "搜尋引擎優化"],
  "options": {
    "assessmentConfig": {
      "enableAllSEO": true
    }
  }
}
```

#### 回應格式
```json
{
  "success": true,
  "report": {
    "url": "https://example.com/my-page",
    "timestamp": "2025-07-17T05:40:31.607Z",
    "overallScores": {
      "seoScore": 58,
      "readabilityScore": 72,
      "overallScore": 64,
      "seoGrade": "needs-improvement",
      "readabilityGrade": "needs-improvement", 
      "overallGrade": "needs-improvement"
    },
    "detailedIssues": [
      {
        "id": "h1-keyword-missing",
        "name": "H1 Missing Focus Keyword",
        "description": "H1 heading does not contain the focus keyword",
        "rating": "ok",
        "recommendation": "Consider including your focus keyword in the H1 heading.",
        "impact": "medium",
        "assessmentType": "seo",
        "score": 60,
        "details": {
          "h1Text": "Hello World",
          "focusKeyword": "網頁優化"
        }
      }
    ],
    "summary": {
      "totalIssues": 10,
      "goodIssues": 2,
      "okIssues": 7,
      "badIssues": 1,
      "criticalIssues": [...],
      "quickWins": [...]
    }
  },
  "processingTime": 144
}
```

### 2. 取得可用檢測項目
**GET** `/api/v1/pagelens/assessments`

#### 回應範例
```json
{
  "success": true,
  "assessments": {
    "currentlyImplemented": [
      "h1-missing",
      "title-needs-improvement", 
      "meta-description-needs-improvement",
      "images-missing-alt",
      "keyword-density-low",
      "content-length-short",
      "flesch-reading-ease",
      "sentence-length-long",
      "paragraph-length-long"
    ],
    "seo": ["h1-missing", "title-needs-improvement", "meta-description-needs-improvement", ...],
    "readability": ["flesch-reading-ease", "sentence-length-long", "paragraph-length-long", ...]
  },
  "configurationExamples": {
    "enableAll": { "enableAll": true },
    "onlySEO": { "enableAllSEO": true },
    "onlyReadability": { "enableAllReadability": true },
    "specific": { "enabledAssessments": ["h1-missing", "images-missing-alt"] }
  }
}
```

### 3. 健康檢查
**GET** `/api/v1/pagelens/health`

### 4. 批量分析
**POST** `/api/v1/pagelens/batch`

#### 請求參數
```json
{
  "audits": [
    {
      "htmlContent": "HTML 內容",
      "pageDetails": { "url": "網頁 URL" },
      "focusKeyword": "關鍵字",
      "options": {...}
    }
  ]
}
```

## 檢測項目說明

### SEO 檢測
- `h1-missing`: 檢查是否有 H1 標題
- `title-needs-improvement`: 檢查頁面標題優化
- `meta-description-needs-improvement`: 檢查 Meta 描述
- `images-missing-alt`: 檢查圖片 Alt 文字
- `keyword-density-low`: 檢查關鍵字密度
- `content-length-short`: 檢查內容長度

### 可讀性檢測
- `flesch-reading-ease`: Flesch 可讀性評分
- `sentence-length-long`: 句子長度檢查
- `paragraph-length-long`: 段落長度檢查

## 錯誤處理

### 錯誤回應格式
```json
{
  "success": false,
  "error": "錯誤訊息",
  "timestamp": "2025-07-17T05:40:31.607Z"
}
```

### 常見錯誤
- `400`: 缺少必要參數 (html 或 url)
- `500`: 伺服器內部錯誤

## 前端整合範例

### JavaScript/TypeScript
```javascript
async function analyzePageSEO(htmlContent, pageUrl, focusKeyword = '') {
  try {
    const response = await fetch('/api/v1/pagelens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: htmlContent,
        url: pageUrl,
        focusKeyword: focusKeyword,
        options: {
          assessmentConfig: {
            enableAll: true
          }
        }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('SEO 分數:', result.report.overallScores.seoScore);
      console.log('可讀性分數:', result.report.overallScores.readabilityScore);
      console.log('問題列表:', result.report.detailedIssues);
      return result.report;
    } else {
      console.error('分析失敗:', result.error);
      return null;
    }
  } catch (error) {
    console.error('請求失敗:', error);
    return null;
  }
}

// 使用範例
const report = await analyzePageSEO(
  document.documentElement.outerHTML,
  window.location.href,
  '我的關鍵字'
);
```

### React 範例
```jsx
import { useState, useEffect } from 'react';

function SEOAnalyzer() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const analyzeCurrentPage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/pagelens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: document.documentElement.outerHTML,
          url: window.location.href,
          focusKeyword: 'SEO優化' // 留空則跳過關鍵字分析
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setReport(result.report);
      }
    } catch (error) {
      console.error('分析失敗:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={analyzeCurrentPage} disabled={loading}>
        {loading ? '分析中...' : '開始 SEO 分析'}
      </button>
      
      {report && (
        <div>
          <h2>分析結果</h2>
          <p>SEO 分數: {report.overallScores.seoScore}</p>
          <p>可讀性分數: {report.overallScores.readabilityScore}</p>
          <p>總評分: {report.overallScores.overallScore}</p>
          
          <h3>問題列表</h3>
          {report.detailedIssues.map((issue, index) => (
            <div key={index}>
              <h4>{issue.name}</h4>
              <p>{issue.description}</p>
              <p>建議: {issue.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 特色功能

### 中文支援
- 自動檢測中文內容
- 針對中文調整字數統計方式
- 中文標題和描述長度標準
- 中文句子長度閾值優化

### 語言感知
- 自動識別內容語言 (中文/英文/混合)
- 根據語言調整分析標準
- 支援中英文混合內容分析

## 空關鍵字處理

### 當沒有提供 focusKeyword 時

如果 `focusKeyword` 為空或未提供，系統會：

1. **跳過關鍵字相關分析**：
   - 不分析關鍵字密度
   - 不檢查關鍵字在首段的出現
   - 不檢查 H1 標題是否包含關鍵字

2. **保持其他分析**：
   - 仍然分析標題和描述的長度
   - 仍然進行可讀性分析
   - 仍然檢查圖片 alt 文字等技術性 SEO

3. **WordPress 整合**：
   - 如果 WordPress 頁面沒有設定 focus keyphrase，系統會自動跳過關鍵字分析
   - 不會使用預設關鍵字，確保分析結果的準確性

### 範例：無關鍵字分析

```json
{
  "html": "<html>...</html>",
  "url": "https://example.com",
  "focusKeyword": ""
}
```

此時回應將不包含：
- `keyword-density-low`
- `keyword-missing-first-paragraph` 
- `h1-keyword-missing`

但仍包含：
- `title-needs-improvement`
- `meta-description-needs-improvement`
- `content-length-good`
- 所有可讀性相關檢測

## 注意事項

1. **HTML 內容**: 請提供完整的 HTML 內容，包含 `<head>` 和 `<body>`
2. **URL 格式**: URL 需要包含協議 (http:// 或 https://)
3. **關鍵字**: 建議提供具體的關鍵字以獲得更精確的分析；留空則跳過關鍵字分析
4. **批量限制**: 批量分析最多支援 10 個頁面
5. **請求大小**: HTML 內容限制在 10MB 以內