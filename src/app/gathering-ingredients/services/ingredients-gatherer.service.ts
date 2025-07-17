import { PageIngredients, PageDetails, IngredientsGatheringResult } from '../types/ingredients.types';

export class IngredientsGatherer {
  async gatherIngredients(input: {
    htmlContent: string;
    pageDetails: PageDetails;
    focusKeyword: string;
    synonyms?: string[];
  }): Promise<IngredientsGatheringResult> {
    try {
      const ingredients: PageIngredients = {
        htmlContent: input.htmlContent,
        pageDetails: input.pageDetails,
        focusKeyword: input.focusKeyword.toLowerCase().trim(),
        synonyms: (input.synonyms || []).map(s => s.toLowerCase().trim())
      };

      this.validateIngredients(ingredients);

      return {
        success: true,
        ingredients,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  private validateIngredients(ingredients: PageIngredients): void {
    if (!ingredients.htmlContent || ingredients.htmlContent.trim().length === 0) {
      throw new Error('HTML content is required');
    }

    if (!ingredients.pageDetails.url) {
      throw new Error('Page URL is required');
    }

    if (!ingredients.focusKeyword || ingredients.focusKeyword.trim().length === 0) {
      throw new Error('Focus keyword is required');
    }

    if (ingredients.htmlContent.length < 100) {
      throw new Error('HTML content seems too short to analyze');
    }
  }
}