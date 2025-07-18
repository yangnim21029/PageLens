# PageLens Makefile

.PHONY: test test-api test-ids start stop install dev deploy help

# Install dependencies
install:
	npm install

# Start the API server
start:
	node api/index.js

# Run API endpoint tests
test-api:
	@echo "🧪 Running API endpoint tests..."
	@node test/api-endpoints.test.js

# Run ID consistency tests
test-ids:
	@echo "🔍 Running ID consistency tests..."
	@node test/assessment-ids.test.js

# Run all tests
test: test-api test-ids

# Development workflow - start server and run tests
dev:
	@echo "🚀 Starting development workflow..."
	@node api/index.js &
	@sleep 5
	@make test-api
	@pkill -f "node api/index.js" || true

# Pre-commit tests
pre-commit:
	@echo "🧪 Running pre-commit tests..."
	@./pre-commit-test.sh

# Deploy to Vercel
deploy:
	@echo "🚀 Deploying to Vercel..."
	@git add . && git commit -m "Auto-commit before deploy" || true
	@git push
	@vercel --prod

# Clean up any running processes
stop:
	@pkill -f "node api/index.js" || true
	@echo "🛑 Stopped all PageLens processes"

# Show help
help:
	@echo "PageLens Commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make start       - Start API server"
	@echo "  make test        - Run all tests"
	@echo "  make test-api    - Run API endpoint tests"
	@echo "  make test-ids    - Run ID consistency tests"
	@echo "  make dev         - Start server and run tests"
	@echo "  make pre-commit  - Run pre-commit tests"
	@echo "  make deploy      - Deploy to Vercel"
	@echo "  make stop        - Stop all processes"
	@echo "  make help        - Show this help"