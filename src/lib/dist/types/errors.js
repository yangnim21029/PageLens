"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInternalError = exports.createAuthError = exports.createRateLimitError = exports.createTimeoutError = exports.createWordPressError = exports.createNetworkError = exports.createValidationError = exports.AuditServiceError = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorType["API_ERROR"] = "API_ERROR";
    ErrorType["WORDPRESS_ERROR"] = "WORDPRESS_ERROR";
    ErrorType["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ErrorType["RATE_LIMIT_ERROR"] = "RATE_LIMIT_ERROR";
    ErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorType["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class AuditServiceError extends Error {
    constructor(type, message, code, details, service = 'audit-service') {
        super(message);
        this.name = 'AuditServiceError';
        this.type = type;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.service = service;
    }
    toJSON() {
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
exports.AuditServiceError = AuditServiceError;
const createValidationError = (message, details) => new AuditServiceError(ErrorType.VALIDATION_ERROR, message, 400, details);
exports.createValidationError = createValidationError;
const createNetworkError = (message, details) => new AuditServiceError(ErrorType.NETWORK_ERROR, message, 500, details);
exports.createNetworkError = createNetworkError;
const createWordPressError = (message, code, details) => new AuditServiceError(ErrorType.WORDPRESS_ERROR, message, code, details);
exports.createWordPressError = createWordPressError;
const createTimeoutError = (message, details) => new AuditServiceError(ErrorType.TIMEOUT_ERROR, message, 408, details);
exports.createTimeoutError = createTimeoutError;
const createRateLimitError = (message, details) => new AuditServiceError(ErrorType.RATE_LIMIT_ERROR, message, 429, details);
exports.createRateLimitError = createRateLimitError;
const createAuthError = (message, details) => new AuditServiceError(ErrorType.AUTHENTICATION_ERROR, message, 401, details);
exports.createAuthError = createAuthError;
const createInternalError = (message, details) => new AuditServiceError(ErrorType.INTERNAL_ERROR, message, 500, details);
exports.createInternalError = createInternalError;
//# sourceMappingURL=errors.js.map