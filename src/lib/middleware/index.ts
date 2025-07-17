/**
 * 中間件配置
 * 包含安全性、日誌記錄、錯誤處理等中間件
 */

import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

// 錯誤處理中間件
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('[ErrorHandler]', err);

  // 如果響應已經發送，交給默認錯誤處理器
  if (res.headersSent) {
    return next(err);
  }

  // 根據錯誤類型返回相應狀態碼
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}

// 404 處理中間件
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
}

// 請求速率限制中間件
export function createRateLimiter(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // 清理過期的記錄
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

// 請求體大小限制中間件
export function createBodySizeLimit(limit: string = '10mb') {
  return (req: Request, res: Response, next: NextFunction): void => {
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

// 日誌記錄中間件
export function createLogger() {
  return morgan('combined', {
    stream: {
      write: (message: string) => {
        console.log(message.trim());
      }
    }
  });
}

// 安全性中間件配置
export function createSecurityMiddleware() {
  return helmet({
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

// CORS 中間件配置
export function createCorsMiddleware(allowedOrigins: string[] = ['*']) {
  return cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  });
}

// 壓縮中間件
export function createCompressionMiddleware() {
  return compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024
  });
}

// 請求驗證中間件
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
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

// 請求時間戳中間件
export function addTimestamp(req: Request, res: Response, next: NextFunction) {
  (req as any).timestamp = new Date().toISOString();
  next();
}

// 響應時間中間件
export function responseTime(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}