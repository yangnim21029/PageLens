/**
 * 語言感知的文本分析工具
 * 支援中文、英文及混合內容的文字統計
 */

export interface TextStats {
  wordCount: number;
  charCount: number;
  charCountNoSpaces: number;
  sentences: number;
  paragraphs: number;
  language: 'chinese' | 'english' | 'mixed';
  chineseCharCount: number;
  englishWordCount: number;
}

export class TextAnalyzer {
  
  /**
   * 檢測文本主要語言
   */
  static detectLanguage(text: string): 'chinese' | 'english' | 'mixed' {
    const chineseCharRegex = /[\u4e00-\u9fff]/g;
    const englishWordRegex = /[a-zA-Z]+/g;
    
    const chineseChars = text.match(chineseCharRegex) || [];
    const englishWords = text.match(englishWordRegex) || [];
    
    const totalChars = text.replace(/\s+/g, '').length;
    const chineseRatio = chineseChars.length / totalChars;
    
    if (chineseRatio > 0.7) return 'chinese';
    if (chineseRatio < 0.1) return 'english';
    return 'mixed';
  }
  
  /**
   * 計算中文字符數量
   */
  static countChineseCharacters(text: string): number {
    const chineseCharRegex = /[\u4e00-\u9fff]/g;
    const matches = text.match(chineseCharRegex);
    return matches ? matches.length : 0;
  }
  
  /**
   * 計算英文單詞數量
   */
  static countEnglishWords(text: string): number {
    const englishWordRegex = /[a-zA-Z]+/g;
    const matches = text.match(englishWordRegex);
    return matches ? matches.length : 0;
  }
  
  /**
   * 智能單詞計算 - 根據語言類型適應性計算
   */
  static countWords(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    
    const cleanText = text.trim();
    const language = this.detectLanguage(cleanText);
    
    const chineseCharCount = this.countChineseCharacters(cleanText);
    const englishWordCount = this.countEnglishWords(cleanText);
    
    switch (language) {
      case 'chinese':
        // 中文主要以字符計算，但如果有英文單詞也計入
        return chineseCharCount + englishWordCount;
        
      case 'english':
        // 英文以空格分隔的單詞計算
        return cleanText.split(/\s+/).filter(word => word.length > 0).length;
        
      case 'mixed':
        // 混合語言：中文字符 + 英文單詞
        return chineseCharCount + englishWordCount;
        
      default:
        return cleanText.split(/\s+/).filter(word => word.length > 0).length;
    }
  }
  
  /**
   * 計算句子數量 - 支援中英文標點符號
   */
  static countSentences(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    
    // 支援中英文句號、問號、驚嘆號
    const sentenceRegex = /[.!?。！？]+/g;
    const sentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);
    return sentences.length;
  }
  
  /**
   * 分析句子長度 - 語言感知
   */
  static analyzeSentenceLength(text: string): {
    sentences: string[];
    averageLength: number;
    longSentences: string[];
  } {
    if (!text || text.trim().length === 0) {
      return { sentences: [], averageLength: 0, longSentences: [] };
    }
    
    const sentenceRegex = /[.!?。！？]+/g;
    const sentences = text.split(sentenceRegex)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (sentences.length === 0) {
      return { sentences: [], averageLength: 0, longSentences: [] };
    }
    
    const language = this.detectLanguage(text);
    const longThreshold = language === 'chinese' ? 30 : 20; // 中文字符閾值較高
    
    const sentenceLengths = sentences.map(sentence => this.countWords(sentence));
    const averageLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentences.length;
    
    const longSentences = sentences.filter(sentence => {
      return this.countWords(sentence) > longThreshold;
    });
    
    return {
      sentences,
      averageLength: Math.round(averageLength * 10) / 10,
      longSentences
    };
  }
  
  /**
   * 完整文本統計分析
   */
  static analyzeText(text: string): TextStats {
    if (!text || text.trim().length === 0) {
      return {
        wordCount: 0,
        charCount: 0,
        charCountNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        language: 'english',
        chineseCharCount: 0,
        englishWordCount: 0
      };
    }
    
    const cleanText = text.trim();
    const language = this.detectLanguage(cleanText);
    
    // 段落計算
    const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      wordCount: this.countWords(cleanText),
      charCount: cleanText.length,
      charCountNoSpaces: cleanText.replace(/\s+/g, '').length,
      sentences: this.countSentences(cleanText),
      paragraphs: paragraphs.length,
      language,
      chineseCharCount: this.countChineseCharacters(cleanText),
      englishWordCount: this.countEnglishWords(cleanText)
    };
  }
  
  /**
   * 計算關鍵字密度 - 語言感知
   */
  static calculateKeywordDensity(text: string, keyword: string): {
    density: number;
    occurrences: number;
    totalWords: number;
  } {
    if (!text || !keyword) {
      return { density: 0, occurrences: 0, totalWords: 0 };
    }
    
    const cleanText = text.toLowerCase();
    const cleanKeyword = keyword.toLowerCase();
    const totalWords = this.countWords(text);
    
    if (totalWords === 0) {
      return { density: 0, occurrences: 0, totalWords: 0 };
    }
    
    // 計算關鍵字出現次數
    let occurrences = 0;
    const language = this.detectLanguage(text);
    
    if (language === 'chinese') {
      // 中文關鍵字可能不需要空格分隔
      occurrences = (cleanText.match(new RegExp(cleanKeyword, 'g')) || []).length;
    } else {
      // 英文關鍵字以單詞邊界匹配
      const wordBoundaryRegex = new RegExp(`\\b${cleanKeyword}\\b`, 'g');
      occurrences = (cleanText.match(wordBoundaryRegex) || []).length;
    }
    
    const density = (occurrences / totalWords) * 100;
    
    return {
      density: Math.round(density * 100) / 100,
      occurrences,
      totalWords
    };
  }
}