import type { NewSeoPage } from '../types/wordpress';
export declare const transforms: {
    cleanString: (value: unknown) => string;
    toDate: (value: unknown) => string;
    parseKeywords: (value: string) => string[];
    toInteger: (value: unknown) => number | null;
};
export declare const MAPPING_CONFIG: {
    wordpress: {
        article: {
            title: {
                path: string;
                transform: string;
            };
            content: {
                path: string;
                transform: string;
            };
            byline: {
                path: string;
                transform: string;
            };
            publishedDate: {
                path: string;
                transform: string;
            };
        };
        seo: {
            metaTitle: {
                path: string;
                transform: string;
            };
            metaDescription: {
                path: string;
                transform: string;
            };
            focusKeyphrase: {
                path: string;
                transform: string;
            };
        };
    };
};
export declare function mapData(data: any, config: any): any;
export declare function createSeoPage(data: any, meta: {
    url: string;
    projectId: string;
    scrapeBy: string;
}): NewSeoPage;
