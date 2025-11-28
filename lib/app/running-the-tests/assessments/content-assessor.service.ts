// 內容相關 SEO 評估器
// 包含關鍵字密度、內容長度、首段關鍵字等評估邏輯

import { AssessmentResult, AssessmentCategory, AssessmentStatus, AvailableAssessments } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';
import { SEOAssessmentUtils } from './utils/seo-assessment-utils';

// 內容相關評估標準值
const CONTENT_STANDARDS = {
  KEYWORD_DENSITY: {
    optimal: { min: 2.5, max: 15, unit: '%' },
    acceptable: { min: 2.5, max: 15, unit: '%' },
    description: '首段關鍵字密度以第一段為準，目標 2.5%-15%，越高越好但不超過 15%'
  },
  CONTENT_LENGTH: {
    optimal: { min: 300, unit: '字' },
    acceptable: { min: 200, unit: '字' },
    description: '內容至少 300 字'
  },
  FIRST_PARAGRAPH_KEYWORD: {
    optimal: { value: '包含', unit: '' },
    acceptable: { value: '包含', unit: '' },
    description: '首段（前100字）應包含焦點關鍵字'
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
        details: { reason: 'No focus keyword provided' },
        standards: CONTENT_STANDARDS.FIRST_PARAGRAPH_KEYWORD
      };
    }

    // 使用 paragraphs 陣列來獲取真正的第一段落（排除標題）
    const firstParagraph = parsedContent.paragraphs && parsedContent.paragraphs.length > 0 
      ? parsedContent.paragraphs[0] 
      : '';
    
    // 如果沒有段落，回傳適當的結果
    if (!firstParagraph) {
      return {
        id: AvailableAssessments.KEYWORD_MISSING_FIRST_PARAGRAPH,
        type: AssessmentCategory.SEO,
        name: 'No Paragraphs Found',
        description: 'No paragraph content found for analysis',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'high',
        recommendation: 'Add paragraph content to your page for SEO analysis.',
        details: { reason: 'No paragraph content found' },
        standards: CONTENT_STANDARDS.FIRST_PARAGRAPH_KEYWORD
      };
    }
    
    // 顯示前 100 字作為預覽
    const firstParagraphPreview = firstParagraph.length > 100 
      ? firstParagraph.substring(0, 100) + '...' 
      : firstParagraph;
    
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
        details: { 
          firstParagraph: firstParagraphPreview, 
          focusKeyword, 
          containsKeyword: true 
        },
        standards: CONTENT_STANDARDS.FIRST_PARAGRAPH_KEYWORD
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
        details: { 
          firstParagraph: firstParagraphPreview, 
          focusKeyword, 
          containsKeyword: false 
        },
        standards: CONTENT_STANDARDS.FIRST_PARAGRAPH_KEYWORD
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

    // 只看第一段落的關鍵字密度，目標 2.5%-15%，越高越好但不超過 15%
    const firstParagraph = parsedContent.paragraphs && parsedContent.paragraphs.length > 0
      ? parsedContent.paragraphs[0]
      : '';

    if (!firstParagraph) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'No Paragraphs Found for Density',
        description: 'No paragraph content found to calculate keyword density',
        status: AssessmentStatus.BAD,
        score: 0,
        impact: 'medium',
        recommendation: 'Add paragraph content to enable keyword density analysis.',
        details: { reason: 'No paragraph content found' },
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    }

    const firstParagraphLower = firstParagraph.toLowerCase();
    const totalWords = SEOAssessmentUtils.analyzeTextLength(firstParagraphLower);
    const keywordLength = SEOAssessmentUtils.analyzeTextLength(focusKeyword);

    const keywordOccurrences = focusKeyword.length > 0
      ? firstParagraphLower.split(focusKeyword).length - 1
      : 0;

    const keywordWordLength = keywordOccurrences * keywordLength;
    const density = totalWords > 0 ? (keywordWordLength / totalWords) * 100 : 0;
    const densityRounded = parseFloat(density.toFixed(2));
    const paragraphPreview = firstParagraph.length > 100 ? firstParagraph.substring(0, 100) + '...' : firstParagraph;
    const firstParagraphLengthChars = firstParagraph.length;
    const baseDetails = {
      density: densityRounded,
      keywordOccurrences,
      totalWords,
      keywordWordLength,
      firstParagraphPreview: paragraphPreview,
      firstParagraphLengthChars
    };

    // 評分：0 無、<2.5 太低、2.5-6 OK、6-15 優、>15 太高
    if (density === 0) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Keyword Not Found in First Paragraph',
        description: 'Focus keyword does not appear in the first paragraph',
        status: AssessmentStatus.BAD,
        score: 20,
        impact: 'medium',
        recommendation: 'Add your focus keyword to the first paragraph to improve density (aim 2.5%-15%).',
        details: baseDetails,
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    } else if (density > 15) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Keyword Density Too High',
        description: `Keyword density is ${densityRounded}% (should not exceed 15%)`,
        status: AssessmentStatus.BAD,
        score: 40,
        impact: 'medium',
        recommendation: 'Reduce the focus keyword usage in the first paragraph to stay under 15%.',
        details: baseDetails,
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    } else if (density >= 6) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Excellent Keyword Density',
        description: `Keyword density is ${densityRounded}% in the first paragraph (target 2.5%-15%)`,
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'medium',
        recommendation: 'Great! Your first paragraph keyword density is strong and under 15%.',
        details: baseDetails,
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    } else if (density >= 2.5) {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Good Keyword Density',
        description: `Keyword density is ${densityRounded}% in the first paragraph (target 2.5%-15%)`,
        status: AssessmentStatus.OK,
        score: 80,
        impact: 'medium',
        recommendation: 'Consider slightly increasing focus keyword usage toward the 15% cap.',
        details: baseDetails,
        standards: CONTENT_STANDARDS.KEYWORD_DENSITY
      };
    } else {
      return {
        id: AvailableAssessments.KEYWORD_DENSITY_LOW,
        type: AssessmentCategory.SEO,
        name: 'Keyword Density Too Low',
        description: `Keyword density is ${densityRounded}% in the first paragraph (minimum target 2.5%)`,
        status: AssessmentStatus.BAD,
        score: 40,
        impact: 'medium',
        recommendation: 'Increase focus keyword presence in the first paragraph (aim 2.5%-15%).',
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
