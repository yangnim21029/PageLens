import { IngredientsGatheringResult, PageDetails } from '../types/ingredients.types';
export declare class IngredientsGatherer {
    gatherIngredients(input: {
        htmlContent: string;
        pageDetails: PageDetails;
        focusKeyword?: string;
        synonyms?: string[];
    }): Promise<IngredientsGatheringResult>;
    private validateIngredients;
}
