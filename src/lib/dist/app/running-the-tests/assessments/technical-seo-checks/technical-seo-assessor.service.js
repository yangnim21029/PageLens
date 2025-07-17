"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalSEOAssessor = void 0;
const assessment_types_1 = require("../../types/assessment.types");
class TechnicalSEOAssessor {
    async runTechnicalSEOChecks(parsedContent, ingredients) {
        const assessments = [];
        assessments.push(...await this.checkCanonicalUrl(parsedContent, ingredients));
        assessments.push(...await this.checkRobotsDirectives(parsedContent));
        assessments.push(...await this.checkHreflangTags(parsedContent));
        assessments.push(...await this.checkSSLSecurity(parsedContent, ingredients));
        assessments.push(...await this.checkStructuredData(parsedContent));
        return assessments;
    }
    async checkCanonicalUrl(parsedContent, ingredients) {
        const assessments = [];
        const canonical = parsedContent.technical?.canonical;
        const currentUrl = ingredients.pageDetails.url;
        if (!canonical) {
            assessments.push({
                id: 'canonical-missing',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'technical-seo',
                name: 'Missing Canonical URL',
                description: 'Page is missing a canonical URL',
                status: assessment_types_1.AssessmentStatus.BAD,
                score: 0,
                impact: 'high',
                recommendation: 'Add a canonical URL to prevent duplicate content issues.',
                category: 'technical-seo',
                data: {
                    technical: {
                        canonicalUrl: {
                            isPresent: false,
                            isValid: false
                        }
                    }
                }
            });
        }
        else {
            const isValid = this.isValidUrl(canonical);
            const isSelfReferencing = canonical === currentUrl;
            if (isValid && isSelfReferencing) {
                assessments.push({
                    id: 'canonical-good',
                    type: assessment_types_1.AssessmentType.SEO,
                    assessmentType: 'technical-seo',
                    name: 'Good Canonical URL',
                    description: 'Canonical URL is properly set and self-referencing',
                    status: assessment_types_1.AssessmentStatus.GOOD,
                    score: 100,
                    impact: 'medium',
                    recommendation: 'Perfect! Your canonical URL is correctly configured.',
                    category: 'technical-seo',
                    data: {
                        technical: {
                            canonicalUrl: {
                                isPresent: true,
                                url: canonical,
                                isValid: true
                            }
                        }
                    }
                });
            }
            else {
                assessments.push({
                    id: 'canonical-issues',
                    type: assessment_types_1.AssessmentType.SEO,
                    assessmentType: 'technical-seo',
                    name: 'Canonical URL Issues',
                    description: !isValid ? 'Canonical URL is not valid' : 'Canonical URL does not match current URL',
                    status: assessment_types_1.AssessmentStatus.OK,
                    score: 60,
                    impact: 'medium',
                    recommendation: !isValid ? 'Fix the canonical URL format.' : 'Ensure canonical URL matches the current page URL.',
                    category: 'technical-seo',
                    data: {
                        technical: {
                            canonicalUrl: {
                                isPresent: true,
                                url: canonical,
                                isValid: isValid
                            }
                        }
                    }
                });
            }
        }
        return assessments;
    }
    async checkRobotsDirectives(parsedContent) {
        const assessments = [];
        const robots = parsedContent.technical?.robots || { meta: undefined, xRobots: undefined };
        const isIndexable = !robots.meta || (!robots.meta.includes('noindex'));
        const isFollowable = !robots.meta || (!robots.meta.includes('nofollow'));
        if (robots.meta && (robots.meta.includes('noindex') || robots.meta.includes('nofollow'))) {
            assessments.push({
                id: 'robots-restrictive',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'technical-seo',
                name: 'Restrictive Robots Directives',
                description: `Robots meta tag contains: ${robots.meta}`,
                status: assessment_types_1.AssessmentStatus.OK,
                score: 50,
                impact: 'high',
                recommendation: 'Review robots directives to ensure they align with your SEO goals.',
                category: 'technical-seo',
                data: {
                    technical: {
                        robots: {
                            metaRobots: robots.meta,
                            hasRobotsTxt: false,
                            isIndexable
                        }
                    }
                }
            });
        }
        else {
            assessments.push({
                id: 'robots-good',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'technical-seo',
                name: 'Good Robots Configuration',
                description: 'Page is indexable and followable',
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'medium',
                recommendation: 'Great! Your page allows search engine indexing and link following.',
                category: 'technical-seo',
                data: {
                    technical: {
                        robots: {
                            metaRobots: robots.meta,
                            hasRobotsTxt: false,
                            isIndexable
                        }
                    }
                }
            });
        }
        return assessments;
    }
    async checkHreflangTags(parsedContent) {
        const assessments = [];
        const hreflangs = parsedContent.technical?.hreflang || [];
        if (hreflangs.length === 0) {
            assessments.push({
                id: 'hreflang-none',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'technical-seo',
                name: 'No Hreflang Tags',
                description: 'Page has no hreflang tags',
                status: assessment_types_1.AssessmentStatus.OK,
                score: 80,
                impact: 'low',
                recommendation: 'If you have multilingual content, consider adding hreflang tags.',
                category: 'technical-seo',
                data: {
                    technical: {
                        canonicalUrl: { isPresent: false, isValid: false },
                        hreflang: { tags: [], hasErrors: false },
                        ssl: { isSecure: true, hasMixedContent: false },
                        robots: { isIndexable: true, hasRobotsTxt: false },
                        sitemap: { isReferencedInRobots: false }
                    }
                }
            });
        }
        else {
            const hasErrors = this.validateHreflangTags(hreflangs);
            assessments.push({
                id: hasErrors ? 'hreflang-errors' : 'hreflang-good',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'technical-seo',
                name: hasErrors ? 'Hreflang Tag Errors' : 'Good Hreflang Configuration',
                description: `Found ${hreflangs.length} hreflang tag(s)${hasErrors ? ' with errors' : ''}`,
                status: hasErrors ? assessment_types_1.AssessmentStatus.BAD : assessment_types_1.AssessmentStatus.GOOD,
                score: hasErrors ? 40 : 100,
                impact: 'medium',
                recommendation: hasErrors ? 'Fix hreflang tag errors for proper international SEO.' : 'Excellent! Your hreflang tags are properly configured.',
                category: 'technical-seo',
                data: {
                    technical: {
                        hreflang: {
                            tags: hreflangs,
                            hasErrors
                        }
                    }
                }
            });
        }
        return assessments;
    }
    async checkSSLSecurity(parsedContent, ingredients) {
        const assessments = [];
        const isSecure = ingredients.pageDetails.url.startsWith('https://');
        const hasMixedContent = parsedContent.security?.hasMixedContent || false;
        if (isSecure && !hasMixedContent) {
            assessments.push({
                id: 'ssl-good',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'technical-seo',
                name: 'Secure HTTPS Connection',
                description: 'Page is served over HTTPS without mixed content',
                status: assessment_types_1.AssessmentStatus.GOOD,
                score: 100,
                impact: 'high',
                recommendation: 'Perfect! Your page is fully secure.',
                category: 'technical-seo',
                data: {
                    technical: {
                        ssl: {
                            isSecure: true,
                            hasMixedContent: false
                        }
                    }
                }
            });
        }
        else if (isSecure && hasMixedContent) {
            assessments.push({
                id: 'ssl-mixed-content',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'technical-seo',
                name: 'Mixed Content Issues',
                description: 'Page is HTTPS but has mixed content',
                status: assessment_types_1.AssessmentStatus.OK,
                score: 70,
                impact: 'medium',
                recommendation: 'Fix mixed content issues by ensuring all resources are served over HTTPS.',
                category: 'technical-seo',
                data: {
                    technical: {
                        ssl: {
                            isSecure: true,
                            hasMixedContent: true
                        }
                    }
                }
            });
        }
        else {
            assessments.push({
                id: 'ssl-insecure',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'technical-seo',
                name: 'Insecure HTTP Connection',
                description: 'Page is not served over HTTPS',
                status: assessment_types_1.AssessmentStatus.BAD,
                score: 0,
                impact: 'high',
                recommendation: 'Implement HTTPS for better security and SEO rankings.',
                category: 'technical-seo',
                data: {
                    technical: {
                        ssl: {
                            isSecure: false,
                            hasMixedContent: false
                        }
                    }
                }
            });
        }
        return assessments;
    }
    async checkStructuredData(parsedContent) {
        const assessments = [];
        const structuredData = parsedContent.structuredDataDetailed;
        const totalSchemas = structuredData ? (structuredData.jsonLd.length + structuredData.microdata.length + structuredData.rdfa.length) : 0;
        if (totalSchemas === 0) {
            assessments.push({
                id: 'structured-data-missing',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'structured-data',
                name: 'No Structured Data',
                description: 'Page has no structured data markup',
                status: assessment_types_1.AssessmentStatus.OK,
                score: 60,
                impact: 'medium',
                recommendation: 'Add structured data markup to help search engines understand your content better.',
                category: 'structured-data',
                data: {
                    structuredData: []
                }
            });
        }
        else {
            const checks = [];
            if (structuredData) {
                structuredData.jsonLd.forEach(schema => {
                    checks.push({
                        type: schema.type,
                        isPresent: true,
                        isValid: this.validateJsonLdSchema(schema),
                        errors: [],
                        warnings: []
                    });
                });
            }
            const validSchemas = checks.filter(check => check.isValid).length;
            const score = totalSchemas > 0 ? (validSchemas / totalSchemas) * 100 : 0;
            assessments.push({
                id: 'structured-data-present',
                type: assessment_types_1.AssessmentType.SEO,
                assessmentType: 'structured-data',
                name: 'Structured Data Found',
                description: `Found ${totalSchemas} structured data schema(s), ${validSchemas} valid`,
                status: score >= 80 ? assessment_types_1.AssessmentStatus.GOOD : score >= 50 ? assessment_types_1.AssessmentStatus.OK : assessment_types_1.AssessmentStatus.BAD,
                score: Math.round(score),
                impact: 'medium',
                recommendation: score >= 80 ? 'Great! Your structured data is well implemented.' : 'Review and fix structured data validation errors.',
                category: 'structured-data',
                data: {
                    structuredData: checks
                }
            });
        }
        return assessments;
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    validateHreflangTags(hreflangs) {
        return hreflangs.some(tag => {
            const isValidLang = /^[a-z]{2}(-[A-Z]{2})?$/.test(tag.lang) || tag.lang === 'x-default';
            const isValidUrl = this.isValidUrl(tag.href);
            return !isValidLang || !isValidUrl;
        });
    }
    validateJsonLdSchema(schema) {
        const data = schema.data;
        switch (schema.type) {
            case 'Article':
            case 'BlogPosting':
                return !!(data.headline && data.author && data.datePublished);
            case 'Organization':
                return !!(data.name && data.url);
            case 'Person':
                return !!(data.name);
            case 'BreadcrumbList':
                return !!(data.itemListElement && Array.isArray(data.itemListElement));
            default:
                return true;
        }
    }
}
exports.TechnicalSEOAssessor = TechnicalSEOAssessor;
//# sourceMappingURL=technical-seo-assessor.service.js.map