# PageLens 自動測試說明

## 📋 測試文件結構

```
test/
├── README.md                   # 本說明文檔
├── api-endpoints.test.js       # API 端點功能測試
├── assessment-ids.test.js      # 評估ID一致性測試
└── AUTOMATION_GUIDE.md        # 自動測試實施指南
```

## 🎯 測試目標

### 1. API 端點測試 (`api-endpoints.test.js`)
- ✅ **確保 WordPress URL 分析返回 15 項評估**
- ✅ **確保 HTML 內容分析返回 15 項評估**
- ⚠️ **測試個別評估篩選功能**（準備中，等待實現）

### 2. 評估 ID 一致性測試 (`assessment-ids.test.js`)
- 🔍 **驗證程式碼中的評估 ID 與文檔一致**
- 🔍 **檢查 API 返回的 ID 與定義的 enum 一致**
- 🔍 **確保 CLAUDE.md 中的 ID 與實際程式碼同步**

## 🚀 快速開始

### 運行測試的 4 種方式

#### 方式 1: NPM Scripts (推薦)
```bash
# 運行 API 端點測試
npm run test:api

# 運行 ID 一致性測試  
npm run test:ids

# 運行所有測試
npm run test:all

# 運行主要測試（預設）
npm test
```

#### 方式 2: 直接執行
```bash
# API 測試
node test/api-endpoints.test.js

# ID 測試
node test/assessment-ids.test.js
```

#### 方式 3: Makefile (方便)
```bash
# 查看所有命令
make help

# 運行測試
make test-api
make test-ids
make test

# 開發流程（啟動服務器 + 測試）
make dev

# Commit 前測試
make pre-commit
```

#### 方式 4: GitHub Actions (自動)
- 每次 `git push` 到 main 分支時自動運行
- 每次 Pull Request 時自動運行
- 查看結果：GitHub → Actions 頁籤

## 🔧 環境配置

### 環境變數
創建 `.env` 文件（可參考 `.env.example`）：
```bash
# 測試目標 API（本地開發）
API_URL=http://localhost:3000

# 測試目標 API（生產環境）
# API_URL=https://page-lens-88bo90kmi-yangnim21029s-projects.vercel.app

# 測試配置
TEST_TIMEOUT=30000
TEST_RETRY_COUNT=3
```

### 運行前提條件
```bash
# 1. 安裝依賴
npm install

# 2. 啟動 API 服務器（另一個終端）
npm start
# 或
node api/index.js

# 3. 運行測試（新終端）
npm test
```

## 📊 測試結果解讀

### ✅ 成功範例
```
🧪 Testing PageLens API Endpoints...
📝 Test 1: WordPress URL Analysis (Complete)
✅ Returned 15 assessments (expected: 15)
✅ Correct number of assessments returned

📊 Test Summary:
✅ API endpoint testing completed
```

### ❌ 失敗範例
```
❌ Expected 15 assessments, got 12
❌ API returned ID "H1_MISSING" but not found in enum
```

### ⚠️ 警告範例
```
⚠️ Individual filtering not implemented - returns all 15 assessments
ℹ️ This is acceptable as full assessment is still provided
```

## 🔄 測試流程說明

### 自動測試如何運作：

1. **GitHub Actions** (`.github/workflows/test.yml`)
   ```
   Code Push → GitHub → Actions Runner → 
   Install Dependencies → Start Server → Run Tests → 
   Report Results
   ```

2. **Pre-commit Hook** (`pre-commit-test.sh`)
   ```
   git commit → Pre-commit Script → 
   Start Test Server → Run Tests → 
   Allow/Block Commit
   ```

3. **本地開發測試**
   ```
   Developer → make test → 
   Check Server → Run Tests → 
   Show Results
   ```

## 🎯 團隊使用建議

### 日常開發
```bash
# 開發時快速測試
make test-api

# 或使用 npm
npm run test:api
```

### Commit 前
```bash
# 確保程式碼品質
make pre-commit

# 或手動運行所有測試
npm run test:all
```

### CI/CD 流程
1. **開發** → 寫程式碼
2. **測試** → `make test` 
3. **Commit** → `git commit` (自動運行 pre-commit tests)
4. **Push** → `git push` (觸發 GitHub Actions)
5. **部署** → `make deploy` (Vercel)

## 🚨 常見問題

### Q: 測試失敗時怎麼辦？
A: 
1. 檢查 API 服務器是否運行 (`npm start`)
2. 檢查網路連接
3. 查看詳細錯誤訊息
4. 檢查環境變數設定

### Q: 個別評估測試為什麼會失敗？
A: 個別評估篩選功能尚未實現，這是預期的。測試已準備好，等待功能實現。

### Q: ID 一致性測試失敗？
A: 可能是文檔與程式碼不同步，需要檢查：
- `lib/app/running-the-tests/types/assessment.types.ts`
- `api/index.ts` 的文檔
- `CLAUDE.md` 的評估 ID 列表

### Q: 如何添加新測試？
A: 
1. 在 `test/` 目錄創建 `*.test.js` 文件
2. 在 `package.json` 添加對應的 script
3. 更新本 README 文檔

## 📈 測試覆蓋範圍

目前測試覆蓋：
- ✅ API 端點功能性
- ✅ 評估數量一致性  
- ✅ WordPress URL 分析
- ✅ HTML 內容分析
- ⚠️ 評估 ID 一致性（需改進）
- 🔄 個別評估篩選（待實現）

未來可擴展：
- 🎯 評估內容正確性測試
- 🎯 效能測試
- 🎯 錯誤處理測試
- 🎯 負載測試