WordPress 代理端點

1. 內容代理 - /api/proxy/content

curl -X POST "https://page-lens-zeta.vercel.app/api/proxy/content" \
 -H "Content-Type: application/json" \
 -d '{
"resourceId": "123456",
"siteCode": "HS_HK"
}'

- 用途：獲取 WordPress 文章內容
- 參數：
  - resourceId - 文章 ID
  - siteCode - 網站代碼（如 GS_HK、HS_HK 等）
- 內部調用：https://article-api.presslogic.com/v1/articles/{resourceId}
  ?site={siteCode}

2. 元數據代理 - /api/proxy/metadata

curl -X POST "https://page-lens-zeta.vercel.app/api/proxy/metadata" \
 -H "Content-Type: application/json" \
 -d '{
"resourceUrl": "https://holidaysmart.io/article/456984/九龍"
}'

- 用途：獲取文章的 SEO 元數據
- 參數：
  - resourceUrl - 文章完整 URL
- 內部調用：https://article-api.presslogic.com/v1/articles/getArticleSEO

代理端點的優勢

1. 隱藏內部 API：對外不暴露 PressLogic 內部的 WordPress API 地址
2. 統一接口：提供簡化的參數格式
3. 錯誤處理：統一的錯誤響應格式

這些代理端點主要用於當你需要單獨獲取文章內容或 SEO 數據，而不需要完整的
SEO 分析報告時使用
