#!/bin/bash

# Test script for PageLens API
# Usage: ./test-pagelens.sh

HTML_FILE="girlstyle_page.html"
API_URL="http://localhost:3000/api/v1/pagelens"

# Check if HTML file exists
if [ ! -f "$HTML_FILE" ]; then
    echo "Error: $HTML_FILE not found!"
    exit 1
fi

echo "Testing PageLens API with $HTML_FILE..."
echo "Running all assessments..."

# Read HTML content and escape it properly for JSON
HTML_CONTENT=$(cat "$HTML_FILE" | jq -Rs .)

# Make the POST request (runs all assessments by default)
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"html\": $HTML_CONTENT,
    \"url\": \"https://girlstyle.com/test-page\"
  }")

echo "Response:"
echo "$RESPONSE" | jq '.'

echo -e "\n\n=== Testing specific assessments ==="
echo "Running selected assessments: Single H1, Alt Attribute, Flesch Reading Ease, Paragraph Length, Sentence Length, Keyword Density..."

# Test with specific assessments (using only implemented ones)
SPECIFIC_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"html\": $HTML_CONTENT,
    \"url\": \"https://girlstyle.com/test-page\",
    \"options\": {
      \"assessmentConfig\": {
        \"enabledAssessments\": [\"h1-missing\", \"images-missing-alt\", \"flesch-reading-ease\", \"paragraph-length-long\", \"sentence-length-long\", \"keyword-density-low\"]
      }
    }
  }")

echo "Specific assessments response:"
echo "$SPECIFIC_RESPONSE" | jq '.'

echo -e "\n\nAll tests completed."