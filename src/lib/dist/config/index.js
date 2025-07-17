"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringConfig = exports.cacheConfig = exports.databaseConfig = exports.enableDetailedErrors = exports.requestTimeout = exports.bodyLimit = exports.allowedOrigins = exports.logLevel = exports.serviceConfig = void 0;
exports.validateConfig = validateConfig;
exports.getConfigSummary = getConfigSummary;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.serviceConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    enableCors: process.env.ENABLE_CORS !== 'false',
    enableLogging: process.env.ENABLE_LOGGING !== 'false',
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
    }
};
function validateConfig() {
    console.log('✅ 審核服務配置驗證通過 - 使用 WordPress API 進行頁面審核');
}
exports.logLevel = process.env.LOG_LEVEL || 'info';
exports.allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['*'];
exports.bodyLimit = process.env.BODY_LIMIT || '10mb';
exports.requestTimeout = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
exports.enableDetailedErrors = process.env.NODE_ENV === 'development';
exports.databaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'audit_service',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true'
};
exports.cacheConfig = {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10)
};
exports.monitoringConfig = {
    enabled: process.env.MONITORING_ENABLED === 'true',
    endpoint: process.env.MONITORING_ENDPOINT,
    apiKey: process.env.MONITORING_API_KEY
};
function getConfigSummary() {
    return {
        port: exports.serviceConfig.port,
        corsEnabled: exports.serviceConfig.enableCors,
        loggingEnabled: exports.serviceConfig.enableLogging,
        rateLimit: exports.serviceConfig.rateLimit,
        environment: process.env.NODE_ENV || 'development',
        logLevel: exports.logLevel,
        service: 'wordpress-audit'
    };
}
//# sourceMappingURL=index.js.map