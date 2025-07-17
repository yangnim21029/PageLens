export interface ParsedContent {
  title: string;
  metaDescription?: string;
  headings: HeadingStructure[];
  images: ImageInfo[];
  links: LinkInfo[];
  videos: VideoInfo[];
  textContent: string;
  wordCount: number;
  paragraphs: string[];
  structuredData?: any[];
  textStats: TextStats;
  mainContentHtml: string;
  author?: string;
  publishedDate?: Date;
  
  // Extended content analysis
  structuredDataDetailed?: StructuredDataInfo;
  socialMeta?: SocialMediaTags;
  technical?: TechnicalSEOInfo;
  media?: MediaInfo;
  contentStructure?: ContentStructureInfo;
  typography?: TypographyInfo;
  performanceHints?: PerformanceInfo;
  accessibility?: AccessibilityInfo;
  i18n?: InternationalizationInfo;
  security?: SecurityInfo;
}

export interface HeadingStructure {
  level: number; // 1-6 for H1-H6
  text: string;
  order: number;
}

export interface ImageInfo {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

export interface LinkInfo {
  href: string;
  text: string;
  isExternal: boolean;
  isNoFollow: boolean;
  contextBefore?: string; // 連結前50字符的上下文文字
  contextAfter?: string; // 連結後50字符的上下文文字
  title?: string;
  rel?: string;
  target?: string;
  isUGC?: boolean;
  isSponsored?: boolean;
}

export interface VideoInfo {
  src: string;
  title?: string;
  type: 'video' | 'iframe';
}

export interface TextStats {
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  readingTime: number; // in minutes
  sentences: number;
}

export interface ContentExtractionResult {
  success: boolean;
  parsedContent?: ParsedContent;
  error?: string;
}

// Extended interfaces for comprehensive content analysis
export interface StructuredDataInfo {
  jsonLd: Array<{
    type: string;
    data: any;
  }>;
  microdata: Array<{
    type: string;
    properties: Record<string, any>;
  }>;
  rdfa: Array<{
    type: string;
    properties: Record<string, any>;
  }>;
}

export interface SocialMediaTags {
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  pinterest: Record<string, string>;
}

export interface TechnicalSEOInfo {
  canonical?: string;
  hreflang: Array<{
    lang: string;
    href: string;
  }>;
  robots: {
    meta?: string;
    xRobots?: string;
  };
  alternateLinks: Array<{
    rel: string;
    type?: string;
    href: string;
    title?: string;
  }>;
}

export interface MediaInfo {
  videos: Array<{
    src?: string;
    poster?: string;
    width?: number;
    height?: number;
    hasTranscript: boolean;
    hasCaptions: boolean;
  }>;
  audio: Array<{
    src?: string;
    hasTranscript: boolean;
  }>;
  iframes: Array<{
    src?: string;
    title?: string;
    width?: number;
    height?: number;
    sandbox?: string;
  }>;
}

export interface ContentStructureInfo {
  lists: {
    ordered: Array<{
      itemCount: number;
      textContent: string;
    }>;
    unordered: Array<{
      itemCount: number;
      textContent: string;
    }>;
    definition: Array<{
      termCount: number;
      definitionCount: number;
    }>;
  };
  tables: Array<{
    rows: number;
    columns: number;
    hasHeader: boolean;
    hasCaption: boolean;
    captionText?: string;
    summary?: string;
  }>;
  blockquotes: Array<{
    text: string;
    cite?: string;
  }>;
  codeBlocks: Array<{
    language?: string;
    content: string;
    lineCount: number;
  }>;
}

export interface TypographyInfo {
  fonts: string[];
  headingSizes: Record<string, number[]>;
  paragraphSizes: number[];
  lineHeights: number[];
}

export interface PerformanceInfo {
  imageSizes: Array<{
    src: string;
    displayWidth?: number;
    displayHeight?: number;
    naturalWidth?: number;
    naturalHeight?: number;
    isLazy?: boolean;
    format?: string;
  }>;
  scripts: Array<{
    src?: string;
    isAsync?: boolean;
    isDefer?: boolean;
    isModule?: boolean;
    size?: number;
  }>;
  stylesheets: Array<{
    href?: string;
    media?: string;
    isInline: boolean;
    size?: number;
  }>;
}

export interface AccessibilityInfo {
  landmarks: Array<{
    role: string;
    label?: string;
  }>;
  headingStructure: Array<{
    level: number;
    text: string;
    id?: string;
    isSkipped: boolean;
  }>;
  skipLinks: Array<{
    href: string;
    text: string;
  }>;
  ariaLabels: number;
  ariaDescriptions: number;
}

export interface InternationalizationInfo {
  documentLanguage?: string;
  contentLanguages: Array<{
    lang: string;
    textLength: number;
  }>;
  hasRTL: boolean;
}

export interface SecurityInfo {
  hasHttpLinks: boolean;
  hasInsecureFormAction: boolean;
  hasMixedContent: boolean;
  externalScripts: string[];
}
