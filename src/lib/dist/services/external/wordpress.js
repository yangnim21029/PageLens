"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callWordPressSEOApi = callWordPressSEOApi;
exports.callWordPressArticleApi = callWordPressArticleApi;
exports.getKeywordByWordPress = getKeywordByWordPress;
exports.getArticleHtmlByWordPress = getArticleHtmlByWordPress;
exports.getArticleTextByWordPress = getArticleTextByWordPress;
exports.getSeoPageByWordPress = getSeoPageByWordPress;
const zod_1 = require("zod");
const wordpress_1 = require("../../config/wordpress");
const formatDataForAi_1 = require("../../utils/formatDataForAi");
const mappingTool_1 = require("../../utils/mappingTool");
const content_extractor_service_1 = require("../../app/understanding-the-page/extractors/content-extractor.service");
const wpSeoDataSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    focusKeyphrase: zod_1.z.string()
});
const wpArticleDataSchema = zod_1.z.object({
    title: zod_1.z.string(),
    post_content: zod_1.z.string(),
    post_date: zod_1.z.string(),
    author: zod_1.z.object({
        display_name: zod_1.z.string()
    })
});
function _extractPostId(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const match = pathname.match(/\/article\/(\d+)/);
        if (match && match[1]) {
            return match[1];
        }
        const parts = pathname.split('/').filter(part => part.length > 0);
        const lastSegment = parts.pop();
        if (lastSegment && /^\d+$/.test(lastSegment)) {
            if (!(parts.length > 0 &&
                parts[parts.length - 1].toLowerCase() === 'article')) {
                console.warn(`[WordPress Client - _extractPostId] Extracted numeric ID '${lastSegment}' from end of path '${pathname}', but it wasn't in '/article/ID' format.`);
                return lastSegment;
            }
        }
        console.warn(`[WordPress Client - _extractPostId] Could not extract numeric Post ID from path: ${pathname} using /article/ID format.`);
        return '';
    }
    catch (e) {
        console.error(`[WordPress Client - _extractPostId] Error parsing URL '${url}':`, e);
        return '';
    }
}
function _parseFocusKeyphrase(focusKeyphrase) {
    if (!focusKeyphrase || focusKeyphrase.trim() === '') {
        return {
            keywords: []
        };
    }
    const keywords = (0, formatDataForAi_1.parseKeywordsFromString)(focusKeyphrase);
    return {
        keywords
    };
}
function _convertWordPressToSeoPage(wpData, url, projectId, seoData) {
    console.log('[WordPress Client - _convertWordPressToSeoPage] 開始轉換 WordPress 數據:', {
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
    });
    const articleData = (0, mappingTool_1.mapData)(wpData, mappingTool_1.MAPPING_CONFIG.wordpress.article);
    const mappedSeoData = (0, mappingTool_1.mapData)(seoData || {}, mappingTool_1.MAPPING_CONFIG.wordpress.seo);
    return (0, mappingTool_1.createSeoPage)({ ...articleData, ...mappedSeoData }, {
        url,
        projectId,
        scrapeBy: 'wp-api'
    });
}
async function callWordPressSEOApi(url) {
    try {
        const wpApiUrl = `${wordpress_1.WP_ARTICLE_SEO_URL}`;
        console.log(`[WordPress Client - callWordPressSEOApi] Fetching SEO data from: ${wpApiUrl}`);
        const response = await fetch(wpApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        if (!response.ok) {
            console.warn(`[WordPress Client - callWordPressSEOApi] WordPress SEO API returned ${response.status} for URL: ${url}`);
            return null;
        }
        const rawData = await response.json();
        console.log(`[WordPress Client - callWordPressSEOApi] Raw WordPress SEO API response:`, rawData);
        const validatedData = wpSeoDataSchema.parse(rawData);
        console.log(`[WordPress Client - callWordPressSEOApi] Validated WordPress SEO data:`, validatedData);
        return validatedData;
    }
    catch (error) {
        console.error(`[WordPress Client - callWordPressSEOApi] Error fetching SEO data for ${url}:`, error);
        return null;
    }
}
async function callWordPressArticleApi(url, options = {}) {
    try {
        console.log('[WordPress Client - callWordPressArticleApi] Attempting to call article API:', url);
        const postId = _extractPostId(url);
        let formattedSiteCode = null;
        const hostname = new URL(url).hostname;
        const mappedSite = wordpress_1.wordPressSiteMap[hostname];
        if (mappedSite) {
            formattedSiteCode = mappedSite;
            console.log(`[WordPress Client - callWordPressArticleApi] 使用映射表中的 site 代碼: ${formattedSiteCode} for ${hostname}`);
        }
        if (!postId) {
            console.warn(`[WordPress Client - callWordPressArticleApi] Could not extract post ID from URL: ${url}`);
            return { success: false, error: 'Could not extract post ID from URL' };
        }
        if (!formattedSiteCode) {
            console.warn(`[WordPress Client - callWordPressArticleApi] Could not determine site code for URL: ${url}`);
            return { success: false, error: 'Could not determine site code for URL' };
        }
        const wpApiUrl = `https://article-api.presslogic.com/v1/articles/${postId}?site=${formattedSiteCode}`;
        console.log(`[WordPress Client - callWordPressArticleApi] Fetching from: ${wpApiUrl}`);
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
            console.error(`[WordPress Client - callWordPressArticleApi] Zod validation failed for ${url}:`, validationResult.error.flatten());
            return { success: false, error: 'Response validation failed' };
        }
        return { success: true, data: validationResult.data };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('[WordPress Client - callWordPressArticleApi] Failed:', errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}
async function getKeywordByWordPress(url) {
    try {
        const validatedData = await callWordPressSEOApi(url);
        if (!validatedData) {
            return null;
        }
        const keywords = _parseFocusKeyphrase(validatedData.focusKeyphrase).keywords;
        console.log(`[WordPress Client - getKeywordByWordPress] Parsed keywords for ${url}:`, keywords);
        return keywords;
    }
    catch (error) {
        console.error(`[WordPress Client - getKeywordByWordPress] Error processing keyword data for ${url}:`, error);
        return null;
    }
}
async function getArticleHtmlByWordPress(url) {
    const response = await callWordPressArticleApi(url);
    if (response.success && response.data) {
        const html = response.data.post_content;
        const article = await (0, content_extractor_service_1.htmlToTextByMozReadability)(html);
        return article || null;
    }
    return null;
}
async function getArticleTextByWordPress(url) {
    const response = await callWordPressArticleApi(url);
    if (response.success && response.data) {
        const html = response.data.post_content;
        const article = await (0, content_extractor_service_1.htmlToTextByMozReadability)(html);
        return article || null;
    }
    return null;
}
async function getSeoPageByWordPress(url, projectId) {
    try {
        const hostname = new URL(url).hostname;
        const supportedSite = wordpress_1.wordPressSiteMap[hostname];
        if (!supportedSite) {
            console.warn(`[WordPress Client - getSeoPageByWordPress] Site ${hostname} is not supported by WordPress API, skipping`);
            return null;
        }
        const promises = [callWordPressSEOApi(url), callWordPressArticleApi(url)];
        const [seoData, articleResult] = await Promise.all(promises);
        if (!seoData) {
            console.warn('[WordPress Client - getSeoPageByWordPress] No SEO data available');
        }
        const keywords = _parseFocusKeyphrase(seoData?.focusKeyphrase || '').keywords;
        if (keywords.length === 0) {
            console.warn(`[WordPress Client - getSeoPageByWordPress] No focus keyphrase found for ${url}, returning empty keywords array`);
        }
        let seoPage;
        if (articleResult.success && articleResult.data) {
            seoPage = _convertWordPressToSeoPage(articleResult.data, url, projectId, seoData);
        }
        else {
            const errorMessage = `WordPress Article API failed: ${articleResult.error || 'No article data'}`;
            console.warn(`[WordPress Client - getSeoPageByWordPress] ${errorMessage}, throwing error to trigger fallback`);
            throw new Error(errorMessage);
        }
        const truncate = (text, maxLength = 100) => {
            if (!text)
                return '';
            return text.length > maxLength
                ? text.substring(0, maxLength) + '...'
                : text;
        };
        console.log(`[WordPress Client - getSeoPageByWordPress] Successfully processed: ${url}`, {
            keywords,
            hasArticleContent: articleResult.success,
            byline: truncate(seoPage.byline || '', 40),
            publishedDate: seoPage.publishedDate
        });
        return seoPage;
    }
    catch (error) {
        console.error(`[WordPress Client - getSeoPageByWordPress] Error processing ${url}:`, error);
        return null;
    }
}
//# sourceMappingURL=wordpress.js.map