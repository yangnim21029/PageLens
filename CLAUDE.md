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
npm run test               # Run all Jest tests
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

### Type Definitions

- `src/app/*/types/*.types.ts` - Stage-specific TypeScript interfaces
- `src/app/running-the-tests/types/extended-assessment.types.ts` - Advanced assessment types
- `src/types/` - Global type definitions

### API and Routes

- `src/routes/appRoutes.ts` - Main API endpoints
- `src/server.ts` - Express server configuration
- `src/middleware/` - Custom middleware implementations

### Testing

- `__tests__/` - Comprehensive test suites organized by type
- `test-scripts/manual-test.js` - Manual testing with real WordPress data

## WordPress Integration

### Supported Sites

- **GS_TW**: girlstyle.com
- **GS_HK**: pretty.presslogic.com

### API Endpoints

- **SEO Data**: `/v1/articles/getArticleSEO` - Focus keywords and meta information
- **Content**: Article content and metadata retrieval

### Key Features

- Multi-separator keyword parsing (commas, dashes, Chinese separators)
- Fallback mechanisms for missing data
- Content validation with Zod schemas

## Extended Assessment Capabilities

Beyond basic SEO checks, the system includes:

### Technical SEO

- Canonical URL validation
- SSL/HTTPS security checks
- Hreflang tag validation
- Structured data (Schema.org) analysis
- Meta robots directives

### Advanced Readability

- Multiple readability algorithms (Gunning Fog, SMOG, Coleman-Liau, Automated Readability Index)
- Content structure analysis (lists, tables, blockquotes)
- Typography and visual design assessment

### Link Analysis

- Internal/external link detection
- Context extraction (50 characters before/after links)
- NoFollow, UGC, and Sponsored attribute tracking

## Development Notes

### TypeScript Configuration

- Strict typing enabled with path aliases (@/\* mapping)
- ES2020 target with comprehensive type checking
- Module path resolution for clean imports

### Testing Strategy

- Unit tests for individual components
- Integration tests for service interactions
- End-to-end functional tests
- Manual testing scripts with real WordPress content

### Performance Considerations

- Parallel processing where possible
- Weighted scoring for intelligent prioritization
- Batch processing support (max 10 pages)
- Content extraction optimization

### Error Handling

- Comprehensive error boundaries at each pipeline stage
- Graceful degradation for missing data
- Structured error responses with timestamps
- Fallback mechanisms for external API failures

## Environment Variables

Key configuration options:

- `PORT` - Server port (default: 3000)
- `WP_ARTICLE_SEO_URL` - WordPress SEO API endpoint
- `WP_TIMEOUT` - API request timeout (default: 30000ms)
- `RATE_LIMIT_MAX` - Rate limit per window (default: 100)
- `ENABLE_CORS` - CORS configuration (default: true)

## Production Deployment

- Docker support with security hardening
- Health check endpoints for monitoring
- Graceful shutdown handling
- Environment-specific configuration management
