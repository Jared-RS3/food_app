/**
 * Redis Cache Helpers
 * Reusable functions for caching operations with proper error handling
 */

import { captureException } from '@/lib/sentry/config';
import { CACHE_KEYS, CACHE_TTL, redis } from './client';

/**
 * Get data from cache
 * Returns null if key doesn't exist or on error
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error(`Cache GET error for key ${key}:`, error);
    captureException(error);
    return null;
  }
}

/**
 * Set data in cache with TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<boolean> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Cache SET error for key ${key}:`, error);
    captureException(error);
    return false;
  }
}

/**
 * Delete a single cache key
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Cache DELETE error for key ${key}:`, error);
    captureException(error);
    return false;
  }
}

/**
 * Delete multiple cache keys matching a pattern
 * Use with caution - can be slow with many keys
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`Cache DELETE pattern error for ${pattern}:`, error);
    captureException(error);
    return 0;
  }
}

/**
 * Invalidate all caches for a specific restaurant
 */
export async function invalidateRestaurantCache(
  restaurantId: string
): Promise<void> {
  try {
    await Promise.all([
      deleteCache(`${CACHE_KEYS.RESTAURANT}${restaurantId}`),
      deleteCache(`${CACHE_KEYS.MENU}${restaurantId}`),
      deleteCachePattern(`${CACHE_KEYS.RESTAURANTS_LIST}*`),
      deleteCachePattern(`${CACHE_KEYS.SEARCH}*`),
    ]);
  } catch (error) {
    console.error(`Error invalidating restaurant cache:`, error);
    captureException(error);
  }
}

/**
 * Cache restaurants list with filters
 */
export async function cacheRestaurantsList(
  filters: {
    city?: string;
    cuisine?: string;
    featured?: boolean;
    page?: number;
  },
  data: any
): Promise<void> {
  const filterKey = Object.entries(filters)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join(':');

  const cacheKey = `${CACHE_KEYS.RESTAURANTS_LIST}${filterKey}`;
  await setCache(cacheKey, data, CACHE_TTL.MEDIUM);
}

/**
 * Get cached restaurants list
 */
export async function getCachedRestaurantsList(filters: {
  city?: string;
  cuisine?: string;
  featured?: boolean;
  page?: number;
}): Promise<any | null> {
  const filterKey = Object.entries(filters)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join(':');

  const cacheKey = `${CACHE_KEYS.RESTAURANTS_LIST}${filterKey}`;
  return getCache(cacheKey);
}

/**
 * Cache restaurant details
 */
export async function cacheRestaurant(
  restaurantId: string,
  data: any
): Promise<void> {
  const cacheKey = `${CACHE_KEYS.RESTAURANT}${restaurantId}`;
  await setCache(cacheKey, data, CACHE_TTL.LONG);
}

/**
 * Get cached restaurant details
 */
export async function getCachedRestaurant(
  restaurantId: string
): Promise<any | null> {
  const cacheKey = `${CACHE_KEYS.RESTAURANT}${restaurantId}`;
  return getCache(cacheKey);
}

/**
 * Cache menu items for a restaurant
 */
export async function cacheMenu(
  restaurantId: string,
  data: any
): Promise<void> {
  const cacheKey = `${CACHE_KEYS.MENU}${restaurantId}`;
  await setCache(cacheKey, data, CACHE_TTL.MEDIUM);
}

/**
 * Get cached menu items
 */
export async function getCachedMenu(restaurantId: string): Promise<any | null> {
  const cacheKey = `${CACHE_KEYS.MENU}${restaurantId}`;
  return getCache(cacheKey);
}

/**
 * Cache search results
 */
export async function cacheSearchResults(
  query: string,
  data: any
): Promise<void> {
  const cacheKey = `${CACHE_KEYS.SEARCH}${query.toLowerCase().trim()}`;
  await setCache(cacheKey, data, CACHE_TTL.SHORT);
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(
  query: string
): Promise<any | null> {
  const cacheKey = `${CACHE_KEYS.SEARCH}${query.toLowerCase().trim()}`;
  return getCache(cacheKey);
}

/**
 * Increment a counter (useful for analytics)
 */
export async function incrementCounter(
  key: string,
  amount: number = 1
): Promise<number> {
  try {
    return await redis.incrby(key, amount);
  } catch (error) {
    console.error(`Counter increment error for ${key}:`, error);
    captureException(error);
    return 0;
  }
}

/**
 * Add item to a sorted set (useful for trending items)
 */
export async function addToSortedSet(
  key: string,
  member: string,
  score: number
): Promise<boolean> {
  try {
    await redis.zadd(key, { score, member });
    return true;
  } catch (error) {
    console.error(`Sorted set add error for ${key}:`, error);
    captureException(error);
    return false;
  }
}

/**
 * Get top items from sorted set
 */
export async function getTopFromSortedSet(
  key: string,
  count: number = 10
): Promise<string[]> {
  try {
    return await redis.zrange(key, 0, count - 1, { rev: true });
  } catch (error) {
    console.error(`Sorted set range error for ${key}:`, error);
    captureException(error);
    return [];
  }
}

/**
 * Cache-aside pattern wrapper
 * Tries to get from cache, falls back to data source, then caches result
 */
export async function cacheAside<T>({
  key,
  ttl = CACHE_TTL.MEDIUM,
  fetchData,
}: {
  key: string;
  ttl?: number;
  fetchData: () => Promise<T>;
}): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch from data source
  const data = await fetchData();

  // Cache the result (fire and forget)
  setCache(key, data, ttl).catch((error) => {
    console.error('Cache set error in cacheAside:', error);
  });

  return data;
}
