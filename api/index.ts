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
app.get('/', (req, res) => res.send('Express on Vercel'));

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

// Page analysis endpoint
app.post('/analyze', async (req, res) => {
  try {
    const { htmlContent, pageDetails, focusKeyword, synonyms, options } = req.body;

    // Validate required fields
    if (!htmlContent || !pageDetails || !pageDetails.url || !pageDetails.title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: htmlContent, pageDetails.url, and pageDetails.title are required'
      });
    }

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

    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// WordPress URL analysis endpoint
app.post('/analyze-wp-url', async (req, res) => {
  try {
    const { url, options } = req.body;

    // Validate required fields
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: url is required'
      });
    }

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
    const input = {
      htmlContent: wpData.post_content,
      pageDetails,
      focusKeyword,
      synonyms
    };

    // Execute audit pipeline
    const result = await orchestrator.executeAuditPipeline(input, options || {});

    // Add WordPress-specific metadata to the response
    const enhancedResult = {
      ...result,
      wordpressData: {
        postId: wpData.id,
        site: supportedSite,
        extractedKeywords: keywords,
        seoMetadata: seoData
      }
    };

    res.json(enhancedResult);
  } catch (error) {
    console.error('WordPress analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
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

app.listen(3000, () => console.log('Server ready on port 3000.'));

module.exports = app;
