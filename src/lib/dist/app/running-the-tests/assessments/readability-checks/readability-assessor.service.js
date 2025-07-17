"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadabilityAssessor = void 0;
const assessment_types_1 = require("../../types/assessment.types");
class ReadabilityAssessor {
    async runReadabilityChecks(parsedContent) {
        const assessments = [];
        assessments.push(...await this.checkSentenceLength(parsedContent));
        assessments.push(...await this.checkFleschReadingEase(parsedContent));
        assessments.push(...await this.checkParagraphLength(parsedContent));
        assessments.push(...await this.checkSubheadingDistribution(parsedContent));
        return assessments;
    }
    async checkSentenceLength(parsedContent) {
        const assessments = [];
        const sentences = this.extractSentences(parsedContent.textContent);
        if (sentences.length === 0) {
            return assessments;
        }
        const averageWordsPerSentence = sentences.reduce((sum, sentence) => {
            return sum + this.countWordsInSentence(sentence);
        }, 0) / sentences.length;
        const longSentences = sentences.filter(sentence => {
            return this.countWordsInSentence(sentence) > this.getLongSentenceThreshold(sentence);
        });
        if (averageWordsPerSentence <= 20 && longSentences.length <= sentences.length * 0.25) {
            assessments.push({
                id: 'sentence-length-good',
                type: assessment_types_1.AssessmentType.READABILITY,
                name: 'Good Sentence Length',
                description: `Average sentence length is ${averageWordsPerSentence.toFixed(1)} words`,
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'medium',
                recommendation: 'Perfect! Your sentences are easy to read.',
                details: {
                    averageWordsPerSentence: averageWordsPerSentence.toFixed(1),
                    longSentences: longSentences.length,
                    totalSentences: sentences.length
                }
            });
        }
        else {
            const score = Math.max(0, 100 - (longSentences.length / sentences.length) * 100);
            assessments.push({
                id: 'sentence-length-long',
                type: assessment_types_1.AssessmentType.READABILITY,
                name: 'Sentences Too Long',
                description: `${longSentences.length} sentences are longer than 20 words`,
                status: longSentences.length > sentences.length * 0.5 ? assessment_types_1.AssessmentStatus.BAD : assessment_types_1.AssessmentStatus.OK,
                score,
                impact: 'medium',
                recommendation: 'Break down long sentences into shorter ones for better readability.',
                details: {
                    averageWordsPerSentence: averageWordsPerSentence.toFixed(1),
                    longSentences: longSentences.length,
                    totalSentences: sentences.length
                }
            });
        }
        return assessments;
    }
    async checkFleschReadingEase(parsedContent) {
        const assessments = [];
        const fleschScore = this.calculateFleschReadingEase(parsedContent.textContent);
        let status;
        let recommendation;
        let description;
        if (fleschScore >= 60) {
            status = assessment_types_1.AssessmentStatus.GOOD;
            description = 'Text is easy to read';
            recommendation = 'Great! Your content is easily readable.';
        }
        else if (fleschScore >= 30) {
            status = assessment_types_1.AssessmentStatus.OK;
            description = 'Text is fairly difficult to read';
            recommendation = 'Consider using simpler words and shorter sentences to improve readability.';
        }
        else {
            status = assessment_types_1.AssessmentStatus.BAD;
            description = 'Text is very difficult to read';
            recommendation = 'Significantly simplify your language, use shorter sentences, and choose common words.';
        }
        assessments.push({
            id: 'flesch-reading-ease',
            type: assessment_types_1.AssessmentType.READABILITY,
            name: 'Flesch Reading Ease',
            description,
            status,
            score: Math.max(0, fleschScore),
            impact: 'high',
            recommendation,
            details: { fleschScore: fleschScore.toFixed(1) }
        });
        return assessments;
    }
    async checkParagraphLength(parsedContent) {
        const assessments = [];
        const paragraphs = parsedContent.paragraphs;
        if (paragraphs.length === 0) {
            return assessments;
        }
        const averageWordsPerParagraph = paragraphs.reduce((sum, paragraph) => {
            return sum + paragraph.split(/\s+/).length;
        }, 0) / paragraphs.length;
        const longParagraphs = paragraphs.filter(paragraph => {
            return paragraph.split(/\s+/).length > 150;
        });
        if (averageWordsPerParagraph <= 150 && longParagraphs.length <= paragraphs.length * 0.25) {
            assessments.push({
                id: 'paragraph-length-good',
                type: assessment_types_1.AssessmentType.READABILITY,
                name: 'Good Paragraph Length',
                description: `Average paragraph length is ${averageWordsPerParagraph.toFixed(1)} words`,
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'medium',
                recommendation: 'Perfect! Your paragraphs are well-sized for readability.',
                details: {
                    averageWordsPerParagraph: averageWordsPerParagraph.toFixed(1),
                    longParagraphs: longParagraphs.length,
                    totalParagraphs: paragraphs.length
                }
            });
        }
        else {
            const score = Math.max(0, 100 - (longParagraphs.length / paragraphs.length) * 100);
            assessments.push({
                id: 'paragraph-length-long',
                type: assessment_types_1.AssessmentType.READABILITY,
                name: 'Paragraphs Too Long',
                description: `${longParagraphs.length} paragraphs are longer than 150 words`,
                status: longParagraphs.length > paragraphs.length * 0.5 ? assessment_types_1.AssessmentStatus.BAD : assessment_types_1.AssessmentStatus.OK,
                score,
                impact: 'medium',
                recommendation: 'Break down long paragraphs into shorter ones for better readability.',
                details: {
                    averageWordsPerParagraph: averageWordsPerParagraph.toFixed(1),
                    longParagraphs: longParagraphs.length,
                    totalParagraphs: paragraphs.length
                }
            });
        }
        return assessments;
    }
    async checkSubheadingDistribution(parsedContent) {
        const assessments = [];
        const headings = parsedContent.headings.filter(h => h.level >= 2);
        const wordCount = parsedContent.wordCount;
        if (wordCount < 300) {
            return assessments;
        }
        const wordsPerHeading = headings.length > 0 ? wordCount / headings.length : wordCount;
        if (wordsPerHeading <= 300) {
            assessments.push({
                id: 'subheading-distribution-good',
                type: assessment_types_1.AssessmentType.READABILITY,
                name: 'Good Subheading Distribution',
                description: `Average of ${wordsPerHeading.toFixed(0)} words per subheading`,
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'medium',
                recommendation: 'Excellent! Your content is well-structured with subheadings.',
                details: {
                    headingCount: headings.length,
                    wordCount,
                    wordsPerHeading: wordsPerHeading.toFixed(0)
                }
            });
        }
        else {
            const score = Math.max(0, 100 - ((wordsPerHeading - 300) / 300) * 50);
            assessments.push({
                id: 'subheading-distribution-poor',
                type: assessment_types_1.AssessmentType.READABILITY,
                name: 'Poor Subheading Distribution',
                description: `Average of ${wordsPerHeading.toFixed(0)} words per subheading`,
                status: wordsPerHeading > 600 ? assessment_types_1.AssessmentStatus.BAD : assessment_types_1.AssessmentStatus.OK,
                score,
                impact: 'medium',
                recommendation: 'Add more subheadings to break up your content (aim for one every 300 words).',
                details: {
                    headingCount: headings.length,
                    wordCount,
                    wordsPerHeading: wordsPerHeading.toFixed(0)
                }
            });
        }
        return assessments;
    }
    extractSentences(text) {
        return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    }
    calculateFleschReadingEase(text) {
        const sentences = this.extractSentences(text);
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
        if (sentences.length === 0 || words.length === 0) {
            return 0;
        }
        const averageWordsPerSentence = words.length / sentences.length;
        const averageSyllablesPerWord = syllables / words.length;
        return 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);
    }
    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3)
            return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }
    countWordsInSentence(sentence) {
        if (!sentence || sentence.trim().length === 0)
            return 0;
        const chineseCharRegex = /[\u4e00-\u9fff]/g;
        const englishWordRegex = /[a-zA-Z]+/g;
        const chineseChars = sentence.match(chineseCharRegex) || [];
        const englishWords = sentence.match(englishWordRegex) || [];
        const totalChars = sentence.replace(/\s+/g, '').length;
        const chineseRatio = chineseChars.length / totalChars;
        if (chineseRatio > 0.7) {
            return chineseChars.length + englishWords.length;
        }
        else if (chineseRatio < 0.1) {
            return sentence.split(/\s+/).filter(word => word.length > 0).length;
        }
        else {
            return chineseChars.length + englishWords.length;
        }
    }
    getLongSentenceThreshold(sentence) {
        const chineseCharRegex = /[\u4e00-\u9fff]/g;
        const chineseChars = sentence.match(chineseCharRegex) || [];
        const totalChars = sentence.replace(/\s+/g, '').length;
        const chineseRatio = chineseChars.length / totalChars;
        if (chineseRatio > 0.5) {
            return 30;
        }
        else {
            return 20;
        }
    }
}
exports.ReadabilityAssessor = ReadabilityAssessor;
//# sourceMappingURL=readability-assessor.service.js.map