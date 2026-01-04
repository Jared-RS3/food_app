/**
 * Cron Job: Refresh Cache
 * Runs periodically to refresh frequently accessed cached data
 */

import { cacheRestaurantsList } from '@/lib/redis/cache-helpers';
import { captureException, captureMessage } from '@/lib/sentry/config';
import {
  getFeaturedRestaurants,
  getRestaurants,
} from '@/services/restaurantService';

export async function refreshCache() {
  try {
    const tasksCompleted: string[] = [];

    // 1. Cache featured restaurants
    const featured = await getFeaturedRestaurants(20);
    if (featured.length > 0) {
      await cacheRestaurantsList(
        { isFeatured: true, page: 1 },
        {
          restaurants: featured,
          total: featured.length,
        }
      );
      tasksCompleted.push('Featured restaurants cached');
    }

    // 2. Cache popular searches
    const popularCuisines = [
      'Italian',
      'Japanese',
      'Indian',
      'Chinese',
      'Mexican',
    ];
    for (const cuisine of popularCuisines) {
      const results = await getRestaurants({
        cuisineType: cuisine,
        page: 1,
        limit: 20,
      });
      await cacheRestaurantsList({ cuisineType: cuisine, page: 1 }, results);
      tasksCompleted.push(`${cuisine} cuisine cached`);
    }

    // 3. Cache top-rated restaurants
    const topRated = await getRestaurants({
      minRating: 4.5,
      page: 1,
      limit: 20,
    });
    await cacheRestaurantsList({ minRating: 4.5, page: 1 }, topRated);
    tasksCompleted.push('Top-rated restaurants cached');

    captureMessage(
      `Cache refreshed: ${tasksCompleted.length} tasks completed`,
      'info'
    );
    console.log(`✅ Cache refreshed: ${tasksCompleted.join(', ')}`);

    return { success: true, tasksCompleted };
  } catch (error) {
    console.error('Refresh cache error:', error);
    captureException(error);
    return { success: false, error };
  }
}

// For Vercel Cron Job API route
export async function GET() {
  const result = await refreshCache();
  return Response.json(result);
}
