import { z } from 'zod';
import { wordPressSiteMap } from '../../config/wordpress';

// Configuration for proxy endpoints
export const PROXY_CONFIG = {
  useProxy: process.env.USE_WP_PROXY === 'true',
  proxyBaseUrl: process.env.PROXY_BASE_URL || 'http://localhost:3000',
  contentEndpoint: '/api/proxy/content',
  metadataEndpoint: '/api/proxy/metadata'
};

// Proxy response schemas
const proxyContentResponseSchema = z.object({
  success: z.boolean(),
  content: z.object({
    status: z.number(),
    data: z.object({
      id: z.number().optional(),
      title: z.string(),
      post_content: z.string(),
      post_date: z.string().or(z.string().datetime()),
      post_author: z.string().optional(),
      author: z.object({
        display_name: z.string(),
        user_nicename: z.string().optional(),
        email: z.string().optional(),
        id: z.string().optional()
      }).optional()
    })
  }).optional(),
  error: z.string().optional()
});

const proxyMetadataResponseSchema = z.object({
  success: z.boolean(),
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    focusKeyphrase: z.string()
  }).optional(),
  error: z.string().optional()
});

/**
 * Extract post ID from URL
 */
function extractPostId(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/\/article\/(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    return '';
  } catch (e) {
    console.error(`[WordPress Proxy] Error extracting post ID from URL '${url}':`, e);
    return '';
  }
}

/**
 * Call WordPress Article API through proxy
 */
export async function callWordPressArticleApiViaProxy(
  url: string,
  options: { timeout?: number } = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!PROXY_CONFIG.useProxy) {
      // If proxy is not enabled, fall back to direct API call
      const { callWordPressArticleApi } = require('./wordpress');
      return callWordPressArticleApi(url, options);
    }

    console.log('[WordPress Proxy] Using proxy for article API:', url);

    // Extract post ID and site info
    const postId = extractPostId(url);
    const hostname = new URL(url).hostname;
    const siteCode = wordPressSiteMap[hostname as keyof typeof wordPressSiteMap];

    if (!postId || !siteCode) {
      return { 
        success: false, 
        error: 'Could not extract post ID or determine site code from URL' 
      };
    }

    const proxyUrl = `${PROXY_CONFIG.proxyBaseUrl}${PROXY_CONFIG.contentEndpoint}`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: postId,
        siteCode: siteCode
      }),
      signal: AbortSignal.timeout(options.timeout || 30000)
    });

    if (!response.ok) {
      throw new Error(`Proxy returned ${response.status}`);
    }

    const rawData = await response.json();
    const validationResult = proxyContentResponseSchema.safeParse(rawData);

    if (!validationResult.success || !validationResult.data.success) {
      return { 
        success: false, 
        error: validationResult.data?.error || 'Proxy response validation failed' 
      };
    }

    return { 
      success: true, 
      data: validationResult.data.content?.data 
    };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('[WordPress Proxy] Article API failed:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Call WordPress SEO API through proxy
 */
export async function callWordPressSEOApiViaProxy(url: string): Promise<any | null> {
  try {
    if (!PROXY_CONFIG.useProxy) {
      // If proxy is not enabled, fall back to direct API call
      const { callWordPressSEOApi } = require('./wordpress');
      return callWordPressSEOApi(url);
    }

    console.log('[WordPress Proxy] Using proxy for SEO API:', url);

    const proxyUrl = `${PROXY_CONFIG.proxyBaseUrl}${PROXY_CONFIG.metadataEndpoint}`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceUrl: url
      })
    });

    if (!response.ok) {
      console.warn(`[WordPress Proxy] SEO API returned ${response.status} for URL: ${url}`);
      return null;
    }

    const rawData = await response.json();
    const validationResult = proxyMetadataResponseSchema.safeParse(rawData);

    if (!validationResult.success || !validationResult.data.success) {
      console.warn('[WordPress Proxy] SEO API response validation failed');
      return null;
    }

    return validationResult.data.metadata;
  } catch (error: any) {
    console.error(`[WordPress Proxy] Error fetching SEO data for ${url}:`, error);
    return null;
  }
}

/**
 * Check if proxy is configured and available
 */
export async function isProxyAvailable(): Promise<boolean> {
  if (!PROXY_CONFIG.useProxy) {
    return false;
  }

  try {
    const healthUrl = `${PROXY_CONFIG.proxyBaseUrl}/`;
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    console.warn('[WordPress Proxy] Proxy health check failed:', error);
    return false;
  }
}