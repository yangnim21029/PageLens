# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

```bash
npm run dev          # Start development server with ts-node
npm run dev:server   # Start alternative server configuration
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled application from dist/
```

### Testing

```bash
npm run test               # Run all Jest tests (currently configured with passWithNoTests: true)
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:manual        # Run manual test scripts with real data
```

### Code Quality

```bash
npm run lint          # ESLint check on src/**/*.ts
npm run lint:fix      # Auto-fix ESLint issues
npm run typecheck     # TypeScript type checking without emit
```

### Build Management

```bash
npm run clean         # Remove dist/ directory
npm run docker:build  # Build Docker image
npm run docker:run    # Start with docker-compose
```

### Deployment

```bash
npm run vercel:deploy # Deploy to Vercel production
npm run vercel:dev    # Run Vercel development server
npm run deploy        # Alias for vercel:deploy
```

## Architecture Overview

### 4-Stage Audit Pipeline

PageLens implements a sequential audit pipeline with clear separation of concerns:

1. **Gathering Ingredients** (`src/app/gathering-ingredients/`)
   - Collects page metadata, focus keywords, and synonyms
   - Input validation and preprocessing
   - Service: `IngredientsGatherer`

2. **Understanding the Page** (`src/app/understanding-the-page/`)
   - HTML parsing and content extraction
   - Structured data detection and social media tag analysis
   - Services: `HTMLParser`, `ContentExtractor`

3. **Running the Tests** (`src/app/running-the-tests/`)
   - SEO assessments (H1, keywords, meta tags, images, content length)
   - Readability analysis (sentence length, Flesch score, paragraph structure)
   - Technical SEO checks (canonical URLs, SSL, structured data)
   - Advanced readability metrics (Gunning Fog, SMOG, Coleman-Liau)
   - Service: `TestRunner` with specialized assessors

4. **Presenting the Report** (`src/app/presenting-the-report/`)
   - Score calculation with weighted impacts
   - Report generation with actionable recommendations
   - Service: `ReportFormatter`

### Assessment System

- **Scoring**: Weighted combination of SEO (60%) and Readability (40%)
- **Impact Levels**: High (3x), Medium (2x), Low (1x) weight multipliers
- **Status Grades**: GOOD, OK, BAD with numerical scores (0-100)
- **Extended Assessments**: Technical SEO, advanced readability metrics, content structure analysis

### Service Architecture

- **Main Orchestrator**: `AuditPipelineOrchestrator` coordinates all stages
- **WordPress Integration**: Specialized service for PressLogic sites (girlstyle.com, pretty.presslogic.com)
- **External APIs**: WordPress SEO data and article content retrieval
- **Security**: Rate limiting, CORS, Helmet middleware, request validation

## Key File Locations

### Core Pipeline

- `src/app/audit-pipeline.orchestrator.ts` - Main pipeline coordinator
- `src/app/index.ts` - App module exports
- `src/index.ts` - Primary application entry point
- `api/index.ts` - Vercel serverless function entry point

### Type Definitions

- `src/app/*/types/*.types.ts` - Stage-specific TypeScript interfaces
- `src/app/running-the-tests/types/extended-assessment.types.ts` - Advanced assessment types
- `src/types/` - Global type definitions

### API and Routes

- `src/routes/appRoutes.ts` - Main API endpoints
- `src/server.ts` - Express server configuration
- `src/middleware/` - Custom middleware implementations

### Assessment Services

- `src/app/running-the-tests/assessments/seo-checks/` - Basic SEO assessments
- `src/app/running-the-tests/assessments/readability-checks/` - Basic readability assessments
- `src/app/running-the-tests/assessments/advanced-readability-checks/` - Advanced readability metrics
- `src/app/running-the-tests/assessments/technical-seo-checks/` - Technical SEO assessments

## API Endpoints

### Core Endpoints

- `POST /api/v1/pagelens` - Single page audit
- `POST /api/v1/pagelens/batch` - Batch page audit  
- `GET /api/v1/pagelens/health` - Health check

### Request Format

```json
{
  "htmlContent": "<!DOCTYPE html>...",
  "pageDetails": {
    "url": "https://example.com/page",
    "title": "Page Title",
    "description": "Page description"
  },
  "focusKeyword": "main keyword",
  "synonyms": ["synonym1", "synonym2"],
  "options": {
    "contentSelectors": ["main", "article"],
    "excludeSelectors": ["nav", "footer"],
    "assessmentConfig": {...}
  }
}
```

## WordPress Integration

### Supported Sites

- **GS_TW**: girlstyle.com
- **GS_HK**: pretty.presslogic.com

### API Features

- Multi-separator keyword parsing (commas, dashes, Chinese separators)
- Fallback mechanisms for missing data
- Content validation with Zod schemas

## Extended Assessment System

### Technical SEO Checks

- Canonical URL validation
- SSL/HTTPS security checks
- Hreflang tag validation
- Structured data (Schema.org) analysis
- Meta robots directives

### Advanced Readability Metrics

- Gunning Fog Index
- SMOG Index
- Coleman-Liau Index
- Automated Readability Index
- Content structure analysis (lists, tables, blockquotes)

### Assessment Result Structure

All assessments follow the `ExtendedAssessmentResult` interface:
- Must include `assessmentType` property
- Categories: 'technical-seo', 'advanced-readability', 'content-structure', 'visual-design'
- Scoring with weighted impacts (high/medium/low)

## Development Notes

### TypeScript Configuration

- Strict typing enabled with path aliases (@/* mapping)
- ES2020 target with comprehensive type checking
- Module path resolution for clean imports
- Build output to `dist/` directory

### Testing Strategy

- Jest configured with `passWithNoTests: true`
- No current test files (removed during cleanup)
- Manual testing scripts with real WordPress data
- Coverage reporting configured

### Error Handling

- Comprehensive error boundaries at each pipeline stage
- Graceful degradation for missing data
- Structured error responses with timestamps
- Fallback mechanisms for external API failures

### Performance Considerations

- Parallel processing where possible
- Weighted scoring for intelligent prioritization
- Batch processing support (max 10 pages)
- Content extraction optimization

## Environment Variables

Key configuration options:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `WP_ARTICLE_SEO_URL` - WordPress SEO API endpoint
- `WP_TIMEOUT` - API request timeout (default: 30000ms)
- `RATE_LIMIT_MAX` - Rate limit per window (default: 100)
- `ENABLE_CORS` - CORS configuration (default: true)

## Deployment Options

### Local Development

```bash
npm run dev    # Development with ts-node
npm run build  # Build for production
npm run start  # Run built application
```

### Docker Deployment

```bash
npm run docker:build    # Build Docker image
npm run docker:run      # Start with docker-compose
npm run docker:stop     # Stop containers
npm run docker:logs     # View logs
```

### Vercel Serverless

- Entry point: `api/index.ts`
- Uses compiled code from `dist/` directory
- 30-second timeout configured
- Automatic deployment on push

### Health Monitoring

- Health check endpoints for monitoring
- Graceful shutdown handling
- Environment-specific configuration management

## Important Reminders

### Code Quality

- Always run `npm run build` and `npm run typecheck` before committing
- ESLint ignores `*.js` files - focus on TypeScript files
- Use path aliases (@/*) for clean imports

### Assessment Development

- All extended assessments must include `assessmentType` property
- Follow the `ExtendedAssessmentResult` interface structure
- Use appropriate categories for assessment classification
- Implement proper error handling and fallbacks

### API Development

- Support both new and legacy request formats
- Validate assessment configurations before processing
- Include proper error responses with meaningful messages
- Maintain backward compatibility where possible