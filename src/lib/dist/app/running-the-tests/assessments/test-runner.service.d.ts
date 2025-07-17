import { TestRunResult, AssessmentConfiguration } from '../types/assessment.types';
import { ParsedContent } from '../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../gathering-ingredients/types/ingredients.types';
export declare class TestRunner {
    private seoAssessor;
    private readabilityAssessor;
    constructor();
    runTests(parsedContent: ParsedContent, ingredients: PageIngredients, config?: AssessmentConfiguration): Promise<TestRunResult>;
    private calculateCategoryScore;
    private calculateOverallScore;
    private getImpactWeight;
    private resolveEnabledAssessments;
    private shouldRunSEOAssessments;
    private shouldRunReadabilityAssessments;
    private filterAssessments;
    private isGoodVersionOfEnabledAssessment;
}
