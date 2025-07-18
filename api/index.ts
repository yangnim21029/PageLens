const express = require('express');
const { AuditPipelineOrchestrator } = require('../lib/app/audit-pipeline.orchestrator');
const { 
  callWordPressArticleApi, 
  callWordPressSEOApi,
  getKeywordByWordPress
} = require('../lib/services/external/wordpress');
const { wordPressSiteMap } = require('../lib/config/wordpress');

const app = express();

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => res.send('PageLens API v2.0 - Unified Assessment IDs'));

// API Documentation endpoint
app.get('/docs', (req, res) => {
  res.json({
    "name": "PageLens API",
    "version": "2.0",
    "description": "Web page SEO and readability analysis API with unified assessment IDs",
    "lastUpdated": "2024-12-01",
    "endpoints": {
      "/analyze": {
        "method": "POST",
        "description": "Analyze HTML content for SEO and readability",
        "contentType": "application/json",
        "requiredFields": ["htmlContent", "pageDetails.url", "pageDetails.title"],
        "optionalFields": ["focusKeyword", "synonyms", "options"],
        "returns": "Analysis report with 15 assessments + Markdown report + Page understanding"
      },
      "/analyze-wp-url": {
        "method": "POST", 
        "description": "Analyze WordPress article URL directly",
        "contentType": "application/json",
        "requiredFields": ["url"],
        "optionalFields": ["options"],
        "returns": "Analysis report with WordPress metadata + Markdown report + Page understanding"
      }
    },
    "newFeatures": {
      "pageUnderstanding": {
        "description": "Structured understanding of the analyzed page",
        "includes": ["Basic info (title, meta, word count)", "Heading structure", "Media statistics", "Link analysis", "Text statistics"]
      },
      "standards": {
        "description": "Optimal and acceptable ranges for assessments",
        "example": {
          "optimal": { "min": 0.5, "max": 2.5, "unit": "%" },
          "acceptable": { "min": 0.3, "max": 3.0, "unit": "%" },
          "description": "關鍵字密度最佳範圍 0.5-2.5%"
        }
      },
      "markdownReport": {
        "description": "Formatted Markdown report for easy reading"
      }
    },
    "assessmentIds": {
      "description": "All assessment IDs use unified naming where key equals value",
      "seoAssessments": [
        "H1_MISSING",
        "MULTIPLE_H1", 
        "H1_KEYWORD_MISSING",
        "IMAGES_MISSING_ALT",
        "KEYWORD_MISSING_FIRST_PARAGRAPH",
        "KEYWORD_DENSITY_LOW",
        "META_DESCRIPTION_NEEDS_IMPROVEMENT",
        "META_DESCRIPTION_MISSING",
        "TITLE_NEEDS_IMPROVEMENT",
        "TITLE_MISSING",
        "CONTENT_LENGTH_SHORT"
      ],
      "readabilityAssessments": [
        "FLESCH_READING_EASE",
        "PARAGRAPH_LENGTH_LONG",
        "SENTENCE_LENGTH_LONG",
        "SUBHEADING_DISTRIBUTION_POOR"
      ],
      "totalCount": 15,
      "format": "Each assessment ID is consistent across frontend and backend (e.g., H1_MISSING = 'H1_MISSING')"
    }
  });
});

// Example endpoint for dev team testing
app.get('/example', (req, res) => {
  res.json({
    "description": "Example API usage for PageLens v2.0",
    "examples": {
      "basicAnalysis": {
        "endpoint": "POST /analyze",
        "payload": {
          "htmlContent": "<html><head><title>Test Page</title></head><body><h1>Main Heading</h1><p>Content here...</p></body></html>",
          "pageDetails": {
            "url": "https://example.com/test-page",
            "title": "Test Page Title",
            "language": "en"
          },
          "focusKeyword": "test keyword",
          "options": {
            "contentSelectors": ["body", "main", "article"],
            "excludeSelectors": [".sidebar", ".ads"]
          }
        }
      },
      "wordPressAnalysis": {
        "endpoint": "POST /analyze-wp-url", 
        "payload": {
          "url": "https://www.elle.com.hk/article/123456",
          "options": {
            "contentSelectors": ["article", ".content"]
          }
        }
      }
    },
    "expectedResponse": {
      "success": true,
      "report": {
        "overallScores": {
          "seoScore": 85,
          "readabilityScore": 72,
          "overallScore": 79
        },
        "detailedIssues": [
          {
            "id": "H1_MISSING",
            "type": "SEO",
            "name": "H1 Tag Present",
            "status": "good",
            "score": 100,
            "impact": "high",
            "recommendation": "Great! Your page has an H1 heading.",
            "details": { "h1Count": 1 },
            "standards": {
              "optimal": { "value": 1, "unit": "個" },
              "description": "每頁應有且僅有一個 H1 標籤"
            }
          }
        ]
      },
      "processingTime": 250,
      "apiVersion": "2.0",
      "assessmentCount": 15,
      "timestamp": "2024-12-01T10:30:00.000Z"
    },
    "notes": [
      "All assessment IDs use unified naming (H1_MISSING = 'H1_MISSING')",
      "API always returns exactly 15 assessments",
      "Processing time is included in response",
      "Some assessments include 'standards' field with optimal ranges",
      "Standards help understand what values are considered good/acceptable",
      "Use /docs endpoint for complete API documentation"
    ]
  });
});

// Debug endpoint for WordPress API
app.post('/debug-wp-api', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Extract post ID and site info
    const postId = url.match(/\/article\/(\d+)/)?.[1];
    const hostname = new URL(url).hostname;
    const siteCode = wordPressSiteMap[hostname];

    if (!postId || !siteCode) {
      return res.status(400).json({ error: 'Invalid URL or unsupported site' });
    }

    const wpApiUrl = `https://article-api.presslogic.com/v1/articles/${postId}?site=${siteCode}`;
    
    const response = await fetch(wpApiUrl);
    const data = await response.json();
    
    res.json({
      url: wpApiUrl,
      status: response.status,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Page analysis endpoint - Returns exactly 15 unified assessment IDs
app.post('/analyze', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { htmlContent, pageDetails, focusKeyword, synonyms, options } = req.body;

    // Enhanced validation with detailed error messages
    if (!htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: htmlContent is required',
        code: 'MISSING_HTML_CONTENT'
      });
    }

    if (!pageDetails) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: pageDetails object is required',
        code: 'MISSING_PAGE_DETAILS'
      });
    }

    if (!pageDetails.url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: pageDetails.url is required',
        code: 'MISSING_PAGE_URL'
      });
    }

    if (!pageDetails.title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: pageDetails.title is required',
        code: 'MISSING_PAGE_TITLE'
      });
    }

    // Log request for debugging
    console.log(`[${new Date().toISOString()}] Analysis request for: ${pageDetails.url}`);
    console.log(`Focus keyword: ${focusKeyword || 'None'}`);
    console.log(`Content length: ${htmlContent.length} characters`);

    // Initialize audit pipeline
    const orchestrator = new AuditPipelineOrchestrator();

    // Prepare input
    const input = {
      htmlContent,
      pageDetails,
      focusKeyword: focusKeyword || '',
      synonyms: synonyms || []
    };

    // Execute audit pipeline
    const result = await orchestrator.executeAuditPipeline(input, options || {});

    // Validate that we return exactly 15 assessment IDs
    const assessmentCount = result.report?.detailedIssues?.length || 0;
    if (assessmentCount !== 15) {
      console.warn(`Warning: Expected 15 assessments, got ${assessmentCount}`);
    }

    // Generate Markdown report
    let markdownReport = '';
    if (result.success && result.report) {
      const reportFormatter = new (require('../lib/app/presenting-the-report/formatters/report-formatter.service')).ReportFormatter();
      markdownReport = reportFormatter.generateMarkdownReport(result.report);
    }

    // Add processing metadata
    const processingTime = Date.now() - startTime;
    const enhancedResult = {
      ...result,
      processingTime,
      apiVersion: '2.0',
      assessmentCount,
      timestamp: new Date().toISOString(),
      markdownReport
    };

    console.log(`Analysis completed in ${processingTime}ms with ${assessmentCount} assessments`);
    
    res.json(enhancedResult);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Analysis error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      code: 'ANALYSIS_ERROR',
      processingTime,
      timestamp: new Date().toISOString()
    });
  }
});

// WordPress URL analysis endpoint - Enhanced for v2.0
app.post('/analyze-wp-url', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { url, options } = req.body;

    // Validate required fields
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: url is required',
        code: 'MISSING_URL'
      });
    }

    console.log(`[${new Date().toISOString()}] WordPress analysis request for: ${url}`);

    // Check if URL is supported by WordPress API
    const hostname = new URL(url).hostname;
    const supportedSite = wordPressSiteMap[hostname];
    
    if (!supportedSite) {
      return res.status(400).json({
        success: false,
        error: `URL domain "${hostname}" is not supported by WordPress API. Supported domains: ${Object.keys(wordPressSiteMap).join(', ')}`
      });
    }

    // Get article content and SEO data from WordPress API
    const [articleResult, seoData, keywords] = await Promise.all([
      callWordPressArticleApi(url),
      callWordPressSEOApi(url),
      getKeywordByWordPress(url)
    ]);

    if (!articleResult.success || !articleResult.data) {
      return res.status(400).json({
        success: false,
        error: `Failed to fetch article from WordPress API: ${articleResult.error || 'Unknown error'}`
      });
    }

    const wpData = articleResult.data;

    // Prepare page details from WordPress data
    const pageDetails = {
      url: url,
      title: wpData.title,
      description: seoData?.description || '',
      language: 'zh-Hant-HK', // Default for PressLogic sites
      author: wpData.author?.display_name || '',
      publishedDate: wpData.post_date,
      category: 'WordPress Article'
    };

    // Use focus keyword from WordPress SEO data
    const focusKeyword = keywords && keywords.length > 0 ? keywords[0] : '';
    const synonyms = keywords && keywords.length > 1 ? keywords.slice(1) : [];

    // Initialize audit pipeline
    const orchestrator = new AuditPipelineOrchestrator();

    // Prepare input for analysis
    // Add H1 tag with title and meta tags to the content since WordPress stores them separately
    const htmlWithMetadata = `<!DOCTYPE html>
<html>
<head>
  <title>${seoData?.title || wpData.title}</title>
  <meta name="description" content="${seoData?.description || ''}">
</head>
<body>
  <h1>${wpData.title}</h1>
  ${wpData.post_content}
</body>
</html>`;
    
    const input = {
      htmlContent: htmlWithMetadata,
      pageDetails,
      focusKeyword,
      synonyms
    };

    // For WordPress sites, use default selectors if user didn't specify
    const wordPressOptions = options || {};
    if (!wordPressOptions.contentSelectors) {
      wordPressOptions.contentSelectors = [
        'main', 'article', '.content', '.post-content', '.entry-content',
        '.article-content', '#content', '#main'
      ];
    }
    if (!wordPressOptions.excludeSelectors) {
      wordPressOptions.excludeSelectors = [
        'script', 'style', 'nav', 'header', 'footer', 'aside', '.sidebar',
        '.menu', '.navigation', '.comments', '.related-posts'
      ];
    }

    // Execute audit pipeline
    const result = await orchestrator.executeAuditPipeline(input, wordPressOptions);

    // Validate assessment count
    const assessmentCount = result.report?.detailedIssues?.length || 0;
    if (assessmentCount !== 15) {
      console.warn(`Warning: Expected 15 assessments, got ${assessmentCount}`);
    }

    // Generate Markdown report
    let markdownReport = '';
    if (result.success && result.report) {
      const reportFormatter = new (require('../lib/app/presenting-the-report/formatters/report-formatter.service')).ReportFormatter();
      markdownReport = reportFormatter.generateMarkdownReport(result.report);
    }

    // Add WordPress-specific metadata to the response
    const processingTime = Date.now() - startTime;
    const enhancedResult = {
      ...result,
      processingTime,
      apiVersion: '2.0',
      assessmentCount,
      timestamp: new Date().toISOString(),
      markdownReport,
      wordpressData: {
        postId: wpData.id,
        site: supportedSite,
        extractedKeywords: keywords,
        seoMetadata: seoData,
        contentSource: 'WordPress API'
      }
    };

    console.log(`WordPress analysis completed in ${processingTime}ms with ${assessmentCount} assessments`);
    
    res.json(enhancedResult);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('WordPress analysis error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      code: 'WORDPRESS_ANALYSIS_ERROR',
      processingTime,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(3000, () => {
  console.log('===============================================');
  console.log('🚀 PageLens API v2.0 Server Started');
  console.log('📡 Port: 3000');
  console.log('🔗 Endpoints:');
  console.log('   GET  /         - Health check');
  console.log('   GET  /docs     - API documentation');
  console.log('   GET  /example  - Usage examples');
  console.log('   POST /analyze  - HTML content analysis');
  console.log('   POST /analyze-wp-url - WordPress URL analysis');
  console.log('✨ New Features:');
  console.log('   - Unified assessment IDs (H1_MISSING = "H1_MISSING")');
  console.log('   - Always returns exactly 15 assessments');
  console.log('   - Enhanced error handling with error codes');
  console.log('   - Processing time tracking');
  console.log('   - Comprehensive logging');
  console.log('===============================================');
});

module.exports = app;
