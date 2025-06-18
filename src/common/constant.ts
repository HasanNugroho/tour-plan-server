// src/common/constants.ts

// Service Injection Tokens (Symbols)
export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
export const MINIO_STORAGE = Symbol('MINIO_STORAGE');
export const USER_SERVICE = Symbol('USER_SERVICE');
export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
export const ROLE_SERVICE = Symbol('ROLE_SERVICE');
export const TENANT_SERVICE = Symbol('TENANT_SERVICE');
export const PARTNER_SERVICE = Symbol('PARTNER_SERVICE');

// Repository Injection Tokens (Symbols)
export const FILE_REPOSITORY = Symbol('FILE_REPOSITORY');
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');
export const TENANT_REPOSITORY = Symbol('TENANT_REPOSITORY');
export const PARTNER_REPOSITORY = Symbol('PARTNER_REPOSITORY');

// Metadata Key for Public Routes
export const IS_PUBLIC_KEY = 'isPublic';

// Time Constants
export const ONE_HOUR_S = 60 * 60;
export const ONE_DAY_S = 24 * ONE_HOUR_S;
export const ONE_WEEK_S = 7 * ONE_DAY_S;

export const ONE_HOUR_MS = ONE_HOUR_S * 1000;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;
export const ONE_WEEK_MS = 7 * ONE_DAY_MS;
