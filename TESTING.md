# SEO Analysis Panel Testing Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run dev:server
```

### 3. Run Manual Tests
```bash
npm run test:manual
```

### 4. Access Demo
Open your browser to: `http://localhost:3000/demo`

## 📋 Testing Methods

### Method 1: Manual API Testing (Recommended)
Run the comprehensive test suite:
```bash
npm run test:manual
```

This will test:
- ✅ Health endpoints
- ✅ Statistics endpoint
- ✅ URL validation
- ✅ SEO analysis with real data
- ✅ Error handling

### Method 2: Unit Tests
```bash
npm test
```

### Method 3: Interactive Demo
1. Start server: `npm run dev:server`
2. Open: `http://localhost:3000/demo`
3. Use the HTML demo interface

### Method 4: Direct API Calls

#### Health Check
```bash
curl http://localhost:3000/health
```

#### SEO Analysis
```bash
curl -X POST "http://localhost:3000/api/seo-analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://girlstyle.com/tw/article/513255",
    "focusKeyword": "Disney Zootopia",
    "synonyms": ["動物方城市", "Disney", "animation"]
  }'
```

#### Statistics
```bash
curl http://localhost:3000/api/seo-analysis/stats
```

#### URL Validation
```bash
curl -X POST "http://localhost:3000/api/seo-analysis/validate-url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://girlstyle.com/tw/article/513255"}'
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
WP_ARTICLE_SEO_URL=https://article-api.presslogic.com/v1/articles/getArticleSEO
WP_ARTICLE_URL=https://article-api.presslogic.com/v1/articles/getArticle
```

### Test Data
Default test URL: `https://girlstyle.com/tw/article/513255`
- This is a real GirlStyle article about Disney's Zootopia 2
- Works with your existing WordPress API integration
- Good for testing Chinese content and special characters

## 📊 Expected Output

### Successful Analysis Response
```json
{
  "success": true,
  "report": {
    "id": "unique-id",
    "url": "https://girlstyle.com/tw/article/513255",
    "overallScores": {
      "seoScore": 85,
      "readabilityScore": 75,
      "overallScore": 80,
      "seoGrade": "GOOD",
      "readabilityGrade": "GOOD",
      "overallGrade": "GOOD"
    },
    "summary": {
      "totalIssues": 3,
      "criticalIssues": 0,
      "passedChecks": 7,
      "totalChecks": 10,
      "keyFindings": [
        "Good keyword usage",
        "Proper heading structure"
      ]
    },
    "issues": [
      {
        "title": "Missing alt text for images",
        "description": "Some images don't have alt text",
        "rating": "MEDIUM",
        "suggestions": ["Add descriptive alt text to all images"]
      }
    ]
  },
  "processingTime": 1500,
  "analyzedUrl": "https://girlstyle.com/tw/article/513255",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 3000 is available
   - Run `npm install` to ensure dependencies are installed
   - Check TypeScript compilation with `npm run typecheck`

2. **SEO analysis fails**
   - Check if the WordPress API is accessible
   - Verify the test URL is valid and accessible
   - Check network connectivity

3. **Tests fail**
   - Make sure server is running on port 3000
   - Check if all dependencies are installed
   - Verify TypeScript compilation

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=seo-analysis:* npm run dev:server
```

## 📝 Test Results Example

```
🧪 Starting Manual SEO Analysis Test
📡 Base URL: http://localhost:3000
🔍 Test URL: https://girlstyle.com/tw/article/513255
🎯 Focus Keyword: Disney Zootopia
📝 Synonyms: 動物方城市, Disney, animation
============================================================

🔍 Testing Health Check...
✅ Health check passed
   Status: healthy
   Uptime: 10.5s

🔍 Testing SEO Analysis Health...
✅ SEO Analysis health check passed
   Status: healthy
   Service: SEO Analysis Service

📊 Testing Stats Endpoint...
✅ Stats retrieved successfully
   Pipeline Steps: Gathering Ingredients, Understanding the Page, Running the Tests, Presenting the Report

🔗 Testing URL Validation...
✅ URL validation completed
   Valid: true
   Accessible: true
   Is HTML: true
   Status Code: 200

🎯 Testing SEO Analysis...
⏳ This may take a moment...
✅ SEO Analysis completed successfully
   Request Time: 2500ms
   Processing Time: 2200ms
   SEO Score: 85
   Readability Score: 75
   Overall Score: 80
   Total Issues: 3
   Critical Issues: 0
   Passed Checks: 7/10

🚫 Testing Invalid Requests...
✅ Invalid URL properly rejected
✅ Missing focus keyword properly rejected

============================================================
📊 TEST SUMMARY
============================================================
✅ Health Check
✅ SEO Analysis Health
✅ Get Stats
✅ Validate URL
✅ SEO Analysis
✅ Invalid Requests

🎯 6/6 tests passed
🎉 All tests passed! The SEO Analysis API is working correctly.
```

## 🔍 Next Steps

1. **Frontend Integration**: The React components are ready for integration
2. **Production Deployment**: Configure for production environment
3. **Advanced Features**: Add authentication, rate limiting, caching
4. **Monitoring**: Set up logging and monitoring for production use

## 📚 API Documentation

All endpoints are documented in the demo page at `http://localhost:3000/demo`

### Available Endpoints:
- `GET /health` - Server health check
- `GET /api/seo-analysis/health` - SEO service health
- `GET /api/seo-analysis/stats` - Processing statistics
- `POST /api/seo-analysis/analyze` - Main SEO analysis
- `POST /api/seo-analysis/validate-url` - URL validation
- `GET /demo` - Interactive demo page