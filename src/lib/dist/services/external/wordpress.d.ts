import { z } from 'zod';
import type { NewSeoPage } from '../../types/wordpress';
declare const wpArticleDataSchema: z.ZodObject<{
    title: z.ZodString;
    post_content: z.ZodString;
    post_date: z.ZodString;
    author: z.ZodObject<{
        display_name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        display_name: string;
    }, {
        display_name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    title: string;
    post_content: string;
    post_date: string;
    author: {
        display_name: string;
    };
}, {
    title: string;
    post_content: string;
    post_date: string;
    author: {
        display_name: string;
    };
}>;
type wpArticleData = z.infer<typeof wpArticleDataSchema>;
export declare function callWordPressSEOApi(url: string): Promise<any | null>;
export declare function callWordPressArticleApi(url: string, options?: {
    timeout?: number;
}): Promise<{
    success: boolean;
    data?: wpArticleData;
    error?: string;
}>;
export declare function getKeywordByWordPress(url: string): Promise<string[] | null>;
export declare function getArticleHtmlByWordPress(url: string): Promise<string | null>;
export declare function getArticleTextByWordPress(url: string): Promise<string | null>;
export declare function getSeoPageByWordPress(url: string, projectId: string): Promise<NewSeoPage | null>;
export {};
