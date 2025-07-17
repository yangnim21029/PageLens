/**
 * 文字和類型轉換工具
 * 統一處理字串解析、格式化等功能
 */

// 移除 lodash 依賴，使用原生 JavaScript

// ===================================
// 關鍵字處理
// ===================================

/**
 * 解析關鍵字字串為陣列
 * 支援多種分隔符：,、，、|、;、、等
 */
export function parseKeywordsFromString(keywordString: string): string[] {
  if (!keywordString || typeof keywordString !== 'string') return [];

  return keywordString.split(/[,，|;、\n\r\t]+/)
    .map(kw => kw.trim())
    .filter(kw => kw.length > 0);
}

/**
 * 將關鍵字陣列轉換為字串
 */
export function stringifyKeywords(keywords: string[]): string {
  if (!Array.isArray(keywords)) return '';
  return keywords
    .map((kw: string) => kw?.trim())
    .filter((kw: string) => kw && kw.length > 0)
    .join(', ');
}

/**
 * 解析關鍵字字串為關鍵字陣列（支援搜尋量）
 * 支援多種分隔格式：逗號、破折號、換行符
 * 範例：'keyword1 (100), keyword2 - keyword3 (300)'
 */
export function parseKeywordString(
  str: string
): Array<{ text: string; searchVolume?: number }> {
  if (!str || str.trim() === '') return [];

  // 支援多種分隔格式：逗號、破折號、換行符
  const separators = [',', '-', '\n'];
  let phrases: string[] = [];

  // 檢查是否使用分隔符
  let usedSeparator = false;
  for (const separator of separators) {
    if (str.includes(separator)) {
      phrases = str.split(separator);
      usedSeparator = true;
      break;
    }
  }

  // 如果沒有找到分隔符，當作單一關鍵字處理
  if (!usedSeparator) {
    phrases = [str];
  }

  return phrases
    .map((phrase: string) => {
      const trimmed = phrase.trim();
      // 提取括號中的搜尋量，例如 "keyword (123)" 或 "keyword（123）"
      const volumeMatch = trimmed.match(/(\(\d+\)|\（\d+\）)$/);
      if (volumeMatch) {
        const text = trimmed.replace(/\s*[\(\（]\d+[\)\）]$/, '').trim();
        const searchVolume = parseInt(
          volumeMatch[1].replace(/[\(\）\(\)]/g, ''),
          10
        );
        return { text, searchVolume };
      }
      return { text: trimmed };
    })
    .filter((k: any) => k.text.length > 0);
}

// ===================================
// 字串清理和格式化
// ===================================

/**
 * 清理字串 - 移除多餘空白和特殊字符
 */
export function cleanString(value: unknown): string {
  if (typeof value !== 'string') return String(value || '');
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * 轉換為日期字串 (YYYY-MM-DD 格式)
 */
export function toDateString(value: unknown): string | null {
  if (!value) return null;

  try {
    // 確保 value 是有效的日期輸入類型
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      const date = new Date(value);
      if (isNaN(date.getTime())) return null;

      // 轉換為 YYYY-MM-DD 格式
      return date.toISOString().split('T')[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 轉換為整數
 */
export function toInteger(value: unknown): number {
  const num = parseInt(String(value || '0'), 10);
  return isNaN(num) ? 0 : num;
}

/**
 * 轉換為布林值
 */
export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on', 'enabled'].includes(value.toLowerCase());
  }
  return Boolean(value);
}

/**
 * 轉換為數字（支援小數）
 */
export function toNumber(value: unknown): number {
  const num = parseFloat(String(value || '0'));
  return isNaN(num) ? 0 : num;
}

// ===================================
// URL 和路徑處理
// ===================================

/**
 * 從 URL 中提取域名
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * 檢查是否為有效的 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ===================================
// 文字截斷和摘要
// ===================================

/**
 * 截斷文字並添加省略號
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * 從 HTML 中提取純文字（簡單版本）
 */
export function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ===================================
// 資料驗證
// ===================================

/**
 * 檢查字串是否為空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 檢查是否為有效的電子郵件
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===================================
// 語言和地區處理
// ===================================

/**
 * 標準化語言代碼
 */
export function normalizeLanguageCode(lang: string): string {
  const languageMap: Record<string, string> = {
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

/**
 * 標準化地區代碼
 */
export function normalizeRegionCode(region: string): string {
  const regionMap: Record<string, string> = {
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

// ===================================
// AI 格式化工具（從 appSchema 移植）
// ===================================

/**
 * 格式化關鍵字陣列為 AI 可讀格式
 */
export function formatKeywordsForAi(keywords: string[]): string {
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

/**
 * 格式化網站資訊為 AI 可讀格式
 */
export function formatSiteInfoForAi(site: {
  name?: string;
  title?: string;
  description?: string;
  dr?: number;
  region?: string;
  language?: string;
}): string {
  return `網站名稱: ${site.name || 'Unknown'}
網站標題: ${site.title || 'N/A'}
網站描述: ${site.description || 'N/A'}
DR分數: ${site.dr || 'N/A'}
地區: ${site.region || 'N/A'}
語言: ${site.language || 'N/A'}`;
}

/**
 * 格式化查詢物件為 AI 可讀格式
 */
export function formatQueryForAi(query: {
  text?: string;
  language?: string;
  region?: string;
  searchVolume?: number;
}): string {
  return `查詢關鍵字: ${query.text || 'N/A'}
語言: ${query.language || 'N/A'}
地區: ${query.region || 'N/A'}
搜索量: ${query.searchVolume || 'N/A'}`;
}

/**
 * 格式化 SERP 結果為 AI 可讀的 XML 格式
 */
export function formatSerpForAi(serp: any, maxResults?: number): string {
  if (!serp) return '<serp_data>No SERP data available</serp_data>';

  const { query, organicResults, totalResults, aiOverview, relatedQueries } = serp;

  // 處理 organicResults 可能是對象或數組的情況
  let resultsArray: any[] = [];
  if (organicResults) {
    if (Array.isArray(organicResults)) {
      resultsArray = organicResults;
    } else if (typeof organicResults === 'object') {
      // 如果是對象，轉換為數組並按位置排序
      resultsArray = Object.values(organicResults).sort((a: any, b: any) => {
        return (a.position || 0) - (b.position || 0);
      });
    }
  }

  // 🎯 使用配置的結果數量，默認為所有結果（移除10個的硬限制）
  const limitedResults = maxResults ? resultsArray.slice(0, maxResults) : resultsArray;

  let xmlFormatted = '<serp_data>\n';

  // 搜索查詢信息
  xmlFormatted += `  <search_query>${escapeXml(query || 'N/A')}</search_query>\n`;
  xmlFormatted += `  <total_results>${totalResults || 0}</total_results>\n`;
  xmlFormatted += `  <results_count>${limitedResults.length}</results_count>\n`;

  // AI 概覽（如果有）
  if (aiOverview) {
    xmlFormatted += `  <ai_overview>${escapeXml(aiOverview)}</ai_overview>\n`;
  }

  // 有機搜索結果
  xmlFormatted += '  <organic_results>\n';
  limitedResults.forEach((result, index) => {
    xmlFormatted += `    <result position="${result.position || index + 1}">\n`;
    xmlFormatted += `      <title>${escapeXml(result.title || 'N/A')}</title>\n`;
    xmlFormatted += `      <url>${escapeXml(result.url || result.link || 'N/A')}</url>\n`;
    xmlFormatted += `      <description>${escapeXml(result.description || result.snippet || 'N/A')}</description>\n`;

    // 如果有 DR 數據
    if (result.ahrefs?.domain?.dr) {
      xmlFormatted += `      <domain_rating>${result.ahrefs.domain.dr}</domain_rating>\n`;
    }

    // 如果有其他相關數據
    if (result.displayedLink) {
      xmlFormatted += `      <displayed_link>${escapeXml(result.displayedLink)}</displayed_link>\n`;
    }

    xmlFormatted += '    </result>\n';
  });
  xmlFormatted += '  </organic_results>\n';

  // 相關查詢（如果有）
  if (relatedQueries && Array.isArray(relatedQueries) && relatedQueries.length > 0) {
    xmlFormatted += '  <related_queries>\n';
    relatedQueries.slice(0, 8).forEach((relatedQuery: any) => {
      xmlFormatted += `    <query>${escapeXml(relatedQuery.query || relatedQuery.text || relatedQuery)}</query>\n`;
    });
    xmlFormatted += '  </related_queries>\n';
  }

  xmlFormatted += '</serp_data>';

  return xmlFormatted;
}

/**
 * 轉義 XML 特殊字符
 */
function escapeXml(text: string): string {
  if (typeof text !== 'string') return String(text || '');

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

// ===================================
// 進度和狀態工具
// ===================================

/**
 * 計算 AI 內容生成進度
 */
export function calculateProgress(status: string): number {
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

/**
 * 檢查狀態是否已完成
 */
export function isStatusCompleted(status: string): boolean {
  return status === 'completed';
}

/**
 * 檢查狀態是否失敗
 */
export function isStatusFailed(status: string): boolean {
  return status === 'failed';
}

/**
 * 格式化關鍵字陣列為字符串，每行一個關鍵字，格式如 "keyword (1600)"
 */
export function formatKeywordArray(
  keywords: Array<{ text: string; searchVolume?: number }>
): string {
  return keywords
    .map(item => {
      if (item.searchVolume !== null && item.searchVolume !== undefined) {
        return `${item.text} (${item.searchVolume})`;
      }
      return item.text;
    })
    .join('\n');
}

// ===================================
// AI Prompt 生成工具（從 ai-formatting 移植）
// ===================================

/**
 * 創建 SEO 頁面關鍵字分析提示
 */
export function getSeoPageKeywordPrompt({
  articlePrompt,
  keywordsPrompt
}: {
  articlePrompt: string;
  keywordsPrompt: string;
}): string {
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

/**
 * 創建關鍵字分群文字提示
 */
export function createClusteringTextPrompt(keywords: string[]): string {
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

/**
 * 創建關鍵字分群轉換提示
 */
export function createClusteringConversionPrompt(analysisText: string): string {
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

/**
 * 創建內部連結提示包裝器
 */
export function createInternalLinkPromptWrapper(data: {
  contentType: string;
  mainKeywords: { text: string; searchVolume?: number | null }[];
  businessType?: string;
  targetAudience?: string;
  contentLength: string;
  region: string;
  googleSuggestions: string[];
}): string {
  return `請先分析以下主題，並選擇一位在這個領域最有影響力、最容易帶來流量的專家或名人來提供內部連結置入建議：

**內容基本資訊：**
- 內容類型：${data.contentType}
- 目標關鍵字：${data.mainKeywords.map(kw => `${kw.text} (搜索量: ${kw.searchVolume || 0})`).join(', ')}
- 企業類型：${data.businessType || '一般企業'}
- 目標受眾：${data.targetAudience || '一般消費者'}
- 內容長度：${data.contentLength}
- 地區：${data.region}

${
  data.googleSuggestions.length > 0
    ? `**Google 建議的延伸議題：**
${data.googleSuggestions
  .slice(0, 15)
  .map(s => `- ${s}`)
  .join('\n')}`
    : ''
}

請提供詳細的內部連結置入建議，包括自然置入點、錨點文字建議和內容優化建議。`;
}

/**
 * 創建內容大綱提示
 */
export function createContentOutlinePrompt({
  targetKeyword,
  contentType,
  targetAudience,
  region,
  language
}: {
  targetKeyword: { text: string };
  contentType: string;
  targetAudience?: string;
  region: string;
  language: string;
}): string {
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

/**
 * 創建關鍵字機會提示
 */
export function createKeywordOpportunityPrompt(data: {
  targetKeyword: string;
  contentType: string;
  region: string;
  language: string;
}): string {
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

// ===================================
// Zod Schema 定義（簡化版）
// ===================================

