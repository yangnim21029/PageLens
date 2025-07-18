// 主要 SEO 評估器 - 重構版本
// 協調所有子評估器，提供統一的 SEO 評估接口

import { AssessmentResult } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';
import { HeadingAssessor } from './heading-assessor.service';
import { ContentAssessor } from './content-assessor.service';
import { MetaAssessor } from './meta-assessor.service';

export class SEOAssessor {
  private headingAssessor: HeadingAssessor;
  private contentAssessor: ContentAssessor;
  private metaAssessor: MetaAssessor;

  constructor() {
    this.headingAssessor = new HeadingAssessor();
    this.contentAssessor = new ContentAssessor();
    this.metaAssessor = new MetaAssessor();
  }

  async runSEOChecks(parsedContent: ParsedContent, ingredients: PageIngredients): Promise<AssessmentResult[]> {
    const assessments: AssessmentResult[] = [];

    // 🔍 標題相關評估 (6個)
    assessments.push(this.headingAssessor.checkH1Missing(parsedContent));
    assessments.push(this.headingAssessor.checkMultipleH1(parsedContent));
    assessments.push(this.headingAssessor.checkH1Keyword(parsedContent, ingredients));
    assessments.push(this.headingAssessor.checkH2RelatedKeywords(parsedContent, ingredients));
    assessments.push(this.headingAssessor.checkTitleOptimization(parsedContent));
    assessments.push(this.headingAssessor.checkTitleKeyword(parsedContent, ingredients));

    // 📝 內容相關評估 (3個)
    assessments.push(this.contentAssessor.checkKeywordFirstParagraph(parsedContent, ingredients));
    assessments.push(this.contentAssessor.checkKeywordDensity(parsedContent, ingredients));
    assessments.push(this.contentAssessor.checkContentLength(parsedContent));

    // 🏷️ Meta 和媒體相關評估 (3個)
    assessments.push(this.metaAssessor.checkImagesAlt(parsedContent));
    assessments.push(this.metaAssessor.checkMetaDescriptionKeyword(parsedContent, ingredients));
    assessments.push(this.metaAssessor.checkMetaDescriptionLength(parsedContent));

    // 確保返回所有 12 個 SEO assessments
    if (assessments.length !== 12) {
      console.warn(`Expected 12 SEO assessments, got ${assessments.length}`);
    }

    return assessments;
  }
}