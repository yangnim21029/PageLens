"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentExtractor = void 0;
exports.htmlToTextByMozReadability = htmlToTextByMozReadability;
const html_parser_service_1 = require("../parsers/html-parser.service");
class ContentExtractor {
    constructor() {
        this.htmlParser = new html_parser_service_1.HTMLParser();
    }
    async extractContent(htmlContent, options = {}) {
        try {
            if (!htmlContent || htmlContent.trim().length === 0) {
                throw new Error('HTML content is empty');
            }
            const parsedContent = this.htmlParser.parse(htmlContent, options);
            if (!parsedContent.title && !parsedContent.textContent) {
                throw new Error('Unable to extract meaningful content from HTML');
            }
            return {
                success: true,
                parsedContent
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to extract content'
            };
        }
    }
    async getArticlePartHtml(html) {
        try {
            const result = await this.extractContent(html);
            if (!result.success || !result.parsedContent) {
                return null;
            }
            return {
                content: result.parsedContent.mainContentHtml,
                textContent: result.parsedContent.textContent,
                title: result.parsedContent.title,
                byline: result.parsedContent.author || ''
            };
        }
        catch (error) {
            console.warn('[getArticlePartHtml] 處理失敗:', error);
            return null;
        }
    }
    async htmlToTextByMozReadability(html) {
        try {
            const result = await this.extractContent(html);
            if (!result.success || !result.parsedContent) {
                return null;
            }
            return result.parsedContent.textContent;
        }
        catch (error) {
            return null;
        }
    }
}
exports.ContentExtractor = ContentExtractor;
async function htmlToTextByMozReadability(html) {
    const extractor = new ContentExtractor();
    return await extractor.htmlToTextByMozReadability(html);
}
//# sourceMappingURL=content-extractor.service.js.map