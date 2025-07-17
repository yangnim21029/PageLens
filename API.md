# PageLens API Documentation

簡單易用的網頁 SEO 和可讀性分析 API

## 🚀 快速開始

**API 地址：** `https://page-lens-zeta.vercel.app`

### 基本使用

```javascript
// 分析任何網頁內容
const response = await fetch('https://page-lens-zeta.vercel.app/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    htmlContent: '<html>你的網頁內容...</html>',
    pageDetails: {
      url: 'https://example.com',
      title: '網頁標題'
    },
    focusKeyword: '關鍵詞'
  })
});

const result = await response.json();
console.log('SEO 分數:', result.report.overallScores.seoScore);
```

## 📋 API 端點

### 1. 健康檢查

```http
GET /
```

回傳：`Express on Vercel`

### 2. HTML 內容分析

```http
POST /analyze
```

分析提供的 HTML 內容，回傳 SEO 和可讀性評分。

**必要參數：**

- `htmlContent` - HTML 內容字串
- `pageDetails.url` - 網頁 URL
- `pageDetails.title` - 網頁標題
- `focusKeyword` - 目標關鍵詞

**可選參數：**

- `options.contentSelectors` - CSS 選擇器（指定分析區域）
- `options.excludeSelectors` - CSS 選擇器（排除區域）
- `options.assessmentConfig.enabledAssessments` - 指定檢測項目（使用下方列表中的 ID）

**完整請求範例：**
```javascript
{
  "htmlContent": "<html>...</html>",
  "pageDetails": {
    "url": "https://example.com",
    "title": "網頁標題"
  },
  "focusKeyword": "關鍵詞",
  "options": {
    "contentSelectors": ["article", "main"],
    "excludeSelectors": [".ad", ".sidebar"],
    "assessmentConfig": {
      "enabledAssessments": [
        "h1-missing",
        "h1-keyword-missing",
        "images-missing-alt",
        "keyword-density-low"
      ]
    }
  }
}
```

**回應格式：**

```json
{
  "success": true,
  "report": {
    "overallScores": {
      "seoScore": 85, // SEO 分數 (0-100)
      "readabilityScore": 72, // 可讀性分數 (0-100)
      "overallScore": 78, // 總分 (0-100)
      "seoGrade": "good" // 等級：excellent/good/needs-improvement/poor
    },
    "detailedIssues": [
      {
        "id": "h1-keyword-missing",
        "name": "H1 標籤缺少關鍵詞",
        "rating": "ok", // good=通過, ok=警告, bad=失敗
        "recommendation": "建議在 H1 標籤中加入關鍵詞",
        "score": 60
      }
    ]
  }
}
```

### 3. WordPress 文章分析

```http
POST /analyze-wp-url
```

直接分析 WordPress 文章 URL，自動抓取內容。

**使用範例：**

```javascript
const response = await fetch(
  'https://page-lens-zeta.vercel.app/analyze-wp-url',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://holidaysmart.io/article/456984/九龍'
    })
  }
);
```

**支援網站：**

- pretty.presslogic.com
- girlstyle.com
- holidaysmart.io
- urbanlifehk.com
- poplady-mag.com
- topbeautyhk.com
- thekdaily.com
- businessfocus.io
- mamidaily.com
- thepetcity.co

## 🎯 外站分析重點

### WordPress vs 外站差異

- **WordPress 網站：** 自動處理，無需設定選擇器
- **外站：** 需要手動指定 `contentSelectors` 才能正確分析

### 為什麼要指定選擇器？

- 確保分析到正確的內容區域
- 避免分析到廣告、導航等無關內容
- 提高 SEO 分析準確性

### 外站分析範例

```javascript
// 分析外部網站
const response = await fetch('https://page-lens-zeta.vercel.app/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    htmlContent: htmlContent,
    pageDetails: {
      url: 'https://www.example.com/article',
      title: '文章標題'
    },
    focusKeyword: '關鍵詞',
    options: {
      contentSelectors: ['article', 'main', '.content'],
      excludeSelectors: ['.ad', '.sidebar']
    }
  })
});
```

### 常見網站選擇器

- **一般新聞網站：** `['article', 'main', '.content']`
- **部落格：** `['.post-content', '.entry-content']`
- **排除廣告：** `['.ad', '.advertisement', '.sidebar']`

## ⚠️ 重要提醒

### 檢測項目配置
如果使用 `enabledAssessments`，請使用檢測 ID 而非名稱：

**❌ 錯誤（使用枚舉名稱）：**
```javascript
"enabledAssessments": ["SEO_SINGLE_H1_CHECK", "SEO_H1_KEYWORD_CHECK"]
```

**✅ 正確（使用枚舉值）：**
```javascript
"enabledAssessments": ["h1-missing", "h1-keyword-missing"]
```

### 完整檢測項目列表
```javascript
// SEO 檢測項目 (使用這些 ID 值)
"h1-missing"                        // H1 標籤檢測
"multiple-h1"                       // 多重 H1 檢測
"h1-keyword-missing"                // H1 關鍵字檢測
"images-missing-alt"                // 圖片 Alt 檢測
"keyword-missing-first-paragraph"   // 首段關鍵字檢測
"keyword-density-low"               // 關鍵字密度檢測
"meta-description-needs-improvement" // Meta 描述檢測
"meta-description-missing"          // Meta 描述長度檢測
"title-needs-improvement"           // 標題優化檢測
"title-missing"                     // 標題關鍵字檢測
"content-length-short"              // 內容長度檢測

// 可讀性檢測項目 (使用這些 ID 值)
"flesch-reading-ease"               // 可讀性評分
"paragraph-length-long"             // 段落長度檢測
"sentence-length-long"              // 句子長度檢測
"subheading-distribution-poor"      // 子標題分佈檢測
```

## 🐛 錯誤處理

**成功回應：** `{ "success": true, "report": {...} }`

**失敗回應：** `{ "success": false, "error": "錯誤訊息" }`

## Supported Sites

| Domain                | Site Code |
| --------------------- | --------- |
| pretty.presslogic.com | GS_HK     |
| girlstyle.com         | GS_TW     |
| holidaysmart.io       | HS_HK     |
| urbanlifehk.com       | UL_HK     |
| poplady-mag.com       | POP_HK    |
| topbeautyhk.com       | TOP_HK    |
| thekdaily.com         | KD_HK     |
| businessfocus.io      | BF_HK     |
| mamidaily.com         | MD_HK     |
| thepetcity.co         | PET_HK    |

## Response Example

```json
{
  "success": true,
  "report": {
    "detailedIssues": [
      {
        "id": "h1-keyword-good",
        "name": "H1 Contains Focus Keyword",
        "rating": "good",
        "score": 100
      },
      {
        "id": "keyword-density-low",
        "name": "Low Keyword Density",
        "rating": "bad",
        "score": 0
      }
    ]
  }
}
```

## Content Selection

PageLens can analyze specific parts of a webpage using CSS selectors.

### Default Behavior

**For external sites (non-WordPress):**

- **No default content filtering** - Analyzes the entire page content
- **No default exclusions** - Includes all elements unless explicitly excluded
- **Requires manual selector specification** for targeted content analysis

**For WordPress sites:**

- **Automatic default selectors** - Uses predefined selectors if none specified
- **Automatic exclusions** - Removes common non-content elements
- **User selectors override defaults** - Custom selectors take precedence

**Benefits:**

- External sites: Complete content analysis without filtering
- WordPress sites: Optimized content extraction with fallback to defaults
- Consistent behavior across different site types

### Custom Content Selection

```json
{
  "options": {
    "contentSelectors": [".custom-article", "#blog-content"],
    "excludeSelectors": [".ads", ".newsletter-signup", ".social-share"],
    "extractMainContent": true
  }
}
```

**Options:**

- `contentSelectors` - Array of CSS selectors to find main content (uses first match)
- `excludeSelectors` - Array of CSS selectors to remove from analysis
- `extractMainContent` - If true, only analyzes extracted content area

### Examples

**Analyze only article body:**

```json
{
  "options": {
    "contentSelectors": [".article-body"],
    "excludeSelectors": [".author-bio", ".related-articles"]
  }
}
```

**Exclude advertisements and popups:**

```json
{
  "options": {
    "excludeSelectors": [".ad", ".popup", ".banner", "[id*='ad-']"]
  }
}
```

**ELLE.com content selection:**

```json
{
  "options": {
    "contentSelectors": [
      "article",
      "main",
      "[data-theme-key='content-header-title']",
      ".listicle-container"
    ],
    "excludeSelectors": [
      ".advertisement",
      ".sidebar",
      ".related-content",
      ".newsletter-signup"
    ]
  }
}
```

**CNN.com content selection:**

```json
{
  "options": {
    "contentSelectors": [
      ".article__content",
      ".article__header",
      ".zn-body__paragraph"
    ],
    "excludeSelectors": [".ad", ".related-content", ".video-resource"]
  }
}
```

**Medium.com content selection:**

```json
{
  "options": {
    "contentSelectors": ["article", ".postArticle-content", ".section-content"],
    "excludeSelectors": [
      ".js-postMetaInline",
      ".u-marginTop30",
      ".postArticle-readNext"
    ]
  }
}
```

## 📊 檢測項目說明

**⚠️ 重要：在 `enabledAssessments` 中使用檢測 ID（不是名稱）**

### SEO 檢測項目 (11 available)

| 檢測 ID | 檢測名稱 | 說明 |
|---------|---------|------|
| `h1-missing` | H1 標籤檢測 | 檢查是否有 H1 標籤 |
| `multiple-h1` | 多重 H1 檢測 | 檢測是否有多個 H1 標籤 |
| `h1-keyword-missing` | H1 關鍵字檢測 | 檢查 H1 是否包含關鍵字 |
| `images-missing-alt` | 圖片 Alt 檢測 | 檢查圖片是否有 alt 屬性 |
| `keyword-missing-first-paragraph` | 首段關鍵字檢測 | 檢查首段是否包含關鍵字 |
| `keyword-density-low` | 關鍵字密度檢測 | 檢查關鍵字密度 (0.5-2.5%) |
| `meta-description-needs-improvement` | Meta 描述檢測 | 檢查 meta description 中的關鍵字 |
| `meta-description-missing` | Meta 描述長度檢測 | 檢查 meta description 長度 (150-160 字) |
| `title-needs-improvement` | 標題優化檢測 | 檢查頁面標題優化 |
| `title-missing` | 標題關鍵字檢測 | 檢查標題是否包含關鍵字 |
| `content-length-short` | 內容長度檢測 | 檢查內容長度 (最少 300 字) |

### 可讀性檢測項目 (4 available)

| 檢測 ID | 檢測名稱 | 說明 |
|---------|---------|------|
| `flesch-reading-ease` | 可讀性評分 | 閱讀難度評分 |
| `paragraph-length-long` | 段落長度檢測 | 檢查段落長度 (最多 150 字) |
| `sentence-length-long` | 句子長度檢測 | 檢查句子長度 (最多 20 字) |
| `subheading-distribution-poor` | 子標題分佈檢測 | 檢查子標題分佈 |

### 配置範例

**執行特定檢測項目：**

```json
{
  "assessmentConfig": {
    "enabledAssessments": [
      "h1-keyword-missing",
      "keyword-density-low",
      "flesch-reading-ease"
    ]
  }
}
```

**只執行 SEO 檢測：**

```json
{
  "assessmentConfig": {
    "enableAllSEO": true,
    "enableAllReadability": false
  }
}
```

**執行所有檢測（預設）：**

```json
{
  "assessmentConfig": {
    "enableAll": true
  }
}
```

## Quick Start

### JavaScript

```javascript
const response = await fetch(
  'https://page-lens-zeta.vercel.app/analyze-wp-url',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://holidaysmart.io/hk/article/456984/九龍',
      options: { assessmentConfig: { enableAllSEO: true } }
    })
  }
);

const result = await response.json();
console.log('Score:', result.report.overallScores.overallScore);
```

### cURL

```bash
curl -X POST https://page-lens-zeta.vercel.app/analyze-wp-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://holidaysmart.io/hk/article/456984/九龍"}'
```

## API Testing Examples

### External Site Analysis (ELLE.com)

**Request:**

```bash
curl -X POST "https://page-lens-zeta.vercel.app/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<html>...</html>",
    "pageDetails": {
      "url": "https://www.elle.com/tw/entertainment/gossip/g64833506/zootopia-2/",
      "title": "ELLE Test Article"
    },
    "focusKeyword": "動物方城市"
  }'
```

**Response:**

```json
{
  "success": true,
  "report": {
    "overallScores": {
      "seoScore": 81,
      "readabilityScore": 61,
      "overallScore": 73,
      "seoGrade": "good",
      "readabilityGrade": "needs-improvement",
      "overallGrade": "needs-improvement"
    },
    "detailedIssues": [
      {
        "id": "h1-keyword-missing",
        "name": "H1 Missing Focus Keyword",
        "description": "H1 heading does not contain the focus keyword",
        "rating": "ok",
        "recommendation": "Consider including your focus keyword \"動物方城市\" in the H1 heading.",
        "impact": "medium",
        "assessmentType": "seo",
        "score": 60,
        "details": {
          "h1Text": "",
          "focusKeyword": "動物方城市"
        }
      },
      {
        "id": "images-alt-good",
        "name": "All Images Have Alt Text",
        "description": "All images have descriptive alt text",
        "rating": "good",
        "recommendation": "Excellent! All your images have alt text.",
        "impact": "medium",
        "assessmentType": "seo",
        "score": 100,
        "details": {
          "imageCount": 31,
          "imagesWithoutAlt": 0
        }
      },
      {
        "id": "keyword-first-paragraph",
        "name": "Keyword in First Paragraph",
        "description": "Focus keyword appears in the first paragraph",
        "rating": "good",
        "recommendation": "Great! Your focus keyword appears in the first paragraph.",
        "impact": "high",
        "assessmentType": "seo",
        "score": 100
      }
    ]
  },
  "processingTime": 2368
}
```

### Key Benefits for External Sites

- **Complete Content Analysis**: Analyzes full page content (31 images detected vs 9 with filtering)
- **H1 Detection**: Properly detects H1 tags without missing content in headers
- **Higher SEO Scores**: Comprehensive analysis leads to better scoring (81 vs lower scores with filtering)
- **Keyword Detection**: Successfully finds keywords in first paragraphs and throughout content

## Error Handling

- `400` - Invalid request data
- `500` - Server error

**Error Response:**

```json
{
  "success": false,
  "error": "error message"
}
```

## Changelog

**v1.2.0** (2025-07-17)

- Improved content selection for external sites: removed default selectors to ensure complete content analysis
- Added comprehensive external site selector examples (ELLE, CNN, Medium)
- Enhanced H1 detection for external sites without content filtering
- WordPress sites retain optimized default selectors with user override capability

**v1.1.1** (2025-07-17)

- Fixed WordPress API response validation
- Added automatic H1 tag insertion for WordPress titles

**v1.1.0**

- Added WordPress URL analysis endpoint
- Automatic keyword extraction

**v1.0.0**

- Initial release
