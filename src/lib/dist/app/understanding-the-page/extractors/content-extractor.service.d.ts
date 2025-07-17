import { ContentSelectors } from '../parsers/html-parser.service';
import { ContentExtractionResult } from '../types/parsed-content.types';
export interface ContentExtractionOptions extends ContentSelectors {
    baseUrl?: string;
    extractMainContent?: boolean;
}
export declare class ContentExtractor {
    private htmlParser;
    constructor();
    extractContent(htmlContent: string, options?: ContentExtractionOptions): Promise<ContentExtractionResult>;
    getArticlePartHtml(html: string): Promise<{
        content: string;
        textContent: string;
        title: string;
        byline: string;
    } | null>;
    htmlToTextByMozReadability(html: string): Promise<string | null>;
}
export declare function htmlToTextByMozReadability(html: string): Promise<string | null>;
