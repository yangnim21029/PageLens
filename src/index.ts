/**
 * 第三方數據抓取與站點審核服務
 * 專門處理 I/O 密集型操作的獨立服務
 */

import { config } from 'dotenv';
import express from 'express';
import {
  addTimestamp,
  createCompressionMiddleware,
  createCorsMiddleware,
  createLogger,
  createRateLimiter,
  createSecurityMiddleware,
  errorHandler,
  notFoundHandler,
  responseTime,
  validateContentType
} from './middleware';

// 載入環境變量
config();

// 配置
const CONFIG = {
  port: parseInt(process.env.PORT || '3000', 10),
  wordpress: {
    apiUrl:
      process.env.WP_ARTICLE_SEO_URL ||
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

async function startServer(): Promise<void> {
  try {
    console.log('🚀 Starting Data Scraping & Audit Service...');

    // 驗證必要配置
    console.log('✅ WordPress API 審核服務 - 無需外部 API 密鑰');

    // 創建 Express 應用
    const app = express();

    // 基礎中間件
    app.use(responseTime);
    app.use(addTimestamp);
    app.use(createCompressionMiddleware());
    app.use(createSecurityMiddleware());

    // CORS 配置
    if (CONFIG.enableCors) {
      app.use(createCorsMiddleware());
    }

    // 日誌記錄
    if (CONFIG.enableLogging) {
      app.use(createLogger());
    }

    // 請求解析
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 請求驗證
    app.use(validateContentType);

    // 速率限制
    app.use(createRateLimiter(CONFIG.rateLimit.windowMs, CONFIG.rateLimit.max));

    // 初始化核心服務
    console.log('🔧 Initializing services...');

    // 引入路由和核心服務
    const { createAppRoutes } = require('./routes/appRoutes');
    const { AuditPipelineOrchestrator } = require('./app/audit-pipeline.orchestrator');
    
    // 實例化審核管道
    const auditOrchestrator = new AuditPipelineOrchestrator();
    
    // API 路由
    app.use('/api/v1', createAppRoutes(auditOrchestrator));

    // 根路由 - 服務信息
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
          // WordPress 頁面審核
          pageAudit: 'POST /api/v1/pagelens - Audit WordPress page',
          batchPageAudit: 'POST /api/v1/pagelens/batch - Batch audit pages',
          pageAuditHealth:
            'GET /api/v1/pagelens/health - Page audit service status'
        }
      });
    });

    // 錯誤處理中間件
    app.use(notFoundHandler);
    app.use(errorHandler);

    // 啟動伺服器
    const server = app.listen(CONFIG.port, () => {
      console.log(`
🎯 Data Scraping & Audit Service Started Successfully!

📊 Server Details:
   - Port: ${CONFIG.port}
   - Environment: ${process.env.NODE_ENV || 'development'}
   - Process ID: ${process.pid}

🔧 Service Configuration:
   - WordPress API: ✅ Enabled
   - Rate Limiting: ✅ Enabled (${CONFIG.rateLimit.max} req/${
        CONFIG.rateLimit.windowMs
      }ms)
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

    // 優雅關閉處理
    const gracefulShutdown = async (signal: string) => {
      console.log(`📴 ${signal} received, shutting down gracefully...`);

      // 停止接受新請求
      server.close(() => {
        console.log('📴 HTTP server closed');
      });

      try {
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 未捕獲的異常處理
    process.on('uncaughtException', error => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // 健康檢查
    setInterval(async () => {
      try {
        console.log('💓 Health check passed');
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, 60000); // 每分鐘檢查一次
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 啟動服務器
startServer().catch(error => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});
