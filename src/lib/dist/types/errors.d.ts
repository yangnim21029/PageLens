export declare enum ErrorType {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    API_ERROR = "API_ERROR",
    WORDPRESS_ERROR = "WORDPRESS_ERROR",
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
export interface ServiceError {
    type: ErrorType;
    message: string;
    code?: string | number;
    details?: Record<string, any>;
    timestamp: string;
    service: string;
}
export declare class AuditServiceError extends Error {
    readonly type: ErrorType;
    readonly code?: string | number;
    readonly details?: Record<string, any>;
    readonly timestamp: string;
    readonly service: string;
    constructor(type: ErrorType, message: string, code?: string | number, details?: Record<string, any>, service?: string);
    toJSON(): ServiceError;
}
export declare const createValidationError: (message: string, details?: Record<string, any>) => AuditServiceError;
export declare const createNetworkError: (message: string, details?: Record<string, any>) => AuditServiceError;
export declare const createWordPressError: (message: string, code?: number, details?: Record<string, any>) => AuditServiceError;
export declare const createTimeoutError: (message: string, details?: Record<string, any>) => AuditServiceError;
export declare const createRateLimitError: (message: string, details?: Record<string, any>) => AuditServiceError;
export declare const createAuthError: (message: string, details?: Record<string, any>) => AuditServiceError;
export declare const createInternalError: (message: string, details?: Record<string, any>) => AuditServiceError;
