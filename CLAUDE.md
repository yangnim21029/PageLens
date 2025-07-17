# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The project uses a minimal Express.js setup with basic npm scripts:

- `npm test` - Currently returns an error (no tests configured)
- `npm install` - Install dependencies
- `node api/index.js` - Start the Express server on port 3000

## Project Architecture

PageLens is a web page analysis tool that evaluates SEO and readability metrics. The project is migrating from a Next.js structure to a serverless Express.js API deployed on Vercel.

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

The system supports flexible assessment configuration:
- `enableAll` - Run all available assessments
- `enabledAssessments` - Specify individual assessments
- `enableAllSEO` / `enableAllReadability` - Enable assessment categories
- Assessment types are defined in `AvailableAssessments` enum

### Deployment

- Configured for Vercel serverless deployment
- `vercel.json` routes all requests to `/api`
- Express server in `api/index.ts` handles requests
- No build process - direct Node.js execution

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

## Important Notes

- The codebase contains Chinese comments in some files
- No test framework is currently configured
- Assessment results include both positive and negative findings
- Scoring uses weighted calculations based on assessment impact levels
- The pipeline is designed to be fault-tolerant with comprehensive error handling