import { AssessmentResult } from '../../types/assessment.types';
import { ParsedContent } from '../../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../../gathering-ingredients/types/ingredients.types';
export declare class SEOAssessor {
    runSEOChecks(parsedContent: ParsedContent, ingredients: PageIngredients): Promise<AssessmentResult[]>;
    private checkHeadingStructure;
    private checkImageOptimization;
    private checkKeywordOptimization;
    private checkMetaElements;
    private checkContentLength;
    private countWordsLanguageAware;
    private countKeywordOccurrences;
    private getTitleLengthStandards;
    private getMetaDescriptionLengthStandards;
}
