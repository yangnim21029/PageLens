/**
 * Unit Tests for SEO Assessor
 */

import { SEOAssessor } from '@/app/running-the-tests/assessments/seo-checks/seo-assessor.service';
import { ParsedContent } from '@/app/understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '@/app/gathering-ingredients/types/ingredients.types';

describe('SEOAssessor', () => {
  let seoAssessor: SEOAssessor;

  beforeEach(() => {
    seoAssessor = new SEOAssessor();
  });

  const mockParsedContent: ParsedContent = {
    title: 'Test Title with Keyword',
    metaDescription: 'Test description',
    headings: [
      { text: 'Main Title', level: 1, order: 0 },
      { text: 'Subtitle', level: 2, order: 1 }
    ],
    images: [
      { src: 'image1.jpg', alt: 'Image 1', title: '', width: undefined, height: undefined },
      { src: 'image2.jpg', alt: '', title: '', width: undefined, height: undefined }
    ],
    links: [
      { text: 'Link 1', href: 'https://example.com', isExternal: true, isNoFollow: false },
      { text: 'Link 2', href: '/internal', isExternal: false, isNoFollow: false }
    ],
    videos: [],
    textContent: 'This is test content with keyword mentioned multiple times. More content here.',
    wordCount: 12,
    paragraphs: [],
    structuredData: [],
    textStats: { wordCount: 12, charCount: 0, paragraphCount: 0, readingTime: 0, sentences: 0 },
    mainContentHtml: '',
    author: '',
    publishedDate: undefined
  };

  const mockIngredients: PageIngredients = {
    htmlContent: '<html><body>Test</body></html>',
    pageDetails: {
      url: 'https://example.com/test',
      title: 'Test Page'
    },
    focusKeyword: 'keyword',
    synonyms: ['term', 'phrase']
  };

  describe('runSEOChecks', () => {
    it('should return array of assessment results', async () => {
      const results = await seoAssessor.runSEOChecks(mockParsedContent, mockIngredients);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should assess H1 keyword presence', async () => {
      const contentWithKeywordInH1: ParsedContent = {
        ...mockParsedContent,
        headings: [{ text: 'Title with keyword', level: 1, order: 0 }],
        paragraphs: [],
        structuredData: [],
        textStats: { wordCount: 0, charCount: 0, paragraphCount: 0, readingTime: 0, sentences: 0 },
        mainContentHtml: '',
        author: '',
        publishedDate: undefined
      };

      const results = await seoAssessor.runSEOChecks(contentWithKeywordInH1, mockIngredients);
      const h1Assessment = results.find(r => r.id.includes('h1'));
      
      expect(h1Assessment).toBeDefined();
      expect(h1Assessment?.status).toBe('good');
    });

    it('should assess missing H1 keyword', async () => {
      const contentWithoutKeywordInH1: ParsedContent = {
        ...mockParsedContent,
        headings: [{ text: 'Title without focus term', level: 1, order: 0 }],
        paragraphs: [],
        structuredData: [],
        textStats: { wordCount: 0, charCount: 0, paragraphCount: 0, readingTime: 0, sentences: 0 },
        mainContentHtml: '',
        author: '',
        publishedDate: undefined
      };

      const results = await seoAssessor.runSEOChecks(contentWithoutKeywordInH1, mockIngredients);
      const h1Assessment = results.find(r => r.id.includes('h1'));
      
      expect(h1Assessment).toBeDefined();
      expect(h1Assessment?.status).toBe('ok');
    });

    it('should assess image alt texts', async () => {
      const results = await seoAssessor.runSEOChecks(mockParsedContent, mockIngredients);
      const imageAssessment = results.find(r => r.id.includes('image'));
      
      expect(imageAssessment).toBeDefined();
      expect(imageAssessment?.status).toBe('ok'); // 1 out of 2 images has alt text
    });

    it('should assess keyword density', async () => {
      const contentWithHighKeywordDensity = {
        ...mockParsedContent,
        textContent: 'keyword keyword keyword keyword keyword',
        wordCount: 5
      };

      const results = await seoAssessor.runSEOChecks(contentWithHighKeywordDensity, mockIngredients);
      const densityAssessment = results.find(r => r.id.includes('keyword-density'));
      
      expect(densityAssessment).toBeDefined();
      expect(densityAssessment?.status).toBe('bad'); // 100% density is too high
    });

    it('should assess title tag optimization', async () => {
      const results = await seoAssessor.runSEOChecks(mockParsedContent, mockIngredients);
      const titleAssessment = results.find(r => r.id.includes('title'));
      
      expect(titleAssessment).toBeDefined();
      expect(titleAssessment?.status).toBe('ok'); // Title contains keyword and is good length
    });

    it('should assess meta description', async () => {
      const contentWithGoodMeta = {
        ...mockParsedContent,
        metaDescription: 'This is a good meta description with keyword that is between 150-160 characters long and provides valuable information about the page content'
      };

      const results = await seoAssessor.runSEOChecks(contentWithGoodMeta, mockIngredients);
      const metaAssessment = results.find(r => r.id.includes('meta-description'));
      
      expect(metaAssessment).toBeDefined();
      expect(metaAssessment?.status).toBe('ok');
    });

    it('should assess content length', async () => {
      const contentTooShort = {
        ...mockParsedContent,
        wordCount: 50
      };

      const results = await seoAssessor.runSEOChecks(contentTooShort, mockIngredients);
      const lengthAssessment = results.find(r => r.id.includes('content-length'));
      
      expect(lengthAssessment).toBeDefined();
      expect(lengthAssessment?.status).toBe('bad');
    });

    it('should handle Chinese content', async () => {
      const chineseContent: ParsedContent = {
        ...mockParsedContent,
        title: '動物方城市2電影資訊',
        headings: [{ text: '動物方城市2上映時間', level: 1, order: 0 }],
        textContent: '迪士尼動畫電影動物方城市2即將上映，這是一部精彩的續集電影。',
        wordCount: 15,
        paragraphs: [],
        structuredData: [],
        textStats: { wordCount: 15, charCount: 0, paragraphCount: 0, readingTime: 0, sentences: 0 },
        mainContentHtml: '',
        author: '',
        publishedDate: undefined
      };

      const chineseIngredients = {
        ...mockIngredients,
        focusKeyword: '動物方城市2'
      };

      const results = await seoAssessor.runSEOChecks(chineseContent, chineseIngredients);
      expect(results.length).toBeGreaterThan(0);
      
      const h1Assessment = results.find(r => r.id.includes('h1'));
      expect(h1Assessment?.status).toBe('good');
    });

    it('should assess keyword in first paragraph', async () => {
      const contentWithKeywordInFirstParagraph = {
        ...mockParsedContent,
        textContent: 'This first paragraph contains the keyword. This is the second paragraph without the focus term.'
      };

      const results = await seoAssessor.runSEOChecks(contentWithKeywordInFirstParagraph, mockIngredients);
      const firstParagraphAssessment = results.find(r => r.id.includes('first-paragraph') || r.id.includes('keyword-first'));
      
      expect(firstParagraphAssessment).toBeDefined();
      expect(firstParagraphAssessment?.status).toBe('ok');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', async () => {
      const emptyContent: ParsedContent = {
        title: '',
        metaDescription: '',
        headings: [],
        images: [],
        links: [],
        videos: [],
        textContent: '',
        wordCount: 0,
        paragraphs: [],
        structuredData: [],
        textStats: { wordCount: 0, charCount: 0, paragraphCount: 0, readingTime: 0, sentences: 0 },
        mainContentHtml: '',
        author: '',
        publishedDate: undefined
      };

      const results = await seoAssessor.runSEOChecks(emptyContent, mockIngredients);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle missing focus keyword', async () => {
      const noKeywordIngredients = {
        ...mockIngredients,
        focusKeyword: ''
      };

      const results = await seoAssessor.runSEOChecks(mockParsedContent, noKeywordIngredients);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle very long content', async () => {
      const longContent = {
        ...mockParsedContent,
        textContent: 'word '.repeat(2000),
        wordCount: 2000
      };

      const results = await seoAssessor.runSEOChecks(longContent, mockIngredients);
      const lengthAssessment = results.find(r => r.id.includes('content-length'));
      expect(lengthAssessment?.status).toBe('good');
    });
  });
});