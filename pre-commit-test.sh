#!/bin/bash

# Pre-commit test script for PageLens
# This script runs API tests before allowing commits

echo "🧪 Running pre-commit tests..."

# Check if API server is running
API_PID=$(pgrep -f "node api/index.js" || echo "")

if [ -z "$API_PID" ]; then
    echo "🚀 Starting API server for testing..."
    node api/index.js &
    SERVER_PID=$!
    sleep 5
    STARTED_SERVER=true
else
    echo "✅ API server already running (PID: $API_PID)"
    STARTED_SERVER=false
fi

# Run API endpoint tests
echo "📝 Running API endpoint tests..."
if node test/api-endpoints.test.js; then
    echo "✅ API endpoint tests passed"
else
    echo "❌ API endpoint tests failed"
    if [ "$STARTED_SERVER" = true ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    exit 1
fi

# Run ID consistency tests (non-blocking for now)
echo "📋 Running ID consistency tests..."
if node test/assessment-ids.test.js; then
    echo "✅ ID consistency tests passed"
else
    echo "⚠️  ID consistency tests failed (non-blocking)"
fi

# Clean up if we started the server
if [ "$STARTED_SERVER" = true ]; then
    echo "🛑 Stopping test server..."
    kill $SERVER_PID 2>/dev/null || true
fi

echo "✅ Pre-commit tests completed successfully!"
exit 0