"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.createRateLimiter = createRateLimiter;
exports.createBodySizeLimit = createBodySizeLimit;
exports.createLogger = createLogger;
exports.createSecurityMiddleware = createSecurityMiddleware;
exports.createCorsMiddleware = createCorsMiddleware;
exports.createCompressionMiddleware = createCompressionMiddleware;
exports.validateContentType = validateContentType;
exports.addTimestamp = addTimestamp;
exports.responseTime = responseTime;
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
function errorHandler(err, req, res, next) {
    console.error('[ErrorHandler]', err);
    if (res.headersSent) {
        return next(err);
    }
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    }
    else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    }
    else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Not Found';
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
}
function createRateLimiter(windowMs = 15 * 60 * 1000, max = 100) {
    const requests = new Map();
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        for (const [key, value] of requests.entries()) {
            if (now > value.resetTime) {
                requests.delete(key);
            }
        }
        const clientData = requests.get(clientId);
        if (!clientData) {
            requests.set(clientId, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        if (now > clientData.resetTime) {
            clientData.count = 1;
            clientData.resetTime = now + windowMs;
            return next();
        }
        if (clientData.count >= max) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                timestamp: new Date().toISOString()
            });
        }
        clientData.count++;
        next();
    };
}
function createBodySizeLimit(limit = '10mb') {
    return (req, res, next) => {
        const contentLength = req.headers['content-length'];
        if (contentLength) {
            const sizeInMB = parseInt(contentLength) / (1024 * 1024);
            const limitInMB = parseInt(limit.replace('mb', ''));
            if (sizeInMB > limitInMB) {
                res.status(413).json({
                    success: false,
                    error: `Request body too large. Maximum size is ${limit}`,
                    timestamp: new Date().toISOString()
                });
                return;
            }
        }
        next();
    };
}
function createLogger() {
    return (0, morgan_1.default)('combined', {
        stream: {
            write: (message) => {
                console.log(message.trim());
            }
        }
    });
}
function createSecurityMiddleware() {
    return (0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false
    });
}
function createCorsMiddleware(allowedOrigins = ['*']) {
    return (0, cors_1.default)({
        origin: allowedOrigins.includes('*') ? true : allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true
    });
}
function createCompressionMiddleware() {
    return (0, compression_1.default)({
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression_1.default.filter(req, res);
        },
        threshold: 1024
    });
}
function validateContentType(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.is('application/json')) {
            res.status(400).json({
                success: false,
                error: 'Content-Type must be application/json',
                timestamp: new Date().toISOString()
            });
            return;
        }
    }
    next();
}
function addTimestamp(req, res, next) {
    req.timestamp = new Date().toISOString();
    next();
}
function responseTime(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
}
//# sourceMappingURL=index.js.map