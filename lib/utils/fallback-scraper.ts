import { JSDOM } from 'jsdom';

/**
 * Fallback scraper to extract meta description from public URL
 * Used when upstream API fails to provide it
 */
export async function scrapeMetaDescription(url: string): Promise<string> {
    try {
        console.log(`[Fallback Scraper] Fetching ${url} for meta description...`);

        // Set a user agent to avoid being blocked by some WAFs
        const headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; PageLens/2.0; +http://pagelens.com)'
        };

        const response = await fetch(url, { headers });

        if (!response.ok) {
            console.warn(`[Fallback Scraper] Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            return '';
        }

        const html = await response.text();

        // Use JSDOM to parse reliable
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Try standard name="description"
        let description = doc.querySelector('meta[name="description"]')?.getAttribute('content');

        // Try property="og:description" as backup
        if (!description) {
            description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
        }

        return description?.trim() || '';

    } catch (error) {
        console.error('[Fallback Scraper] Error scraping description:', error);
        return '';
    }
}
