// 簡化的映射工具，專注於 WordPress 審核功能

import type { NewSeoPage } from '../types/wordpress';
import {
  parseKeywordsFromString
} from './formatDataForAi';

// === Transform 函數 ===
export const transforms = {
  cleanString: (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  },
  toDate: (value: unknown): string => {
    if (!value) return '';
    try {
      return new Date(String(value)).toISOString();
    } catch {
      return '';
    }
  },
  parseKeywords: (value: string) => (value ? parseKeywordsFromString(value) : []),
  toInteger: (value: unknown) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? null : parsed;
  }
};

// === 映射配置 ===
export const MAPPING_CONFIG = {
  wordpress: {
    article: {
      title: { path: 'title', transform: 'cleanString' },
      content: { path: 'post_content', transform: 'cleanString' },
      byline: { path: 'author.display_name', transform: 'cleanString' },
      publishedDate: { path: 'post_date', transform: 'toDate' }
    },
    seo: {
      metaTitle: { path: 'title', transform: 'cleanString' },
      metaDescription: { path: 'description', transform: 'cleanString' },
      focusKeyphrase: { path: 'focusKeyphrase', transform: 'cleanString' }
    }
  }
};

// === 映射函數 ===
export function mapData(data: any, config: any): any {
  const result: any = {};
  
  for (const [key, mapping] of Object.entries(config)) {
    const { path, transform } = mapping as any;
    let value = getNestedValue(data, path);
    
    if (transform && transforms[transform as keyof typeof transforms]) {
      value = (transforms[transform as keyof typeof transforms] as any)(value);
    }
    
    result[key] = value;
  }
  
  return result;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// === SeoPage 創建函數 ===
export function createSeoPage(
  data: any,
  meta: { url: string; projectId: string; scrapeBy: string }
): NewSeoPage {
  return {
    url: meta.url,
    projectId: meta.projectId,
    scrapeBy: meta.scrapeBy,
    title: data.title || '',
    content: data.content || '',
    metaTitle: data.metaTitle || '',
    metaDescription: data.metaDescription || '',
    focusKeyphrase: data.focusKeyphrase || '',
    byline: data.byline || '',
    publishedDate: data.publishedDate || '',
    keywords: data.keywords || []
  };
}