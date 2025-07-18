// 內容相關 SEO 評估器
// 包含關鍵字密度、內容長度、首段關鍵字等評估邏輯

import { AssessmentResult, AssessmentCategory, AssessmentStatus, AvailableAssessments } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';
import { SEOAssessmentUtils } from './utils/seo-assessment-utils';

// 內容相關評估標準值
const CONTENT_STANDARDS = {
  KEYWORD_DENSITY: {
    optimal: { min: 0.5, max: 2.5, unit: '%' },
    acceptable: { min: 0.3, max: 3.0, unit: '%' },
    description: '關鍵字密度最佳範圍 0.5-2.5%'
  },
  CONTENT_LENGTH: {
    optimal: { min: 300, unit: '字' },
    acceptable: { min: 200, unit: '字' },
    description: '內容至少 300 字'
  }
};

export class ContentAssessor {
  
  checkKeywordFirstParagraph(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
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

    const firstParagraph = parsedContent.textContent.split('\n')[0] || '';
    
    // 使用字符級別匹配檢查焦點關鍵字
    if (SEOAssessmentUtils.containsAllCharacters(firstParagraph, focusKeyword)) {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'Keyword in First Paragraph',
        description: 'Focus keyword appears in the first paragraph',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Great! Your focus keyword appears in the first paragraph.',
        details: { firstParagraph: firstParagraph.substring(0, 100) + '...', focusKeyword, containsKeyword: true }
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
        details: { firstParagraph: firstParagraph.substring(0, 100) + '...', focusKeyword, containsKeyword: false }
      };
    }
  }

  checkKeywordDensity(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
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
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
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
    // - 確保關鍵字匹配大小寫不敏感
    const totalWords = parsedContent.wordCount || SEOAssessmentUtils.analyzeTextLength(text);
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
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
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
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
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