import { JSDOM } from 'jsdom';
import { convert } from 'html-to-text';
import { ParsedContent, HeadingStructure, ImageInfo, LinkInfo, VideoInfo, TextStats } from '../types/parsed-content.types';

export interface ContentSelectors {
  contentSelectors?: string[];
  excludeSelectors?: string[];
}

export class HTMLParser {
  private defaultContentSelectors = [
    'main',
    'article',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '#content',
    '#main'
  ];

  private defaultExcludeSelectors = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    'aside',
    '.sidebar',
    '.menu',
    '.navigation',
    '.comments',
    '.related-posts'
  ];

  private htmlToTextOptions = {
    wordwrap: 130,
    preserveNewlines: true,
    ignoreHref: true,
    ignoreImage: true
  };

  parse(htmlContent: string, options: ContentSelectors = {}): ParsedContent {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Extract main content using selectors
    const mainContent = this.extractMainContent(document, options);

    return {
      title: this.extractTitle(document),
      metaDescription: this.extractMetaDescription(document),
      headings: this.extractHeadings(mainContent || document),
      images: this.extractImages(mainContent || document),
      links: this.extractLinks(mainContent || document, htmlContent),
      videos: this.extractVideos(mainContent || document),
      textContent: this.extractTextContent(mainContent || document),
      wordCount: this.countWords(mainContent || document),
      paragraphs: this.extractParagraphs(mainContent || document),
      structuredData: this.extractStructuredData(document),
      textStats: this.getTextStats(mainContent || document),
      mainContentHtml: mainContent?.innerHTML || document.body?.innerHTML || '',
      author: this.extractAuthor(document),
      publishedDate: this.extractPublishedDate(document)
    };
  }

  private extractMainContent(document: Document, options: ContentSelectors): Element | null {
    // Only use selectors if explicitly provided by user
    const contentSelectors = options.contentSelectors;
    const excludeSelectors = options.excludeSelectors;

    // Remove excluded elements first (only if user specified)
    if (excludeSelectors && excludeSelectors.length > 0) {
      const elementsToRemove = document.querySelectorAll(excludeSelectors.join(', '));
      elementsToRemove.forEach(el => el.remove());
    }

    // Find main content using selectors (only if user specified)
    if (contentSelectors && contentSelectors.length > 0) {
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element;
        }
      }
    }

    // Return full document body if no selectors specified
    // This allows complete content analysis without filtering
    return document.body;
  }

  private extractTitle(document: Document): string {
    const titleTag = document.querySelector('title');
    return titleTag?.textContent?.trim() || '';
  }

  private extractMetaDescription(document: Document): string | undefined {
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc?.getAttribute('content')?.trim();
  }

  private extractHeadings(element: Element | Document): HeadingStructure[] {
    const headings: HeadingStructure[] = [];
    const headingElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      headings.push({
        level,
        text: heading.textContent?.trim() || '',
        order: index
      });
    });

    return headings;
  }

  private extractImages(element: Element | Document): ImageInfo[] {
    const images: ImageInfo[] = [];
    const imgElements = element.querySelectorAll('img');

    imgElements.forEach(img => {
      images.push({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || undefined,
        title: img.getAttribute('title') || undefined,
        width: img.width || undefined,
        height: img.height || undefined
      });
    });

    return images;
  }

  private extractLinks(element: Element | Document, originalHtml: string): LinkInfo[] {
    const links: LinkInfo[] = [];
    const linkElements = element.querySelectorAll('a[href]');

    // Try to extract base URL from original HTML
    const baseUrl = this.extractBaseUrl(originalHtml);

    linkElements.forEach(link => {
      const href = link.getAttribute('href') || '';
      links.push({
        href,
        text: link.textContent?.trim() || '',
        isExternal: this.isExternalLink(href, baseUrl),
        isNoFollow: link.getAttribute('rel')?.includes('nofollow') || false
      });
    });

    return links;
  }

  private extractVideos(element: Element | Document): VideoInfo[] {
    const videos: VideoInfo[] = [];
    const videoElements = element.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');

    videoElements.forEach(video => {
      videos.push({
        src: video.getAttribute('src') || '',
        title: video.getAttribute('title') || undefined,
        type: video.tagName.toLowerCase() === 'video' ? 'video' : 'iframe'
      });
    });

    return videos;
  }

  private extractTextContent(element: Element | any): string {
    // Check if it's a Document-like object by checking for body property
    const body = element.body ? element.body : element;
    if (!body) return '';

    // Clone to avoid modifying original
    const clone = body.cloneNode(true) as Element;
    
    // Remove script and style elements
    const scripts = clone.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());

    return clone.textContent?.trim() || '';
  }

  private countWords(element: Element | Document): number {
    const text = this.extractTextContent(element);
    return this.analyzeTextLength(text);
  }

  private analyzeTextLength(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    
    // 檢測中文字符
    const chineseCharRegex = /[\u4e00-\u9fff]/g;
    const englishWordRegex = /[a-zA-Z]+/g;
    
    const chineseChars = text.match(chineseCharRegex) || [];
    const englishWords = text.match(englishWordRegex) || [];
    
    const totalChars = text.replace(/\s+/g, '').length;
    const chineseRatio = chineseChars.length / totalChars;
    
    // 根據語言類型計算
    if (chineseRatio > 0.7) {
      // 中文為主：中文字符 + 英文單詞
      return chineseChars.length + englishWords.length;
    } else if (chineseRatio < 0.1) {
      // 英文為主：傳統空格分隔
      return text.split(/\s+/).filter(word => word.length > 0).length;
    } else {
      // 混合語言：中文字符 + 英文單詞
      return chineseChars.length + englishWords.length;
    }
  }

  private extractParagraphs(element: Element | Document): string[] {
    const paragraphs: string[] = [];
    const pElements = element.querySelectorAll('p');

    pElements.forEach(p => {
      const text = p.textContent?.trim();
      if (text && text.length > 0) {
        paragraphs.push(text);
      }
    });

    return paragraphs;
  }

  private extractStructuredData(document: Document): any[] {
    const structuredData: any[] = [];
    const scriptElements = document.querySelectorAll('script[type="application/ld+json"]');

    scriptElements.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        structuredData.push(data);
      } catch {
        // Ignore invalid JSON
      }
    });

    return structuredData;
  }

  private getTextStats(element: Element | Document): TextStats {
    const textContent = this.extractTextContent(element);
    const wordCount = this.analyzeTextLength(textContent);
    
    // 支援中英文句號、問號、驚嘆號
    const sentences = textContent.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
    const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      wordCount,
      charCount: textContent.length,
      paragraphCount: paragraphs.length,
      readingTime: Math.ceil(wordCount / 200), // 200 words per minute
      sentences: sentences.length
    };
  }

  private extractAuthor(document: Document): string | undefined {
    const authorSelectors = [
      '[rel="author"]',
      '.author',
      '.byline',
      '.post-author',
      '.author-name',
      'meta[name="author"]'
    ];

    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent?.trim() || element.getAttribute('content')?.trim();
      }
    }

    return undefined;
  }

  private extractPublishedDate(document: Document): Date | undefined {
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="publishdate"]',
      'meta[name="date"]',
      'time[datetime]',
      '.published-date',
      '.post-date'
    ];

    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const dateStr = element.getAttribute('content') || 
                       element.getAttribute('datetime') || 
                       element.textContent?.trim();
        
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }

    return undefined;
  }

  private isExternalLink(href: string, baseUrl?: string): boolean {
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
      return false;
    }
    
    // Special protocols
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      return false;
    }
    
    try {
      const url = new URL(href, baseUrl);
      return baseUrl ? url.origin !== new URL(baseUrl).origin : true;
    } catch {
      return false;
    }
  }

  private extractBaseUrl(html: string): string | undefined {
    const baseTagMatch = html.match(/<base[^>]*href=['"](.*?)['"][^>]*>/i);
    if (baseTagMatch) {
      return baseTagMatch[1];
    }
    return undefined;
  }

  // Legacy methods for backward compatibility
  public parseH1Elements(html: string): Array<{ text: string }> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const h1Elements = document.querySelectorAll('h1');

    return Array.from(h1Elements).map(h1 => ({
      text: h1.textContent?.trim() || ''
    }));
  }

  public parseH2Elements(html: string): Array<{ text: string }> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const h2Elements = document.querySelectorAll('h2');

    return Array.from(h2Elements).map(h2 => ({
      text: h2.textContent?.trim() || ''
    }));
  }

  public parseImageElements(html: string): Array<{ text: string; src: string }> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const imgElements = document.querySelectorAll('img');

    return Array.from(imgElements).map(img => ({
      text: img.getAttribute('alt') || '',
      src: img.getAttribute('src') || ''
    }));
  }

  public parseInternalLinks(html: string, baseUrl?: string): Array<{ text: string; href: string }> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const linkElements = document.querySelectorAll('a[href]');

    return Array.from(linkElements)
      .filter(link => {
        const href = link.getAttribute('href');
        return href && !this.isExternalLink(href, baseUrl);
      })
      .map(link => ({
        text: link.textContent?.trim() || '',
        href: link.getAttribute('href') || ''
      }));
  }

  public parseExternalLinks(html: string, baseUrl?: string): Array<{ text: string; href: string }> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const linkElements = document.querySelectorAll('a[href]');

    return Array.from(linkElements)
      .filter(link => {
        const href = link.getAttribute('href');
        return href && this.isExternalLink(href, baseUrl);
      })
      .map(link => ({
        text: link.textContent?.trim() || '',
        href: link.getAttribute('href') || ''
      }));
  }

  public parseSemanticContent(html: string): { text: string } {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    const textContent = document.body?.textContent || document.textContent || '';

    return {
      text: textContent.trim()
    };
  }

  public findKeywordInElements(html: string, keyword: string) {
    const keywordLower = keyword.toLowerCase();
    const h1s = this.parseH1Elements(html);
    const h2s = this.parseH2Elements(html);
    const imgs = this.parseImageElements(html);
    const internalLinks = this.parseInternalLinks(html);
    const semanticContent = this.parseSemanticContent(html);

    return {
      inTitle: h1s.some(h1 => h1.text.toLowerCase().includes(keywordLower)),
      inH2: h2s.some(h2 => h2.text.toLowerCase().includes(keywordLower)),
      inImages: imgs.some(img => img.text.toLowerCase().includes(keywordLower)),
      inLinks: internalLinks.some(link => link.text.toLowerCase().includes(keywordLower)),
      inContent: semanticContent.text.toLowerCase().includes(keywordLower)
    };
  }
}