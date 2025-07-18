#!/bin/bash

# 測試 ELLE 網站 API 分析
echo "=== 測試 ELLE 網站 API 分析 ==="

# 檢查 HTML 檔案是否存在
if [ ! -f "./elle-zootopia2.html" ]; then
    echo "錯誤：elle-zootopia2.html 檔案不存在"
    exit 1
fi

echo "1. 測試無焦點關鍵字的情況..."
curl -X POST "http://localhost:3000/analyze" \
  -H "Content-Type: application/json" \
  -d "{
    \"htmlContent\": $(cat './elle-zootopia2.html' | jq -Rs .),
    \"pageDetails\": {
      \"url\": \"https://www.elle.com/tw/entertainment/gossip/g64833506/zootopia-2/\",
      \"title\": \"《動物方城市2》何時上映？11月登上大銀幕，前導預告曝光，關繼威成全新反派\",
      \"language\": \"zh\"
    },
    \"options\": {
      \"contentSelectors\": [\"article\", \"main\", \".content\", \".post-content\", \".entry-content\"],
      \"excludeSelectors\": [\".ad\", \".advertisement\", \".sidebar\", \".navigation\", \".comments\"]
    }
  }" | python3 -c "
import json
import sys
data = json.load(sys.stdin)
print('✓ 成功:', data['success'])
print('✓ SEO 分數:', data['report']['overallScores']['seoScore'])
print('✓ 可讀性分數:', data['report']['overallScores']['readabilityScore'])
print('✓ 總分:', data['report']['overallScores']['overallScore'])
print('✓ 問題數量:', len(data['report']['detailedIssues']))
print('✓ 處理時間:', data['processingTime'], 'ms')
"

echo ""
echo "2. 測試有焦點關鍵字的情況..."
curl -X POST "http://localhost:3000/analyze" \
  -H "Content-Type: application/json" \
  -d "{
    \"htmlContent\": $(cat './elle-zootopia2.html' | jq -Rs .),
    \"pageDetails\": {
      \"url\": \"https://www.elle.com/tw/entertainment/gossip/g64833506/zootopia-2/\",
      \"title\": \"《動物方城市2》何時上映？11月登上大銀幕，前導預告曝光，關繼威成全新反派\",
      \"language\": \"zh\"
    },
    \"focusKeyword\": \"動物方城市\",
    \"options\": {
      \"contentSelectors\": [\"article\", \"main\", \".content\", \".post-content\", \".entry-content\"],
      \"excludeSelectors\": [\".ad\", \".advertisement\", \".sidebar\", \".navigation\", \".comments\"]
    }
  }" | python3 -c "
import json
import sys
data = json.load(sys.stdin)
print('✓ 成功:', data['success'])
print('✓ SEO 分數:', data['report']['overallScores']['seoScore'])
print('✓ 可讀性分數:', data['report']['overallScores']['readabilityScore'])
print('✓ 總分:', data['report']['overallScores']['overallScore'])
print('✓ 問題數量:', len(data['report']['detailedIssues']))
print('✓ 處理時間:', data['processingTime'], 'ms')
print('')
print('前三個問題:')
for i, issue in enumerate(data['report']['detailedIssues'][:3]):
    print(f'  {i+1}. {issue[\"name\"]} - {issue[\"rating\"]}')
"

echo ""
echo "3. 測試無選擇器的情況 (完整頁面分析)..."
curl -X POST "http://localhost:3000/analyze" \
  -H "Content-Type: application/json" \
  -d "{
    \"htmlContent\": $(cat './elle-zootopia2.html' | jq -Rs .),
    \"pageDetails\": {
      \"url\": \"https://www.elle.com/tw/entertainment/gossip/g64833506/zootopia-2/\",
      \"title\": \"《動物方城市2》何時上映？11月登上大銀幕，前導預告曝光，關繼威成全新反派\",
      \"language\": \"zh\"
    },
    \"focusKeyword\": \"動物方城市\"
  }" | python3 -c "
import json
import sys
data = json.load(sys.stdin)
print('✓ 成功:', data['success'])
print('✓ SEO 分數:', data['report']['overallScores']['seoScore'])
print('✓ 可讀性分數:', data['report']['overallScores']['readabilityScore'])
print('✓ 總分:', data['report']['overallScores']['overallScore'])
print('✓ 問題數量:', len(data['report']['detailedIssues']))
print('✓ 處理時間:', data['processingTime'], 'ms')

# 檢查指定的 15 個 assessment IDs
expected_ids = [
    'H1_MISSING', 'MULTIPLE_H1', 'H1_KEYWORD_MISSING', 'IMAGES_MISSING_ALT',
    'KEYWORD_MISSING_FIRST_PARAGRAPH', 'KEYWORD_DENSITY_LOW', 'META_DESCRIPTION_NEEDS_IMPROVEMENT',
    'META_DESCRIPTION_MISSING', 'TITLE_NEEDS_IMPROVEMENT', 'TITLE_MISSING', 'CONTENT_LENGTH_SHORT',
    'FLESCH_READING_EASE', 'PARAGRAPH_LENGTH_LONG', 'SENTENCE_LENGTH_LONG', 'SUBHEADING_DISTRIBUTION_POOR'
]

returned_ids = [issue['id'] for issue in data['report']['detailedIssues']]
print('')
print('=== 檢查指定的 15 個 Assessment IDs ===')
print(f'期望數量: {len(expected_ids)}')
print(f'實際數量: {len(returned_ids)}')
print('返回的 IDs:', returned_ids)
print('')

# 檢查每個指定的 ID
missing_ids = []
for expected_id in expected_ids:
    if expected_id in returned_ids:
        print(f'✓ {expected_id}')
    else:
        print(f'✗ {expected_id} (缺少)')
        missing_ids.append(expected_id)

# 檢查額外的 ID
extra_ids = [id for id in returned_ids if id not in expected_ids]
if extra_ids:
    print('')
    print('額外的 IDs (不應該出現):')
    for extra_id in extra_ids:
        print(f'  - {extra_id}')

print('')
print(f'總結: {len(returned_ids)}/{len(expected_ids)} 個 ID 正確')
if len(returned_ids) == len(expected_ids) and len(missing_ids) == 0 and len(extra_ids) == 0:
    print('✓ 測試通過：所有 15 個 Assessment IDs 都正確返回')
else:
    print('✗ 測試失敗：ID 數量或內容不匹配')
"

echo ""
echo "=== 測試完成 ==="