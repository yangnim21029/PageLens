import { ExtendedAssessmentResult } from '../../types/extended-assessment.types';
import { ParsedContent } from '../../../understanding-the-page/types/parsed-content.types';
import { PageIngredients } from '../../../gathering-ingredients/types/ingredients.types';
export declare class TechnicalSEOAssessor {
    runTechnicalSEOChecks(parsedContent: ParsedContent, ingredients: PageIngredients): Promise<ExtendedAssessmentResult[]>;
    private checkCanonicalUrl;
    private checkRobotsDirectives;
    private checkHreflangTags;
    private checkSSLSecurity;
    private checkStructuredData;
    private isValidUrl;
    private validateHreflangTags;
    private validateJsonLdSchema;
}
