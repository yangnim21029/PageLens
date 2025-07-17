"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRunner = void 0;
const seo_assessor_service_1 = require("./seo-checks/seo-assessor.service");
const readability_assessor_service_1 = require("./readability-checks/readability-assessor.service");
const assessment_types_1 = require("../types/assessment.types");
class TestRunner {
    constructor() {
        this.seoAssessor = new seo_assessor_service_1.SEOAssessor();
        this.readabilityAssessor = new readability_assessor_service_1.ReadabilityAssessor();
    }
    async runTests(parsedContent, ingredients, config = assessment_types_1.DEFAULT_ASSESSMENT_CONFIG) {
        try {
            const enabledAssessments = this.resolveEnabledAssessments(config);
            let seoAssessments = [];
            if (this.shouldRunSEOAssessments(enabledAssessments)) {
                const allSeoAssessments = await this.seoAssessor.runSEOChecks(parsedContent, ingredients);
                seoAssessments = this.filterAssessments(allSeoAssessments, enabledAssessments);
            }
            let readabilityAssessments = [];
            if (this.shouldRunReadabilityAssessments(enabledAssessments)) {
                const allReadabilityAssessments = await this.readabilityAssessor.runReadabilityChecks(parsedContent);
                readabilityAssessments = this.filterAssessments(allReadabilityAssessments, enabledAssessments);
            }
            const allAssessments = [...seoAssessments, ...readabilityAssessments];
            const seoScore = this.calculateCategoryScore(seoAssessments);
            const readabilityScore = this.calculateCategoryScore(readabilityAssessments);
            const overallScore = this.calculateOverallScore(seoScore, readabilityScore);
            const results = {
                seoScore,
                readabilityScore,
                overallScore,
                assessments: allAssessments,
                timestamp: new Date()
            };
            return {
                success: true,
                results
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to run tests'
            };
        }
    }
    calculateCategoryScore(assessments) {
        if (assessments.length === 0)
            return 0;
        const weightedScores = assessments.map(assessment => {
            const impactWeight = this.getImpactWeight(assessment.impact);
            return assessment.score * impactWeight;
        });
        const totalWeight = assessments.reduce((sum, assessment) => {
            return sum + this.getImpactWeight(assessment.impact);
        }, 0);
        return totalWeight > 0 ? Math.round(weightedScores.reduce((sum, score) => sum + score, 0) / totalWeight) : 0;
    }
    calculateOverallScore(seoScore, readabilityScore) {
        return Math.round((seoScore * 0.6) + (readabilityScore * 0.4));
    }
    getImpactWeight(impact) {
        switch (impact) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 1;
        }
    }
    resolveEnabledAssessments(config) {
        if (config.enableAll || (!config.enabledAssessments && !config.enableAllSEO && !config.enableAllReadability)) {
            return Object.values(assessment_types_1.AvailableAssessments);
        }
        let enabledAssessments = [];
        if (config.enabledAssessments) {
            enabledAssessments.push(...config.enabledAssessments);
        }
        if (config.enableAllSEO) {
            enabledAssessments.push(...assessment_types_1.SEO_ASSESSMENTS);
        }
        if (config.enableAllReadability) {
            enabledAssessments.push(...assessment_types_1.READABILITY_ASSESSMENTS);
        }
        return [...new Set(enabledAssessments)];
    }
    shouldRunSEOAssessments(enabledAssessments) {
        return assessment_types_1.SEO_ASSESSMENTS.some(seoAssessment => enabledAssessments.includes(seoAssessment));
    }
    shouldRunReadabilityAssessments(enabledAssessments) {
        return assessment_types_1.READABILITY_ASSESSMENTS.some(readabilityAssessment => enabledAssessments.includes(readabilityAssessment));
    }
    filterAssessments(assessments, enabledAssessments) {
        return assessments.filter(assessment => {
            return enabledAssessments.includes(assessment.id) ||
                this.isGoodVersionOfEnabledAssessment(assessment.id, enabledAssessments);
        });
    }
    isGoodVersionOfEnabledAssessment(assessmentId, enabledAssessments) {
        const goodToEnabledMap = {
            'h1-keyword-good': assessment_types_1.AvailableAssessments.H1_KEYWORD,
            'images-alt-good': assessment_types_1.AvailableAssessments.ALT_ATTRIBUTE,
            'keyword-first-paragraph': assessment_types_1.AvailableAssessments.INTRODUCTION_KEYWORD,
            'keyword-density-good': assessment_types_1.AvailableAssessments.KEYWORD_DENSITY,
            'keyword-density-high': assessment_types_1.AvailableAssessments.KEYWORD_DENSITY,
            'meta-description-good': assessment_types_1.AvailableAssessments.META_DESCRIPTION_KEYWORD,
            'title-good': assessment_types_1.AvailableAssessments.PAGE_TITLE_WIDTH,
            'content-length-good': assessment_types_1.AvailableAssessments.TEXT_LENGTH,
            'sentence-length-good': assessment_types_1.AvailableAssessments.SENTENCE_LENGTH_IN_TEXT,
            'paragraph-length-good': assessment_types_1.AvailableAssessments.PARAGRAPH_TOO_LONG,
            'subheading-distribution-good': assessment_types_1.AvailableAssessments.SUBHEADING_DISTRIBUTION_TOO_LONG,
            'no-images': assessment_types_1.AvailableAssessments.ALT_ATTRIBUTE
        };
        const correspondingEnabledAssessment = goodToEnabledMap[assessmentId];
        return correspondingEnabledAssessment ? enabledAssessments.includes(correspondingEnabledAssessment) : false;
    }
}
exports.TestRunner = TestRunner;
//# sourceMappingURL=test-runner.service.js.map