// WordPress API 配置
export const WP_ARTICLE_SEO_URL =
  process.env.WP_ARTICLE_SEO_URL ||
  'https://article-api.presslogic.com/v1/articles/getArticleSEO';
// curl -X POST "https://article-api.presslogic.com/v1/articles/getArticleSEO" -H "Content-Type: application/json" -d '{"url": "https://pretty.presslogic.com/2025/07/16/1234567890"}'
export const WP_ARTICLE_URL =
  process.env.WP_ARTICLE_URL ||
  'https://article-api.presslogic.com/v1/articles/getArticle';
// curl -X GET "https://article-api.presslogic.com/v1/articles/{post_id}?pageId={page_id}&site={site_code}"
// api response schema:
/*
ArticleSuccessDto{
  status*	number
  data*	ArticleDto{
  id*	number
  post_date*	string($date-time)
  post_content*	string
  title*	string
  guid*	string
  post_status*	string
  post_date_gmt*	string($date-time)
  image*	string
  post_author*	number
  post_modified*	string($date-time)
  url_name*	string
  terms*	[string]
  tags*	[string]
  categories*	[string]
  remove_ads*	boolean
  remove_sidebar_ads*	boolean
  fbia_status*	boolean
  custom_canonical*	boolean
  custom_meta_title*	string
  custom_meta_description*	string
  custom_og_title*	string
  custom_og_description*	string
  custom_remove_sidebar*	boolean
  custom_remove_author*	boolean
  custom_remove_tag*	boolean
  custom_remove_sharetofb*	boolean
  custom_remove_video*	boolean
  custom_remove_alsolike*	boolean
  custom_remove_hottest*	boolean
  custom_remove_lightbox*	boolean
  custom_layout*	boolean
  custom_remove_cover*	boolean
  custom_remove_title*	boolean
  custom_remove_category*	boolean
  custom_ia_related_article*	boolean
  custom_ads*	boolean
  remove_text_ads*	boolean
  custom_cover_img*	boolean
  custom_alcohol_warning*	boolean
  custom_allow_comments*	boolean
  custom_allow_reactions*	boolean
  custom_app_only_content*	boolean
  hide_bottom_gallery*	boolean
  show_ad_module*	boolean
  url*	string
  description*	string
  author*	AuthorDto{
  description*	string
  user_nicename*	string
  display_name*	string
  email*	string
  id*	number
  avatar_id*	string
  image*	string
  }
  }
  }*/
// swagger_url: https://article-api.presslogic.com/apidocs/

// 完整的 PressLogic 網站映射表
export const wordPressSiteMap = {
  // GirlStyle 系列
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
} as const;

// 支援子路徑的網站映射 (用於處理如 girlstyle.com/sg 這樣的 URL)
export const subPathSiteMap = {
  'girlstyle.com/sg': 'GS_SG',
  'girlstyle.com/my': 'GS_MY',
  'girlstyle.com/tw': 'GS_TW',
  'holidaysmart.io/hk': 'HS_HK',
  'holidaysmart.io/tw': 'HS_TW'
} as const;

// 根據網站代碼的分組
export const siteGroups = {
  girlstyle: ['GS_HK', 'GS_TW', 'GS_SG', 'GS_IN', 'GS_KR', 'GS_MY'],
  holidaysmart: ['HS_HK', 'HS_TW', 'HS_SG'],
  urbanlife: ['UL_HK'],
  poplady: ['POP_HK'],
  topbeauty: ['TOP_HK'],
  businessfocus: ['BF_HK'],
  mamiDaily: ['MD_HK'],
  thekdaily: ['KD_HK'],
  thepetcity: ['PET_HK']
} as const;

export const WORDPRESS_CONFIG = {
  WP_ARTICLE_SEO_URL,
  supportedSites: wordPressSiteMap,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 2000
};
