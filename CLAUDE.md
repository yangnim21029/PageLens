# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The project uses CommonJS modules with Express.js:

- `npm install` - Install dependencies (express, jsdom, html-to-text, zod, dotenv)
- `node api/index.js` - Start the Express server locally on port 3000
- `npm test` - Currently not configured (exits with error)
- **TypeScript**: Project has TypeScript types but no compilation step - runs directly as CommonJS

## Local Development

```bash
# Start server locally
node api/index.js

# Test the analyze endpoint
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<html>...</html>",
    "pageDetails": {"url": "https://example.com", "title": "Example Page"},
    "focusKeyword": "example",
    "options": {"enableAllSEO": true}
  }'

# Test WordPress URL analysis
curl -X POST http://localhost:3000/analyze-wp-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://wordpress-site.com/article"}'
```

## Project Architecture

PageLens is a web page analysis tool that evaluates SEO and readability metrics through a serverless Express.js API deployed on Vercel.

### Core Pipeline Architecture

The main workflow follows a 4-step pipeline orchestrated by `AuditPipelineOrchestrator`:

1. **Gathering Ingredients** (`lib/app/gathering-ingredients/`)
   - Validates and prepares input data (HTML content, page details, focus keywords)
   - Main service: `IngredientsGatherer`

2. **Understanding the Page** (`lib/app/understanding-the-page/`)
   - Parses HTML and extracts content structure
   - Services: `HTMLParser`, `ContentExtractor`
   - Extracts headings, images, links, text statistics

3. **Running the Tests** (`lib/app/running-the-tests/`)
   - Performs SEO and readability assessments
   - Main service: `TestRunner` coordinates multiple assessors
   - Assessors: `SEOAssessor`, `ReadabilityAssessor`
   - Configurable assessment types via `AssessmentConfiguration`

4. **Presenting the Report** (`lib/app/presenting-the-report/`)
   - Formats test results into structured reports
   - Main service: `ReportFormatter`
   - Generates scores, grades, and detailed issue descriptions

### Key Components

- **`AuditPipelineOrchestrator`** - Main entry point coordinating the entire analysis pipeline
- **Assessment System** - Modular assessment framework supporting:
  - SEO checks (H1 tags, meta descriptions, keyword optimization, alt text)
  - Readability checks (sentence length, paragraph length, Flesch reading ease)
  - Configurable assessment selection via `AssessmentConfiguration`
- **Type System** - Comprehensive TypeScript definitions across all modules
- **Service Architecture** - Clean separation of concerns with dedicated services for each step

### File Organization

```
lib/
├── app/                           # Main application logic
│   ├── audit-pipeline.orchestrator.ts    # Main orchestrator
│   ├── gathering-ingredients/             # Step 1: Input validation
│   ├── understanding-the-page/           # Step 2: HTML parsing
│   ├── running-the-tests/                # Step 3: Assessments
│   └── presenting-the-report/            # Step 4: Report generation
├── config/                        # Configuration files
├── services/external/             # External service integrations
├── types/                         # Shared type definitions
└── utils/                         # Utility functions
```

### Assessment Configuration

The system supports flexible assessment configuration through `AssessmentConfiguration`:
- `enableAll` - Run all available assessments
- `enabledAssessments` - Specify individual assessments from `AvailableAssessments` enum
- `enableAllSEO` / `enableAllReadability` - Enable assessment categories

Available assessments in `AvailableAssessments` enum:
```typescript
// SEO Assessments
SINGLE_H1 = 'h1-missing'
MULTIPLE_H1 = 'multiple-h1'
H1_KEYWORD = 'h1-keyword-missing'
ALT_ATTRIBUTE = 'images-missing-alt'
INTRODUCTION_KEYWORD = 'keyword-missing-first-paragraph'
KEYWORD_DENSITY = 'keyword-density-low'
META_DESCRIPTION_KEYWORD = 'meta-description-needs-improvement'
META_DESCRIPTION_LENGTH = 'meta-description-missing'
PAGE_TITLE_WIDTH = 'title-needs-improvement'
TITLE_KEYWORD = 'title-missing'
TEXT_LENGTH = 'content-length-short'

// Readability Assessments
FLESCH_READING_EASE = 'flesch-reading-ease'
PARAGRAPH_TOO_LONG = 'paragraph-length-long'
SENTENCE_LENGTH_IN_TEXT = 'sentence-length-long'
SUBHEADING_DISTRIBUTION_TOO_LONG = 'subheading-distribution-poor'
```

### Deployment

- Configured for Vercel serverless deployment
- `vercel.json` routes all requests to `/api` endpoint
- Express server in `api/index.ts` handles requests
- No build process - CommonJS modules run directly in Node.js
- Environment: Node.js runtime on Vercel

## Usage Patterns

When working with the audit pipeline:

1. Import `AuditPipelineOrchestrator` from `lib/app`
2. Create input with `AuditPipelineInput` interface
3. Configure assessments with `AuditPipelineOptions`
4. Call `executeAuditPipeline()` method
5. Handle `AuditPipelineResult` response

Example assessment configuration:
```typescript
const config: AssessmentConfiguration = {
  enableAllSEO: true,
  enabledAssessments: [AvailableAssessments.SENTENCE_LENGTH_IN_TEXT]
};
```

## API Endpoints

### POST /analyze
Direct HTML analysis endpoint for analyzing raw HTML content.

**Request Body:**
```json
{
  "htmlContent": "string (required) - Full HTML content",
  "pageDetails": {
    "url": "string (required)",
    "title": "string (required)"
  },
  "focusKeyword": "string (optional)",
  "synonyms": ["array of strings (optional)"],
  "options": {
    "enableAll": "boolean",
    "enableAllSEO": "boolean",
    "enableAllReadability": "boolean",
    "enabledAssessments": ["array of AvailableAssessments"]
  }
}
```

### POST /analyze-wp-url
WordPress URL analysis endpoint - automatically fetches content from WordPress sites.

**Request Body:**
```json
{
  "url": "string (required) - WordPress article URL",
  "options": {} // Same as /analyze endpoint
}
```

Supported WordPress domains are configured in `lib/config/wordpress.ts`.

## Important Notes

- The codebase contains Chinese comments in some files
- No test framework is currently configured
- CommonJS modules used throughout (no ES6 imports)
- Assessment results include both positive and negative findings
- Scoring uses weighted calculations based on assessment impact levels (high/medium/low)
- The pipeline is designed to be fault-tolerant with comprehensive error handling
- WordPress integration includes automatic SEO data extraction (Yoast/RankMath)