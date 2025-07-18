import { AssessmentResult, AssessmentCategory, AssessmentStatus, AvailableAssessments } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';

// 可讀性評估標準值定義
const READABILITY_STANDARDS = {
  FLESCH_SCORE: {
    optimal: { min: 60, max: 100, unit: '分' },
    acceptable: { min: 30, max: 100, unit: '分' },
    description: 'Flesch 分數 60+ 為易讀'
  },
  PARAGRAPH_LENGTH: {
    optimal: { max: 150, unit: '字/段' },
    acceptable: { max: 200, unit: '字/段' },
    description: '段落不超過 150 字'
  },
  SENTENCE_LENGTH: {
    optimal: { max: 20, unit: '字/句' },
    acceptable: { max: 25, unit: '字/句' },
    description: '句子不超過 20 字'
  },
  SUBHEADING_DISTRIBUTION: {
    optimal: { max: 300, unit: '字/標題' },
    acceptable: { max: 400, unit: '字/標題' },
    description: '每 300 字應有一個子標題'
  }
};

export class ReadabilityAssessor {
  async runReadabilityChecks(parsedContent: ParsedContent): Promise<AssessmentResult[]> {
    const assessments: AssessmentResult[] = [];

    // 確保返回所有 4 個 Readability assessments
    assessments.push(this.checkFleschReadingEase(parsedContent));
    assessments.push(this.checkParagraphLength(parsedContent));
    assessments.push(this.checkSentenceLength(parsedContent));
    assessments.push(this.checkSubheadingDistribution(parsedContent));

    return assessments;
  }

  private checkFleschReadingEase(parsedContent: ParsedContent): AssessmentResult {
    const text = parsedContent.textContent;
    
    if (!text || text.length < 100) {
      return {
        id: AvailableAssessments.FLESCH_READING_EASE,
        type: AssessmentCategory.READABILITY,
        name: 'Flesch Reading Ease - Content Too Short',
        description: 'Content is too short for reliable readability analysis',
        status: AssessmentStatus.OK,
        score: 80,
        impact: 'low',
        recommendation: 'Add more content for better readability analysis.',
        details: { contentLength: text.length, fleschScore: 0 }
      };
    }

    const fleschScore = this.calculateFleschScore(text);
    
    if (fleschScore >= 60) {
      return {
        id: AvailableAssessments.FLESCH_READING_EASE,
        type: AssessmentCategory.READABILITY,
        name: 'Good Readability',
        description: `Flesch Reading Ease score: ${fleschScore.toFixed(1)} (Good readability)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Excellent! Your content is easy to read.',
        details: { fleschScore, interpretation: this.interpretFleschScore(fleschScore) },
        standards: READABILITY_STANDARDS.FLESCH_SCORE
      };
    } else if (fleschScore >= 30) {
      return {
        id: AvailableAssessments.FLESCH_READING_EASE,
        type: AssessmentCategory.READABILITY,
        name: 'Moderate Readability',
        description: `Flesch Reading Ease score: ${fleschScore.toFixed(1)} (Moderate readability)`,
        status: AssessmentStatus.OK,
        score: 70,
        impact: 'medium',
        recommendation: 'Consider simplifying your language for better readability.',
        details: { fleschScore, interpretation: this.interpretFleschScore(fleschScore) },
        standards: READABILITY_STANDARDS.FLESCH_SCORE
      };
    } else {
      return {
        id: AvailableAssessments.FLESCH_READING_EASE,
        type: AssessmentCategory.READABILITY,
        name: 'Poor Readability',
        description: `Flesch Reading Ease score: ${fleschScore.toFixed(1)} (Difficult to read)`,
        status: AssessmentStatus.BAD,
        score: 30,
        impact: 'high',
        recommendation: 'Simplify your language and use shorter sentences for better readability.',
        details: { fleschScore, interpretation: this.interpretFleschScore(fleschScore) },
        standards: READABILITY_STANDARDS.FLESCH_SCORE
      };
    }
  }

  private checkParagraphLength(parsedContent: ParsedContent): AssessmentResult {
    const text = parsedContent.textContent;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length === 0) {
      return {
        id: AvailableAssessments.PARAGRAPH_LENGTH_LONG,
        type: AssessmentCategory.READABILITY,
        name: 'No Paragraphs Found',
        description: 'No paragraphs found in the content',
        status: AssessmentStatus.OK,
        score: 80,
        impact: 'low',
        recommendation: 'Structure your content into paragraphs for better readability.',
        details: { paragraphCount: 0, longParagraphs: 0 }
      };
    }

    const longParagraphs = paragraphs.filter(p => p.length > 150).length;
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
    
    if (longParagraphs === 0) {
      return {
        id: AvailableAssessments.PARAGRAPH_LENGTH_LONG,
        type: AssessmentCategory.READABILITY,
        name: 'Good Paragraph Length',
        description: `All paragraphs are under 150 characters (average: ${avgParagraphLength.toFixed(0)} chars)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Perfect! Your paragraphs are well-sized for readability.',
        details: { paragraphCount: paragraphs.length, longParagraphs, avgLength: avgParagraphLength }
      };
    } else {
      return {
        id: AvailableAssessments.PARAGRAPH_LENGTH_LONG,
        type: AssessmentCategory.READABILITY,
        name: 'Long Paragraphs Found',
        description: `${longParagraphs} out of ${paragraphs.length} paragraphs are too long`,
        status: AssessmentStatus.BAD,
        score: Math.max(0, 100 - (longParagraphs / paragraphs.length) * 100),
        impact: 'medium',
        recommendation: 'Break up long paragraphs into shorter ones for better readability.',
        details: { paragraphCount: paragraphs.length, longParagraphs, avgLength: avgParagraphLength }
      };
    }
  }

  private checkSentenceLength(parsedContent: ParsedContent): AssessmentResult {
    const text = parsedContent.textContent;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return {
        id: AvailableAssessments.SENTENCE_LENGTH_LONG,
        type: AssessmentCategory.READABILITY,
        name: 'No Sentences Found',
        description: 'No sentences found in the content',
        status: AssessmentStatus.OK,
        score: 80,
        impact: 'low',
        recommendation: 'Structure your content into clear sentences.',
        details: { sentenceCount: 0, longSentences: 0 }
      };
    }

    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 20).length;
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length;
    
    if (longSentences === 0) {
      return {
        id: AvailableAssessments.SENTENCE_LENGTH_LONG,
        type: AssessmentCategory.READABILITY,
        name: 'Good Sentence Length',
        description: `All sentences are under 20 words (average: ${avgSentenceLength.toFixed(1)} words)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Great! Your sentences are well-sized for readability.',
        details: { sentenceCount: sentences.length, longSentences, avgLength: avgSentenceLength }
      };
    } else {
      return {
        id: AvailableAssessments.SENTENCE_LENGTH_LONG,
        type: AssessmentCategory.READABILITY,
        name: 'Long Sentences Found',
        description: `${longSentences} out of ${sentences.length} sentences are too long`,
        status: AssessmentStatus.BAD,
        score: Math.max(0, 100 - (longSentences / sentences.length) * 100),
        impact: 'high',
        recommendation: 'Break up long sentences into shorter ones for better readability.',
        details: { sentenceCount: sentences.length, longSentences, avgLength: avgSentenceLength }
      };
    }
  }

  private checkSubheadingDistribution(parsedContent: ParsedContent): AssessmentResult {
    const headings = parsedContent.headings.filter(h => h.level >= 2);
    const wordCount = parsedContent.wordCount || 0;
    
    if (wordCount < 300) {
      return {
        id: AvailableAssessments.SUBHEADING_DISTRIBUTION_POOR,
        type: AssessmentCategory.READABILITY,
        name: 'Content Too Short for Subheading Analysis',
        description: 'Content is too short to require subheadings',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'low',
        recommendation: 'No subheadings needed for short content.',
        details: { headingCount: headings.length, wordCount, wordsPerHeading: 0 }
      };
    }

    const wordsPerHeading = headings.length > 0 ? wordCount / headings.length : wordCount;
    
    if (headings.length === 0) {
      return {
        id: AvailableAssessments.SUBHEADING_DISTRIBUTION_POOR,
        type: AssessmentCategory.READABILITY,
        name: 'No Subheadings Found',
        description: 'Content lacks subheadings for better organization',
        status: AssessmentStatus.BAD,
        score: 30,
        impact: 'medium',
        recommendation: 'Add subheadings (H2, H3) to organize your content better.',
        details: { headingCount: 0, wordCount, wordsPerHeading }
      };
    } else if (wordsPerHeading <= 300) {
      return {
        id: AvailableAssessments.SUBHEADING_DISTRIBUTION_POOR,
        type: AssessmentCategory.READABILITY,
        name: 'Good Subheading Distribution',
        description: `${headings.length} subheadings for ${wordCount} words (${wordsPerHeading.toFixed(0)} words per heading)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Excellent! Your subheadings are well-distributed.',
        details: { headingCount: headings.length, wordCount, wordsPerHeading }
      };
    } else {
      return {
        id: AvailableAssessments.SUBHEADING_DISTRIBUTION_POOR,
        type: AssessmentCategory.READABILITY,
        name: 'Poor Subheading Distribution',
        description: `${headings.length} subheadings for ${wordCount} words (${wordsPerHeading.toFixed(0)} words per heading)`,
        status: AssessmentStatus.BAD,
        score: Math.max(0, 100 - ((wordsPerHeading - 300) / 300) * 50),
        impact: 'medium',
        recommendation: 'Add more subheadings to break up long sections of text.',
        details: { headingCount: headings.length, wordCount, wordsPerHeading }
      };
    }
  }

  private calculateFleschScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  private interpretFleschScore(score: number): string {
    if (score >= 90) return 'Very easy to read';
    if (score >= 80) return 'Easy to read';
    if (score >= 70) return 'Fairly easy to read';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly difficult to read';
    if (score >= 30) return 'Difficult to read';
    return 'Very difficult to read';
  }
}