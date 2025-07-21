# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start server locally (CommonJS, no build step needed)
node api/index.ts

# Run tests
npm test        # Run API endpoint tests
npm run test:ids    # Run assessment ID consistency tests
npm run test:all    # Run all tests

# Local development with Vercel
vercel dev      # Start on port 3000 with hot reload
```

## Testing Endpoints Locally

```bash
# Test HTML analysis
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<html>...</html>",
    "pageDetails": {"url": "https://example.com", "title": "Example"},
    "focusKeyword": "example",
    "relatedKeywords": ["related1", "related2"]
  }'

# Test WordPress URL analysis
curl -X POST http://localhost:3000/analyze-wp-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://pretty.presslogic.com/article/123/title"}'

# Get API documentation
curl http://localhost:3000/docs
```

## Project Architecture

PageLens is a web page SEO and readability analysis tool using a 4-step pipeline pattern, deployed as a Vercel serverless function.

### Core Pipeline Flow

```
Input → Gathering Ingredients → Understanding the Page → Running Tests → Presenting Report
```

1. **Gathering Ingredients** (`lib/app/gathering-ingredients/`)
   - `IngredientsGatherer` validates input and prepares data
   - Handles focus keyword and related keywords parsing
   - WordPress URLs: Automatically splits keywords by `-` delimiter

2. **Understanding the Page** (`lib/app/understanding-the-page/`)
   - `HTMLParser` + `ContentExtractor` parse HTML structure
   - Extracts headings, images, links, text content
   - Calculates word count using language-aware analysis (Chinese chars + English words)

3. **Running the Tests** (`lib/app/running-the-tests/`)
   - `TestRunner` orchestrates assessments
   - Split into specialized assessors by concern:
     - `HeadingAssessor` - H1/H2 structure and keywords
     - `ContentAssessor` - Keyword density, content length, first paragraph
     - `MetaAssessor` - Title and meta description
     - `MediaAssessor` - Image alt text
     - `ReadabilityAssessor` - Sentence/paragraph length, subheadings
   - Uses `AssessmentConfiguration` for selective testing

4. **Presenting the Report** (`lib/app/presenting-the-report/`)
   - `ReportFormatter` generates structured output
   - Creates Markdown report and detailed JSON results
   - Calculates weighted scores based on impact levels

### Key Technical Details

- **No Build Step**: TypeScript types exist but code runs as CommonJS directly
- **Chinese Support**: Pixel-based width calculations (Chinese: 14px, English: 5px, Numbers: 8px)
- **Keyword Density**: Formula = (keyword length × occurrences) / total words × 100%
  - H2 keywords get 2x weight
  - Space-separated keywords counted individually
- **Assessment IDs**: Unified enum format (e.g., `H1_MISSING`, `KEYWORD_DENSITY_LOW`)
- **WordPress Integration**: Auto-fetches content and SEO metadata from supported sites

### Assessment Configuration

```javascript
// Run specific assessments
{
  enabledAssessments: ['H1_MISSING', 'KEYWORD_DENSITY_LOW']
}

// Run all SEO assessments
{
  enableAllSEO: true
}

// Run everything
{
  enableAll: true
}
```

### Recent Updates

**v2.4 (Latest)**
- Keyword density calculation considers keyword length
- H2 keywords receive 2x weight in density calculation
- Support for space-separated keywords (e.g., "洗面乳 推薦")

**v2.3**
- `synonyms` → `relatedKeywords` terminology change
- Enhanced Chinese keyword matching using character-level detection

**v2.2**
- Title/H1 must contain focus keyword + at least one related keyword
- WordPress keyword auto-splitting by `-` delimiter

**v2.1**
- Added H2_SYNONYMS_MISSING assessment for related keywords coverage
- Total 16 assessments (12 SEO + 4 Readability)

**v2.0**
- Pixel-based width calculation for Title/Meta Description
- Added `pageUnderstanding` and `markdownReport` to API response
- Standards field with optimal/acceptable ranges

## WordPress Integration

Supported sites configured in `lib/config/wordpress.ts`:
- pretty.presslogic.com (GS_HK)
- girlstyle.com (GS_TW)
- holidaysmart.io (HS_HK)
- urbanlifehk.com (UL_HK)
- And more...

WordPress keyword format: `焦點關鍵字-相關關鍵字1-相關關鍵字2` automatically parsed into:
- focusKeyword: "焦點關鍵字"
- relatedKeywords: ["相關關鍵字1", "相關關鍵字2"]

## API Response Structure

```typescript
{
  success: boolean,
  result?: {
    input: { /* validated input */ },
    pageUnderstanding: { /* page structure analysis */ },
    assessmentResults: { /* ID -> result mapping */ },
    report: { /* formatted report */ },
    markdownReport: string
  },
  error?: string,
  processingTime: number
}
```

## Common Development Tasks

### Adding a New Assessment
1. Add enum value to `AvailableAssessments` in `lib/app/running-the-tests/types/assessment.types.ts`
2. Implement assessment logic in appropriate assessor service
3. Add translations to `translations/assessment-translations.js`
4. Update `API.md` documentation

### Modifying Keyword Logic
- Keyword matching: `lib/app/utils/keyword-matcher.ts`
- Density calculation: `lib/app/running-the-tests/assessments/content-assessor.service.ts`
- Text analysis: `lib/app/utils/text-analyzer.ts`

### Testing Changes
```bash
# Test locally with Vercel
vercel dev

# Run assessment ID consistency check
npm run test:ids

# Test with production URL
curl -X POST https://page-lens-zeta.vercel.app/analyze-wp-url \
  -d '{"url": "YOUR_TEST_URL"}'
```