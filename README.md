# 🔍 Audit Service

專門用於 WordPress 頁面 SEO 審核的獨立微服務。

## 🚀 快速開始

### 環境要求

- Node.js >= 18.17.0
- TypeScript >= 5.1.6
- Redis (可選，用於任務隊列)

### 安裝

```bash
# 安裝依賴
npm install

# 複製並配置環境變量
cp .env.example .env
# 編輯 .env 文件，填入你的實際配置

# 建構專案
npm run build

# 啟動服務
npm run start
```

## 📋 API 文檔

### 主要端點

#### 1. 頁面審核

```bash
POST /api/v1/page-audit
```

**請求參數：**
```json
{
  "url": "https://girlstyle.com/article/123456",
  "options": {
    "includeContent": true,
    "includeSeo": true,
    "performAudit": true
  }
}
```

#### 2. 批量審核

```bash
POST /api/v1/page-audit/batch
```

#### 3. AI 聊天助手

```bash
POST /api/v1/chat
```

### 支援的 WordPress 網站

- `girlstyle.com` (GS_TW)
- `pretty.presslogic.com` (GS_HK)

## 🔧 配置說明

參考 `.env.example` 文件進行配置。

## 🧪 測試

```bash
npm run test
npm run test:coverage
```

## 📄 授權

MIT License