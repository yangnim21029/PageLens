/**
 * Unit Tests for HTMLParser
 */

import { HTMLParser } from '@/app/understanding-the-page/parsers/html-parser.service';

describe('HTMLParser', () => {
  let htmlParser: HTMLParser;

  beforeEach(() => {
    htmlParser = new HTMLParser();
  });

  describe('parse', () => {
    it('should parse basic HTML structure', () => {
      const html = `
        <html>
          <head>
            <title>Test Title</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <h1>Main Title</h1>
            <p>Test content</p>
          </body>
        </html>
      `;

      const result = htmlParser.parse(html);

      expect(result.title).toBe('Test Title');
      expect(result.metaDescription).toBe('Test description');
      expect(result.headings).toHaveLength(1);
      expect(result.headings[0].text).toBe('Main Title');
      expect(result.headings[0].level).toBe(1);
    });

    it('should extract all heading levels', () => {
      const html = `
        <html>
          <body>
            <h1>H1 Title</h1>
            <h2>H2 Title</h2>
            <h3>H3 Title</h3>
            <h4>H4 Title</h4>
            <h5>H5 Title</h5>
            <h6>H6 Title</h6>
          </body>
        </html>
      `;

      const result = htmlParser.parse(html);

      expect(result.headings).toHaveLength(6);
      expect(result.headings[0].level).toBe(1);
      expect(result.headings[1].level).toBe(2);
      expect(result.headings[5].level).toBe(6);
    });

    it('should extract images with alt text', () => {
      const html = `
        <html>
          <body>
            <img src="image1.jpg" alt="Image 1">
            <img src="image2.jpg" alt="Image 2">
            <img src="image3.jpg">
          </body>
        </html>
      `;

      const result = htmlParser.parse(html);

      expect(result.images).toHaveLength(3);
      expect(result.images[0].alt).toBe('Image 1');
      expect(result.images[1].alt).toBe('Image 2');
      expect(result.images[2].alt).toBeUndefined();
    });

    it('should extract links', () => {
      const html = `
        <html>
          <body>
            <a href="https://example.com">External Link</a>
            <a href="/internal">Internal Link</a>
            <a href="mailto:test@example.com">Email Link</a>
          </body>
        </html>
      `;

      const result = htmlParser.parse(html);

      expect(result.links).toHaveLength(3);
      expect(result.links[0].text).toBe('External Link');
      expect(result.links[0].href).toBe('https://example.com');
      expect(result.links[0].isExternal).toBe(true);
      expect(result.links[1].isExternal).toBe(false);
    });

    it('should extract text content and count words', () => {
      const html = `
        <html>
          <body>
            <p>This is a test paragraph with multiple words.</p>
            <p>Another paragraph with more content.</p>
          </body>
        </html>
      `;

      const result = htmlParser.parse(html);

      expect(result.textContent).toContain('This is a test paragraph');
      expect(result.textContent).toContain('Another paragraph with more content');
      expect(result.wordCount).toBe(13);
    });

    it('should handle content selectors', () => {
      const html = `
        <html>
          <body>
            <div class="header">Header content</div>
            <div class="content">
              <p>Main content here</p>
              <p>More main content</p>
            </div>
            <div class="footer">Footer content</div>
          </body>
        </html>
      `;

      const result = htmlParser.parse(html, {
        contentSelectors: ['.content'],
        excludeSelectors: ['.footer']
      });

      expect(result.textContent).toContain('Main content here');
      expect(result.textContent).toContain('More main content');
      expect(result.textContent).not.toContain('Footer content');
    });

    it('should extract videos', () => {
      const html = `
        <html>
          <body>
            <video src="video1.mp4" title="Video 1"></video>
            <iframe src="https://youtube.com/embed/123" title="YouTube Video"></iframe>
          </body>
        </html>
      `;

      const result = htmlParser.parse(html);

      expect(result.videos).toHaveLength(2);
      expect(result.videos[0].title).toBe('Video 1');
      expect(result.videos[1].title).toBe('YouTube Video');
    });

    it('should handle Chinese content', () => {
      const html = `
        <html>
          <head>
            <title>動物方城市2電影</title>
            <meta name="description" content="迪士尼動畫電影續集">
          </head>
          <body>
            <h1>動物方城市2上映資訊</h1>
            <p>經過九年等待，動物方城市2終於要上映了！</p>
          </body>
        </html>
      `;

      const result = htmlParser.parse(html);

      expect(result.title).toBe('動物方城市2電影');
      expect(result.metaDescription).toBe('迪士尼動畫電影續集');
      expect(result.headings[0].text).toBe('動物方城市2上映資訊');
      expect(result.textContent).toContain('動物方城市2終於要上映了');
    });

    it('should handle empty or invalid HTML', () => {
      expect(() => htmlParser.parse('')).not.toThrow();
      expect(() => htmlParser.parse('<html></html>')).not.toThrow();
      expect(() => htmlParser.parse('invalid html')).not.toThrow();
    });

    it('should exclude script and style content', () => {
      const html = `
        <html>
          <head>
            <script>console.log('script content');</script>
            <style>.test { color: red; }</style>
          </head>
          <body>
            <p>Visible content</p>
            <script>alert('more script');</script>
          </body>
        </html>
      `;

      const result = htmlParser.parse(html);

      expect(result.textContent).toContain('Visible content');
      expect(result.textContent).not.toContain('script content');
      expect(result.textContent).not.toContain('color: red');
    });
  });

  describe('legacy compatibility methods', () => {
    it('should support extractTitle', () => {
      const html = '<html><head><title>Test Title</title></head></html>';
      const result = htmlParser.parse(html);
      expect(result.title).toBe('Test Title');
    });

    it('should support extractH1Tags', () => {
      const html = '<html><body><h1>First H1</h1><h1>Second H1</h1></body></html>';
      const result = htmlParser.parse(html);
      const h1Tags = result.headings.filter(h => h.level === 1);
      expect(h1Tags).toHaveLength(2);
      expect(h1Tags[0].text).toBe('First H1');
    });

    it('should support extractImageAltTexts', () => {
      const html = '<html><body><img alt="Alt 1"><img alt="Alt 2"></body></html>';
      const result = htmlParser.parse(html);
      expect(result.images).toHaveLength(2);
      expect(result.images[0].alt).toBe('Alt 1');
      expect(result.images[1].alt).toBe('Alt 2');
    });
  });
});