import { SEOAssessor } from './seo-checks/seo-assessor.service';
import { ReadabilityAssessor } from './readability-checks/readability-assessor.service';
import { TestRunResult, TestResults, AssessmentType } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';

export class TestRunner {
  private seoAssessor: SEOAssessor;
  private readabilityAssessor: ReadabilityAssessor;

  constructor() {
    this.seoAssessor = new SEOAssessor();
    this.readabilityAssessor = new ReadabilityAssessor();
  }

  async runTests(parsedContent: ParsedContent, ingredients: PageIngredients): Promise<TestRunResult> {
    try {
      const seoAssessments = await this.seoAssessor.runSEOChecks(parsedContent, ingredients);
      const readabilityAssessments = await this.readabilityAssessor.runReadabilityChecks(parsedContent);

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
}