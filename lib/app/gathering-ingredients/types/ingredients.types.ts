export interface PageIngredients {
  htmlContent: string;
  pageDetails: PageDetails;
  focusKeyword: string;  // 可以是空字串，但仍需提供
  relatedKeywords: string[];  // 相關關鍵字清單（如：九龍好去處、港島好去處）
  synonyms?: string[];  // 同義詞清單（預留給未來使用，如：旅遊/旅行、景點/景區）
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