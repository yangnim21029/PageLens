export interface PageIngredients {
    htmlContent: string;
    pageDetails: PageDetails;
    focusKeyword: string;
    synonyms: string[];
}
export interface PageDetails {
    url: string;
    title: string;
    description?: string;
    language?: string;
    publishedDate?: Date;
    modifiedDate?: Date;
    author?: string;
    category?: string;
    tags?: string[];
}
export interface IngredientsGatheringResult {
    success: boolean;
    ingredients?: PageIngredients;
    error?: string;
    timestamp: Date;
}
