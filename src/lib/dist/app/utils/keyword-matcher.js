"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordMatcher = void 0;
class KeywordMatcher {
    checkIfContainsKeyword(text, keyword) {
        if (!text || !keyword)
            return false;
        const normalizedText = text.toLowerCase().trim();
        const normalizedKeyword = keyword.toLowerCase().trim();
        if (normalizedText.includes(normalizedKeyword)) {
            return true;
        }
        const keywordWords = normalizedKeyword.split(/\s+/);
        const textWords = normalizedText.split(/\s+/);
        const allWordsFound = keywordWords.every(keywordWord => textWords.some(textWord => textWord.includes(keywordWord)));
        if (allWordsFound) {
            return true;
        }
        const textNoSpaces = normalizedText.replace(/\s+/g, '');
        const keywordNoSpaces = normalizedKeyword.replace(/\s+/g, '');
        if (textNoSpaces.includes(keywordNoSpaces)) {
            return true;
        }
        return this.fuzzyMatch(normalizedText, normalizedKeyword);
    }
    fuzzyMatch(text, keyword, threshold = 0.8) {
        if (keyword.length < 3)
            return false;
        const similarity = this.calculateSimilarity(text, keyword);
        return similarity >= threshold;
    }
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const editDistance = this.calculateEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    calculateEditDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    findKeywordPositions(text, keyword) {
        const positions = [];
        const normalizedText = text.toLowerCase();
        const normalizedKeyword = keyword.toLowerCase();
        let index = 0;
        while (index < normalizedText.length) {
            const found = normalizedText.indexOf(normalizedKeyword, index);
            if (found === -1)
                break;
            positions.push({
                start: found,
                end: found + normalizedKeyword.length,
                match: text.substring(found, found + normalizedKeyword.length)
            });
            index = found + 1;
        }
        return positions;
    }
    calculateKeywordDensity(text, keyword) {
        if (!text || !keyword)
            return 0;
        const normalizedText = text.toLowerCase();
        const normalizedKeyword = keyword.toLowerCase();
        const matches = normalizedText.match(new RegExp(normalizedKeyword, 'g'));
        const keywordCount = matches ? matches.length : 0;
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const totalWords = words.length;
        if (totalWords === 0)
            return 0;
        return (keywordCount / totalWords) * 100;
    }
    isKeywordInFirstHalf(text, keyword) {
        if (!text || !keyword)
            return false;
        const normalizedText = text.toLowerCase();
        const normalizedKeyword = keyword.toLowerCase();
        const keywordPosition = normalizedText.indexOf(normalizedKeyword);
        if (keywordPosition === -1)
            return false;
        const midPoint = text.length / 2;
        return keywordPosition < midPoint;
    }
    generateKeywordVariants(keyword) {
        const variants = [keyword];
        if (/^[a-zA-Z\s]+$/.test(keyword)) {
            variants.push(keyword + 's');
            variants.push(keyword + 'es');
            variants.push(keyword + 'ies');
        }
        if (keyword.includes(' ')) {
            variants.push(keyword.replace(/\s+/g, ''));
        }
        const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        if (capitalized !== keyword) {
            variants.push(capitalized);
        }
        const uppercase = keyword.toUpperCase();
        if (uppercase !== keyword) {
            variants.push(uppercase);
        }
        return [...new Set(variants)];
    }
    checkMultipleKeywords(text, keywords) {
        return keywords.map(keyword => ({
            keyword,
            found: this.checkIfContainsKeyword(text, keyword),
            positions: this.findKeywordPositions(text, keyword),
            density: this.calculateKeywordDensity(text, keyword)
        }));
    }
    highlightKeywords(text, keywords, highlightTag = 'mark') {
        let highlightedText = text;
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            highlightedText = highlightedText.replace(regex, `<${highlightTag}>$1</${highlightTag}>`);
        });
        return highlightedText;
    }
    analyzeKeyword(text, keyword, h1s, h2s, images, links) {
        const keywordLower = keyword.toLowerCase();
        return {
            inTitle: h1s.some(h1 => h1.text.toLowerCase().includes(keywordLower)),
            inH2: h2s.some(h2 => h2.text.toLowerCase().includes(keywordLower)),
            inImages: images.some(img => img.text.toLowerCase().includes(keywordLower)),
            inLinks: links.some(link => link.text.toLowerCase().includes(keywordLower)),
            inContent: text.toLowerCase().includes(keywordLower),
            density: this.calculateKeywordDensity(text, keyword),
            positions: this.findKeywordPositions(text, keyword)
        };
    }
    checkSynonyms(text, synonyms) {
        return synonyms.map(synonym => ({
            synonym,
            found: this.checkIfContainsKeyword(text, synonym),
            density: this.calculateKeywordDensity(text, synonym)
        }));
    }
}
exports.KeywordMatcher = KeywordMatcher;
//# sourceMappingURL=keyword-matcher.js.map