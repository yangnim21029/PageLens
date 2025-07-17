"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORDPRESS_CONFIG = exports.siteGroups = exports.subPathSiteMap = exports.wordPressSiteMap = exports.WP_ARTICLE_URL = exports.WP_ARTICLE_SEO_URL = void 0;
exports.WP_ARTICLE_SEO_URL = process.env.WP_ARTICLE_SEO_URL ||
    'https://article-api.presslogic.com/v1/articles/getArticleSEO';
exports.WP_ARTICLE_URL = process.env.WP_ARTICLE_URL ||
    'https://article-api.presslogic.com/v1/articles/getArticle';
exports.wordPressSiteMap = {
    'pretty.presslogic.com': 'GS_HK',
    'girlstyle.com': 'GS_TW',
    'girlstyle.com/sg': 'GS_SG',
    'girlstyle.com/in': 'GS_IN',
    'girlstyle.com/kr': 'GS_KR',
    'girlstyle.com/my': 'GS_MY',
    'holidaysmart.io': 'HS_HK',
    'holidaysmart.io/tw': 'HS_TW',
    'holidaysmart.io/sg': 'HS_SG',
    'urbanlifehk.com': 'UL_HK',
    'poplady-mag.com': 'POP_HK',
    'topbeautyhk.com': 'TOP_HK',
    'mensdoor.presslogic.com': 'MD_HK',
    'thekdaily.com': 'KD_HK',
    'businessfocus.io': 'BF_HK',
    'mamidaily.com': 'MD_HK',
    'thepetcity.co': 'PET_HK'
};
exports.subPathSiteMap = {
    'girlstyle.com/sg': 'GS_SG',
    'girlstyle.com/my': 'GS_MY',
    'girlstyle.com/tw': 'GS_TW',
    'holidaysmart.io/hk': 'HS_HK',
    'holidaysmart.io/tw': 'HS_TW'
};
exports.siteGroups = {
    girlstyle: ['GS_HK', 'GS_TW', 'GS_SG', 'GS_IN', 'GS_KR', 'GS_MY'],
    holidaysmart: ['HS_HK', 'HS_TW', 'HS_SG'],
    urbanlife: ['UL_HK'],
    poplady: ['POP_HK'],
    topbeauty: ['TOP_HK'],
    businessfocus: ['BF_HK'],
    mamiDaily: ['MD_HK'],
    thekdaily: ['KD_HK'],
    thepetcity: ['PET_HK']
};
exports.WORDPRESS_CONFIG = {
    WP_ARTICLE_SEO_URL: exports.WP_ARTICLE_SEO_URL,
    supportedSites: exports.wordPressSiteMap,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 2000
};
//# sourceMappingURL=wordpress.js.map