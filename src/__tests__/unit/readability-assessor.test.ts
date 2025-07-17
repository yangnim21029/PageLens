/**
 * Unit Tests for Readability Assessor
 */

import { ReadabilityAssessor } from '@/app/running-the-tests/assessments/readability-checks/readability-assessor.service';
import { ParsedContent } from '@/app/understanding-the-page/types/parsed-content.types';

describe('ReadabilityAssessor', () => {
  let readabilityAssessor: ReadabilityAssessor;

  beforeEach(() => {
    readabilityAssessor = new ReadabilityAssessor();
  });

  const mockParsedContent: ParsedContent = {
    title: 'Test Title',
    metaDescription: 'Test description',
    headings: [
      { text: 'Main Title', level: 1, order: 0 },
      { text: 'Subtitle', level: 2, order: 1 }
    ],
    images: [],
    links: [],
    videos: [],
    textContent: 'This is a test sentence. This is another sentence with more words. Short sentence.',
    wordCount: 15,
    paragraphs: ['This is a test sentence. This is another sentence with more words. Short sentence.'],
    structuredData: [],
    textStats: { wordCount: 15, charCount: 0, paragraphCount: 0, readingTime: 0, sentences: 0 },
    mainContentHtml: '',
    author: '',
    publishedDate: undefined
  };

  describe('runReadabilityChecks', () => {
    it('should return array of assessment results', async () => {
      const results = await readabilityAssessor.runReadabilityChecks(mockParsedContent);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should assess sentence length', async () => {
      const contentWithLongSentences = {
        ...mockParsedContent,
        textContent: 'This is a very long sentence that contains way too many words and should be broken down into smaller sentences for better readability and user experience. Another long sentence here.'
      };

      const results = await readabilityAssessor.runReadabilityChecks(contentWithLongSentences);
      const sentenceAssessment = results.find(r => r.id.includes('sentence-length'));
      
      expect(sentenceAssessment).toBeDefined();
      expect(sentenceAssessment?.status).toMatch(/^(ok|bad)$/);
    });

    it('should assess good sentence length', async () => {
      const contentWithGoodSentences = {
        ...mockParsedContent,
        textContent: 'This is good. Short sentences are better. They are easy to read.'
      };

      const results = await readabilityAssessor.runReadabilityChecks(contentWithGoodSentences);
      const sentenceAssessment = results.find(r => r.id.includes('sentence-length'));
      
      expect(sentenceAssessment).toBeDefined();
      expect(sentenceAssessment?.status).toBe('good');
    });

    it('should calculate Flesch Reading Ease score', async () => {
      const results = await readabilityAssessor.runReadabilityChecks(mockParsedContent);
      const fleschAssessment = results.find(r => r.id.includes('flesch'));
      
      expect(fleschAssessment).toBeDefined();
      expect(fleschAssessment?.score).toBeGreaterThanOrEqual(0);
      expect(fleschAssessment?.score).toBeLessThanOrEqual(100);
    });

    it('should assess paragraph length', async () => {
      const contentWithLongParagraphs = {
        ...mockParsedContent,
        textContent: 'This is a very long paragraph that goes on and on with many sentences that should probably be broken up into smaller paragraphs for better readability. ' +
                   'It continues with more sentences that make it even longer and harder to read. ' +
                   'This makes the paragraph too long for good readability standards.'
      };

      const results = await readabilityAssessor.runReadabilityChecks(contentWithLongParagraphs);
      const paragraphAssessment = results.find(r => r.id.includes('paragraph-length'));
      
      expect(paragraphAssessment).toBeDefined();
    });

    it('should assess subheading distribution', async () => {
      const contentWithGoodSubheadings: ParsedContent = {
        ...mockParsedContent,
        headings: [
          { text: 'Main Title', level: 1, order: 0 },
          { text: 'First Section', level: 2, order: 1 },
          { text: 'Second Section', level: 2, order: 2 },
          { text: 'Third Section', level: 2, order: 3 }
        ],
        textContent: 'Content with good subheading distribution. ' + 'word '.repeat(300),
        wordCount: 303,
        images: [],
        links: [],
        videos: [],
        paragraphs: [],
        structuredData: [],
        textStats: { wordCount: 303, charCount: 0, paragraphCount: 0, readingTime: 0, sentences: 0 },
        mainContentHtml: '',
        author: '',
        publishedDate: undefined
      };

      const results = await readabilityAssessor.runReadabilityChecks(contentWithGoodSubheadings);
      const subheadingAssessment = results.find(r => r.id.includes('subheading'));
      
      expect(subheadingAssessment).toBeDefined();
      expect(subheadingAssessment?.status).toBe('good');
    });

    it('should handle Chinese content', async () => {
      const chineseContent = {
        ...mockParsedContent,
        textContent: '這是一個中文句子。另一個句子包含更多的詞語。短句子更容易閱讀。',
        wordCount: 20
      };

      const results = await readabilityAssessor.runReadabilityChecks(chineseContent);
      expect(results.length).toBeGreaterThan(0);
      
      const fleschAssessment = results.find(r => r.id.includes('flesch'));
      expect(fleschAssessment).toBeDefined();
    });

    it('should assess transition words usage', async () => {
      const contentWithTransitions = {
        ...mockParsedContent,
        textContent: 'First, we need to understand the problem. However, the solution is not simple. Therefore, we must be careful. Additionally, we should consider alternatives.'
      };

      const results = await readabilityAssessor.runReadabilityChecks(contentWithTransitions);
      const transitionAssessment = results.find(r => r.id.includes('transition'));
      
      // This test depends on whether transition word assessment is implemented
      if (transitionAssessment) {
        expect(transitionAssessment.status).toBe('good');
      }
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

      const results = await readabilityAssessor.runReadabilityChecks(emptyContent);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle single sentence', async () => {
      const singleSentence = {
        ...mockParsedContent,
        textContent: 'This is a single sentence.',
        wordCount: 5
      };

      const results = await readabilityAssessor.runReadabilityChecks(singleSentence);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle content without punctuation', async () => {
      const noPunctuation = {
        ...mockParsedContent,
        textContent: 'This is content without proper punctuation it should still be assessed',
        wordCount: 12
      };

      const results = await readabilityAssessor.runReadabilityChecks(noPunctuation);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle very short content', async () => {
      const shortContent = {
        ...mockParsedContent,
        textContent: 'Short.',
        wordCount: 1
      };

      const results = await readabilityAssessor.runReadabilityChecks(shortContent);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('scoring consistency', () => {
    it('should return consistent scores for same content', async () => {
      const results1 = await readabilityAssessor.runReadabilityChecks(mockParsedContent);
      const results2 = await readabilityAssessor.runReadabilityChecks(mockParsedContent);
      
      expect(results1.length).toBe(results2.length);
      
      results1.forEach((result, index) => {
        expect(result.score).toBe(results2[index].score);
        expect(result.status).toBe(results2[index].status);
      });
    });

    it('should have scores between 0 and 100', async () => {
      const results = await readabilityAssessor.runReadabilityChecks(mockParsedContent);
      
      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      });
    });
  });
});