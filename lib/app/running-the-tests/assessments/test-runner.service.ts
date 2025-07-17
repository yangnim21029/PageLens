import { SEOAssessor } from './seo-checks/seo-assessor.service';
import { ReadabilityAssessor } from './readability-checks/readability-assessor.service';
import { 
  TestRunResult, 
  TestResults, 
  AssessmentType, 
  AssessmentConfiguration, 
  DEFAULT_ASSESSMENT_CONFIG,
  SEO_ASSESSMENTS,
  READABILITY_ASSESSMENTS,
  AvailableAssessments 
} from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';

export class TestRunner {
  private seoAssessor: SEOAssessor;
  private readabilityAssessor: ReadabilityAssessor;

  constructor() {
    this.seoAssessor = new SEOAssessor();
    this.readabilityAssessor = new ReadabilityAssessor();
  }

  async runTests(
    parsedContent: ParsedContent, 
    ingredients: PageIngredients, 
    config: AssessmentConfiguration = DEFAULT_ASSESSMENT_CONFIG
  ): Promise<TestRunResult> {
    try {
      const enabledAssessments = this.resolveEnabledAssessments(config);
      
      // Run SEO assessments if any SEO checks are enabled
      let seoAssessments: any[] = [];
      if (this.shouldRunSEOAssessments(enabledAssessments)) {
        const allSeoAssessments = await this.seoAssessor.runSEOChecks(parsedContent, ingredients);
        seoAssessments = this.filterAssessments(allSeoAssessments, enabledAssessments);
      }

      // Run readability assessments if any readability checks are enabled
      let readabilityAssessments: any[] = [];
      if (this.shouldRunReadabilityAssessments(enabledAssessments)) {
        const allReadabilityAssessments = await this.readabilityAssessor.runReadabilityChecks(parsedContent);
        readabilityAssessments = this.filterAssessments(allReadabilityAssessments, enabledAssessments);
      }

      const allAssessments = [...seoAssessments, ...readabilityAssessments];

      const seoScore = this.calculateCategoryScore(seoAssessments);
      const readabilityScore = this.calculateCategoryScore(readabilityAssessments);
      const overallScore = this.calculateOverallScore(seoScore, readabilityScore);

      const results: TestResults = {
        seoScore,
        readabilityScore,
        overallScore,
        assessments: allAssessments,
        timestamp: new Date()
      };

      return {
        success: true,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run tests'
      };
    }
  }

  private calculateCategoryScore(assessments: any[]): number {
    if (assessments.length === 0) return 0;

    const weightedScores = assessments.map(assessment => {
      const impactWeight = this.getImpactWeight(assessment.impact);
      return assessment.score * impactWeight;
    });

    const totalWeight = assessments.reduce((sum, assessment) => {
      return sum + this.getImpactWeight(assessment.impact);
    }, 0);

    return totalWeight > 0 ? Math.round(weightedScores.reduce((sum, score) => sum + score, 0) / totalWeight) : 0;
  }

  private calculateOverallScore(seoScore: number, readabilityScore: number): number {
    // Weight SEO slightly higher than readability
    return Math.round((seoScore * 0.6) + (readabilityScore * 0.4));
  }

  private getImpactWeight(impact: string): number {
    switch (impact) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  /**
   * Resolve which assessments should be enabled based on configuration
   */
  private resolveEnabledAssessments(config: AssessmentConfiguration): string[] {
    // If enableAll is true or no specific configuration is provided
    if (config.enableAll || (!config.enabledAssessments && !config.enableAllSEO && !config.enableAllReadability)) {
      return Object.values(AvailableAssessments);
    }

    let enabledAssessments: string[] = [];

    // Add specifically enabled assessments
    if (config.enabledAssessments) {
      enabledAssessments.push(...config.enabledAssessments);
    }

    // Add all SEO assessments if enableAllSEO is true
    if (config.enableAllSEO) {
      enabledAssessments.push(...SEO_ASSESSMENTS);
    }

    // Add all readability assessments if enableAllReadability is true
    if (config.enableAllReadability) {
      enabledAssessments.push(...READABILITY_ASSESSMENTS);
    }

    // Remove duplicates
    return [...new Set(enabledAssessments)];
  }

  /**
   * Check if any SEO assessments should be run
   */
  private shouldRunSEOAssessments(enabledAssessments: string[]): boolean {
    return SEO_ASSESSMENTS.some(seoAssessment => enabledAssessments.includes(seoAssessment));
  }

  /**
   * Check if any readability assessments should be run
   */
  private shouldRunReadabilityAssessments(enabledAssessments: string[]): boolean {
    return READABILITY_ASSESSMENTS.some(readabilityAssessment => enabledAssessments.includes(readabilityAssessment));
  }

  /**
   * Filter assessments based on enabled assessment IDs
   */
  private filterAssessments(assessments: any[], enabledAssessments: string[]): any[] {
    return assessments.filter(assessment => {
      // Check if this assessment ID is enabled, or if it's a "good" version of an enabled assessment
      return enabledAssessments.includes(assessment.id) || 
             this.isGoodVersionOfEnabledAssessment(assessment.id, enabledAssessments);
    });
  }

  /**
   * Check if an assessment is a "good" version of an enabled assessment
   * For example, 'h1-keyword-good' is the positive version of 'h1-keyword-missing'
   */
  private isGoodVersionOfEnabledAssessment(assessmentId: string, enabledAssessments: string[]): boolean {
    // Map of good assessment IDs to their corresponding enabled assessment enum values
    const goodToEnabledMap: Record<string, string> = {
      'h1-keyword-good': AvailableAssessments.H1_KEYWORD,
      'images-alt-good': AvailableAssessments.ALT_ATTRIBUTE,
      'keyword-first-paragraph': AvailableAssessments.INTRODUCTION_KEYWORD,
      'keyword-density-good': AvailableAssessments.KEYWORD_DENSITY,
      'keyword-density-high': AvailableAssessments.KEYWORD_DENSITY,
      'meta-description-good': AvailableAssessments.META_DESCRIPTION_KEYWORD,
      'title-good': AvailableAssessments.PAGE_TITLE_WIDTH,
      'content-length-good': AvailableAssessments.TEXT_LENGTH,
      'sentence-length-good': AvailableAssessments.SENTENCE_LENGTH_IN_TEXT,
      'paragraph-length-good': AvailableAssessments.PARAGRAPH_TOO_LONG,
      'subheading-distribution-good': AvailableAssessments.SUBHEADING_DISTRIBUTION_TOO_LONG,
      'no-images': AvailableAssessments.ALT_ATTRIBUTE
    };

    const correspondingEnabledAssessment = goodToEnabledMap[assessmentId];
    return correspondingEnabledAssessment ? enabledAssessments.includes(correspondingEnabledAssessment) : false;
  }
}