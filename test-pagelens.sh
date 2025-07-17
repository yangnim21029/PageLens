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

# Read HTML content and escape it properly for JSON
HTML_CONTENT=$(cat "$HTML_FILE" | jq -Rs .)

# Make the POST request
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"html\": $HTML_CONTENT,
    \"url\": \"https://girlstyle.com/test-page\"
  }")

echo "Response:"
echo "$RESPONSE" | jq '.'

echo -e "\n\nTest completed."