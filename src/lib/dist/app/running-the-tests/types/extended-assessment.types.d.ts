import { AssessmentResult, AssessmentType } from './assessment.types';
export interface StructuredDataCheck {
    type: 'Article' | 'BlogPosting' | 'BreadcrumbList' | 'Organization' | 'Person' | 'FAQ' | 'HowTo';
    isPresent: boolean;
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
}
export interface SocialMediaTags {
    openGraph: {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
        type?: string;
        siteName?: string;
    };
    twitterCard: {
        card?: string;
        title?: string;
        description?: string;
        image?: string;
        site?: string;
        creator?: string;
    };
    pinterest?: {
        richPins?: boolean;
        verified?: boolean;
    };
}
export interface TechnicalSEOChecks {
    canonicalUrl?: {
        isPresent: boolean;
        url?: string;
        isValid: boolean;
    };
    hreflang?: {
        tags: Array<{
            lang: string;
            href: string;
        }>;
        hasErrors: boolean;
    };
    ssl?: {
        isSecure: boolean;
        hasMixedContent: boolean;
    };
    robots?: {
        metaRobots?: string;
        hasRobotsTxt: boolean;
        isIndexable: boolean;
    };
    sitemap?: {
        isReferencedInRobots: boolean;
        xmlSitemapUrl?: string;
    };
}
export interface LinkAnalysis {
    internal: {
        count: number;
        uniqueCount: number;
        brokenCount: number;
        links: Array<{
            url: string;
            anchorText: string;
            isNoFollow: boolean;
            isBroken: boolean;
        }>;
    };
    external: {
        count: number;
        uniqueCount: number;
        brokenCount: number;
        links: Array<{
            url: string;
            anchorText: string;
            isNoFollow: boolean;
            isBroken: boolean;
            domain: string;
        }>;
    };
}
export interface CoreWebVitals {
    lcp?: {
        value: number;
        rating: 'good' | 'needs-improvement' | 'poor';
    };
    fid?: {
        value: number;
        rating: 'good' | 'needs-improvement' | 'poor';
    };
    cls?: {
        value: number;
        rating: 'good' | 'needs-improvement' | 'poor';
    };
}
export interface AdvancedReadabilityMetrics {
    gunningFog: {
        score: number;
        interpretation: string;
    };
    smog: {
        score: number;
        interpretation: string;
    };
    colemanLiau: {
        score: number;
        interpretation: string;
    };
    automatedReadability: {
        score: number;
        interpretation: string;
    };
}
export interface ContentStructure {
    lists: {
        ordered: number;
        unordered: number;
        totalItems: number;
        averageItemsPerList: number;
    };
    tables: {
        count: number;
        withHeaders: number;
        withCaption: number;
        accessibility: {
            missingHeaders: number;
            complexTables: number;
        };
    };
    blockquotes: {
        count: number;
        withCitation: number;
    };
    codeBlocks: {
        count: number;
        withLanguage: number;
        languages: string[];
    };
}
export interface VisualDesignChecks {
    typography: {
        fontSize: {
            min: number;
            max: number;
            average: number;
            isMobileReadable: boolean;
        };
        lineHeight: {
            average: number;
            isOptimal: boolean;
        };
        fontFamilies: string[];
    };
    contrast: {
        textContrast: Array<{
            selector: string;
            ratio: number;
            passes: {
                aa: boolean;
                aaa: boolean;
            };
        }>;
    };
    responsive: {
        hasViewportMeta: boolean;
        hasMobileStyles: boolean;
        breakpoints: number[];
    };
}
export interface ExtendedAssessmentResult extends AssessmentResult {
    assessmentType: AssessmentType | 'technical-seo' | 'social-media' | 'structured-data' | 'links' | 'performance' | 'advanced-readability' | 'content-structure' | 'visual-design';
    category?: 'seo' | 'readability' | 'technical' | 'performance' | 'technical-seo' | 'social-media' | 'structured-data' | 'links' | 'advanced-readability' | 'content-structure' | 'visual-design';
    data?: {
        structuredData?: StructuredDataCheck[];
        socialMedia?: SocialMediaTags;
        technical?: TechnicalSEOChecks;
        links?: LinkAnalysis;
        coreWebVitals?: CoreWebVitals;
        advancedReadability?: AdvancedReadabilityMetrics;
        contentStructure?: ContentStructure;
        visualDesign?: VisualDesignChecks;
    };
}
export interface ExtendedTestResults {
    seoScore: number;
    readabilityScore: number;
    technicalScore: number;
    performanceScore: number;
    overallScore: number;
    assessments: ExtendedAssessmentResult[];
    detailedMetrics: {
        seo: {
            basic: AssessmentResult[];
            technical: ExtendedAssessmentResult[];
            structured: ExtendedAssessmentResult[];
            social: ExtendedAssessmentResult[];
        };
        readability: {
            basic: AssessmentResult[];
            advanced: ExtendedAssessmentResult[];
            structure: ExtendedAssessmentResult[];
        };
        performance: ExtendedAssessmentResult[];
        accessibility: ExtendedAssessmentResult[];
    };
    timestamp: Date;
}
