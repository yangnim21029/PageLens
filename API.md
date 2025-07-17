# PageLens API Documentation

## Base URL

Production: `https://page-lens-zeta.vercel.app`  
Local: `http://localhost:3000`

## Endpoints

### 1. Health Check

```
GET /
```

Returns: `Express on Vercel`

### 2. HTML Content Analysis

```
POST /analyze
```

Analyzes provided HTML content for SEO and readability metrics.

**Note:** The response includes ALL assessment results (passed, warnings, and failures) in `detailedIssues`.

**Request:**

```json
{
  "htmlContent": "string (required)",
  "pageDetails": {
    "url": "string (required)",
    "title": "string (required)",
    "description": "string",
    "language": "string",
    "author": "string"
  },
  "focusKeyword": "string",
  "synonyms": ["string"],
  "options": {
    "contentSelectors": ["string"], // CSS selectors for main content
    "excludeSelectors": ["string"], // CSS selectors to exclude
    "extractMainContent": "boolean", // Extract main content area only
    "assessmentConfig": {
      "enableAllSEO": "boolean",
      "enableAllReadability": "boolean",
      "enabledAssessments": ["string"]
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "report": {
    "overallScores": {
      "seoScore": 0-100,
      "readabilityScore": 0-100,
      "overallScore": 0-100,
      "seoGrade": "excellent|good|needs-improvement|poor",
      "readabilityGrade": "excellent|good|needs-improvement|poor"
    },
    "detailedIssues": [{
      "id": "string",
      "name": "string",
      "description": "string",
      "rating": "good|ok|bad",  // good = passed, ok = warning, bad = failed
      "recommendation": "string",
      "impact": "high|medium|low",
      "assessmentType": "seo|readability",
      "score": 0-100,
      "details": "object (optional)"
    }],
    "summary": {
      "totalIssues": "number",
      "criticalIssues": ["array"],
      "quickWins": ["array"]
    }
  },
  "processingTime": "milliseconds"
}
```

### 3. WordPress URL Analysis

```
POST /analyze-wp-url
```

Analyzes WordPress articles by URL (automatic content fetching).

**Note:** WordPress article titles are automatically added as H1 tags for SEO analysis.

**Request:**

```json
{
  "url": "string (required)",
  "options": {
    "contentSelectors": ["string"], // CSS selectors for main content
    "excludeSelectors": ["string"], // CSS selectors to exclude
    "extractMainContent": "boolean", // Extract main content area only
    "assessmentConfig": {
      "enableAllSEO": "boolean",
      "enableAllReadability": "boolean"
    }
  }
}
```

**Response:** Same as `/analyze` plus:

```json
{
  "wordpressData": {
    "postId": "number",
    "site": "string",
    "extractedKeywords": ["string"],
    "seoMetadata": {
      "title": "string",
      "description": "string",
      "focusKeyphrase": "string"
    }
  }
}
```

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

## Assessment Types

### SEO Assessments (11 available)

- `SINGLE_H1` - Checks for single H1 tag presence
- `MULTIPLE_H1` - Detects multiple H1 tags
- `H1_KEYWORD` - Verifies focus keyword in H1
- `ALT_ATTRIBUTE` - Checks images for alt attributes
- `INTRODUCTION_KEYWORD` - Keyword in first paragraph
- `KEYWORD_DENSITY` - Monitors keyword density (0.5-2.5%)
- `META_DESCRIPTION_KEYWORD` - Keyword in meta description
- `META_DESCRIPTION_LENGTH` - Meta description length (150-160 chars)
- `PAGE_TITLE_WIDTH` - Page title optimization
- `TITLE_KEYWORD` - Keyword in page title
- `TEXT_LENGTH` - Content length (min 300 words)

### Readability Assessments (4 available)

- `FLESCH_READING_EASE` - Reading difficulty score
- `PARAGRAPH_TOO_LONG` - Paragraph length check (max 150 words)
- `SENTENCE_LENGTH_IN_TEXT` - Sentence length (max 20 words)
- `SUBHEADING_DISTRIBUTION_TOO_LONG` - Subheading distribution

### Configuration Examples

**Run specific assessments only:**

```json
{
  "assessmentConfig": {
    "enabledAssessments": [
      "H1_KEYWORD",
      "KEYWORD_DENSITY",
      "FLESCH_READING_EASE"
    ]
  }
}
```

**Run all SEO assessments only:**

```json
{
  "assessmentConfig": {
    "enableAllSEO": true,
    "enableAllReadability": false
  }
}
```

**Run all assessments (default):**

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

**v1.1.1** (2025-07-17)

- Fixed WordPress API response validation
- Added automatic H1 tag insertion for WordPress titles

**v1.1.0**

- Added WordPress URL analysis endpoint
- Automatic keyword extraction

**v1.0.0**

- Initial release
