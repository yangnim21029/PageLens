export interface KeywordMatch {
    keyword: string;
    found: boolean;
    positions: Array<{
        start: number;
        end: number;
        match: string;
    }>;
    density: number;
}
export interface KeywordAnalysis {
    inTitle: boolean;
    inH2: boolean;
    inImages: boolean;
    inLinks: boolean;
    inContent: boolean;
    density: number;
    positions: Array<{
        start: number;
        end: number;
        match: string;
    }>;
}
export declare class KeywordMatcher {
    checkIfContainsKeyword(text: string, keyword: string): boolean;
    private fuzzyMatch;
    private calculateSimilarity;
    private calculateEditDistance;
    findKeywordPositions(text: string, keyword: string): Array<{
        start: number;
        end: number;
        match: string;
    }>;
    calculateKeywordDensity(text: string, keyword: string): number;
    isKeywordInFirstHalf(text: string, keyword: string): boolean;
    generateKeywordVariants(keyword: string): string[];
    checkMultipleKeywords(text: string, keywords: string[]): KeywordMatch[];
    highlightKeywords(text: string, keywords: string[], highlightTag?: string): string;
    analyzeKeyword(text: string, keyword: string, h1s: Array<{
        text: string;
    }>, h2s: Array<{
        text: string;
    }>, images: Array<{
        text: string;
    }>, links: Array<{
        text: string;
    }>): KeywordAnalysis;
    checkSynonyms(text: string, synonyms: string[]): Array<{
        synonym: string;
        found: boolean;
        density: number;
    }>;
}
