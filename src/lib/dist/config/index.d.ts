import { ServiceConfig } from '../types';
export declare const serviceConfig: ServiceConfig;
export declare function validateConfig(): void;
export declare const logLevel: string;
export declare const allowedOrigins: string[];
export declare const bodyLimit: string;
export declare const requestTimeout: number;
export declare const enableDetailedErrors: boolean;
export declare const databaseConfig: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
};
export declare const cacheConfig: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
};
export declare const monitoringConfig: {
    enabled: boolean;
    endpoint: string | undefined;
    apiKey: string | undefined;
};
export declare function getConfigSummary(): object;
