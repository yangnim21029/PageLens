/**
 * Vercel Serverless Function Entry Point for PageLens
 */

import { config } from 'dotenv';
import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';

// 動態導入中間件 - Debug paths
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

let middlewareModule;
try {
  // Try multiple possible paths
  const possiblePaths = [
    path.join(__dirname, '..', 'dist', 'middleware'),
    path.join(__dirname, 'dist', 'middleware'),
    path.join(process.cwd(), 'dist', 'middleware'),
    './dist/middleware',
    '../dist/middleware'
  ];
  
  for (const tryPath of possiblePaths) {
    try {
      console.log('Trying path:', tryPath);
      middlewareModule = require(tryPath);
      console.log('Successfully loaded middleware from:', tryPath);
      break;
    } catch (err) {
      console.log('Failed to load from:', tryPath, err.message);
    }
  }
  
  if (!middlewareModule) {
    throw new Error('Could not find middleware module');
  }
} catch (err) {
  console.error('Error loading middleware:', err);
  throw err;
}

const {
  addTimestamp,
  createCompressionMiddleware,
  createCorsMiddleware,
  createLogger,
  createSecurityMiddleware,
  errorHandler,
  notFoundHandler,
  responseTime,
  validateContentType
} = middlewareModule;

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
let appRoutesModule, orchestratorModule;

try {
  const routesPaths = [
    path.join(__dirname, '..', 'dist', 'routes', 'appRoutes'),
    path.join(__dirname, 'dist', 'routes', 'appRoutes'),
    path.join(process.cwd(), 'dist', 'routes', 'appRoutes')
  ];
  
  for (const tryPath of routesPaths) {
    try {
      console.log('Trying routes path:', tryPath);
      appRoutesModule = require(tryPath);
      console.log('Successfully loaded routes from:', tryPath);
      break;
    } catch (err) {
      console.log('Failed to load routes from:', tryPath, err.message);
    }
  }
  
  const orchestratorPaths = [
    path.join(__dirname, '..', 'dist', 'app', 'audit-pipeline.orchestrator'),
    path.join(__dirname, 'dist', 'app', 'audit-pipeline.orchestrator'),
    path.join(process.cwd(), 'dist', 'app', 'audit-pipeline.orchestrator')
  ];
  
  for (const tryPath of orchestratorPaths) {
    try {
      console.log('Trying orchestrator path:', tryPath);
      orchestratorModule = require(tryPath);
      console.log('Successfully loaded orchestrator from:', tryPath);
      break;
    } catch (err) {
      console.log('Failed to load orchestrator from:', tryPath, err.message);
    }
  }
  
  if (!appRoutesModule) throw new Error('Could not find appRoutes module');
  if (!orchestratorModule) throw new Error('Could not find orchestrator module');
  
} catch (err) {
  console.error('Error loading modules:', err);
  throw err;
}

const { createAppRoutes } = appRoutesModule;
const { AuditPipelineOrchestrator } = orchestratorModule;

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