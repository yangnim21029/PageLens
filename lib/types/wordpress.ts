// WordPress API 相關類型定義

export interface NewSeoPage {
  url: string;
  projectId: string;
  scrapeBy: string;
  byline?: string;
  publishedDate?: string;
  title?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyphrase?: string;
  keywords?: string[];
  [key: string]: any;
}

export interface WordPressAuditResult {
  success: boolean;
  url: string;
  content?: {
    title: string;
    html: string;
    text: string;
    author: string;
    publishedDate: string;
  };
  seo?: {
    title: string;
    description: string;
    focusKeyphrase: string;
    relatedKeyphrase?: string[];
    keywords: string[];
  };
  audit?: {
    passed: boolean;
    score: number;
    issues: Array<{
      type: 'warning' | 'error' | 'info';
      message: string;
      suggestion?: string;
    }>;
  };
  error?: string;
}

export interface WordPressConfig {
  WP_ARTICLE_SEO_URL: string;
  supportedSites: Record<string, string>;
}