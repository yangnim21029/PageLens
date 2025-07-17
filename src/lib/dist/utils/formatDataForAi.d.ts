export declare function parseKeywordsFromString(keywordString: string): string[];
export declare function stringifyKeywords(keywords: string[]): string;
export declare function parseKeywordString(str: string): Array<{
    text: string;
    searchVolume?: number;
}>;
export declare function cleanString(value: unknown): string;
export declare function toDateString(value: unknown): string | null;
export declare function toInteger(value: unknown): number;
export declare function toBoolean(value: unknown): boolean;
export declare function toNumber(value: unknown): number;
export declare function extractDomain(url: string): string;
export declare function isValidUrl(url: string): boolean;
export declare function truncateText(text: string, maxLength?: number): string;
export declare function stripHtmlTags(html: string): string;
export declare function isEmpty(value: unknown): boolean;
export declare function isValidEmail(email: string): boolean;
export declare function normalizeLanguageCode(lang: string): string;
export declare function normalizeRegionCode(region: string): string;
export declare function formatKeywordsForAi(keywords: string[]): string;
export declare function formatSiteInfoForAi(site: {
    name?: string;
    title?: string;
    description?: string;
    dr?: number;
    region?: string;
    language?: string;
}): string;
export declare function formatQueryForAi(query: {
    text?: string;
    language?: string;
    region?: string;
    searchVolume?: number;
}): string;
export declare function formatSerpForAi(serp: any, maxResults?: number): string;
export declare function calculateProgress(status: string): number;
export declare function isStatusCompleted(status: string): boolean;
export declare function isStatusFailed(status: string): boolean;
export declare function formatKeywordArray(keywords: Array<{
    text: string;
    searchVolume?: number;
}>): string;
export declare function getSeoPageKeywordPrompt({ articlePrompt, keywordsPrompt }: {
    articlePrompt: string;
    keywordsPrompt: string;
}): string;
export declare function createClusteringTextPrompt(keywords: string[]): string;
export declare function createClusteringConversionPrompt(analysisText: string): string;
export declare function createInternalLinkPromptWrapper(data: {
    contentType: string;
    mainKeywords: {
        text: string;
        searchVolume?: number | null;
    }[];
    businessType?: string;
    targetAudience?: string;
    contentLength: string;
    region: string;
    googleSuggestions: string[];
}): string;
export declare function createContentOutlinePrompt({ targetKeyword, contentType, targetAudience, region, language }: {
    targetKeyword: {
        text: string;
    };
    contentType: string;
    targetAudience?: string;
    region: string;
    language: string;
}): string;
export declare function createKeywordOpportunityPrompt(data: {
    targetKeyword: string;
    contentType: string;
    region: string;
    language: string;
}): string;
