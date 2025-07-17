export interface TextStats {
    wordCount: number;
    charCount: number;
    charCountNoSpaces: number;
    sentences: number;
    paragraphs: number;
    language: 'chinese' | 'english' | 'mixed';
    chineseCharCount: number;
    englishWordCount: number;
}
export declare class TextAnalyzer {
    static detectLanguage(text: string): 'chinese' | 'english' | 'mixed';
    static countChineseCharacters(text: string): number;
    static countEnglishWords(text: string): number;
    static countWords(text: string): number;
    static countSentences(text: string): number;
    static analyzeSentenceLength(text: string): {
        sentences: string[];
        averageLength: number;
        longSentences: string[];
    };
    static analyzeText(text: string): TextStats;
    static calculateKeywordDensity(text: string, keyword: string): {
        density: number;
        occurrences: number;
        totalWords: number;
    };
}
