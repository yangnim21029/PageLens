import { z } from 'zod';
import { WP_ARTICLE_SEO_URL, wordPressSiteMap } from '../../config/wordpress';
import type { NewSeoPage } from '../../types/wordpress';
import { parseKeywordsFromString } from '../../utils/formatDataForAi';
import {
  MAPPING_CONFIG,
  createSeoPage,
  mapData
} from '../../utils/mappingTool';
import { htmlToTextByMozReadability } from '../../app/understanding-the-page/extractors/content-extractor.service';

// ====================================================================
// SCHEMAS - DO NOT MODIFY
// ====================================================================
const wpSeoDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  focusKeyphrase: z.string()
  // relatedKeyphrase: z.array(z.string()) // 這個不會用到
});

type wpSeoData = z.infer<typeof wpSeoDataSchema>;

const wpArticleDataSchema = z.object({
  title: z.string(),
  post_content: z.string(),
  post_date: z.string(),
  author: z.object({
    display_name: z.string()
  })
});

type wpArticleData = z.infer<typeof wpArticleDataSchema>;

// 移除重複定義，使用配置文件中的
// ====================================================================
// UTILITY FUNCTIONS - STABLE - DO NOT MODIFY
// ====================================================================

function _extractPostId(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const match = pathname.match(/\/article\/(\d+)/);
    if (match && match[1]) {
      return match[1]; // e.g., "746508"
    }
    // Fallback if the primary regex doesn't match, though /article/ID should be standard
    const parts = pathname.split('/').filter(part => part.length > 0);
    const lastSegment = parts.pop();
    if (lastSegment && /^\d+$/.test(lastSegment)) {
      // Check if the segment before the numeric one is not 'article' to avoid re-matching what regex should have caught
      if (
        !(
          parts.length > 0 &&
          parts[parts.length - 1].toLowerCase() === 'article'
        )
      ) {
        console.warn(
          `[WordPress Client - _extractPostId] Extracted numeric ID '${lastSegment}' from end of path '${pathname}', but it wasn't in '/article/ID' format.`
        );
        return lastSegment;
      }
    }
    console.warn(
      `[WordPress Client - _extractPostId] Could not extract numeric Post ID from path: ${pathname} using /article/ID format.`
    );
    return ''; // Return empty string if no numeric ID found
  } catch (e) {
    console.error(
      `[WordPress Client - _extractPostId] Error parsing URL '${url}':`,
      e
    );
    return '';
  }
}

/**
 * Parse focus keyphrase from WordPress API
 * Supports multiple separators: -, ,, 、, |, ;, etc.
 * First keyword becomes main keyword, rest become tracking keywords
 * Supports both "keyword(volume)" and "keyword" formats
 * @param focusKeyphrase - The focus keyphrase string from WordPress
 * @returns Object with mainKeyword and trackingKeywords
 */
function _parseFocusKeyphrase(focusKeyphrase: string): {
  keywords: string[];
} {
  if (!focusKeyphrase || focusKeyphrase.trim() === '') {
    return {
      keywords: []
    };
  }

  const keywords = parseKeywordsFromString(focusKeyphrase);

  return {
    keywords
  };
}

/**
 * 轉換 WordPress 數據為 SeoPage 格式
 */
function _convertWordPressToSeoPage(
  wpData: wpArticleData,
  url: string,
  projectId: string,
  seoData?: wpSeoData
): any {
  console.log(
    '[WordPress Client - _convertWordPressToSeoPage] 開始轉換 WordPress 數據:',
    {
      hasWpData: !!wpData,
      wpDataKeys: wpData ? Object.keys(wpData) : [],
      h1: wpData?.title,
      hasPostContent: !!wpData?.post_content,
      postContentLength: wpData?.post_content?.length || 0,
      author: wpData?.author?.display_name,
      postDate: wpData?.post_date,
      focusKeyphrase: seoData?.focusKeyphrase,
      metaTitle: seoData?.title,
      metaDescription: seoData?.description
    }
  );

  // 使用新的映射工具
  const articleData = mapData(wpData, MAPPING_CONFIG.wordpress.article);
  const mappedSeoData = mapData(seoData || {}, MAPPING_CONFIG.wordpress.seo);

  return createSeoPage(
    { ...articleData, ...mappedSeoData },
    {
      url,
      projectId,
      scrapeBy: 'wp-api'
    }
  );
}

// ====================================================================
// API CALLING FUNCTIONS - INTERNAL
// ====================================================================

/**
 * 調用 WordPress SEO API（POST 請求）
 */
export async function callWordPressSEOApi(url: string): Promise<any | null> {
  try {
    const wpApiUrl = `${WP_ARTICLE_SEO_URL}`;
    console.log(
      `[WordPress Client - callWordPressSEOApi] Fetching SEO data from: ${wpApiUrl}`
    );

    const response = await fetch(wpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      console.warn(
        `[WordPress Client - callWordPressSEOApi] WordPress SEO API returned ${response.status} for URL: ${url}`
      );
      return null;
    }

    const rawData = await response.json();
    console.log(
      `[WordPress Client - callWordPressSEOApi] Raw WordPress SEO API response:`,
      rawData
    );

    const validatedData = wpSeoDataSchema.parse(rawData);
    console.log(
      `[WordPress Client - callWordPressSEOApi] Validated WordPress SEO data:`,
      validatedData
    );

    return validatedData;
  } catch (error: any) {
    console.error(
      `[WordPress Client - callWordPressSEOApi] Error fetching SEO data for ${url}:`,
      error
    );
    return null;
  }
}

/**
 * 調用 WordPress 文章 API（GET 請求）
 */
export async function callWordPressArticleApi(
  url: string,
  options: { timeout?: number } = {}
): Promise<{ success: boolean; data?: wpArticleData; error?: string }> {
  try {
    console.log(
      '[WordPress Client - callWordPressArticleApi] Attempting to call article API:',
      url
    );

    // 從 URL 中提取 post ID 和 site info
    const postId = _extractPostId(url);

    let formattedSiteCode: string | null = null;

    // 直接使用映射表獲取 site 代碼（WordPress 有自己的 site 列表）
    const hostname = new URL(url).hostname;
    const mappedSite =
      wordPressSiteMap[hostname as keyof typeof wordPressSiteMap];
    if (mappedSite) {
      formattedSiteCode = mappedSite;
      console.log(
        `[WordPress Client - callWordPressArticleApi] 使用映射表中的 site 代碼: ${formattedSiteCode} for ${hostname}`
      );
    }

    if (!postId) {
      console.warn(
        `[WordPress Client - callWordPressArticleApi] Could not extract post ID from URL: ${url}`
      );
      return { success: false, error: 'Could not extract post ID from URL' };
    }

    if (!formattedSiteCode) {
      console.warn(
        `[WordPress Client - callWordPressArticleApi] Could not determine site code for URL: ${url}`
      );
      return { success: false, error: 'Could not determine site code for URL' };
    }

    const wpApiUrl = `https://article-api.presslogic.com/v1/articles/${postId}?site=${formattedSiteCode}`;
    console.log(
      `[WordPress Client - callWordPressArticleApi] Fetching from: ${wpApiUrl}`
    );

    const response = await fetch(wpApiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(options.timeout || 30000)
    });

    if (!response.ok) {
      throw new Error(`WordPress Article API returned ${response.status}`);
    }

    const rawData = await response.json();
    const validationResult = wpArticleDataSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error(
        `[WordPress Client - callWordPressArticleApi] Zod validation failed for ${url}:`,
        validationResult.error.flatten()
      );
      return { success: false, error: 'Response validation failed' };
    }

    return { success: true, data: validationResult.data };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      '[WordPress Client - callWordPressArticleApi] Failed:',
      errorMessage
    );

    return {
      success: false,
      error: errorMessage
    };
  }
}

// ====================================================================
// PUBLIC EXPORTED FUNCTIONS
// ====================================================================

/**
 * 獲取 WordPress 文章關鍵字
 */
export async function getKeywordByWordPress(
  url: string
): Promise<string[] | null> {
  try {
    const validatedData = await callWordPressSEOApi(url);
    if (!validatedData) {
      return null;
    }

    const keywords = _parseFocusKeyphrase(
      validatedData.focusKeyphrase
    ).keywords;

    console.log(
      `[WordPress Client - getKeywordByWordPress] Parsed keywords for ${url}:`,
      keywords
    );
    return keywords;
  } catch (error: any) {
    console.error(
      `[WordPress Client - getKeywordByWordPress] Error processing keyword data for ${url}:`,
      error
    );
    return null;
  }
}

/**
 * 獲取 WordPress 文章內容
 */
export async function getArticleHtmlByWordPress(
  url: string
): Promise<string | null> {
  const response = await callWordPressArticleApi(url);
  if (response.success && response.data) {
    const html = response.data.post_content;
    const article = await htmlToTextByMozReadability(html);
    return article || null;
  }
  return null;
}

export async function getArticleTextByWordPress(
  url: string
): Promise<string | null> {
  const response = await callWordPressArticleApi(url);
  if (response.success && response.data) {
    const html = response.data.post_content;
    const article = await htmlToTextByMozReadability(html);
    return article || null;
  }
  return null;
}

/**
 * 獲取完整的 SEO 頁面數據，包含關鍵字和內容
 */
export async function getSeoPageByWordPress(
  url: string,
  projectId: string
): Promise<NewSeoPage | null> {
  try {
    // WordPress API 支持檢查移至映射表邏輯
    const hostname = new URL(url).hostname;
    const supportedSite =
      wordPressSiteMap[hostname as keyof typeof wordPressSiteMap];

    if (!supportedSite) {
      console.warn(
        `[WordPress Client - getSeoPageByWordPress] Site ${hostname} is not supported by WordPress API, skipping`
      );
      return null;
    }

    // 並行獲取關鍵字數據和文章數據
    const promises = [callWordPressSEOApi(url), callWordPressArticleApi(url)];
    const [seoData, articleResult] = await Promise.all(promises);

    if (!seoData) {
      console.warn(
        '[WordPress Client - getSeoPageByWordPress] No SEO data available'
      );
    }

    // 解析關鍵字
    const keywords = _parseFocusKeyphrase(seoData?.focusKeyphrase || '').keywords;
    
    // 如果沒有關鍵字，記錄警告但不使用預設值
    if (keywords.length === 0) {
      console.warn(
        `[WordPress Client - getSeoPageByWordPress] No focus keyphrase found for ${url}, returning empty keywords array`
      );
      // 不使用預設值，讓系統知道確實沒有設定關鍵字
    }
    // 如果有文章數據，使用文章數據；否則拋出錯誤讓 scrapeWithFallback 回退到 Moz
    let seoPage: NewSeoPage;
    if (articleResult.success && articleResult.data) {
      seoPage = _convertWordPressToSeoPage(
        articleResult.data,
        url,
        projectId,
        seoData
      );
    } else {
      // Article API 失敗時，拋出錯誤讓系統回退到 Moz
      const errorMessage = `WordPress Article API failed: ${
        articleResult.error || 'No article data'
      }`;
      console.warn(
        `[WordPress Client - getSeoPageByWordPress] ${errorMessage}, throwing error to trigger fallback`
      );
      throw new Error(errorMessage);
    }

    // 輔助函數：截斷長文本用於日誌
    const truncate = (text: string | undefined, maxLength: number = 100) => {
      if (!text) return '';
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
    };

    console.log(
      `[WordPress Client - getSeoPageByWordPress] Successfully processed: ${url}`,
      {
        keywords,
        hasArticleContent: articleResult.success,
        byline: truncate(seoPage.byline || '', 40),
        publishedDate: seoPage.publishedDate
      }
    );

    return seoPage;
  } catch (error: any) {
    console.error(
      `[WordPress Client - getSeoPageByWordPress] Error processing ${url}:`,
      error
    );
    return null;
  }
}
