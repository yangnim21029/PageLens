import { AssessmentResult, AssessmentType, AssessmentStatus } from '../../types/assessment.types';
import { ParsedContent } from '../../../understanding-the-page/types/parsed-content.types';

export class ReadabilityAssessor {
  async runReadabilityChecks(parsedContent: ParsedContent): Promise<AssessmentResult[]> {
    const assessments: AssessmentResult[] = [];

    assessments.push(...await this.checkSentenceLength(parsedContent));
    assessments.push(...await this.checkFleschReadingEase(parsedContent));
    assessments.push(...await this.checkParagraphLength(parsedContent));
    assessments.push(...await this.checkSubheadingDistribution(parsedContent));

    return assessments;
  }

  private async checkSentenceLength(parsedContent: ParsedContent): Promise<AssessmentResult[]> {
    const assessments: AssessmentResult[] = [];
    const sentences = this.extractSentences(parsedContent.textContent);
    
    if (sentences.length === 0) {
      return assessments;
    }

    const averageWordsPerSentence = sentences.reduce((sum, sentence) => {
      return sum + this.countWordsInSentence(sentence);
    }, 0) / sentences.length;

    const longSentences = sentences.filter(sentence => {
      return this.countWordsInSentence(sentence) > this.getLongSentenceThreshold(sentence);
    });

    if (averageWordsPerSentence <= 20 && longSentences.length <= sentences.length * 0.25) {
      assessments.push({
        id: 'sentence-length-good',
        type: AssessmentType.READABILITY,
        name: 'Good Sentence Length',
        description: `Average sentence length is ${averageWordsPerSentence.toFixed(1)} words`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Perfect! Your sentences are easy to read.',
        details: { 
          averageWordsPerSentence: averageWordsPerSentence.toFixed(1),
          longSentences: longSentences.length,
          totalSentences: sentences.length
        }
      });
    } else {
      const score = Math.max(0, 100 - (longSentences.length / sentences.length) * 100);
      assessments.push({
        id: 'sentence-length-long',
        type: AssessmentType.READABILITY,
        name: 'Sentences Too Long',
        description: `${longSentences.length} sentences are longer than 20 words`,
        status: longSentences.length > sentences.length * 0.5 ? AssessmentStatus.BAD : AssessmentStatus.OK,
        score,
        impact: 'medium',
        recommendation: 'Break down long sentences into shorter ones for better readability.',
        details: { 
          averageWordsPerSentence: averageWordsPerSentence.toFixed(1),
          longSentences: longSentences.length,
          totalSentences: sentences.length
        }
      });
    }

    return assessments;
  }

  private async checkFleschReadingEase(parsedContent: ParsedContent): Promise<AssessmentResult[]> {
    const assessments: AssessmentResult[] = [];
    const fleschScore = this.calculateFleschReadingEase(parsedContent.textContent);

    let status: AssessmentStatus;
    let recommendation: string;
    let description: string;

    if (fleschScore >= 60) {
      status = AssessmentStatus.GOOD;
      description = 'Text is easy to read';
      recommendation = 'Great! Your content is easily readable.';
    } else if (fleschScore >= 30) {
      status = AssessmentStatus.OK;
      description = 'Text is fairly difficult to read';
      recommendation = 'Consider using simpler words and shorter sentences to improve readability.';
    } else {
      status = AssessmentStatus.BAD;
      description = 'Text is very difficult to read';
      recommendation = 'Significantly simplify your language, use shorter sentences, and choose common words.';
    }

    assessments.push({
      id: 'flesch-reading-ease',
      type: AssessmentType.READABILITY,
      name: 'Flesch Reading Ease',
      description,
      status,
      score: Math.max(0, fleschScore),
      impact: 'high',
      recommendation,
      details: { fleschScore: fleschScore.toFixed(1) }
    });

    return assessments;
  }

  private async checkParagraphLength(parsedContent: ParsedContent): Promise<AssessmentResult[]> {
    const assessments: AssessmentResult[] = [];
    const paragraphs = parsedContent.paragraphs;
    
    if (paragraphs.length === 0) {
      return assessments;
    }

    const averageWordsPerParagraph = paragraphs.reduce((sum, paragraph) => {
      return sum + paragraph.split(/\s+/).length;
    }, 0) / paragraphs.length;

    const longParagraphs = paragraphs.filter(paragraph => {
      return paragraph.split(/\s+/).length > 150;
    });

    if (averageWordsPerParagraph <= 150 && longParagraphs.length <= paragraphs.length * 0.25) {
      assessments.push({
        id: 'paragraph-length-good',
        type: AssessmentType.READABILITY,
        name: 'Good Paragraph Length',
        description: `Average paragraph length is ${averageWordsPerParagraph.toFixed(1)} words`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Perfect! Your paragraphs are well-sized for readability.',
        details: { 
          averageWordsPerParagraph: averageWordsPerParagraph.toFixed(1),
          longParagraphs: longParagraphs.length,
          totalParagraphs: paragraphs.length
        }
      });
    } else {
      const score = Math.max(0, 100 - (longParagraphs.length / paragraphs.length) * 100);
      assessments.push({
        id: 'paragraph-length-long',
        type: AssessmentType.READABILITY,
        name: 'Paragraphs Too Long',
        description: `${longParagraphs.length} paragraphs are longer than 150 words`,
        status: longParagraphs.length > paragraphs.length * 0.5 ? AssessmentStatus.BAD : AssessmentStatus.OK,
        score,
        impact: 'medium',
        recommendation: 'Break down long paragraphs into shorter ones for better readability.',
        details: { 
          averageWordsPerParagraph: averageWordsPerParagraph.toFixed(1),
          longParagraphs: longParagraphs.length,
          totalParagraphs: paragraphs.length
        }
      });
    }

    return assessments;
  }

  private async checkSubheadingDistribution(parsedContent: ParsedContent): Promise<AssessmentResult[]> {
    const assessments: AssessmentResult[] = [];
    const headings = parsedContent.headings.filter(h => h.level >= 2); // H2 and below
    const wordCount = parsedContent.wordCount;

    if (wordCount < 300) {
      return assessments; // Skip this check for short content
    }

    const wordsPerHeading = headings.length > 0 ? wordCount / headings.length : wordCount;

    if (wordsPerHeading <= 300) {
      assessments.push({
        id: 'subheading-distribution-good',
        type: AssessmentType.READABILITY,
        name: 'Good Subheading Distribution',
        description: `Average of ${wordsPerHeading.toFixed(0)} words per subheading`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Excellent! Your content is well-structured with subheadings.',
        details: { 
          headingCount: headings.length,
          wordCount,
          wordsPerHeading: wordsPerHeading.toFixed(0)
        }
      });
    } else {
      const score = Math.max(0, 100 - ((wordsPerHeading - 300) / 300) * 50);
      assessments.push({
        id: 'subheading-distribution-poor',
        type: AssessmentType.READABILITY,
        name: 'Poor Subheading Distribution',
        description: `Average of ${wordsPerHeading.toFixed(0)} words per subheading`,
        status: wordsPerHeading > 600 ? AssessmentStatus.BAD : AssessmentStatus.OK,
        score,
        impact: 'medium',
        recommendation: 'Add more subheadings to break up your content (aim for one every 300 words).',
        details: { 
          headingCount: headings.length,
          wordCount,
          wordsPerHeading: wordsPerHeading.toFixed(0)
        }
      });
    }

    return assessments;
  }

  private extractSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }

  private calculateFleschReadingEase(text: string): number {
    const sentences = this.extractSentences(text);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) {
      return 0;
    }

    const averageWordsPerSentence = words.length / sentences.length;
    const averageSyllablesPerWord = syllables / words.length;

    return 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  /**
   * 語言感知的句子單詞計算
   */
  private countWordsInSentence(sentence: string): number {
    if (!sentence || sentence.trim().length === 0) return 0;
    
    // 檢測中文字符
    const chineseCharRegex = /[\u4e00-\u9fff]/g;
    const englishWordRegex = /[a-zA-Z]+/g;
    
    const chineseChars = sentence.match(chineseCharRegex) || [];
    const englishWords = sentence.match(englishWordRegex) || [];
    
    const totalChars = sentence.replace(/\s+/g, '').length;
    const chineseRatio = chineseChars.length / totalChars;
    
    // 根據語言類型計算
    if (chineseRatio > 0.7) {
      // 中文為主：中文字符 + 英文單詞
      return chineseChars.length + englishWords.length;
    } else if (chineseRatio < 0.1) {
      // 英文為主：傳統空格分隔
      return sentence.split(/\s+/).filter(word => word.length > 0).length;
    } else {
      // 混合語言：中文字符 + 英文單詞
      return chineseChars.length + englishWords.length;
    }
  }

  /**
   * 取得長句子閾值（根據語言調整）
   */
  private getLongSentenceThreshold(sentence: string): number {
    const chineseCharRegex = /[\u4e00-\u9fff]/g;
    const chineseChars = sentence.match(chineseCharRegex) || [];
    const totalChars = sentence.replace(/\s+/g, '').length;
    const chineseRatio = chineseChars.length / totalChars;

    if (chineseRatio > 0.5) {
      // 中文為主：閾值調整為30字符
      return 30;
    } else {
      // 英文為主：使用標準20單詞
      return 20;
    }
  }
}