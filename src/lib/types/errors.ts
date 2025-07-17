/**
 * 統一的錯誤類型定義
 */

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  WORDPRESS_ERROR = 'WORDPRESS_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface ServiceError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: Record<string, any>;
  timestamp: string;
  service: string;
}

export class AuditServiceError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string | number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;
  public readonly service: string;

  constructor(
    type: ErrorType,
    message: string,
    code?: string | number,
    details?: Record<string, any>,
    service: string = 'audit-service'
  ) {
    super(message);
    this.name = 'AuditServiceError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.service = service;
  }

  toJSON(): ServiceError {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      service: this.service
    };
  }
}

// 預定義的錯誤創建函數
export const createValidationError = (
  message: string,
  details?: Record<string, any>
) => new AuditServiceError(ErrorType.VALIDATION_ERROR, message, 400, details);

export const createNetworkError = (
  message: string,
  details?: Record<string, any>
) => new AuditServiceError(ErrorType.NETWORK_ERROR, message, 500, details);

export const createWordPressError = (
  message: string,
  code?: number,
  details?: Record<string, any>
) => new AuditServiceError(ErrorType.WORDPRESS_ERROR, message, code, details);

export const createTimeoutError = (
  message: string,
  details?: Record<string, any>
) => new AuditServiceError(ErrorType.TIMEOUT_ERROR, message, 408, details);

export const createRateLimitError = (
  message: string,
  details?: Record<string, any>
) => new AuditServiceError(ErrorType.RATE_LIMIT_ERROR, message, 429, details);

export const createAuthError = (
  message: string,
  details?: Record<string, any>
) =>
  new AuditServiceError(ErrorType.AUTHENTICATION_ERROR, message, 401, details);

export const createInternalError = (
  message: string,
  details?: Record<string, any>
) => new AuditServiceError(ErrorType.INTERNAL_ERROR, message, 500, details);
