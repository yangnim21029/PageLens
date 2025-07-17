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
| holidaysmart.io       | HS_HK     |
| pretty.presslogic.com | GS_HK     |
| girlstyle.com         | GS_TW     |
| urbanlifehk.com       | UL_HK     |
| weekendhk.com         | WH_HK     |
| gotrip.hk             | GT_HK     |
| nmplus.hk             | NM_HK     |
| sundaymore.com        | SM_HK     |
| weekendsg.com         | WH_SG     |
| gotrip.my             | GT_MY     |

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

## Assessment Types

**SEO:**

- `H1_KEYWORD` - H1 keyword optimization
- `ALT_ATTRIBUTE` - Image alt text
- `KEYWORD_DENSITY` - Keyword density
- `META_DESCRIPTION_KEYWORD` - Meta description keywords
- `TEXT_LENGTH` - Content length

**Readability:**

- `SENTENCE_LENGTH_IN_TEXT` - Sentence length
- `PARAGRAPH_TOO_LONG` - Paragraph length
- `FLESCH_READING_EASE` - Reading ease score

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
