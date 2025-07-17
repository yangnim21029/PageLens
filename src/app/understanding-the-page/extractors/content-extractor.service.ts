import { ContentSelectors, HTMLParser } from '../parsers/html-parser.service';
import { ContentExtractionResult } from '../types/parsed-content.types';

export interface ContentExtractionOptions extends ContentSelectors {
  baseUrl?: string;
  extractMainContent?: boolean;
}

export class ContentExtractor {
  private htmlParser: HTMLParser;

  constructor() {
    this.htmlParser = new HTMLParser();
  }

  async extractContent(
    htmlContent: string,
    options: ContentExtractionOptions = {}
  ): Promise<ContentExtractionResult> {
    try {
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('HTML content is empty');
      }

      const parsedContent = this.htmlParser.parse(htmlContent, options);

      // Validate parsed content
      if (!parsedContent.title && !parsedContent.textContent) {
        throw new Error('Unable to extract meaningful content from HTML');
      }

      return {
        success: true,
        parsedContent
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to extract content'
      };
    }
  }

  // Legacy method for backward compatibility
  async getArticlePartHtml(html: string): Promise<{
    content: string;
    textContent: string;
    title: string;
    byline: string;
  } | null> {
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
    } catch (error) {
      console.warn('[getArticlePartHtml] 處理失敗:', error);
      return null;
    }
  }

  // Legacy method for backward compatibility
  async htmlToTextByMozReadability(html: string): Promise<string | null> {
    try {
      const result = await this.extractContent(html);
      if (!result.success || !result.parsedContent) {
        return null;
      }

      return result.parsedContent.textContent;
    } catch (error) {
      return null;
    }
  }
}
