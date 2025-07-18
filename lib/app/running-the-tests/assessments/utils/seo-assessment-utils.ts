// SEO 評估工具類
// 包含關鍵字匹配、像素寬度計算等通用邏輯

export class SEOAssessmentUtils {
  // 🌟 CRITICAL: 中英文混合文本長度分析（與 HTMLParser 保持一致）
  // 
  // 重要說明：
  // - 這個方法必須與 HTMLParser.analyzeTextLength() 保持完全一致
  // - 中文和英文的分詞邏輯不同，需要智能判斷
  // - 不能使用簡單的 text.split(/\s+/) 方式，這對中文不準確
  //
  // 分詞邏輯：
  // - 中文為主 (>70%)：中文字符數 + 英文單詞數
  // - 英文為主 (<10%)：傳統空格分隔
  // - 混合語言：中文字符數 + 英文單詞數
  static analyzeTextLength(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    
    // 檢測中文字符（Unicode 範圍 4e00-9fff）
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

  // Helper method to check if all characters of a keyword exist in the text
  static containsAllCharacters(text: string, keyword: string): boolean {
    const textLower = text.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // Check if every character in the keyword exists in the text
    for (const char of keywordLower) {
      if (!textLower.includes(char)) {
        return false;
      }
    }
    return true;
  }

  // Helper method to find which related keyword contains all its characters in the text
  static findMatchingRelatedKeyword(text: string, relatedKeywords: string[]): string | null {
    for (const keyword of relatedKeywords) {
      if (this.containsAllCharacters(text, keyword)) {
        return keyword;
      }
    }
    return null;
  }

  // Helper method to calculate pixel width of text
  static calculateTextWidth(text: string): number {
    let totalWidth = 0;
    
    for (const char of text) {
      if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(char)) {
        // Chinese characters: 14px
        totalWidth += 14;
      } else if (/[0-9]/.test(char)) {
        // Numbers: 8px
        totalWidth += 8;
      } else if (/[a-zA-Z]/.test(char)) {
        // English letters: 5px
        totalWidth += 5;
      } else if (/\s/.test(char)) {
        // Spaces: 5px (same as English)
        totalWidth += 5;
      }
      // Punctuation and other characters are ignored for width calculation
    }
    
    return totalWidth;
  }

  // Helper method to convert pixel width to equivalent character count for display
  static pixelWidthToCharCount(pixelWidth: number): number {
    // Convert to "character units" for user-friendly display (using 14px as base)
    return Math.round(pixelWidth / 14);
  }
}