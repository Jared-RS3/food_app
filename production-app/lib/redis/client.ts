/**
 * Redis Client - Upstash
 * Serverless-compatible Redis client for caching
 */

import { Redis } from '@upstash/redis';

/**
 * Redis client instance
 * Uses Upstash REST API for serverless compatibility
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cache key prefixes for organization
 */
export const CACHE_KEYS = {
  RESTAURANT: 'restaurant:',
  RESTAURANTS_LIST: 'restaurants:list:',
  MENU: 'menu:',
  SEARCH: 'search:',
  USER_CART: 'cart:user:',
  TRENDING: 'trending:',
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 15, // 15 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 60 * 60 * 24, // 24 hours
} as const;
