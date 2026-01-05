// 內容相關 SEO 評估器
// 包含關鍵字密度、內容長度、首段關鍵字等評估邏輯

import { AssessmentResult, AssessmentCategory, AssessmentStatus, AvailableAssessments } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';
import { SEOAssessmentUtils } from './utils/seo-assessment-utils';

// 內容相關評估標準值
const KEYWORD_DENSITY_MIN_TARGET = 12;

const CONTENT_STANDARDS = {
  KEYWORD_DENSITY: {
    optimal: { min: KEYWORD_DENSITY_MIN_TARGET, unit: '%' },
    acceptable: { min: KEYWORD_DENSITY_MIN_TARGET, unit: '%' },
    description: `前100字關鍵字密度，目標 >${KEYWORD_DENSITY_MIN_TARGET}%，暫不設上限`
  },
  CONTENT_LENGTH: {
    optimal: { min: 300, unit: '字' },
    acceptable: { min: 200, unit: '字' },
    description: '內容至少 300 字'
  },
  FIRST_PARAGRAPH_KEYWORD: {
    optimal: { value: '包含', unit: '' },
    acceptable: { value: '包含', unit: '' },
    description: '前100字應包含焦點關鍵字'
  }
};

export class ContentAssessor {
  
  checkKeywordFirstParagraph(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const keywords = [
      ingredients.focusKeyword,
      ...(ingredients.relatedKeywords || [])
    ]
      .map(kw => kw?.toLowerCase().trim())
      .filter((kw): kw is string => !!kw);
    
    if (keywords.length === 0) {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'No Keyword for First 100 Chars Analysis',
        description: 'No focus/related keyword provided for first 100 characters analysis',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'low',
        recommendation: 'Set a focus keyword (or related keywords) to analyze first-100-characters optimization.',
        details: { reason: 'No focus/related keyword provided' },
        standards: CONTENT_STANDARDS.FIRST_PARAGRAPH_KEYWORD
      };
    }

    // 直接取全文前 100 字
    const analyzedFirstParagraph = (parsedContent.textContent || '').substring(0, 100);
    
    // 如果沒有段落，回傳適當的結果
    if (!analyzedFirstParagraph) {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'No Text Found',
        description: 'No text content found for analysis',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Add textual content to your page for SEO analysis.',
        details: { reason: 'No text content found' },
        standards: CONTENT_STANDARDS.FIRST_PARAGRAPH_KEYWORD
      };
    }
    
    // 顯示前 100 字作為預覽
    const firstParagraphPreview = analyzedFirstParagraph;
    
    // 使用字符級別匹配檢查焦點關鍵字
    const matchedKeyword = keywords.find(kw => SEOAssessmentUtils.containsAllCharacters(analyzedFirstParagraph, kw));
    if (matchedKeyword) {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'Keyword in First 100 Chars',
        description: 'Focus/related keyword appears in the first 100 characters',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Great! Your keyword (focus or related) appears in the first 100 characters.',
        details: { 
          firstParagraph: firstParagraphPreview, 
          keyword: matchedKeyword, 
          containsKeyword: true 
        },
        standards: CONTENT_STANDARDS.FIRST_PARAGRAPH_KEYWORD
      };
    } else {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'Keyword Missing from First 100 Chars',
        description: 'Focus/related keyword does not appear in the first 100 characters',
        status: AssessmentStatus.BAD,
        score: 30,
        impact: 'high',
        recommendation: 'Include your focus/related keyword in the first 100 characters to improve SEO.',
        details: { 
          firstParagraph: firstParagraphPreview, 
          keywords, 
          containsKeyword: false 
        },
        standards: CONTENT_STANDARDS.FIRST_PARAGRAPH_KEYWORD
      };
    }
  }

  checkKeywordDensity(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const keywords = [
      ingredients.focusKeyword,
      ...(ingredients.relatedKeywords || [])
    ]
      .map(kw => kw?.toLowerCase().trim())
      .filter((kw): kw is string => !!kw);
    
    if (keywords.length === 0) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'No Keyword for Density Analysis',
        description: 'No focus/related keyword provided for density analysis',
        status: AssessmentStatus.OK,
        score: 75,
        impact: 'low',
        recommendation: 'Set a focus or related keyword to analyze keyword density.',
        details: { reason: 'No focus/related keyword provided' },
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    }

    // 只看前 100 字的關鍵字密度，目標 >12%，暫不設上限
    const analyzedParagraph = (parsedContent.textContent || '').substring(0, 100);

    if (!analyzedParagraph) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'No Text Found for Density',
        description: 'No text content found to calculate keyword density',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'medium',
        recommendation: 'Add textual content to enable keyword density analysis.',
        details: { reason: 'No text content found' },
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    }

    const firstParagraphLower = analyzedParagraph.toLowerCase();
    const totalLengthChars = analyzedParagraph.length || 0; // 前 100 字長度做為分母

    const calculateMetrics = (keyword: string) => {
      const keywordNormalized = keyword.toLowerCase().trim();
      const chineseChars = keywordNormalized.match(/[\u4e00-\u9fff]/g) || [];
      const wordTokens = keywordNormalized.match(/[a-z0-9]+/g) || [];
      const countWordOccurrences = (token: string) => {
        const regex = new RegExp(`\\b${token}\\b`, 'g');
        const matches = firstParagraphLower.match(regex);
        return matches ? matches.length : 0;
      };
      // 中文：逐字累計出現次數；英數：按單字，累計單字長度
      const matchedChineseCharsCount = chineseChars.reduce((sum, char) => {
        const regex = new RegExp(char, 'g');
        const matches = firstParagraphLower.match(regex);
        return sum + (matches ? matches.length : 0);
      }, 0);
      const matchedWordTokensLength = wordTokens.reduce((sum, token) => {
        const occurrences = countWordOccurrences(token);
        return sum + occurrences * token.length;
      }, 0);

      const matchedCharsTotal = matchedChineseCharsCount + matchedWordTokensLength;
      const densityVal = totalLengthChars > 0 ? (matchedCharsTotal / totalLengthChars) * 100 : 0;
      const densityRoundedVal = parseFloat(densityVal.toFixed(2));
      return {
        keyword,
        matchedChineseCharsCount,
        matchedWordTokensLength,
        matchedCharsTotal,
        densityRounded: densityRoundedVal
      };
    };

    const allChineseChars = new Set<string>();
    const allWordTokens = new Set<string>();
    const metricsList = keywords.map(k => {
      const metric = calculateMetrics(k);
      metric.keyword
        .match(/[\u4e00-\u9fff]/g)?.forEach(ch => allChineseChars.add(ch));
      metric.keyword
        .toLowerCase()
        .match(/[a-z0-9]+/g)?.forEach(token => allWordTokens.add(token));
      return metric;
    });

    const uniqueMatchedChineseChars = Array.from(allChineseChars).reduce((sum, char) => {
      const regex = new RegExp(char, 'g');
      const matches = firstParagraphLower.match(regex);
      return sum + (matches ? matches.length : 0);
    }, 0);

    const countWordOccurrences = (token: string) => {
      const regex = new RegExp(`\\b${token}\\b`, 'g');
      const matches = firstParagraphLower.match(regex);
      return matches ? matches.length : 0;
    };
    const uniqueMatchedWordTokensLength = Array.from(allWordTokens).reduce((sum, token) => {
      const occurrences = countWordOccurrences(token);
      return sum + occurrences * token.length;
    }, 0);

    const matchedCharsTotal = uniqueMatchedChineseChars + uniqueMatchedWordTokensLength;
    const densityVal = totalLengthChars > 0 ? (matchedCharsTotal / totalLengthChars) * 100 : 0;
    const densityRounded = parseFloat(densityVal.toFixed(2));
    const paragraphPreview = analyzedParagraph;
    const firstParagraphLengthChars = analyzedParagraph.length;
    const baseDetails = {
      matchedCharsTotal,
      density: densityRounded,
      keywordOccurrences: matchedCharsTotal, // deduped across keywords
      keywordUnits: matchedCharsTotal,
      totalWords: totalLengthChars,
      keywordWordLength: matchedCharsTotal,
      matchedChineseChars: uniqueMatchedChineseChars,
      matchedWordTokens: uniqueMatchedWordTokensLength,
      uniqueChineseChars: Array.from(allChineseChars),
      uniqueWordTokens: Array.from(allWordTokens),
      totalCharsAnalyzed: totalLengthChars,
      firstParagraphPreview: paragraphPreview,
      firstParagraphLengthChars,
      matchMode: 'char-count-over-100-chars-dedup-keywords',
      matchedKeyword: undefined,
      targetMinPercent: KEYWORD_DENSITY_MIN_TARGET,
      checkedKeywords: keywords,
      keywordMatches: metricsList
    };

    // 評分：0 無、<12 太低、>=12 達標（暫無上限）
    if (densityRounded === 0) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Keyword Not Found in First 100 Chars',
        description: 'Focus/related keyword does not appear in the first 100 characters',
        status: AssessmentStatus.BAD,
        score: 20,
        impact: 'medium',
        recommendation: `Add your focus/related keyword to the first 100 characters to improve density (aim >${KEYWORD_DENSITY_MIN_TARGET}%).`,
        details: baseDetails,
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    } else if (densityRounded < KEYWORD_DENSITY_MIN_TARGET) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Keyword Density Too Low',
        description: `Keyword density is ${densityRounded}% in the first 100 characters (target >${KEYWORD_DENSITY_MIN_TARGET}%)`,
        status: AssessmentStatus.BAD,
        score: 40,
        impact: 'medium',
        recommendation: `Increase focus/related keyword presence in the first 100 characters (aim above ${KEYWORD_DENSITY_MIN_TARGET}%).`,
        details: baseDetails,
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    } else {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Keyword Density Meets Target',
        description: `Keyword density is ${densityRounded}% in the first 100 characters (target >${KEYWORD_DENSITY_MIN_TARGET}%, no upper limit set)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Great! Your keyword density exceeds the minimum target; no upper limit is enforced for now.',
        details: baseDetails,
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    }
  }

  checkContentLength(parsedContent: ParsedContent): AssessmentResult {
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
        details: { wordCount },
        standards: CONTENT_STANDARDS.CONTENT_LENGTH
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
        details: { wordCount },
        standards: CONTENT_STANDARDS.CONTENT_LENGTH
      };
    }
  }
}
