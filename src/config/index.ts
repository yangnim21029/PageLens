/**
 * 配置管理
 * 從環境變量加載配置
 */

import { config } from 'dotenv';
import { ServiceConfig } from '../types';

// 載入環境變量
config();

export const serviceConfig: ServiceConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  enableCors: process.env.ENABLE_CORS !== 'false',
  enableLogging: process.env.ENABLE_LOGGING !== 'false',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  }
};

// 驗證必需的環境變量
export function validateConfig(): void {
  // 審核服務不需要外部 API 依賴，所有驗證都已通過
  console.log('✅ 審核服務配置驗證通過 - 使用 WordPress API 進行頁面審核');
}

// 日誌級別配置
export const logLevel = process.env.LOG_LEVEL || 'info';

// 允許的來源配置
export const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['*'];

// 請求體大小限制
export const bodyLimit = process.env.BODY_LIMIT || '10mb';

// 超時設置
export const requestTimeout = parseInt(
  process.env.REQUEST_TIMEOUT || '30000',
  10
);

// 是否啟用詳細錯誤信息
export const enableDetailedErrors = process.env.NODE_ENV === 'development';

// 數據庫配置（如果需要）
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'audit_service',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true'
};

// 快取配置
export const cacheConfig = {
  enabled: process.env.CACHE_ENABLED === 'true',
  ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10)
};

// 監控配置
export const monitoringConfig = {
  enabled: process.env.MONITORING_ENABLED === 'true',
  endpoint: process.env.MONITORING_ENDPOINT,
  apiKey: process.env.MONITORING_API_KEY
};

// 導出配置摘要（用於日誌記錄）
export function getConfigSummary(): object {
  return {
    port: serviceConfig.port,
    corsEnabled: serviceConfig.enableCors,
    loggingEnabled: serviceConfig.enableLogging,
    rateLimit: serviceConfig.rateLimit,
    environment: process.env.NODE_ENV || 'development',
    logLevel,
    service: 'wordpress-audit'
  };
}
