"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLParser = void 0;
const jsdom_1 = require("jsdom");
class HTMLParser {
    constructor() {
        this.defaultContentSelectors = [
            'main',
            'article',
            '.content',
            '.post-content',
            '.entry-content',
            '.article-content',
            '#content',
            '#main'
        ];
        this.defaultExcludeSelectors = [
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
        this.htmlToTextOptions = {
            wordwrap: 130,
            preserveNewlines: true,
            ignoreHref: true,
            ignoreImage: true
        };
    }
    parse(htmlContent, options = {}) {
        const dom = new jsdom_1.JSDOM(htmlContent);
        const document = dom.window.document;
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
    extractMainContent(document, options) {
        const contentSelectors = options.contentSelectors || this.defaultContentSelectors;
        const excludeSelectors = options.excludeSelectors || this.defaultExcludeSelectors;
        const elementsToRemove = document.querySelectorAll(excludeSelectors.join(', '));
        elementsToRemove.forEach(el => el.remove());
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }
        return document.body;
    }
    extractTitle(document) {
        const titleTag = document.querySelector('title');
        return titleTag?.textContent?.trim() || '';
    }
    extractMetaDescription(document) {
        const metaDesc = document.querySelector('meta[name="description"]');
        return metaDesc?.getAttribute('content')?.trim();
    }
    extractHeadings(element) {
        const headings = [];
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
    extractImages(element) {
        const images = [];
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
    extractLinks(element, originalHtml) {
        const links = [];
        const linkElements = element.querySelectorAll('a[href]');
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
    extractVideos(element) {
        const videos = [];
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
    extractTextContent(element) {
        const body = element.body ? element.body : element;
        if (!body)
            return '';
        const clone = body.cloneNode(true);
        const scripts = clone.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());
        return clone.textContent?.trim() || '';
    }
    countWords(element) {
        const text = this.extractTextContent(element);
        return this.analyzeTextLength(text);
    }
    analyzeTextLength(text) {
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
    extractParagraphs(element) {
        const paragraphs = [];
        const pElements = element.querySelectorAll('p');
        pElements.forEach(p => {
            const text = p.textContent?.trim();
            if (text && text.length > 0) {
                paragraphs.push(text);
            }
        });
        return paragraphs;
    }
    extractStructuredData(document) {
        const structuredData = [];
        const scriptElements = document.querySelectorAll('script[type="application/ld+json"]');
        scriptElements.forEach(script => {
            try {
                const data = JSON.parse(script.textContent || '');
                structuredData.push(data);
            }
            catch {
            }
        });
        return structuredData;
    }
    getTextStats(element) {
        const textContent = this.extractTextContent(element);
        const wordCount = this.analyzeTextLength(textContent);
        const sentences = textContent.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
        const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        return {
            wordCount,
            charCount: textContent.length,
            paragraphCount: paragraphs.length,
            readingTime: Math.ceil(wordCount / 200),
            sentences: sentences.length
        };
    }
    extractAuthor(document) {
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
    extractPublishedDate(document) {
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
    isExternalLink(href, baseUrl) {
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            return false;
        }
        if (href.startsWith('mailto:') || href.startsWith('tel:')) {
            return false;
        }
        try {
            const url = new URL(href, baseUrl);
            return baseUrl ? url.origin !== new URL(baseUrl).origin : true;
        }
        catch {
            return false;
        }
    }
    extractBaseUrl(html) {
        const baseTagMatch = html.match(/<base[^>]*href=['"](.*?)['"][^>]*>/i);
        if (baseTagMatch) {
            return baseTagMatch[1];
        }
        return undefined;
    }
    parseH1Elements(html) {
        const dom = new jsdom_1.JSDOM(html);
        const document = dom.window.document;
        const h1Elements = document.querySelectorAll('h1');
        return Array.from(h1Elements).map(h1 => ({
            text: h1.textContent?.trim() || ''
        }));
    }
    parseH2Elements(html) {
        const dom = new jsdom_1.JSDOM(html);
        const document = dom.window.document;
        const h2Elements = document.querySelectorAll('h2');
        return Array.from(h2Elements).map(h2 => ({
            text: h2.textContent?.trim() || ''
        }));
    }
    parseImageElements(html) {
        const dom = new jsdom_1.JSDOM(html);
        const document = dom.window.document;
        const imgElements = document.querySelectorAll('img');
        return Array.from(imgElements).map(img => ({
            text: img.getAttribute('alt') || '',
            src: img.getAttribute('src') || ''
        }));
    }
    parseInternalLinks(html, baseUrl) {
        const dom = new jsdom_1.JSDOM(html);
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
    parseExternalLinks(html, baseUrl) {
        const dom = new jsdom_1.JSDOM(html);
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
    parseSemanticContent(html) {
        const dom = new jsdom_1.JSDOM(html);
        const document = dom.window.document;
        const scripts = document.querySelectorAll('script, style');
        scripts.forEach(script => script.remove());
        const textContent = document.body?.textContent || document.textContent || '';
        return {
            text: textContent.trim()
        };
    }
    findKeywordInElements(html, keyword) {
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
exports.HTMLParser = HTMLParser;
//# sourceMappingURL=html-parser.service.js.map