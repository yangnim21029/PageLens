/**
 * Vercel Serverless Function Entry Point for PageLens
 */

import { config } from 'dotenv';
import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  addTimestamp,
  createCompressionMiddleware,
  createCorsMiddleware,
  createLogger,
  createSecurityMiddleware,
  errorHandler,
  notFoundHandler,
  responseTime,
  validateContentType
} from '../dist/middleware';

// 載入環境變量
config();

// 創建 Express 應用
const app = express();

// 基礎中間件
app.use(responseTime);
app.use(addTimestamp);
app.use(createCompressionMiddleware());
app.use(createSecurityMiddleware());
app.use(createCorsMiddleware());

// 請求解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 請求驗證
app.use(validateContentType);

// 引入路由和核心服務
const { createAppRoutes } = require('../dist/routes/appRoutes');
const { AuditPipelineOrchestrator } = require('../dist/app/audit-pipeline.orchestrator');

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
    platform: 'Vercel Serverless',
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

// 錯誤處理中間件
app.use(notFoundHandler);
app.use(errorHandler);

// 導出 Vercel 處理函數
export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};