"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEOAssessor = void 0;
const assessment_types_1 = require("../../types/assessment.types");
class SEOAssessor {
    async runSEOChecks(parsedContent, ingredients) {
        const assessments = [];
        assessments.push(...await this.checkHeadingStructure(parsedContent, ingredients));
        assessments.push(...await this.checkImageOptimization(parsedContent));
        assessments.push(...await this.checkKeywordOptimization(parsedContent, ingredients));
        assessments.push(...await this.checkMetaElements(parsedContent, ingredients));
        assessments.push(...await this.checkContentLength(parsedContent));
        return assessments;
    }
    async checkHeadingStructure(parsedContent, ingredients) {
        const assessments = [];
        const h1Tags = parsedContent.headings.filter(h => h.level === 1);
        if (h1Tags.length === 0) {
            assessments.push({
                id: 'h1-missing',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'H1 Tag Missing',
                description: 'Page is missing an H1 heading',
                status: assessment_types_1.AssessmentStatus.BAD,
                score: 0,
                impact: 'high',
                recommendation: 'Add exactly one H1 heading that describes the main topic of your page.',
                details: { h1Count: 0 }
            });
        }
        else if (h1Tags.length > 1) {
            assessments.push({
                id: 'multiple-h1',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Multiple H1 Tags',
                description: 'Page has multiple H1 headings',
                status: assessment_types_1.AssessmentStatus.BAD,
                score: 40,
                impact: 'medium',
                recommendation: 'Use only one H1 heading per page. Convert additional H1s to H2 or H3.',
                details: { h1Count: h1Tags.length, h1Texts: h1Tags.map(h => h.text) }
            });
        }
        else {
            const h1Text = h1Tags[0].text.toLowerCase();
            const focusKeyword = ingredients.focusKeyword?.toLowerCase() || '';
            if (!focusKeyword || focusKeyword.trim() === '') {
                assessments.push({
                    id: 'h1-no-keyword-analysis',
                    type: assessment_types_1.AssessmentType.SEO,
                    name: 'H1 Present (No Keyword Analysis)',
                    description: 'H1 heading exists but no focus keyword provided for analysis',
                    status: assessment_types_1.AssessmentStatus.OK,
                    score: 75,
                    impact: 'low',
                    recommendation: 'H1 heading is present. Consider setting a focus keyword to analyze keyword optimization.',
                    details: { h1Text, reason: 'No focus keyword provided' }
                });
            }
            else if (h1Text.includes(focusKeyword)) {
                assessments.push({
                    id: 'h1-keyword-good',
                    type: assessment_types_1.AssessmentType.SEO,
                    name: 'H1 Contains Focus Keyword',
                    description: 'H1 heading contains the focus keyword',
                    status: assessment_types_1.AssessmentStatus.GOOD,
                    score: 100,
                    impact: 'high',
                    recommendation: 'Great! Your H1 contains the focus keyword.',
                    details: { h1Text, focusKeyword }
                });
            }
            else {
                assessments.push({
                    id: 'h1-keyword-missing',
                    type: assessment_types_1.AssessmentType.SEO,
                    name: 'H1 Missing Focus Keyword',
                    description: 'H1 heading does not contain the focus keyword',
                    status: assessment_types_1.AssessmentStatus.OK,
                    score: 60,
                    impact: 'medium',
                    recommendation: `Consider including your focus keyword "${ingredients.focusKeyword}" in the H1 heading.`,
                    details: { h1Text, focusKeyword }
                });
            }
        }
        return assessments;
    }
    async checkImageOptimization(parsedContent) {
        const assessments = [];
        const images = parsedContent.images;
        const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '');
        if (images.length === 0) {
            assessments.push({
                id: 'no-images',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'No Images Found',
                description: 'Page contains no images',
                status: assessment_types_1.AssessmentStatus.OK,
                score: 75,
                impact: 'low',
                recommendation: 'Consider adding relevant images to make your content more engaging.',
                details: { imageCount: 0 }
            });
        }
        else if (imagesWithoutAlt.length === 0) {
            assessments.push({
                id: 'images-alt-good',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'All Images Have Alt Text',
                description: 'All images have descriptive alt text',
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'medium',
                recommendation: 'Excellent! All your images have alt text.',
                details: { imageCount: images.length, imagesWithoutAlt: 0 }
            });
        }
        else {
            const status = imagesWithoutAlt.length === images.length ? assessment_types_1.AssessmentStatus.BAD : assessment_types_1.AssessmentStatus.OK;
            const score = Math.max(0, 100 - (imagesWithoutAlt.length / images.length) * 100);
            assessments.push({
                id: 'images-missing-alt',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Images Missing Alt Text',
                description: `${imagesWithoutAlt.length} out of ${images.length} images are missing alt text`,
                status,
                score,
                impact: 'medium',
                recommendation: 'Add descriptive alt text to all images for better accessibility and SEO.',
                details: {
                    imageCount: images.length,
                    imagesWithoutAlt: imagesWithoutAlt.length,
                    problematicImages: imagesWithoutAlt.map(img => img.src)
                }
            });
        }
        return assessments;
    }
    async checkKeywordOptimization(parsedContent, ingredients) {
        const assessments = [];
        const textContent = parsedContent.textContent.toLowerCase();
        const focusKeyword = ingredients.focusKeyword?.toLowerCase() || '';
        if (!focusKeyword || focusKeyword.trim() === '') {
            assessments.push({
                id: 'no-keyword-analysis',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'No Keyword Analysis',
                description: 'No focus keyword provided for keyword optimization analysis',
                status: assessment_types_1.AssessmentStatus.OK,
                score: 75,
                impact: 'low',
                recommendation: 'Consider setting a focus keyword to analyze keyword optimization.',
                details: { reason: 'No focus keyword provided' }
            });
            return assessments;
        }
        const firstParagraph = parsedContent.paragraphs[0]?.toLowerCase() || '';
        if (firstParagraph.includes(focusKeyword)) {
            assessments.push({
                id: 'keyword-first-paragraph',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Keyword in First Paragraph',
                description: 'Focus keyword appears in the first paragraph',
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'high',
                recommendation: 'Great! Your focus keyword appears in the first paragraph.',
                details: { focusKeyword }
            });
        }
        else {
            assessments.push({
                id: 'keyword-missing-first-paragraph',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Keyword Missing from First Paragraph',
                description: 'Focus keyword does not appear in the first paragraph',
                status: assessment_types_1.AssessmentStatus.OK,
                score: 60,
                impact: 'medium',
                recommendation: `Consider including your focus keyword "${focusKeyword}" in the first paragraph.`,
                details: { focusKeyword }
            });
        }
        const totalWords = this.countWordsLanguageAware(textContent);
        const keywordOccurrences = this.countKeywordOccurrences(textContent, focusKeyword);
        const keywordDensity = totalWords > 0 ? (keywordOccurrences / totalWords) * 100 : 0;
        if (keywordDensity >= 0.5 && keywordDensity <= 2.5) {
            assessments.push({
                id: 'keyword-density-good',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Good Keyword Density',
                description: `Focus keyword density is ${keywordDensity.toFixed(1)}%`,
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'medium',
                recommendation: 'Perfect! Your keyword density is in the optimal range.',
                details: { keywordDensity: keywordDensity.toFixed(1), occurrences: keywordOccurrences }
            });
        }
        else if (keywordDensity < 0.5) {
            assessments.push({
                id: 'keyword-density-low',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Low Keyword Density',
                description: `Focus keyword density is only ${keywordDensity.toFixed(1)}%`,
                status: assessment_types_1.AssessmentStatus.OK,
                score: 70,
                impact: 'medium',
                recommendation: 'Consider using your focus keyword more frequently in the content (aim for 0.5-2.5%).',
                details: { keywordDensity: keywordDensity.toFixed(1), occurrences: keywordOccurrences }
            });
        }
        else {
            assessments.push({
                id: 'keyword-density-high',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'High Keyword Density',
                description: `Focus keyword density is ${keywordDensity.toFixed(1)}%`,
                status: assessment_types_1.AssessmentStatus.BAD,
                score: 40,
                impact: 'high',
                recommendation: 'Reduce keyword usage to avoid over-optimization (aim for 0.5-2.5%).',
                details: { keywordDensity: keywordDensity.toFixed(1), occurrences: keywordOccurrences }
            });
        }
        return assessments;
    }
    async checkMetaElements(parsedContent, ingredients) {
        const assessments = [];
        const title = parsedContent.title;
        const metaDescription = parsedContent.metaDescription;
        const focusKeyword = ingredients.focusKeyword?.toLowerCase() || '';
        const hasKeyword = focusKeyword && focusKeyword.trim() !== '';
        if (!title) {
            assessments.push({
                id: 'title-missing',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Title Tag Missing',
                description: 'Page is missing a title tag',
                status: assessment_types_1.AssessmentStatus.BAD,
                score: 0,
                impact: 'high',
                recommendation: 'Add a descriptive title tag that includes your focus keyword.',
                details: {}
            });
        }
        else {
            const titleLength = title.length;
            const titleHasKeyword = hasKeyword ? title.toLowerCase().includes(focusKeyword) : false;
            const { minLength, maxLength } = this.getTitleLengthStandards(title);
            if (titleLength >= minLength && titleLength <= maxLength && titleHasKeyword) {
                assessments.push({
                    id: 'title-good',
                    type: assessment_types_1.AssessmentType.SEO,
                    name: 'Good Title Tag',
                    description: 'Title tag is well-optimized',
                    status: assessment_types_1.AssessmentStatus.GOOD,
                    score: 100,
                    impact: 'high',
                    recommendation: 'Perfect! Your title tag is the right length and contains the focus keyword.',
                    details: { title, length: titleLength, hasKeyword: titleHasKeyword }
                });
            }
            else {
                let recommendation = 'Improve your title tag: ';
                if (titleLength < minLength)
                    recommendation += `make it longer (${minLength}-${maxLength} characters), `;
                if (titleLength > maxLength)
                    recommendation += `make it shorter (${minLength}-${maxLength} characters), `;
                if (hasKeyword && !titleHasKeyword)
                    recommendation += 'include your focus keyword, ';
                recommendation = recommendation.slice(0, -2) + '.';
                assessments.push({
                    id: 'title-needs-improvement',
                    type: assessment_types_1.AssessmentType.SEO,
                    name: 'Title Tag Needs Improvement',
                    description: 'Title tag could be optimized better',
                    status: assessment_types_1.AssessmentStatus.OK,
                    score: 60,
                    impact: 'high',
                    recommendation,
                    details: { title, length: titleLength, hasKeyword: titleHasKeyword }
                });
            }
        }
        if (!metaDescription) {
            assessments.push({
                id: 'meta-description-missing',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Meta Description Missing',
                description: 'Page is missing a meta description',
                status: assessment_types_1.AssessmentStatus.BAD,
                score: 0,
                impact: 'high',
                recommendation: 'Add a compelling meta description (150-160 characters) that includes your focus keyword.',
                details: {}
            });
        }
        else {
            const descLength = metaDescription.length;
            const descHasKeyword = hasKeyword ? metaDescription.toLowerCase().includes(focusKeyword) : false;
            const { minLength, maxLength } = this.getMetaDescriptionLengthStandards(metaDescription);
            if (descLength >= minLength && descLength <= maxLength && descHasKeyword) {
                assessments.push({
                    id: 'meta-description-good',
                    type: assessment_types_1.AssessmentType.SEO,
                    name: 'Good Meta Description',
                    description: 'Meta description is well-optimized',
                    status: assessment_types_1.AssessmentStatus.GOOD,
                    score: 100,
                    impact: 'high',
                    recommendation: 'Excellent! Your meta description is the right length and contains the focus keyword.',
                    details: { metaDescription, length: descLength, hasKeyword: descHasKeyword }
                });
            }
            else {
                let recommendation = 'Improve your meta description: ';
                if (descLength < minLength)
                    recommendation += `make it longer (${minLength}-${maxLength} characters), `;
                if (descLength > maxLength)
                    recommendation += `make it shorter (${minLength}-${maxLength} characters), `;
                if (hasKeyword && !descHasKeyword)
                    recommendation += 'include your focus keyword, ';
                recommendation = recommendation.slice(0, -2) + '.';
                assessments.push({
                    id: 'meta-description-needs-improvement',
                    type: assessment_types_1.AssessmentType.SEO,
                    name: 'Meta Description Needs Improvement',
                    description: 'Meta description could be optimized better',
                    status: assessment_types_1.AssessmentStatus.OK,
                    score: 60,
                    impact: 'high',
                    recommendation,
                    details: { metaDescription, length: descLength, hasKeyword: descHasKeyword }
                });
            }
        }
        return assessments;
    }
    async checkContentLength(parsedContent) {
        const assessments = [];
        const wordCount = parsedContent.wordCount;
        if (wordCount >= 300) {
            assessments.push({
                id: 'content-length-good',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Sufficient Content Length',
                description: `Page has ${wordCount} words`,
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'medium',
                recommendation: 'Great! Your content has sufficient length for SEO.',
                details: { wordCount }
            });
        }
        else {
            assessments.push({
                id: 'content-length-short',
                type: assessment_types_1.AssessmentType.SEO,
                name: 'Content Too Short',
                description: `Page has only ${wordCount} words`,
                status: assessment_types_1.AssessmentStatus.BAD,
                score: Math.max(0, (wordCount / 300) * 100),
                impact: 'high',
                recommendation: 'Add more content to reach at least 300 words for better SEO performance.',
                details: { wordCount }
            });
        }
        return assessments;
    }
    countWordsLanguageAware(text) {
        if (!text || text.trim().length === 0)
            return 0;
        const chineseCharRegex = /[\u4e00-\u9fff]/g;
        const englishWordRegex = /[a-zA-Z]+/g;
        const chineseChars = text.match(chineseCharRegex) || [];
        const englishWords = text.match(englishWordRegex) || [];
        const totalChars = text.replace(/\s+/g, '').length;
        const chineseRatio = chineseChars.length / totalChars;
        if (chineseRatio > 0.7) {
            return chineseChars.length + englishWords.length;
        }
        else if (chineseRatio < 0.1) {
            return text.split(/\s+/).filter(word => word.length > 0).length;
        }
        else {
            return chineseChars.length + englishWords.length;
        }
    }
    countKeywordOccurrences(text, keyword) {
        if (!text || !keyword)
            return 0;
        const cleanText = text.toLowerCase();
        const cleanKeyword = keyword.toLowerCase();
        const chineseCharRegex = /[\u4e00-\u9fff]/;
        const isChinese = chineseCharRegex.test(cleanKeyword);
        if (isChinese) {
            const matches = cleanText.match(new RegExp(cleanKeyword, 'g'));
            return matches ? matches.length : 0;
        }
        else {
            const wordBoundaryRegex = new RegExp(`\\b${cleanKeyword}\\b`, 'g');
            const matches = cleanText.match(wordBoundaryRegex);
            return matches ? matches.length : 0;
        }
    }
    getTitleLengthStandards(title) {
        const chineseCharRegex = /[\u4e00-\u9fff]/g;
        const chineseChars = title.match(chineseCharRegex) || [];
        const totalChars = title.replace(/\s+/g, '').length;
        const chineseRatio = chineseChars.length / totalChars;
        if (chineseRatio > 0.5) {
            return { minLength: 15, maxLength: 30 };
        }
        else {
            return { minLength: 30, maxLength: 60 };
        }
    }
    getMetaDescriptionLengthStandards(description) {
        const chineseCharRegex = /[\u4e00-\u9fff]/g;
        const chineseChars = description.match(chineseCharRegex) || [];
        const totalChars = description.replace(/\s+/g, '').length;
        const chineseRatio = chineseChars.length / totalChars;
        if (chineseRatio > 0.5) {
            return { minLength: 70, maxLength: 80 };
        }
        else {
            return { minLength: 150, maxLength: 160 };
        }
    }
}
exports.SEOAssessor = SEOAssessor;
//# sourceMappingURL=seo-assessor.service.js.map