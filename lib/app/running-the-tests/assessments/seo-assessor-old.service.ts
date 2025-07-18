import { AssessmentResult, AssessmentCategory, AssessmentStatus, AvailableAssessments } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';

// SEO 評估標準值定義
const SEO_STANDARDS = {
  KEYWORD_DENSITY: {
    optimal: { min: 0.5, max: 2.5, unit: '%' },
    acceptable: { min: 0.3, max: 3.0, unit: '%' },
    description: '關鍵字密度最佳範圍 0.5-2.5%'
  },
  META_DESCRIPTION_LENGTH: {
    optimal: { min: 600, max: 960, unit: 'px' },
    acceptable: { min: 300, max: 960, unit: 'px' },
    description: 'Meta 描述寬度最佳 >600px，最大960px'
  },
  TITLE_LENGTH: {
    optimal: { min: 150, max: 600, unit: 'px' },
    acceptable: { min: 100, max: 600, unit: 'px' },
    description: '標題寬度最佳 >150px，最大600px'
  },
  CONTENT_LENGTH: {
    optimal: { min: 300, unit: '字' },
    acceptable: { min: 200, unit: '字' },
    description: '內容至少 300 字'
  },
  H1_COUNT: {
    optimal: { value: 1, unit: '個' },
    description: '每頁應有且僅有一個 H1 標籤'
  },
  IMAGES_ALT: {
    optimal: { value: 0, unit: '個缺失' },
    description: '所有圖片都應有 alt 屬性'
  }
};

export class SEOAssessor {
  // Helper method to check if all characters of a keyword exist in the text
  private containsAllCharacters(text: string, keyword: string): boolean {
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
  private findMatchingRelatedKeyword(text: string, relatedKeywords: string[]): string | null {
    for (const keyword of relatedKeywords) {
      if (this.containsAllCharacters(text, keyword)) {
        return keyword;
      }
    }
    return null;
  }

  // Helper method to calculate pixel width of text
  private calculateTextWidth(text: string): number {
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
  private pixelWidthToCharCount(pixelWidth: number): number {
    // Convert to "character units" for user-friendly display (using 14px as base)
    return Math.round(pixelWidth / 14);
  }

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
  private analyzeTextLength(text: string): number {
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
  async runSEOChecks(parsedContent: ParsedContent, ingredients: PageIngredients): Promise<AssessmentResult[]> {
    const assessments: AssessmentResult[] = [];

    // 確保返回所有 12 個 SEO assessments
    assessments.push(this.checkH1Missing(parsedContent));
    assessments.push(this.checkMultipleH1(parsedContent));
    assessments.push(this.checkH1Keyword(parsedContent, ingredients));
    assessments.push(this.checkH2RelatedKeywords(parsedContent, ingredients));
    assessments.push(this.checkImagesAlt(parsedContent));
    assessments.push(this.checkKeywordFirstParagraph(parsedContent, ingredients));
    assessments.push(this.checkKeywordDensity(parsedContent, ingredients));
    assessments.push(this.checkMetaDescriptionKeyword(parsedContent, ingredients));
    assessments.push(this.checkMetaDescriptionLength(parsedContent));
    assessments.push(this.checkTitleOptimization(parsedContent, ingredients));
    assessments.push(this.checkTitleKeyword(parsedContent, ingredients));
    assessments.push(this.checkContentLength(parsedContent));

    return assessments;
  }

  private checkH1Missing(parsedContent: ParsedContent): AssessmentResult {
    const h1Tags = parsedContent.headings.filter(h => h.level === 1);
    
    if (h1Tags.length === 0) {
      return {
        id: AvailableAssessments.H1_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H1 Tag Missing',
        description: 'Page is missing an H1 heading',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Add exactly one H1 heading that describes the main topic of your page.',
        details: { h1Count: 0 }
      };
    } else {
      return {
        id: AvailableAssessments.H1_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H1 Tag Present',
        description: 'Page has an H1 heading',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Great! Your page has an H1 heading.',
        details: { h1Count: h1Tags.length }
      };
    }
  }

  private checkMultipleH1(parsedContent: ParsedContent): AssessmentResult {
    const h1Tags = parsedContent.headings.filter(h => h.level === 1);
    
    if (h1Tags.length > 1) {
      return {
        id: AvailableAssessments.MULTIPLE_H1,
        type: AssessmentCategory.SEO,
        name: 'Multiple H1 Tags',
        description: 'Page has multiple H1 headings',
        status: AssessmentStatus.BAD,
        score: 40,
        impact: 'medium',
        recommendation: 'Use only one H1 heading per page. Convert additional H1s to H2 or H3.',
        details: { h1Count: h1Tags.length, h1Texts: h1Tags.map(h => h.text) }
      };
    } else {
      return {
        id: AvailableAssessments.MULTIPLE_H1,
        type: AssessmentCategory.SEO,
        name: 'Single H1 Tag',
        description: `Page has ${h1Tags.length === 1 ? 'exactly one' : 'no'} H1 heading`,
        status: h1Tags.length === 1 ? AssessmentStatus.GOOD : AssessmentStatus.BAD,
        score: h1Tags.length === 1 ? 100 : 0,
        impact: 'medium',
        recommendation: h1Tags.length === 1 ? 'Perfect! Your page has exactly one H1 heading.' : 'Add exactly one H1 heading.',
        details: { h1Count: h1Tags.length }
      };
    }
  }

  private checkH1Keyword(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const h1Tags = parsedContent.headings.filter(h => h.level === 1);
    
    if (h1Tags.length === 0) {
      return {
        id: AvailableAssessments.H1_KEYWORD_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H1 Missing for Keyword Analysis',
        description: 'Cannot analyze H1 keyword because H1 is missing',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Add an H1 heading that includes your focus keyword.',
        details: { reason: 'No H1 heading found' }
      };
    }

    const h1Text = h1Tags[0].text;
    const focusKeyword = ingredients.focusKeyword || '';
    const relatedKeywords = ingredients.relatedKeywords || [];
    
    if (!focusKeyword || focusKeyword.trim() === '') {
      return {
        id: AvailableAssessments.H1_KEYWORD_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H1 Keyword Analysis Skipped',
        description: 'No focus keyword provided for H1 analysis',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'low',
        recommendation: 'Set a focus keyword to analyze H1 keyword optimization.',
        details: { h1Text, reason: 'No focus keyword provided' }
      };
    }
    
    // Check if focus keyword is included using character-level matching
    const hasFocusKeyword = this.containsAllCharacters(h1Text, focusKeyword);
    const matchingRelatedKeyword = this.findMatchingRelatedKeyword(h1Text, relatedKeywords);
    
    if (hasFocusKeyword && matchingRelatedKeyword) {
      return {
        id: AvailableAssessments.H1_KEYWORD_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H1 Contains Both Keywords',
        description: 'H1 heading contains focus keyword and a related keyword',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Perfect! Your H1 contains both the focus keyword and a related keyword.',
        details: { 
          h1Text, 
          focusKeyword,
          matchingRelatedKeyword,
          hasFocusKeyword: true,
          hasRelatedKeyword: true
        }
      };
    } else if (hasFocusKeyword && !matchingRelatedKeyword) {
      return {
        id: AvailableAssessments.H1_KEYWORD_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H1 Missing Related Keyword',
        description: 'H1 heading contains focus keyword but missing related keywords',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'high',
        recommendation: relatedKeywords.length > 0 
          ? `Good! H1 contains focus keyword. Consider also including one of these related keywords: ${relatedKeywords.join(', ')}`
          : 'Good! H1 contains focus keyword. Consider adding related keywords for better optimization.',
        details: { 
          h1Text, 
          focusKeyword,
          hasFocusKeyword: true,
          hasRelatedKeyword: false,
          availableRelatedKeywords: relatedKeywords
        }
      };
    } else if (!hasFocusKeyword && matchingRelatedKeyword) {
      return {
        id: AvailableAssessments.H1_KEYWORD_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H1 Missing Focus Keyword',
        description: 'H1 heading contains a related keyword but missing the focus keyword',
        status: AssessmentStatus.BAD,
        score: 50,
        impact: 'high',
        recommendation: `H1 contains related keyword "${matchingRelatedKeyword}" but missing the focus keyword "${focusKeyword}". Include the focus keyword for better SEO.`,
        details: { 
          h1Text, 
          focusKeyword,
          matchingRelatedKeyword,
          hasFocusKeyword: false,
          hasRelatedKeyword: true
        }
      };
    } else {
      return {
        id: AvailableAssessments.H1_KEYWORD_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H1 Missing Both Keywords',
        description: 'H1 heading missing both focus and related keywords',
        status: AssessmentStatus.BAD,
        score: 40,
        impact: 'high',
        recommendation: `Include your focus keyword "${focusKeyword}" and at least one related keyword in the H1 heading.`,
        details: { 
          h1Text, 
          focusKeyword,
          hasFocusKeyword: false,
          hasRelatedKeyword: false,
          availableRelatedKeywords: relatedKeywords
        }
      };
    }
  }

  private checkH2RelatedKeywords(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const h2Tags = parsedContent.headings.filter(h => h.level === 2);
    const relatedKeywords = ingredients.relatedKeywords || [];
    
    // If no related keywords provided, return OK status
    if (relatedKeywords.length === 0) {
      return {
        id: AvailableAssessments.H2_SYNONYMS_MISSING,
        type: AssessmentCategory.SEO,
        name: 'H2 Related Keywords Check Skipped',
        description: 'No related keywords provided for H2 analysis',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'medium',
        recommendation: 'Provide related keywords to analyze H2 optimization.',
        details: { 
          h2Count: h2Tags.length,
          relatedKeywordsProvided: 0,
          reason: 'No related keywords provided' 
        }
      };
    }
    
    // If no H2 tags found
    if (h2Tags.length === 0) {
      return {
        id: AvailableAssessments.H2_SYNONYMS_MISSING,
        type: AssessmentCategory.SEO,
        name: 'No H2 Headings Found',
        description: 'No H2 headings found to check for related keywords',
        status: AssessmentStatus.BAD,
        score: 40,
        impact: 'medium',
        recommendation: 'Add H2 headings that include your related keywords for better content structure.',
        details: { 
          h2Count: 0,
          relatedKeywordsProvided: relatedKeywords.length,
          missingRelatedKeywords: relatedKeywords 
        }
      };
    }
    
    // Check which related keywords are found in H2 tags
    const h2Texts = h2Tags.map(h => h.text.toLowerCase()).join(' ');
    const foundRelatedKeywords: string[] = [];
    const missingRelatedKeywords: string[] = [];
    
    for (const relatedKeyword of relatedKeywords) {
      const relatedKeywordLower = relatedKeyword.toLowerCase();
      if (h2Texts.includes(relatedKeywordLower)) {
        foundRelatedKeywords.push(relatedKeyword);
      } else {
        missingRelatedKeywords.push(relatedKeyword);
      }
    }
    
    const coveragePercentage = (foundRelatedKeywords.length / relatedKeywords.length) * 100;
    
    // Determine status based on coverage
    if (coveragePercentage === 100) {
      return {
        id: AvailableAssessments.H2_SYNONYMS_MISSING,
        type: AssessmentCategory.SEO,
        name: 'All Related Keywords Found in H2',
        description: 'All related keywords appear in H2 headings',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Excellent! All your related keywords appear in H2 headings.',
        details: { 
          h2Count: h2Tags.length,
          relatedKeywordsProvided: relatedKeywords.length,
          foundRelatedKeywords,
          coveragePercentage: 100
        }
      };
    } else if (coveragePercentage >= 50) {
      return {
        id: AvailableAssessments.H2_SYNONYMS_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Some Related Keywords Missing in H2',
        description: `${foundRelatedKeywords.length} out of ${relatedKeywords.length} related keywords found in H2`,
        status: AssessmentStatus.OK,
        score: 70 + (coveragePercentage * 0.3),
        impact: 'medium',
        recommendation: `Consider including these keywords in H2 headings: ${missingRelatedKeywords.join(', ')}`,
        details: { 
          h2Count: h2Tags.length,
          relatedKeywordsProvided: relatedKeywords.length,
          foundRelatedKeywords,
          missingRelatedKeywords,
          coveragePercentage
        }
      };
    } else {
      return {
        id: AvailableAssessments.H2_SYNONYMS_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Most Related Keywords Missing in H2',
        description: `Only ${foundRelatedKeywords.length} out of ${relatedKeywords.length} related keywords found in H2`,
        status: AssessmentStatus.BAD,
        score: 40 + (coveragePercentage * 0.6),
        impact: 'medium',
        recommendation: `Include these related keywords in your H2 headings: ${missingRelatedKeywords.join(', ')}`,
        details: { 
          h2Count: h2Tags.length,
          relatedKeywordsProvided: relatedKeywords.length,
          foundRelatedKeywords,
          missingRelatedKeywords,
          coveragePercentage
        }
      };
    }
  }

  private checkImagesAlt(parsedContent: ParsedContent): AssessmentResult {
    const images = parsedContent.images || [];
    
    if (images.length === 0) {
      return {
        id: AvailableAssessments.IMAGES_MISSING_ALT,
        type: AssessmentCategory.SEO,
        name: 'No Images Found',
        description: 'No images found on the page',
        status: AssessmentStatus.OK,
        score: 100,
        impact: 'low',
        recommendation: 'No images found, so no alt text issues.',
        details: { imageCount: 0, imagesWithoutAlt: 0 }
      };
    }

    const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '').length;
    
    if (imagesWithoutAlt === 0) {
      return {
        id: AvailableAssessments.IMAGES_MISSING_ALT,
        type: AssessmentCategory.SEO,
        name: 'All Images Have Alt Text',
        description: 'All images have descriptive alt text',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Excellent! All your images have alt text.',
        details: { imageCount: images.length, imagesWithoutAlt: 0 }
      };
    } else {
      return {
        id: AvailableAssessments.IMAGES_MISSING_ALT,
        type: AssessmentCategory.SEO,
        name: 'Images Missing Alt Text',
        description: `${imagesWithoutAlt} out of ${images.length} images are missing alt text`,
        status: AssessmentStatus.BAD,
        score: Math.max(0, 100 - (imagesWithoutAlt / images.length) * 100),
        impact: 'medium',
        recommendation: 'Add descriptive alt text to all images for better accessibility and SEO.',
        details: { imageCount: images.length, imagesWithoutAlt }
      };
    }
  }

  private checkKeywordFirstParagraph(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const focusKeyword = ingredients.focusKeyword?.toLowerCase() || '';
    
    if (!focusKeyword || focusKeyword.trim() === '') {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'No Keyword for First Paragraph Analysis',
        description: 'No focus keyword provided for first paragraph analysis',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'low',
        recommendation: 'Set a focus keyword to analyze first paragraph optimization.',
        details: { reason: 'No focus keyword provided' }
      };
    }

    const firstParagraph = parsedContent.textContent.split('\n')[0]?.toLowerCase() || '';
    
    if (firstParagraph.includes(focusKeyword)) {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'Keyword in First Paragraph',
        description: 'Focus keyword appears in the first paragraph',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Great! Your focus keyword appears in the first paragraph.',
        details: { firstParagraph: firstParagraph.substring(0, 100) + '...', focusKeyword }
      };
    } else {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'Keyword Missing from First Paragraph',
        description: 'Focus keyword does not appear in the first paragraph',
        status: AssessmentStatus.BAD,
        score: 30,
        impact: 'high',
        recommendation: 'Include your focus keyword in the first paragraph to improve SEO.',
        details: { firstParagraph: firstParagraph.substring(0, 100) + '...', focusKeyword }
      };
    }
  }

  private checkKeywordDensity(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const focusKeyword = ingredients.focusKeyword?.toLowerCase() || '';
    
    if (!focusKeyword || focusKeyword.trim() === '') {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'No Keyword for Density Analysis',
        description: 'No focus keyword provided for density analysis',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'low',
        recommendation: 'Set a focus keyword to analyze keyword density.',
        details: { reason: 'No focus keyword provided' },
        standards: SEO_STANDARDS.KEYWORD_DENSITY
      };
    }

    const text = parsedContent.textContent.toLowerCase();
    
    // 🌟 CRITICAL: 關鍵字密度計算必須使用與 wordCount 相同的方式
    // 
    // 問題背景：
    // - 舊版本使用 text.split(/\s+/) 只適用於英文（用空格分詞）
    // - 中文內容會導致計算錯誤：4762 字的文章被誤算為 277 字
    // - 這會導致關鍵字密度異常偏高（30.3% 而不是正確的 1.8%）
    //
    // 解決方案：
    // - 使用 parsedContent.wordCount（已經過正確的中英文分詞）
    // - 如果沒有 wordCount，使用 analyzeTextLength() 作為後備
    // - 確保兩個計算使用相同的邏輯，保持一致性
    const totalWords = parsedContent.wordCount || this.analyzeTextLength(text);
    const keywordCount = text.split(focusKeyword).length - 1;
    const density = (keywordCount / totalWords) * 100;
    
    if (density >= 0.5 && density <= 2.5) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Good Keyword Density',
        description: `Keyword density is ${density.toFixed(1)}% (optimal range: 0.5-2.5%)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Perfect! Your keyword density is within the optimal range.',
        details: { density, keywordCount, totalWords },
        standards: SEO_STANDARDS.KEYWORD_DENSITY
      };
    } else if (density < 0.5) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Low Keyword Density',
        description: `Keyword density is ${density.toFixed(1)}% (recommended: 0.5-2.5%)`,
        status: AssessmentStatus.BAD,
        score: 30,
        impact: 'medium',
        recommendation: 'Consider using your focus keyword more frequently throughout the content.',
        details: { density, keywordCount, totalWords },
        standards: SEO_STANDARDS.KEYWORD_DENSITY
      };
    } else {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'High Keyword Density',
        description: `Keyword density is ${density.toFixed(1)}% (recommended: 0.5-2.5%)`,
        status: AssessmentStatus.BAD,
        score: 40,
        impact: 'medium',
        recommendation: 'Reduce keyword usage to avoid keyword stuffing.',
        details: { density, keywordCount, totalWords },
        standards: SEO_STANDARDS.KEYWORD_DENSITY
      };
    }
  }

  private checkMetaDescriptionKeyword(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const focusKeyword = ingredients.focusKeyword?.toLowerCase() || '';
    const metaDescription = parsedContent.metaDescription?.toLowerCase() || '';
    
    if (!focusKeyword || focusKeyword.trim() === '') {
      return {
        id: AvailableAssessments.META_DESCRIPTION_NEEDS_IMPROVEMENT,
        type: AssessmentCategory.SEO,
        name: 'No Keyword for Meta Description Analysis',
        description: 'No focus keyword provided for meta description analysis',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'low',
        recommendation: 'Set a focus keyword to analyze meta description optimization.',
        details: { reason: 'No focus keyword provided' }
      };
    }

    if (!metaDescription || metaDescription.trim() === '') {
      return {
        id: AvailableAssessments.META_DESCRIPTION_NEEDS_IMPROVEMENT,
        type: AssessmentCategory.SEO,
        name: 'Meta Description Missing',
        description: 'Page is missing a meta description',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Add a meta description that includes your focus keyword.',
        details: { metaDescription: '', focusKeyword }
      };
    }

    if (metaDescription.includes(focusKeyword)) {
      return {
        id: AvailableAssessments.META_DESCRIPTION_NEEDS_IMPROVEMENT,
        type: AssessmentCategory.SEO,
        name: 'Meta Description Contains Keyword',
        description: 'Meta description contains the focus keyword',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Great! Your meta description contains the focus keyword.',
        details: { metaDescription, focusKeyword }
      };
    } else {
      return {
        id: AvailableAssessments.META_DESCRIPTION_NEEDS_IMPROVEMENT,
        type: AssessmentCategory.SEO,
        name: 'Meta Description Needs Improvement',
        description: 'Meta description does not contain the focus keyword',
        status: AssessmentStatus.BAD,
        score: 50,
        impact: 'high',
        recommendation: 'Include your focus keyword in the meta description.',
        details: { metaDescription, focusKeyword }
      };
    }
  }

  private checkMetaDescriptionLength(parsedContent: ParsedContent): AssessmentResult {
    const metaDescription = parsedContent.metaDescription || '';
    const pixelWidth = this.calculateTextWidth(metaDescription);
    const charEquivalent = this.pixelWidthToCharCount(pixelWidth);
    
    
    if (pixelWidth === 0) {
      return {
        id: AvailableAssessments.META_DESCRIPTION_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Meta Description Missing',
        description: 'Page is missing a meta description',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Add a meta description (optimal width: >600px, max 960px).',
        details: { pixelWidth: 0, charEquivalent: 0 },
        standards: SEO_STANDARDS.META_DESCRIPTION_LENGTH
      };
    } else if (pixelWidth >= 600 && pixelWidth <= 960) {
      return {
        id: AvailableAssessments.META_DESCRIPTION_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Meta Description Length Good',
        description: `Meta description width is ${pixelWidth}px (good: >600px, max: 960px)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Perfect! Your meta description width is optimal.',
        details: { pixelWidth, charEquivalent },
        standards: SEO_STANDARDS.META_DESCRIPTION_LENGTH
      };
    } else {
      return {
        id: AvailableAssessments.META_DESCRIPTION_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Meta Description Length Needs Improvement',
        description: `Meta description width is ${pixelWidth}px (recommended: >600px, max: 960px)`,
        status: pixelWidth > 960 ? AssessmentStatus.BAD : AssessmentStatus.OK,
        score: pixelWidth > 960 ? 40 : 70,
        impact: 'medium',
        recommendation: pixelWidth > 960 ? 'Consider shortening your meta description.' : 'Consider expanding your meta description.',
        details: { pixelWidth, charEquivalent },
        standards: SEO_STANDARDS.META_DESCRIPTION_LENGTH
      };
    }
  }

  private checkTitleOptimization(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const title = parsedContent.title || '';
    const pixelWidth = this.calculateTextWidth(title);
    const charEquivalent = this.pixelWidthToCharCount(pixelWidth);
    
    if (pixelWidth === 0) {
      return {
        id: AvailableAssessments.TITLE_NEEDS_IMPROVEMENT,
        type: AssessmentCategory.SEO,
        name: 'Title Missing',
        description: 'Page is missing a title',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Add a descriptive title (optimal width: >150px, max 600px).',
        details: { pixelWidth: 0, charEquivalent: 0 },
        standards: SEO_STANDARDS.TITLE_LENGTH
      };
    } else if (pixelWidth >= 150 && pixelWidth <= 600) {
      return {
        id: AvailableAssessments.TITLE_NEEDS_IMPROVEMENT,
        type: AssessmentCategory.SEO,
        name: 'Title Length Good',
        description: `Title width is ${pixelWidth}px (good: >150px, max: 600px)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Perfect! Your title width is optimal.',
        details: { pixelWidth, charEquivalent },
        standards: SEO_STANDARDS.TITLE_LENGTH
      };
    } else {
      return {
        id: AvailableAssessments.TITLE_NEEDS_IMPROVEMENT,
        type: AssessmentCategory.SEO,
        name: 'Title Length Needs Improvement',
        description: `Title width is ${pixelWidth}px (recommended: >150px, max: 600px)`,
        status: pixelWidth > 600 ? AssessmentStatus.BAD : AssessmentStatus.OK,
        score: pixelWidth > 600 ? 40 : 70,
        impact: 'high',
        recommendation: pixelWidth > 600 ? 'Consider shortening your title.' : 'Consider expanding your title.',
        details: { pixelWidth, charEquivalent },
        standards: SEO_STANDARDS.TITLE_LENGTH
      };
    }
  }

  private checkTitleKeyword(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const title = parsedContent.title || '';
    const focusKeyword = ingredients.focusKeyword || '';
    const relatedKeywords = ingredients.relatedKeywords || [];
    
    if (!focusKeyword || focusKeyword.trim() === '') {
      return {
        id: AvailableAssessments.TITLE_MISSING,
        type: AssessmentCategory.SEO,
        name: 'No Keyword for Title Analysis',
        description: 'No focus keyword provided for title analysis',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'low',
        recommendation: 'Set a focus keyword to analyze title optimization.',
        details: { reason: 'No focus keyword provided' }
      };
    }
    
    // Check if focus keyword is included using character-level matching
    const hasFocusKeyword = this.containsAllCharacters(title, focusKeyword);
    const matchingRelatedKeyword = this.findMatchingRelatedKeyword(title, relatedKeywords);
    
    if (hasFocusKeyword && matchingRelatedKeyword) {
      return {
        id: AvailableAssessments.TITLE_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Title Contains Both Keywords',
        description: 'Title contains focus keyword and a related keyword',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Perfect! Your title contains both the focus keyword and a related keyword.',
        details: { 
          title, 
          focusKeyword,
          matchingRelatedKeyword,
          hasFocusKeyword: true,
          hasRelatedKeyword: true
        }
      };
    } else if (hasFocusKeyword && !matchingRelatedKeyword) {
      return {
        id: AvailableAssessments.TITLE_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Title Missing Related Keyword',
        description: 'Title contains focus keyword but missing related keywords',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'high',
        recommendation: relatedKeywords.length > 0 
          ? `Good! Title contains focus keyword. Consider also including one of these related keywords: ${relatedKeywords.join(', ')}`
          : 'Good! Title contains focus keyword. Consider adding related keywords for better optimization.',
        details: { 
          title, 
          focusKeyword,
          hasFocusKeyword: true,
          hasRelatedKeyword: false,
          availableRelatedKeywords: relatedKeywords
        }
      };
    } else if (!hasFocusKeyword && matchingRelatedKeyword) {
      return {
        id: AvailableAssessments.TITLE_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Title Missing Focus Keyword',
        description: 'Title contains a related keyword but missing the focus keyword',
        status: AssessmentStatus.BAD,
        score: 50,
        impact: 'high',
        recommendation: `Title contains related keyword "${matchingRelatedKeyword}" but missing the focus keyword "${focusKeyword}". Include the focus keyword for better SEO.`,
        details: { 
          title, 
          focusKeyword,
          matchingRelatedKeyword,
          hasFocusKeyword: false,
          hasRelatedKeyword: true
        }
      };
    } else {
      return {
        id: AvailableAssessments.TITLE_MISSING,
        type: AssessmentCategory.SEO,
        name: 'Title Missing Both Keywords',
        description: 'Title missing both focus and related keywords',
        status: AssessmentStatus.BAD,
        score: 30,
        impact: 'high',
        recommendation: `Include your focus keyword "${focusKeyword}" and at least one related keyword in the title.`,
        details: { 
          title, 
          focusKeyword,
          hasFocusKeyword: false,
          hasRelatedKeyword: false,
          availableRelatedKeywords: relatedKeywords
        }
      };
    }
  }

  private checkContentLength(parsedContent: ParsedContent): AssessmentResult {
    const wordCount = parsedContent.wordCount || 0;
    
    if (wordCount >= 300) {
      return {
        id: AvailableAssessments.CONTENT_LENGTH_SHORT,
        type: AssessmentCategory.SEO,
        name: 'Content Length Good',
        description: `Content has ${wordCount} words (minimum: 300)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Great! Your content meets the minimum word count.',
        details: { wordCount }
      };
    } else {
      return {
        id: AvailableAssessments.CONTENT_LENGTH_SHORT,
        type: AssessmentCategory.SEO,
        name: 'Content Length Short',
        description: `Content has ${wordCount} words (minimum: 300)`,
        status: AssessmentStatus.BAD,
        score: Math.max(0, (wordCount / 300) * 100),
        impact: 'medium',
        recommendation: 'Consider expanding your content to at least 300 words.',
        details: { wordCount }
      };
    }
  }
}