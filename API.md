# PageLens API Documentation

PageLens is a web page analysis tool that evaluates SEO and readability metrics through a comprehensive audit pipeline.

## Features

✅ **SEO Analysis**: H1 tags, meta descriptions, keyword optimization, alt text validation  
✅ **Readability Analysis**: Sentence length, paragraph structure, Flesch reading ease  
✅ **WordPress Integration**: Direct analysis of WordPress/PressLogic articles by URL  
✅ **Automatic Keyword Extraction**: Integrated with WordPress SEO data  
✅ **Comprehensive Reporting**: Detailed scores, grades, and actionable recommendations  
✅ **Multi-language Support**: Optimized for English and Chinese content

## Base URL

```
https://page-lens-zeta.vercel.app
```

For local development:

```
http://localhost:3000
```

## Endpoints

### Health Check

#### GET /

Returns a simple health check response.

**Response:**

```
Express on Vercel
```

### Page Analysis

#### POST /analyze

Analyzes a web page for SEO and readability metrics using provided HTML content.

#### POST /analyze-wp-url

🚀 **NEW**: Analyzes a WordPress/PressLogic article by URL using integrated WordPress API. Automatically fetches content, SEO data, and keywords.

**Request Body:**

```json
{
  "htmlContent": "string",
  "pageDetails": {
    "url": "string",
    "title": "string",
    "description": "string (optional)",
    "language": "string (optional)",
    "publishedDate": "ISO 8601 date (optional)",
    "modifiedDate": "ISO 8601 date (optional)",
    "author": "string (optional)",
    "category": "string (optional)",
    "tags": ["string"] "(optional)"
  },
  "focusKeyword": "string",
  "synonyms": ["string"] "(optional)",
  "options": {
    "contentSelectors": ["string"] "(optional)",
    "excludeSelectors": ["string"] "(optional)",
    "extractMainContent": "boolean (optional)",
    "baseUrl": "string (optional)",
    "assessmentConfig": {
      "enableAll": "boolean (optional)",
      "enableAllSEO": "boolean (optional)",
      "enableAllReadability": "boolean (optional)",
      "enabledAssessments": ["string"] "(optional)"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "report": {
    "url": "string",
    "timestamp": "ISO 8601 date",
    "overallScores": {
      "seoScore": "number (0-100)",
      "readabilityScore": "number (0-100)",
      "overallScore": "number (0-100)",
      "seoGrade": "excellent|good|needs-improvement|poor",
      "readabilityGrade": "excellent|good|needs-improvement|poor",
      "overallGrade": "excellent|good|needs-improvement|poor"
    },
    "detailedIssues": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "rating": "good|ok|bad",
        "recommendation": "string",
        "impact": "high|medium|low",
        "assessmentType": "seo|readability",
        "score": "number (0-100)",
        "details": "object (optional)"
      }
    ],
    "summary": {
      "totalIssues": "number",
      "goodIssues": "number",
      "okIssues": "number",
      "badIssues": "number",
      "criticalIssues": [
        {
          "id": "string",
          "name": "string",
          "impact": "high"
        }
      ],
      "quickWins": [
        {
          "id": "string",
          "name": "string",
          "rating": "ok"
        }
      ]
    }
  },
  "processingTime": "number (milliseconds)"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "string",
  "processingTime": "number (milliseconds)"
}
```

### WordPress URL Analysis

#### POST /analyze-wp-url

Analyzes a WordPress/PressLogic article by URL using integrated WordPress API. Automatically fetches content, SEO data, and keywords.

**Request Body:**

```json
{
  "url": "string (WordPress/PressLogic article URL)",
  "options": {
    "contentSelectors": ["string"] "(optional)",
    "excludeSelectors": ["string"] "(optional)",
    "extractMainContent": "boolean (optional)",
    "assessmentConfig": {
      "enableAll": "boolean (optional)",
      "enableAllSEO": "boolean (optional)",
      "enableAllReadability": "boolean (optional)",
      "enabledAssessments": ["string"] "(optional)"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "report": {
    "url": "string",
    "timestamp": "ISO 8601 date",
    "overallScores": {
      "seoScore": "number (0-100)",
      "readabilityScore": "number (0-100)",
      "overallScore": "number (0-100)",
      "seoGrade": "excellent|good|needs-improvement|poor",
      "readabilityGrade": "excellent|good|needs-improvement|poor",
      "overallGrade": "excellent|good|needs-improvement|poor"
    },
    "detailedIssues": ["...same as /analyze endpoint"],
    "summary": {
      "totalIssues": "number",
      "goodIssues": "number",
      "okIssues": "number",
      "badIssues": "number",
      "criticalIssues": ["array"],
      "quickWins": ["array"]
    }
  },
  "wordpressData": {
    "postId": "number",
    "site": "string (site code)",
    "extractedKeywords": ["string"],
    "seoMetadata": {
      "title": "string",
      "description": "string",
      "focusKeyphrase": "string"
    }
  },
  "processingTime": "number (milliseconds)"
}
```

**Supported WordPress Sites:**

- pretty.presslogic.com (GS_HK)
- girlstyle.com (GS_TW)
- holidaysmart.io (HS_HK)
- urbanlifehk.com (UL_HK)
- poplady-mag.com (POP_HK)
- topbeautyhk.com (TOP_HK)
- thekdaily.com (KD_HK)
- businessfocus.io (BF_HK)
- mamidaily.com (MD_HK)
- thepetcity.co (PET_HK)

**Error Response:**

```json
{
  "success": false,
  "error": "string",
  "processingTime": "number (milliseconds)"
}
```

## Request Examples

### Basic Analysis

```json
{
  "htmlContent": "<!DOCTYPE html><html><head><title>Example Page</title></head><body><h1>Welcome</h1><p>This is a sample page.</p></body></html>",
  "pageDetails": {
    "url": "https://example.com",
    "title": "Example Page",
    "description": "A sample webpage for testing"
  },
  "focusKeyword": "example",
  "synonyms": ["sample", "demo"]
}
```

### Advanced Analysis with Custom Configuration

```json
{
  "htmlContent": "<!DOCTYPE html><html>...</html>",
  "pageDetails": {
    "url": "https://example.com/blog/post",
    "title": "How to Use PageLens",
    "description": "Complete guide to PageLens analysis",
    "language": "en",
    "author": "John Doe",
    "category": "Technology",
    "tags": ["SEO", "Analysis", "Web Development"]
  },
  "focusKeyword": "PageLens",
  "synonyms": ["page analysis", "SEO tool"],
  "options": {
    "contentSelectors": ["main", ".content"],
    "excludeSelectors": [".sidebar", ".footer"],
    "extractMainContent": true,
    "assessmentConfig": {
      "enableAllSEO": true,
      "enabledAssessments": ["SENTENCE_LENGTH_IN_TEXT", "PARAGRAPH_TOO_LONG"]
    }
  }
}
```

### WordPress URL Analysis

```json
{
  "url": "https://holidaysmart.io/hk/article/454588/vlt兩大活動登場-「澀出真我角度」大型裝置登陸商",
  "options": {
    "assessmentConfig": {
      "enableAllSEO": true,
      "enableAllReadability": true
    }
  }
}
```

### WordPress URL Analysis with Custom Configuration

```json
{
  "url": "https://pretty.presslogic.com/article/123456/beauty-tips",
  "options": {
    "contentSelectors": [".post-content", ".article-body"],
    "excludeSelectors": [".advertisement", ".related-posts"],
    "extractMainContent": true,
    "assessmentConfig": {
      "enableAllSEO": true,
      "enabledAssessments": [
        "FLESCH_READING_EASE",
        "PARAGRAPH_TOO_LONG",
        "H1_KEYWORD"
      ]
    }
  }
}
```

## Assessment Types

### SEO Assessments

- **H1_KEYWORD** - H1 tag keyword optimization
- **ALT_ATTRIBUTE** - Image alt text validation
- **INTRODUCTION_KEYWORD** - Keyword in first paragraph
- **KEYWORD_DENSITY** - Focus keyword density analysis
- **META_DESCRIPTION_KEYWORD** - Meta description keyword usage
- **PAGE_TITLE_WIDTH** - Page title length validation
- **TEXT_LENGTH** - Content length analysis

### Readability Assessments

- **SENTENCE_LENGTH_IN_TEXT** - Average sentence length
- **PARAGRAPH_TOO_LONG** - Paragraph length validation
- **SUBHEADING_DISTRIBUTION_TOO_LONG** - Subheading distribution
- **FLESCH_READING_EASE** - Flesch reading ease score

## Score Grading

| Score Range | Grade             | Description                              |
| ----------- | ----------------- | ---------------------------------------- |
| 90-100      | excellent         | Outstanding performance                  |
| 70-89       | good              | Good performance with minor improvements |
| 50-69       | needs-improvement | Requires significant improvements        |
| 0-49        | poor              | Critical issues need immediate attention |

## Impact Levels

- **high** - Critical issues that significantly affect SEO/readability
- **medium** - Important issues that should be addressed
- **low** - Minor improvements that can enhance performance

## Error Codes

| Error | Description                                       |
| ----- | ------------------------------------------------- |
| 400   | Bad Request - Invalid input data                  |
| 500   | Internal Server Error - Analysis pipeline failure |

## Rate Limits

Currently no rate limits are implemented, but usage should be reasonable to ensure service availability.

## Integration Example

### JavaScript/Node.js

```javascript
const response = await fetch('https://page-lens-zeta.vercel.app/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    htmlContent: htmlString,
    pageDetails: {
      url: 'https://example.com',
      title: 'Page Title'
    },
    focusKeyword: 'target keyword'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Overall Score:', result.report.overallScores.overallScore);
  console.log('Issues Found:', result.report.detailedIssues.length);
  console.log('Critical Issues:', result.report.summary.criticalIssues.length);
  console.log('Quick Wins:', result.report.summary.quickWins.length);
} else {
  console.error('Analysis failed:', result.error);
}
```

### cURL

```bash
curl -X POST https://page-lens-zeta.vercel.app/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<!DOCTYPE html>...",
    "pageDetails": {
      "url": "https://example.com",
      "title": "Example"
    },
    "focusKeyword": "example"
  }'
```

### WordPress URL Analysis with JavaScript

```javascript
const response = await fetch(
  'https://page-lens-zeta.vercel.app/analyze-wp-url',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://holidaysmart.io/hk/article/454588/vlt兩大活動登場',
      options: {
        assessmentConfig: {
          enableAllSEO: true,
          enableAllReadability: true
        }
      }
    })
  }
);

const result = await response.json();
if (result.success) {
  console.log('Overall Score:', result.report.overallScores.overallScore);
  console.log('WordPress Data:', result.wordpressData);
  console.log('Extracted Keywords:', result.wordpressData.extractedKeywords);
  console.log('Site Code:', result.wordpressData.site);
} else {
  console.error('Analysis failed:', result.error);
}
```

### WordPress URL Analysis with cURL

```bash
curl -X POST https://page-lens-zeta.vercel.app/analyze-wp-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://holidaysmart.io/hk/article/454588/vlt兩大活動登場-「澀出真我角度」大型裝置登陸商",
    "options": {
      "assessmentConfig": {
        "enableAllSEO": true,
        "enableAllReadability": true
      }
    }
  }'
```

## Real-world Example

Here's a real test result from analyzing a HolidaySmart article:

### Request

```bash
curl -X POST https://page-lens-zeta.vercel.app/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<!DOCTYPE html><html><head><title>VLT兩大活動登場 「澀出真我角度」大型裝置登陸商場</title>...</head><body>...</body></html>",
    "pageDetails": {
      "url": "https://holidaysmart.io/hk/article/454588/vlt兩大活動登場",
      "title": "VLT兩大活動登場 「澀出真我角度」大型裝置登陸商場 巨型VLT特色郵箱成打卡熱點",
      "description": "踏入初夏，VLT最新推出嘅「澀出真我角度」活動正式揭幕",
      "language": "zh-Hant-HK"
    },
    "focusKeyword": "VLT",
    "synonyms": ["維他", "檸檬茶"],
    "options": {
      "assessmentConfig": {
        "enableAllSEO": true,
        "enableAllReadability": true
      }
    }
  }'
```

### Response Summary

```json
{
  "success": true,
  "report": {
    "overallScores": {
      "seoScore": 68,
      "readabilityScore": 53,
      "overallScore": 62,
      "seoGrade": "needs-improvement",
      "readabilityGrade": "needs-improvement",
      "overallGrade": "needs-improvement"
    },
    "summary": {
      "totalIssues": 11,
      "goodIssues": 6,
      "okIssues": 1,
      "badIssues": 4,
      "criticalIssues": [
        {
          "id": "h1-missing",
          "name": "H1 Tag Missing",
          "impact": "high"
        },
        {
          "id": "keyword-density-high",
          "name": "High Keyword Density",
          "impact": "high"
        },
        {
          "id": "flesch-reading-ease",
          "name": "Flesch Reading Ease",
          "impact": "high"
        }
      ],
      "quickWins": [
        {
          "id": "meta-description-needs-improvement",
          "name": "Meta Description Needs Improvement",
          "rating": "ok"
        }
      ]
    }
  },
  "processingTime": 49
}
```

### Key Issues Found

- **Missing H1 Tag**: Critical SEO issue
- **High Keyword Density**: 2.6% (should be 0.5-2.5%)
- **Poor Readability**: Flesch score of 24.4 (very difficult to read)
- **Meta Description**: Needs to be longer (70-80 characters)

### Positive Findings

- All images have alt text
- Focus keyword appears in first paragraph
- Good title tag optimization
- Sufficient content length (352 words)
- Well-structured with subheadings

## WordPress URL Analysis Example

For WordPress/PressLogic sites, you can use the simpler `/analyze-wp-url` endpoint:

### Request

```bash
curl -X POST https://page-lens-zeta.vercel.app/analyze-wp-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://holidaysmart.io/hk/article/454588/vlt兩大活動登場-「澀出真我角度」大型裝置登陸商"
  }'
```

### Benefits

- **Automatic data fetching**: No need to manually extract HTML content
- **SEO metadata integration**: Automatically uses WordPress SEO settings
- **Keyword extraction**: Focus keywords and synonyms extracted from WordPress
- **Author and date information**: Automatically populated from WordPress data
- **Site-specific optimization**: Optimized for PressLogic network sites

## Support

For issues and questions:

- Check the logs in Vercel dashboard for deployment issues
- Review the CLAUDE.md file for development guidance
- Ensure all required fields are provided in requests

## Changelog

### Version 1.1.0

- Added WordPress URL analysis endpoint (`/analyze-wp-url`)
- Automatic content fetching from WordPress/PressLogic sites
- Integrated keyword extraction from WordPress SEO data
- Support for 10+ PressLogic network sites
- Enhanced response with WordPress-specific metadata

### Version 1.0.0

- Initial API release with basic page analysis
- SEO and readability assessment pipeline
- Configurable assessment selection
- Comprehensive reporting with scores and recommendations
