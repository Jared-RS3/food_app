/**
 * CACHE SERVICE - In-Memory Caching with TTL
 * ============================================
 *
 * Reduces Supabase calls by caching frequently accessed data.
 * Can be upgraded to Redis for production if needed.
 *
 * Features:
 * - Time-to-Live (TTL) support
 * - Auto-expiration
 * - Cache invalidation
 * - Type-safe keys
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  // Default TTL: 5 minutes
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  /**
   * Store data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Retrieve data from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove specific key from cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Remove all keys matching a pattern
   * Example: invalidatePattern('restaurant:') removes all restaurant cache
   */
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries (run periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const keys = Array.from(this.cache.keys());

    keys.forEach((key) => {
      const entry = this.cache.get(key);
      if (entry && now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache key builders for consistency
export const CacheKeys = {
  // Restaurants
  restaurant: (id: string) => `restaurant:${id}`,
  allRestaurants: () => 'restaurants:all',
  restaurantsByCuisine: (cuisine: string) => `restaurants:cuisine:${cuisine}`,
  favoriteRestaurants: (userId: string) => `restaurants:favorites:${userId}`,
  mustTryRestaurants: (userId: string) => `restaurants:must-try:${userId}`,

  // Collections
  userCollections: (userId: string) => `collections:user:${userId}`,
  collectionRestaurants: (collectionId: string) =>
    `collection:${collectionId}:restaurants`,

  // Food Items
  foodItem: (id: string) => `food:${id}`,
  restaurantFoodItems: (restaurantId: string) =>
    `food:restaurant:${restaurantId}`,

  // Markets
  allMarkets: () => 'markets:all',
  market: (id: string) => `market:${id}`,

  // User Profile
  userProfile: (userId: string) => `profile:${userId}`,
  userAchievements: (userId: string) => `achievements:${userId}`,
} as const;

// Auto-cleanup every 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);

export default cacheService;
