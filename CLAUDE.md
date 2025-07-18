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
    "relatedKeywords": ["related1", "related2"],
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

Available assessments in `AvailableAssessments` enum (unified naming format):
```typescript
// SEO Assessments
H1_MISSING = 'H1_MISSING'
MULTIPLE_H1 = 'MULTIPLE_H1'
H1_KEYWORD_MISSING = 'H1_KEYWORD_MISSING'
H2_SYNONYMS_MISSING = 'H2_SYNONYMS_MISSING'
IMAGES_MISSING_ALT = 'IMAGES_MISSING_ALT'
KEYWORD_MISSING_FIRST_PARAGRAPH = 'KEYWORD_MISSING_FIRST_PARAGRAPH'
KEYWORD_DENSITY_LOW = 'KEYWORD_DENSITY_LOW'
META_DESCRIPTION_NEEDS_IMPROVEMENT = 'META_DESCRIPTION_NEEDS_IMPROVEMENT'
META_DESCRIPTION_MISSING = 'META_DESCRIPTION_MISSING'
TITLE_NEEDS_IMPROVEMENT = 'TITLE_NEEDS_IMPROVEMENT'
TITLE_MISSING = 'TITLE_MISSING'
CONTENT_LENGTH_SHORT = 'CONTENT_LENGTH_SHORT'

// Readability Assessments
FLESCH_READING_EASE = 'FLESCH_READING_EASE'
PARAGRAPH_LENGTH_LONG = 'PARAGRAPH_LENGTH_LONG'
SENTENCE_LENGTH_LONG = 'SENTENCE_LENGTH_LONG'
SUBHEADING_DISTRIBUTION_POOR = 'SUBHEADING_DISTRIBUTION_POOR'
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
  enabledAssessments: [AvailableAssessments.SENTENCE_LENGTH_LONG]
};
```

## Recent Updates (v2.0)

### Pixel-Based Width Calculation
- **Title/Meta Description**: Now use pixel width instead of character count for accurate Chinese content assessment
- **Calculation Rules**: Chinese chars (14px), English letters (5px), Numbers (8px), Spaces (5px)
- **Standards**: Title >150px good (max 600px), Meta Description >600px good (max 960px)
- **Response Fields**: Both `pixelWidth` and `charEquivalent` included in assessment details

### Enhanced API Response
- **pageUnderstanding**: Structured page analysis (headings, media, links, text stats)
- **markdownReport**: Formatted Markdown report for easy reading
- **standards**: Optimal/acceptable ranges for assessments with pixel-based units

### Terminology Update (v2.3)
- **Renamed**: `synonyms` → `relatedKeywords` throughout the codebase for clarity
- **Purpose**: These are related keywords, not true synonyms of the focus keyword
- **Future**: Reserved `synonyms` field for true synonym functionality
- **Backward Compatibility**: API still accepts `synonyms` parameter which maps to `relatedKeywords`

### H2 Related Keywords Assessment (v2.1)
- **New Assessment**: H2_SYNONYMS_MISSING checks if all related keywords appear in H2 headings
- **Keyword Structure**: Support for focus keyword (single) and relatedKeywords (multiple secondary keywords)
- **H2 Coverage**: Ensures all secondary keywords are covered in H2 headings for better content structure
- **Total Assessments**: Now returns 16 assessments (12 SEO + 4 Readability)

### Enhanced Keyword Matching (v2.2)
- **Character-Level Matching**: Title and H1 now use character-level matching for Chinese keywords
- **Title/H1 Requirements**: Must contain focus keyword AND at least one related keyword
- **WordPress Integration**: Automatically splits keywords by `-` (e.g., `焦點關鍵字-相關關鍵字1-相關關鍵字2`)
- **Smart Matching**: Handles overlapping characters in keywords (e.g., "九龍好去處" and "九龍好玩")

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
  "relatedKeywords": ["array of strings (optional)"],  // 相關關鍵字
  "synonyms": ["array of strings (optional)"],  // 預留給未來同義詞功能
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