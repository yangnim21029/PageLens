/**
 * 關鍵字匹配工具
 * 用於檢查文本中是否包含特定關鍵字
 */

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  positions: Array<{ start: number; end: number; match: string }>;
  density: number;
}

export interface KeywordAnalysis {
  inTitle: boolean;
  inH2: boolean;
  inImages: boolean;
  inLinks: boolean;
  inContent: boolean;
  density: number;
  positions: Array<{ start: number; end: number; match: string }>;
}

export class KeywordMatcher {
  /**
   * 檢查文本中是否包含關鍵字
   * 支持中英文混合、部分匹配、模糊匹配
   */
  public checkIfContainsKeyword(text: string, keyword: string): boolean {
    if (!text || !keyword) return false;

    const normalizedText = text.toLowerCase().trim();
    const normalizedKeyword = keyword.toLowerCase().trim();

    // 完全匹配
    if (normalizedText.includes(normalizedKeyword)) {
      return true;
    }

    // 分詞匹配 - 將關鍵字分解成單詞
    const keywordWords = normalizedKeyword.split(/\s+/);
    const textWords = normalizedText.split(/\s+/);

    // 檢查所有關鍵字單詞是否都出現在文本中
    const allWordsFound = keywordWords.every(keywordWord => 
      textWords.some(textWord => textWord.includes(keywordWord))
    );

    if (allWordsFound) {
      return true;
    }

    // 中文字符處理 - 去除空格進行匹配
    const textNoSpaces = normalizedText.replace(/\s+/g, '');
    const keywordNoSpaces = normalizedKeyword.replace(/\s+/g, '');

    if (textNoSpaces.includes(keywordNoSpaces)) {
      return true;
    }

    // 模糊匹配 - 允許一定的字符差異
    return this.fuzzyMatch(normalizedText, normalizedKeyword);
  }

  /**
   * 模糊匹配函數
   * 使用簡單的相似度算法
   */
  private fuzzyMatch(text: string, keyword: string, threshold: number = 0.8): boolean {
    if (keyword.length < 3) return false; // 短關鍵字不進行模糊匹配

    // 計算最長公共子序列
    const similarity = this.calculateSimilarity(text, keyword);
    return similarity >= threshold;
  }

  /**
   * 計算兩個字符串的相似度
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 計算編輯距離（Levenshtein 距離）
   */
  private calculateEditDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0]![j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i]![j] = matrix[i - 1]![j - 1]!;
        } else {
          matrix[i]![j] = Math.min(
            matrix[i - 1]![j - 1]! + 1,
            matrix[i]![j - 1]! + 1,
            matrix[i - 1]![j]! + 1
          );
        }
      }
    }

    return matrix[str2.length]![str1.length]!;
  }

  /**
   * 提取文本中的關鍵字位置
   */
  public findKeywordPositions(text: string, keyword: string): Array<{
    start: number;
    end: number;
    match: string;
  }> {
    const positions: Array<{ start: number; end: number; match: string }> = [];
    const normalizedText = text.toLowerCase();
    const normalizedKeyword = keyword.toLowerCase();

    let index = 0;
    while (index < normalizedText.length) {
      const found = normalizedText.indexOf(normalizedKeyword, index);
      if (found === -1) break;

      positions.push({
        start: found,
        end: found + normalizedKeyword.length,
        match: text.substring(found, found + normalizedKeyword.length)
      });

      index = found + 1;
    }

    return positions;
  }

  /**
   * 計算關鍵字密度
   */
  public calculateKeywordDensity(text: string, keyword: string): number {
    if (!text || !keyword) return 0;

    const normalizedText = text.toLowerCase();
    const normalizedKeyword = keyword.toLowerCase();

    // 計算關鍵字出現次數
    const matches = normalizedText.match(new RegExp(normalizedKeyword, 'g'));
    const keywordCount = matches ? matches.length : 0;

    // 計算總詞數
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;

    if (totalWords === 0) return 0;

    return (keywordCount / totalWords) * 100;
  }

  /**
   * 檢查關鍵字是否在標題前半部分
   */
  public isKeywordInFirstHalf(text: string, keyword: string): boolean {
    if (!text || !keyword) return false;

    const normalizedText = text.toLowerCase();
    const normalizedKeyword = keyword.toLowerCase();

    const keywordPosition = normalizedText.indexOf(normalizedKeyword);
    if (keywordPosition === -1) return false;

    const midPoint = text.length / 2;
    return keywordPosition < midPoint;
  }

  /**
   * 提取關鍵字變體
   * 生成關鍵字的可能變化形式
   */
  public generateKeywordVariants(keyword: string): string[] {
    const variants: string[] = [keyword];
    
    // 添加複數形式（英文）
    if (/^[a-zA-Z\s]+$/.test(keyword)) {
      variants.push(keyword + 's');
      variants.push(keyword + 'es');
      variants.push(keyword + 'ies');
    }

    // 添加去除空格的版本
    if (keyword.includes(' ')) {
      variants.push(keyword.replace(/\s+/g, ''));
    }

    // 添加首字母大寫的版本
    const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    if (capitalized !== keyword) {
      variants.push(capitalized);
    }

    // 添加全大寫版本
    const uppercase = keyword.toUpperCase();
    if (uppercase !== keyword) {
      variants.push(uppercase);
    }

    // 去重
    return [...new Set(variants)];
  }

  /**
   * 批量檢查多個關鍵字
   */
  public checkMultipleKeywords(text: string, keywords: string[]): KeywordMatch[] {
    return keywords.map(keyword => ({
      keyword,
      found: this.checkIfContainsKeyword(text, keyword),
      positions: this.findKeywordPositions(text, keyword),
      density: this.calculateKeywordDensity(text, keyword)
    }));
  }

  /**
   * 高亮關鍵字
   */
  public highlightKeywords(text: string, keywords: string[], highlightTag: string = 'mark'): string {
    let highlightedText = text;

    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, `<${highlightTag}>$1</${highlightTag}>`);
    });

    return highlightedText;
  }

  /**
   * 綜合關鍵字分析
   */
  public analyzeKeyword(
    text: string,
    keyword: string,
    h1s: Array<{ text: string }>,
    h2s: Array<{ text: string }>,
    images: Array<{ text: string }>,
    links: Array<{ text: string }>
  ): KeywordAnalysis {
    const keywordLower = keyword.toLowerCase();

    return {
      inTitle: h1s.some(h1 => h1.text.toLowerCase().includes(keywordLower)),
      inH2: h2s.some(h2 => h2.text.toLowerCase().includes(keywordLower)),
      inImages: images.some(img => img.text.toLowerCase().includes(keywordLower)),
      inLinks: links.some(link => link.text.toLowerCase().includes(keywordLower)),
      inContent: text.toLowerCase().includes(keywordLower),
      density: this.calculateKeywordDensity(text, keyword),
      positions: this.findKeywordPositions(text, keyword)
    };
  }

  /**
   * 檢查同義詞
   */
  public checkSynonyms(text: string, synonyms: string[]): Array<{
    synonym: string;
    found: boolean;
    density: number;
  }> {
    return synonyms.map(synonym => ({
      synonym,
      found: this.checkIfContainsKeyword(text, synonym),
      density: this.calculateKeywordDensity(text, synonym)
    }));
  }
}