/**
 * Unit Tests for KeywordMatcher
 */

import { KeywordMatcher } from '@/app/utils/keyword-matcher';

describe('KeywordMatcher', () => {
  let keywordMatcher: KeywordMatcher;

  beforeEach(() => {
    keywordMatcher = new KeywordMatcher();
  });

  describe('checkIfContainsKeyword', () => {
    it('should find exact matches', () => {
      const result = keywordMatcher.checkIfContainsKeyword('This is a test', 'test');
      expect(result).toBe(true);
    });

    it('should find case-insensitive matches', () => {
      const result = keywordMatcher.checkIfContainsKeyword('This is a TEST', 'test');
      expect(result).toBe(true);
    });

    it('should find Chinese keyword matches', () => {
      const result = keywordMatcher.checkIfContainsKeyword('動物方城市2是一部好電影', '動物方城市2');
      expect(result).toBe(true);
    });

    it('should find partial word matches', () => {
      const result = keywordMatcher.checkIfContainsKeyword('testing is good', 'test');
      expect(result).toBe(true);
    });

    it('should handle empty inputs', () => {
      expect(keywordMatcher.checkIfContainsKeyword('', 'test')).toBe(false);
      expect(keywordMatcher.checkIfContainsKeyword('test', '')).toBe(false);
    });

    it('should find matches with spaces removed (Chinese)', () => {
      const result = keywordMatcher.checkIfContainsKeyword('動物 方城市 2', '動物方城市2');
      expect(result).toBe(true);
    });

    it('should find multi-word keyword matches', () => {
      const result = keywordMatcher.checkIfContainsKeyword('This is a long sentence with multiple words', 'multiple words');
      expect(result).toBe(true);
    });
  });

  describe('calculateKeywordDensity', () => {
    it('should calculate density correctly', () => {
      const density = keywordMatcher.calculateKeywordDensity('test test test other words', 'test');
      expect(density).toBe(60); // 3 out of 5 words = 60%
    });

    it('should handle empty inputs', () => {
      expect(keywordMatcher.calculateKeywordDensity('', 'test')).toBe(0);
      expect(keywordMatcher.calculateKeywordDensity('test', '')).toBe(0);
    });

    it('should handle Chinese text', () => {
      const density = keywordMatcher.calculateKeywordDensity('動物方城市2 是 一部 好 電影 動物方城市2', '動物方城市2');
      expect(density).toBe(33.33333333333333); // 2 out of 6 words
    });
  });

  describe('findKeywordPositions', () => {
    it('should find single keyword position', () => {
      const positions = keywordMatcher.findKeywordPositions('This is a test', 'test');
      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual({
        start: 10,
        end: 14,
        match: 'test'
      });
    });

    it('should find multiple keyword positions', () => {
      const positions = keywordMatcher.findKeywordPositions('test this test', 'test');
      expect(positions).toHaveLength(2);
      expect(positions[0].start).toBe(0);
      expect(positions[1].start).toBe(10);
    });

    it('should find Chinese keyword positions', () => {
      const positions = keywordMatcher.findKeywordPositions('動物方城市2很好看', '動物方城市2');
      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual({
        start: 0,
        end: 6,
        match: '動物方城市2'
      });
    });
  });

  describe('isKeywordInFirstHalf', () => {
    it('should return true when keyword is in first half', () => {
      const result = keywordMatcher.isKeywordInFirstHalf('test this is a long sentence', 'test');
      expect(result).toBe(true);
    });

    it('should return false when keyword is in second half', () => {
      const result = keywordMatcher.isKeywordInFirstHalf('this is a long sentence test', 'test');
      expect(result).toBe(false);
    });

    it('should handle Chinese text', () => {
      const result = keywordMatcher.isKeywordInFirstHalf('動物方城市2是一部很好看的電影作品', '動物方城市2');
      expect(result).toBe(true);
    });
  });

  describe('generateKeywordVariants', () => {
    it('should generate English variants', () => {
      const variants = keywordMatcher.generateKeywordVariants('test');
      expect(variants).toContain('test');
      expect(variants).toContain('tests');
      expect(variants).toContain('Test');
      expect(variants).toContain('TEST');
    });

    it('should generate variants with spaces', () => {
      const variants = keywordMatcher.generateKeywordVariants('test keyword');
      expect(variants).toContain('test keyword');
      expect(variants).toContain('testkeyword');
      expect(variants).toContain('Test keyword');
    });

    it('should handle Chinese keywords', () => {
      const variants = keywordMatcher.generateKeywordVariants('動物方城市2');
      expect(variants).toContain('動物方城市2');
    });
  });

  describe('checkMultipleKeywords', () => {
    it('should check multiple keywords', () => {
      const results = keywordMatcher.checkMultipleKeywords('test this example', ['test', 'example', 'missing']);
      expect(results).toHaveLength(3);
      expect(results[0].found).toBe(true);
      expect(results[1].found).toBe(true);
      expect(results[2].found).toBe(false);
    });
  });

  describe('highlightKeywords', () => {
    it('should highlight keywords with default tag', () => {
      const highlighted = keywordMatcher.highlightKeywords('test this test', ['test']);
      expect(highlighted).toBe('<mark>test</mark> this <mark>test</mark>');
    });

    it('should highlight keywords with custom tag', () => {
      const highlighted = keywordMatcher.highlightKeywords('test this', ['test'], 'strong');
      expect(highlighted).toBe('<strong>test</strong> this');
    });
  });

  describe('analyzeKeyword', () => {
    it('should analyze keyword presence across elements', () => {
      const analysis = keywordMatcher.analyzeKeyword(
        'This is test content with test keyword',
        'test',
        [{ text: 'Test Title' }],
        [{ text: 'Test Heading' }],
        [{ text: 'Test Image' }],
        [{ text: 'Test Link' }]
      );

      expect(analysis.inTitle).toBe(true);
      expect(analysis.inH2).toBe(true);
      expect(analysis.inImages).toBe(true);
      expect(analysis.inLinks).toBe(true);
      expect(analysis.inContent).toBe(true);
      expect(analysis.density).toBeGreaterThan(0);
    });
  });

  describe('checkSynonyms', () => {
    it('should check synonyms', () => {
      const results = keywordMatcher.checkSynonyms('movie film cinema', ['movie', 'film', 'theater']);
      expect(results).toHaveLength(3);
      expect(results[0].found).toBe(true);
      expect(results[1].found).toBe(true);
      expect(results[2].found).toBe(false);
    });
  });
});