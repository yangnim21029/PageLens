import { ParsedContent } from '../types/parsed-content.types';
export interface ContentSelectors {
    contentSelectors?: string[];
    excludeSelectors?: string[];
}
export declare class HTMLParser {
    private defaultContentSelectors;
    private defaultExcludeSelectors;
    private htmlToTextOptions;
    parse(htmlContent: string, options?: ContentSelectors): ParsedContent;
    private extractMainContent;
    private extractTitle;
    private extractMetaDescription;
    private extractHeadings;
    private extractImages;
    private extractLinks;
    private extractVideos;
    private extractTextContent;
    private countWords;
    private analyzeTextLength;
    private extractParagraphs;
    private extractStructuredData;
    private getTextStats;
    private extractAuthor;
    private extractPublishedDate;
    private isExternalLink;
    private extractBaseUrl;
    parseH1Elements(html: string): Array<{
        text: string;
    }>;
    parseH2Elements(html: string): Array<{
        text: string;
    }>;
    parseImageElements(html: string): Array<{
        text: string;
        src: string;
    }>;
    parseInternalLinks(html: string, baseUrl?: string): Array<{
        text: string;
        href: string;
    }>;
    parseExternalLinks(html: string, baseUrl?: string): Array<{
        text: string;
        href: string;
    }>;
    parseSemanticContent(html: string): {
        text: string;
    };
    findKeywordInElements(html: string, keyword: string): {
        inTitle: boolean;
        inH2: boolean;
        inImages: boolean;
        inLinks: boolean;
        inContent: boolean;
    };
}
