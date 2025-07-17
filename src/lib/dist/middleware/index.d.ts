import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
export declare function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
export declare function createRateLimiter(windowMs?: number, max?: number): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function createBodySizeLimit(limit?: string): (req: Request, res: Response, next: NextFunction) => void;
export declare function createLogger(): (req: import("http").IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage>, callback: (err?: Error) => void) => void;
export declare function createSecurityMiddleware(): (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare function createCorsMiddleware(allowedOrigins?: string[]): (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
export declare function createCompressionMiddleware(): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function validateContentType(req: Request, res: Response, next: NextFunction): void;
export declare function addTimestamp(req: Request, res: Response, next: NextFunction): void;
export declare function responseTime(req: Request, res: Response, next: NextFunction): void;
