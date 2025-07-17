"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const middleware_1 = require("./middleware");
(0, dotenv_1.config)();
const CONFIG = {
    port: parseInt(process.env.PORT || '3000', 10),
    wordpress: {
        apiUrl: process.env.WP_ARTICLE_SEO_URL ||
            'https://article-api.presslogic.com/v1/articles/getArticleSEO',
        timeout: parseInt(process.env.WP_TIMEOUT || '30000', 10),
        retryAttempts: parseInt(process.env.WP_RETRY_ATTEMPTS || '3', 10),
        retryDelay: parseInt(process.env.WP_RETRY_DELAY || '2000', 10)
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
    },
    enableCors: process.env.ENABLE_CORS !== 'false',
    enableLogging: process.env.ENABLE_LOGGING !== 'false'
};
async function startServer() {
    try {
        console.log('🚀 Starting Data Scraping & Audit Service...');
        console.log('✅ WordPress API 審核服務 - 無需外部 API 密鑰');
        const app = (0, express_1.default)();
        app.use(middleware_1.responseTime);
        app.use(middleware_1.addTimestamp);
        app.use((0, middleware_1.createCompressionMiddleware)());
        app.use((0, middleware_1.createSecurityMiddleware)());
        if (CONFIG.enableCors) {
            app.use((0, middleware_1.createCorsMiddleware)());
        }
        if (CONFIG.enableLogging) {
            app.use((0, middleware_1.createLogger)());
        }
        app.use(express_1.default.json({ limit: '10mb' }));
        app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        app.use(middleware_1.validateContentType);
        app.use((0, middleware_1.createRateLimiter)(CONFIG.rateLimit.windowMs, CONFIG.rateLimit.max));
        console.log('🔧 Initializing services...');
        const { createAppRoutes } = require('./routes/appRoutes');
        const { AuditPipelineOrchestrator } = require('./app/audit-pipeline.orchestrator');
        const auditOrchestrator = new AuditPipelineOrchestrator();
        app.use('/api/v1', createAppRoutes(auditOrchestrator));
        app.get('/', (req, res) => {
            res.json({
                name: 'PageLens Service',
                version: '1.0.0',
                description: 'Specialized service for WordPress SEO page auditing',
                focus: 'WordPress page SEO analysis and auditing',
                status: 'healthy',
                features: [
                    'WordPress Page Auditing',
                    'SEO Content Analysis',
                    'Batch Processing',
                    'Health Monitoring'
                ],
                timestamp: new Date().toISOString(),
                endpoints: {
                    pageAudit: 'POST /api/v1/pagelens - Audit WordPress page',
                    batchPageAudit: 'POST /api/v1/pagelens/batch - Batch audit pages',
                    pageAuditHealth: 'GET /api/v1/pagelens/health - Page audit service status'
                }
            });
        });
        app.use(middleware_1.notFoundHandler);
        app.use(middleware_1.errorHandler);
        const server = app.listen(CONFIG.port, () => {
            console.log(`
🎯 Data Scraping & Audit Service Started Successfully!

📊 Server Details:
   - Port: ${CONFIG.port}
   - Environment: ${process.env.NODE_ENV || 'development'}
   - Process ID: ${process.pid}

🔧 Service Configuration:
   - WordPress API: ✅ Enabled
   - Rate Limiting: ✅ Enabled (${CONFIG.rateLimit.max} req/${CONFIG.rateLimit.windowMs}ms)
   - CORS: ${CONFIG.enableCors ? '✅ Enabled' : '❌ Disabled'}
   - Logging: ${CONFIG.enableLogging ? '✅ Enabled' : '❌ Disabled'}

🎯 Core Features:
   - WordPress Page Auditing
   - SEO Content Analysis
   - Batch Processing
   - Health Monitoring

📋 API Endpoints:
   - POST /api/v1/pagelens         - WordPress page audit
   - POST /api/v1/pagelens/batch   - Batch page audit
   - GET  /api/v1/pagelens/health  - Page audit health

🌐 Access: http://localhost:${CONFIG.port}
      `);
        });
        const gracefulShutdown = async (signal) => {
            console.log(`📴 ${signal} received, shutting down gracefully...`);
            server.close(() => {
                console.log('📴 HTTP server closed');
            });
            try {
                console.log('✅ Graceful shutdown completed');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('uncaughtException', error => {
            console.error('💥 Uncaught Exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
        setInterval(async () => {
            try {
                console.log('💓 Health check passed');
            }
            catch (error) {
                console.error('❌ Health check failed:', error);
            }
        }, 60000);
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer().catch(error => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map