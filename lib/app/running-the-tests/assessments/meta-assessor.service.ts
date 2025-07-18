// Meta 和媒體相關 SEO 評估器
// 包含 Meta Description、圖片 Alt 標籤等評估邏輯

import { AssessmentResult, AssessmentCategory, AssessmentStatus, AvailableAssessments } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';
import { SEOAssessmentUtils } from './utils/seo-assessment-utils';

// Meta 相關評估標準值
const META_STANDARDS = {
  META_DESCRIPTION_LENGTH: {
    optimal: { min: 600, max: 960, unit: 'px' },
    acceptable: { min: 300, max: 960, unit: 'px' },
    description: 'Meta 描述寬度最佳 >600px，最大960px'
  },
  IMAGES_ALT: {
    optimal: { value: 0, unit: '個缺失' },
    description: '所有圖片都應有 alt 屬性'
  }
};

export class MetaAssessor {
  
  checkImagesAlt(parsedContent: ParsedContent): AssessmentResult {
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
        details: { imageCount: 0, imagesWithoutAlt: 0 },
        standards: META_STANDARDS.IMAGES_ALT
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
        details: { imageCount: images.length, imagesWithoutAlt: 0 },
        standards: META_STANDARDS.IMAGES_ALT
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
        details: { imageCount: images.length, imagesWithoutAlt },
        standards: META_STANDARDS.IMAGES_ALT
      };
    }
  }

  checkMetaDescriptionKeyword(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
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

    // 使用字符級別匹配，檢查是否包含焦點關鍵字的所有字符
    const containsKeyword = SEOAssessmentUtils.containsAllCharacters(metaDescription, focusKeyword);
    
    if (containsKeyword) {
      return {
        id: AvailableAssessments.META_DESCRIPTION_NEEDS_IMPROVEMENT,
        type: AssessmentCategory.SEO,
        name: 'Meta Description Contains Keyword',
        description: 'Meta description contains the focus keyword',
        status: AssessmentStatus.GOOD,
        score: 100,
        impact: 'high',
        recommendation: 'Great! Your meta description contains the focus keyword.',
        details: { metaDescription, focusKeyword, containsKeyword: true }
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
        details: { metaDescription, focusKeyword, containsKeyword: false }
      };
    }
  }

  checkMetaDescriptionLength(parsedContent: ParsedContent): AssessmentResult {
    const metaDescription = parsedContent.metaDescription || '';
    const pixelWidth = SEOAssessmentUtils.calculateTextWidth(metaDescription);
    const charEquivalent = SEOAssessmentUtils.pixelWidthToCharCount(pixelWidth);
    
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
        standards: META_STANDARDS.META_DESCRIPTION_LENGTH
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
        standards: META_STANDARDS.META_DESCRIPTION_LENGTH
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
        standards: META_STANDARDS.META_DESCRIPTION_LENGTH
      };
    }
  }
}