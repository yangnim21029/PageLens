"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextAnalyzer = void 0;
class TextAnalyzer {
    static detectLanguage(text) {
        const chineseCharRegex = /[\u4e00-\u9fff]/g;
        const englishWordRegex = /[a-zA-Z]+/g;
        const chineseChars = text.match(chineseCharRegex) || [];
        const englishWords = text.match(englishWordRegex) || [];
        const totalChars = text.replace(/\s+/g, '').length;
        const chineseRatio = chineseChars.length / totalChars;
        if (chineseRatio > 0.7)
            return 'chinese';
        if (chineseRatio < 0.1)
            return 'english';
        return 'mixed';
    }
    static countChineseCharacters(text) {
        const chineseCharRegex = /[\u4e00-\u9fff]/g;
        const matches = text.match(chineseCharRegex);
        return matches ? matches.length : 0;
    }
    static countEnglishWords(text) {
        const englishWordRegex = /[a-zA-Z]+/g;
        const matches = text.match(englishWordRegex);
        return matches ? matches.length : 0;
    }
    static countWords(text) {
        if (!text || text.trim().length === 0)
            return 0;
        const cleanText = text.trim();
        const language = this.detectLanguage(cleanText);
        const chineseCharCount = this.countChineseCharacters(cleanText);
        const englishWordCount = this.countEnglishWords(cleanText);
        switch (language) {
            case 'chinese':
                return chineseCharCount + englishWordCount;
            case 'english':
                return cleanText.split(/\s+/).filter(word => word.length > 0).length;
            case 'mixed':
                return chineseCharCount + englishWordCount;
            default:
                return cleanText.split(/\s+/).filter(word => word.length > 0).length;
        }
    }
    static countSentences(text) {
        if (!text || text.trim().length === 0)
            return 0;
        const sentenceRegex = /[.!?。！？]+/g;
        const sentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);
        return sentences.length;
    }
    static analyzeSentenceLength(text) {
        if (!text || text.trim().length === 0) {
            return { sentences: [], averageLength: 0, longSentences: [] };
        }
        const sentenceRegex = /[.!?。！？]+/g;
        const sentences = text.split(sentenceRegex)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        if (sentences.length === 0) {
            return { sentences: [], averageLength: 0, longSentences: [] };
        }
        const language = this.detectLanguage(text);
        const longThreshold = language === 'chinese' ? 30 : 20;
        const sentenceLengths = sentences.map(sentence => this.countWords(sentence));
        const averageLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentences.length;
        const longSentences = sentences.filter(sentence => {
            return this.countWords(sentence) > longThreshold;
        });
        return {
            sentences,
            averageLength: Math.round(averageLength * 10) / 10,
            longSentences
        };
    }
    static analyzeText(text) {
        if (!text || text.trim().length === 0) {
            return {
                wordCount: 0,
                charCount: 0,
                charCountNoSpaces: 0,
                sentences: 0,
                paragraphs: 0,
                language: 'english',
                chineseCharCount: 0,
                englishWordCount: 0
            };
        }
        const cleanText = text.trim();
        const language = this.detectLanguage(cleanText);
        const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        return {
            wordCount: this.countWords(cleanText),
            charCount: cleanText.length,
            charCountNoSpaces: cleanText.replace(/\s+/g, '').length,
            sentences: this.countSentences(cleanText),
            paragraphs: paragraphs.length,
            language,
            chineseCharCount: this.countChineseCharacters(cleanText),
            englishWordCount: this.countEnglishWords(cleanText)
        };
    }
    static calculateKeywordDensity(text, keyword) {
        if (!text || !keyword) {
            return { density: 0, occurrences: 0, totalWords: 0 };
        }
        const cleanText = text.toLowerCase();
        const cleanKeyword = keyword.toLowerCase();
        const totalWords = this.countWords(text);
        if (totalWords === 0) {
            return { density: 0, occurrences: 0, totalWords: 0 };
        }
        let occurrences = 0;
        const language = this.detectLanguage(text);
        if (language === 'chinese') {
            occurrences = (cleanText.match(new RegExp(cleanKeyword, 'g')) || []).length;
        }
        else {
            const wordBoundaryRegex = new RegExp(`\\b${cleanKeyword}\\b`, 'g');
            occurrences = (cleanText.match(wordBoundaryRegex) || []).length;
        }
        const density = (occurrences / totalWords) * 100;
        return {
            density: Math.round(density * 100) / 100,
            occurrences,
            totalWords
        };
    }
}
exports.TextAnalyzer = TextAnalyzer;
//# sourceMappingURL=text-analyzer.js.map