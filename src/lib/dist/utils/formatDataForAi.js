"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKeywordsFromString = parseKeywordsFromString;
exports.stringifyKeywords = stringifyKeywords;
exports.parseKeywordString = parseKeywordString;
exports.cleanString = cleanString;
exports.toDateString = toDateString;
exports.toInteger = toInteger;
exports.toBoolean = toBoolean;
exports.toNumber = toNumber;
exports.extractDomain = extractDomain;
exports.isValidUrl = isValidUrl;
exports.truncateText = truncateText;
exports.stripHtmlTags = stripHtmlTags;
exports.isEmpty = isEmpty;
exports.isValidEmail = isValidEmail;
exports.normalizeLanguageCode = normalizeLanguageCode;
exports.normalizeRegionCode = normalizeRegionCode;
exports.formatKeywordsForAi = formatKeywordsForAi;
exports.formatSiteInfoForAi = formatSiteInfoForAi;
exports.formatQueryForAi = formatQueryForAi;
exports.formatSerpForAi = formatSerpForAi;
exports.calculateProgress = calculateProgress;
exports.isStatusCompleted = isStatusCompleted;
exports.isStatusFailed = isStatusFailed;
exports.formatKeywordArray = formatKeywordArray;
exports.getSeoPageKeywordPrompt = getSeoPageKeywordPrompt;
exports.createClusteringTextPrompt = createClusteringTextPrompt;
exports.createClusteringConversionPrompt = createClusteringConversionPrompt;
exports.createInternalLinkPromptWrapper = createInternalLinkPromptWrapper;
exports.createContentOutlinePrompt = createContentOutlinePrompt;
exports.createKeywordOpportunityPrompt = createKeywordOpportunityPrompt;
function parseKeywordsFromString(keywordString) {
    if (!keywordString || typeof keywordString !== 'string')
        return [];
    return keywordString.split(/[,，|;、\n\r\t]+/)
        .map(kw => kw.trim())
        .filter(kw => kw.length > 0);
}
function stringifyKeywords(keywords) {
    if (!Array.isArray(keywords))
        return '';
    return keywords
        .map((kw) => kw?.trim())
        .filter((kw) => kw && kw.length > 0)
        .join(', ');
}
function parseKeywordString(str) {
    if (!str || str.trim() === '')
        return [];
    const separators = [',', '-', '\n'];
    let phrases = [];
    let usedSeparator = false;
    for (const separator of separators) {
        if (str.includes(separator)) {
            phrases = str.split(separator);
            usedSeparator = true;
            break;
        }
    }
    if (!usedSeparator) {
        phrases = [str];
    }
    return phrases
        .map((phrase) => {
        const trimmed = phrase.trim();
        const volumeMatch = trimmed.match(/(\(\d+\)|\（\d+\）)$/);
        if (volumeMatch) {
            const text = trimmed.replace(/\s*[\(\（]\d+[\)\）]$/, '').trim();
            const searchVolume = parseInt(volumeMatch[1].replace(/[\(\）\(\)]/g, ''), 10);
            return { text, searchVolume };
        }
        return { text: trimmed };
    })
        .filter((k) => k.text.length > 0);
}
function cleanString(value) {
    if (typeof value !== 'string')
        return String(value || '');
    return value.trim().replace(/\s+/g, ' ');
}
function toDateString(value) {
    if (!value)
        return null;
    try {
        if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
            const date = new Date(value);
            if (isNaN(date.getTime()))
                return null;
            return date.toISOString().split('T')[0];
        }
        return null;
    }
    catch {
        return null;
    }
}
function toInteger(value) {
    const num = parseInt(String(value || '0'), 10);
    return isNaN(num) ? 0 : num;
}
function toBoolean(value) {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string') {
        return ['true', '1', 'yes', 'on', 'enabled'].includes(value.toLowerCase());
    }
    return Boolean(value);
}
function toNumber(value) {
    const num = parseFloat(String(value || '0'));
    return isNaN(num) ? 0 : num;
}
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    }
    catch {
        return '';
    }
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function truncateText(text, maxLength = 100) {
    if (!text || typeof text !== 'string')
        return '';
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength).trim() + '...';
}
function stripHtmlTags(html) {
    if (!html || typeof html !== 'string')
        return '';
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function isEmpty(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value === 'string')
        return value.trim().length === 0;
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function normalizeLanguageCode(lang) {
    const languageMap = {
        zh: 'zh-TW',
        'zh-tw': 'zh-TW',
        'zh-cn': 'zh-CN',
        en: 'en-US',
        'en-us': 'en-US',
        ja: 'ja-JP',
        ko: 'ko-KR'
    };
    return languageMap[lang.toLowerCase()] || lang;
}
function normalizeRegionCode(region) {
    const regionMap = {
        taiwan: 'TW',
        tw: 'TW',
        china: 'CN',
        cn: 'CN',
        usa: 'US',
        us: 'US',
        japan: 'JP',
        jp: 'JP',
        korea: 'KR',
        kr: 'KR'
    };
    return regionMap[region.toLowerCase()] || region.toUpperCase();
}
function formatKeywordsForAi(keywords) {
    if (!keywords || keywords.length === 0) {
        return 'No keywords available';
    }
    return keywords
        .map((keyword, index) => {
        const label = index === 0 ? '主要關鍵字' : `追蹤關鍵字 ${index}`;
        return `${label}: ${keyword}`;
    })
        .join('\n');
}
function formatSiteInfoForAi(site) {
    return `網站名稱: ${site.name || 'Unknown'}
網站標題: ${site.title || 'N/A'}
網站描述: ${site.description || 'N/A'}
DR分數: ${site.dr || 'N/A'}
地區: ${site.region || 'N/A'}
語言: ${site.language || 'N/A'}`;
}
function formatQueryForAi(query) {
    return `查詢關鍵字: ${query.text || 'N/A'}
語言: ${query.language || 'N/A'}
地區: ${query.region || 'N/A'}
搜索量: ${query.searchVolume || 'N/A'}`;
}
function formatSerpForAi(serp, maxResults) {
    if (!serp)
        return '<serp_data>No SERP data available</serp_data>';
    const { query, organicResults, totalResults, aiOverview, relatedQueries } = serp;
    let resultsArray = [];
    if (organicResults) {
        if (Array.isArray(organicResults)) {
            resultsArray = organicResults;
        }
        else if (typeof organicResults === 'object') {
            resultsArray = Object.values(organicResults).sort((a, b) => {
                return (a.position || 0) - (b.position || 0);
            });
        }
    }
    const limitedResults = maxResults ? resultsArray.slice(0, maxResults) : resultsArray;
    let xmlFormatted = '<serp_data>\n';
    xmlFormatted += `  <search_query>${escapeXml(query || 'N/A')}</search_query>\n`;
    xmlFormatted += `  <total_results>${totalResults || 0}</total_results>\n`;
    xmlFormatted += `  <results_count>${limitedResults.length}</results_count>\n`;
    if (aiOverview) {
        xmlFormatted += `  <ai_overview>${escapeXml(aiOverview)}</ai_overview>\n`;
    }
    xmlFormatted += '  <organic_results>\n';
    limitedResults.forEach((result, index) => {
        xmlFormatted += `    <result position="${result.position || index + 1}">\n`;
        xmlFormatted += `      <title>${escapeXml(result.title || 'N/A')}</title>\n`;
        xmlFormatted += `      <url>${escapeXml(result.url || result.link || 'N/A')}</url>\n`;
        xmlFormatted += `      <description>${escapeXml(result.description || result.snippet || 'N/A')}</description>\n`;
        if (result.ahrefs?.domain?.dr) {
            xmlFormatted += `      <domain_rating>${result.ahrefs.domain.dr}</domain_rating>\n`;
        }
        if (result.displayedLink) {
            xmlFormatted += `      <displayed_link>${escapeXml(result.displayedLink)}</displayed_link>\n`;
        }
        xmlFormatted += '    </result>\n';
    });
    xmlFormatted += '  </organic_results>\n';
    if (relatedQueries && Array.isArray(relatedQueries) && relatedQueries.length > 0) {
        xmlFormatted += '  <related_queries>\n';
        relatedQueries.slice(0, 8).forEach((relatedQuery) => {
            xmlFormatted += `    <query>${escapeXml(relatedQuery.query || relatedQuery.text || relatedQuery)}</query>\n`;
        });
        xmlFormatted += '  </related_queries>\n';
    }
    xmlFormatted += '</serp_data>';
    return xmlFormatted;
}
function escapeXml(text) {
    if (typeof text !== 'string')
        return String(text || '');
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function calculateProgress(status) {
    switch (status) {
        case 'failed':
            return 0;
        case 'completed':
            return 100;
        case 'generating':
            return 50;
        case 'pending':
        default:
            return 0;
    }
}
function isStatusCompleted(status) {
    return status === 'completed';
}
function isStatusFailed(status) {
    return status === 'failed';
}
function formatKeywordArray(keywords) {
    return keywords
        .map(item => {
        if (item.searchVolume !== null && item.searchVolume !== undefined) {
            return `${item.text} (${item.searchVolume})`;
        }
        return item.text;
    })
        .join('\n');
}
function getSeoPageKeywordPrompt({ articlePrompt, keywordsPrompt }) {
    return `你是一位專業的 SEO 關鍵字研究專家。請分析以下文章內容，並根據提供的關鍵字提示，選擇最合適的關鍵字。

**文章內容：**
${truncateText(articlePrompt, 2000)}

**關鍵字提示：**
${keywordsPrompt}

**任務：**
1. 仔細分析文章內容的主題和核心概念
2. 根據關鍵字提示，選擇最相關且具有SEO價值的關鍵字
3. 確保關鍵字與文章內容高度相關
4. 優先選擇具有商業價值和搜索量的關鍵字

請返回一個關鍵字陣列，包含3-8個最適合的關鍵字。`;
}
function createClusteringTextPrompt(keywords) {
    return `你是一位專業的 SEO 關鍵字研究專家，擅長語義分析和關鍵字分群。

**任務：** 分析以下關鍵字列表，將它們按照語義相關性進行分群。

**關鍵字列表：**
${keywords.join('\n')}

**分析要求：**
1. 識別關鍵字的主題和意圖
2. 根據語義相關性進行分群
3. 為每個分群命名
4. 解釋分群的邏輯

**輸出格式：**
為每個分群提供：
- 分群名稱
- 包含的關鍵字
- 分群說明
- 用戶意圖分析

請用繁體中文回應。`;
}
function createClusteringConversionPrompt(analysisText) {
    return `請將以下關鍵字分群分析轉換為結構化的 JSON 格式：

${analysisText}

請將分析結果轉換為以下格式：
{
  "clusters": [
    {
      "clusterName": "分群名稱",
      "keywords": ["關鍵字1", "關鍵字2"],
      "description": "分群說明",
      "userIntent": "用戶意圖分析"
    }
  ]
}`;
}
function createInternalLinkPromptWrapper(data) {
    return `請先分析以下主題，並選擇一位在這個領域最有影響力、最容易帶來流量的專家或名人來提供內部連結置入建議：

**內容基本資訊：**
- 內容類型：${data.contentType}
- 目標關鍵字：${data.mainKeywords.map(kw => `${kw.text} (搜索量: ${kw.searchVolume || 0})`).join(', ')}
- 企業類型：${data.businessType || '一般企業'}
- 目標受眾：${data.targetAudience || '一般消費者'}
- 內容長度：${data.contentLength}
- 地區：${data.region}

${data.googleSuggestions.length > 0
        ? `**Google 建議的延伸議題：**
${data.googleSuggestions
            .slice(0, 15)
            .map(s => `- ${s}`)
            .join('\n')}`
        : ''}

請提供詳細的內部連結置入建議，包括自然置入點、錨點文字建議和內容優化建議。`;
}
function createContentOutlinePrompt({ targetKeyword, contentType, targetAudience, region, language }) {
    return `你是一位專業的內容策略師，專精於創建SEO優化的內容大綱。

**任務：** 為目標關鍵字「${targetKeyword.text}」創建詳細的內容大綱

**內容參數：**
- 內容類型：${contentType}
- 目標受眾：${targetAudience || '一般讀者'}
- 地區：${region}
- 語言：${language}

**大綱要求：**
1. **主標題** - 包含目標關鍵字
2. **內容結構** - 6-8個主要段落
3. **SEO優化** - 關鍵字分佈建議
4. **用戶價值** - 每段落的價值主張
5. **行動呼籲** - 適當的CTA建議

請確保大綱符合SEO最佳實踐，並提供高價值內容。`;
}
function createKeywordOpportunityPrompt(data) {
    return `你是一位專業的SEO關鍵字研究專家。請為目標關鍵字「${data.targetKeyword}」分析關鍵字機會。

**分析參數：**
- 內容類型：${data.contentType}
- 地區：${data.region}
- 語言：${data.language}

**分析要求：**
1. 識別相關的長尾關鍵字機會
2. 分析競爭程度和搜索意圖
3. 提供關鍵字優化建議
4. 建議內容策略方向

請提供具體可行的關鍵字機會分析。`;
}
//# sourceMappingURL=formatDataForAi.js.map