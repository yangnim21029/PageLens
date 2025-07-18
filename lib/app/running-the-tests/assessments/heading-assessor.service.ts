// 標題相關 SEO 評估器
// 包含 H1、H2、Title 相關的評估邏輯

import { AssessmentResult, AssessmentCategory, AssessmentStatus, AvailableAssessments } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';
import { SEOAssessmentUtils } from './utils/seo-assessment-utils';

// 標題相關評估標準值
const HEADING_STANDARDS = {
  TITLE_LENGTH: {
    optimal: { min: 150, max: 600, unit: 'px' },
    acceptable: { min: 100, max: 600, unit: 'px' },
    description: '標題寬度最佳 >150px，最大600px'
  },
  H1_COUNT: {
    optimal: { value: 1, unit: '個' },
    description: '每頁應有且僅有一個 H1 標籤'
  }
};

export class HeadingAssessor {
  
  checkH1Missing(parsedContent: ParsedContent): AssessmentResult {
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

  checkMultipleH1(parsedContent: ParsedContent): AssessmentResult {
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

  checkH1Keyword(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
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
    const focusKeyword = ingredients.focusKeyword?.toLowerCase() || '';
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
    const hasFocusKeyword = SEOAssessmentUtils.containsAllCharacters(h1Text, focusKeyword);
    const matchingRelatedKeyword = SEOAssessmentUtils.findMatchingRelatedKeyword(h1Text, relatedKeywords);
    
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

  checkH2RelatedKeywords(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
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

  checkTitleOptimization(parsedContent: ParsedContent): AssessmentResult {
    const title = parsedContent.title || '';
    const pixelWidth = SEOAssessmentUtils.calculateTextWidth(title);
    const charEquivalent = SEOAssessmentUtils.pixelWidthToCharCount(pixelWidth);
    
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
        standards: HEADING_STANDARDS.TITLE_LENGTH
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
        standards: HEADING_STANDARDS.TITLE_LENGTH
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
        standards: HEADING_STANDARDS.TITLE_LENGTH
      };
    }
  }

  checkTitleKeyword(parsedContent: ParsedContent, ingredients: PageIngredients): AssessmentResult {
    const title = parsedContent.title || '';
    const focusKeyword = ingredients.focusKeyword?.toLowerCase() || '';
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
    const hasFocusKeyword = SEOAssessmentUtils.containsAllCharacters(title, focusKeyword);
    const matchingRelatedKeyword = SEOAssessmentUtils.findMatchingRelatedKeyword(title, relatedKeywords);
    
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
}