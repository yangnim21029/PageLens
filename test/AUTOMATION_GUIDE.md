# PageLens 自動測試實施指南

## 🏗️ 自動測試架構圖

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   開發者寫程式碼    │ → │   本地測試        │ → │   Commit        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel 部署    │ ← │   GitHub Push   │ ← │ Pre-commit Tests│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▼
                       ┌─────────────────┐
                       │ GitHub Actions  │
                       │   自動測試       │
                       └─────────────────┘
```

## 🔧 實施步驟詳解

### 步驟 1: 設置本地測試環境

```bash
# 1. 確保項目依賴已安裝
npm install

# 2. 複製環境變數模板
cp .env.example .env

# 3. 編輯環境變數（可選）
# vim .env
```

### 步驟 2: 測試運行環境

```bash
# 啟動 API 服務器（終端 1）
npm start

# 運行測試（終端 2）
npm test

# 預期輸出：
# ✅ Returned 15 assessments (expected: 15)
# ✅ API endpoint testing completed
```

### 步驟 3: 設置 Git Hooks（可選）

```bash
# 設置 pre-commit hook
cp pre-commit-test.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 現在每次 commit 都會自動運行測試
```

### 步驟 4: 驗證 GitHub Actions

```bash
# Push 到 GitHub 觸發自動測試
git add .
git commit -m "Setup automated testing"
git push

# 查看 Actions 結果：
# GitHub 倉庫 → Actions 標籤 → 最新的 workflow run
```

## 🎮 使用場景指南

### 場景 1: 日常開發

```bash
# 開發者 A 修改了 SEO 評估邏輯
vim lib/app/running-the-tests/assessments/seo-assessor.service.ts

# 快速測試修改是否正確
make test-api
# 或
npm run test:api

# 看到結果：
# ✅ Returned 15 assessments (expected: 15)
# ✅ SEO: 11, Readability: 4
```

### 場景 2: 新增評估項目

```bash
# 開發者 B 新增了一個評估類型
vim lib/app/running-the-tests/types/assessment.types.ts

# 確保 ID 一致性
npm run test:ids

# 確保 API 仍返回正確數量
npm run test:api

# 預期：可能需要更新測試數量從 15 → 16
```

### 場景 3: 準備發布

```bash
# 運行完整測試套件
make pre-commit
# 或
npm run test:all

# 如果通過，安全 commit
git commit -m "Ready for release"

# GitHub Actions 會自動運行並驗證
```

### 場景 4: 緊急修復

```bash
# 快速驗證修復不會破壞核心功能
npm run test:api

# 如果緊急，可以跳過完整測試
git commit -m "hotfix: urgent bug fix"

# 但仍會觸發 GitHub Actions 驗證
```

## 🎯 不同團隊角色的使用方式

### 👨‍💻 前端開發者
```bash
# 確保 API 契約沒有改變
npm run test:api

# 重點關注：
# - 評估數量是否正確（15 項）
# - API 響應格式是否一致
# - 錯誤處理是否正常
```

### 🔧 後端開發者
```bash
# 確保邏輯修改不破壞 API
npm run test:all

# 重點關注：
# - 所有評估邏輯正確運行
# - ID 命名一致性
# - 新增功能向下兼容
```

### 📝 內容/文檔維護者
```bash
# 確保文檔與程式碼同步
npm run test:ids

# 重點關注：
# - CLAUDE.md 評估 ID 正確
# - API 文檔描述準確
# - 範例程式碼可運行
```

### 🚀 DevOps/部署負責人
```bash
# 驗證整個 CI/CD 流程
make deploy

# 重點關注：
# - GitHub Actions 運行成功
# - Vercel 部署正常
# - 生產環境測試通過
```

## 📊 測試指標與監控

### 關鍵指標
- **API 響應時間** < 2 秒
- **評估數量準確性** = 100%（15 項）
- **測試通過率** > 95%
- **ID 一致性** = 100%

### 監控方式
```bash
# 本地監控
npm run test:api 2>&1 | grep "✅\|❌" | wc -l

# CI 監控（GitHub Actions 自動）
# 失敗時會發送 email 通知

# 生產監控（可擴展）
# 未來可添加 health check endpoint
```

## 🔄 測試維護指南

### 定期維護任務

#### 每週
- [ ] 運行完整測試套件 `npm run test:all`
- [ ] 檢查 GitHub Actions 歷史記錄
- [ ] 更新測試用例（如有 API 改動）

#### 每月
- [ ] 檢查測試覆蓋率
- [ ] 更新依賴版本
- [ ] 檢討測試失敗模式

#### 每季度
- [ ] 評估測試架構
- [ ] 添加新測試場景
- [ ] 優化測試效能

### 新增測試步驟

1. **識別需求**
   ```
   問題：新功能沒有測試覆蓋
   目標：添加相應測試
   ```

2. **創建測試文件**
   ```bash
   # 創建新測試
   touch test/new-feature.test.js
   
   # 編輯測試邏輯
   vim test/new-feature.test.js
   ```

3. **更新配置**
   ```bash
   # 更新 package.json
   vim package.json  # 添加 test:new-feature script
   
   # 更新 Makefile
   vim Makefile     # 添加對應命令
   ```

4. **測試驗證**
   ```bash
   # 運行新測試
   npm run test:new-feature
   
   # 整合到完整測試
   npm run test:all
   ```

## 🚨 故障排除

### 常見問題與解決方案

#### 問題 1: 測試超時
```bash
# 現象
Error: Request timeout after 30000ms

# 解決
1. 檢查 API 服務器狀態：curl http://localhost:3000
2. 增加超時設定：export TEST_TIMEOUT=60000
3. 檢查網路連接
```

#### 問題 2: 評估數量不正確
```bash
# 現象
❌ Expected 15 assessments, got 12

# 解決
1. 檢查 API 邏輯是否有 bug
2. 查看 assessment.types.ts 是否有新增/移除
3. 確認測試目標環境正確
```

#### 問題 3: GitHub Actions 失敗
```bash
# 現象
Actions 顯示紅色 ❌

# 解決
1. 查看 Actions 詳細日誌
2. 本地重現問題：npm run test:all
3. 檢查 .github/workflows/test.yml 配置
```

#### 問題 4: ID 一致性測試失敗
```bash
# 現象
❌ API returned ID "H1_MISSING" but not found in enum

# 解決
1. 檢查 regex 模式是否正確
2. 確認 enum 定義格式
3. 暫時標記為非阻塞性錯誤
```

## 📈 效能優化建議

### 測試執行優化
```bash
# 並行運行測試（未來可實現）
npm run test:api & npm run test:ids & wait

# 使用測試緩存
export NODE_ENV=test

# 減少測試數據量
# 使用更簡單的 HTML 內容進行測試
```

### CI/CD 優化
```yaml
# GitHub Actions 優化建議
- 使用 cache 減少安裝時間
- 並行運行不同測試
- 只在特定條件下運行耗時測試
```

這個指南將幫助團隊成員：
- 🎯 **理解測試架構**
- 🚀 **快速上手使用** 
- 🔧 **解決常見問題**
- 📈 **持續改進測試**