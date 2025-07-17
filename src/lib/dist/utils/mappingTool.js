"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAPPING_CONFIG = exports.transforms = void 0;
exports.mapData = mapData;
exports.createSeoPage = createSeoPage;
const formatDataForAi_1 = require("./formatDataForAi");
exports.transforms = {
    cleanString: (value) => {
        if (value === null || value === undefined)
            return '';
        return String(value).trim();
    },
    toDate: (value) => {
        if (!value)
            return '';
        try {
            return new Date(String(value)).toISOString();
        }
        catch {
            return '';
        }
    },
    parseKeywords: (value) => (value ? (0, formatDataForAi_1.parseKeywordsFromString)(value) : []),
    toInteger: (value) => {
        if (value === null || value === undefined || value === '')
            return null;
        const parsed = parseInt(String(value), 10);
        return isNaN(parsed) ? null : parsed;
    }
};
exports.MAPPING_CONFIG = {
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
function mapData(data, config) {
    const result = {};
    for (const [key, mapping] of Object.entries(config)) {
        const { path, transform } = mapping;
        let value = getNestedValue(data, path);
        if (transform && exports.transforms[transform]) {
            value = exports.transforms[transform](value);
        }
        result[key] = value;
    }
    return result;
}
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}
function createSeoPage(data, meta) {
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
//# sourceMappingURL=mappingTool.js.map