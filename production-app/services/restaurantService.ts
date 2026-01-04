/**
 * Restaurant Service
 * Business logic for restaurant operations
 */

import {
  cacheRestaurant,
  cacheRestaurantsList,
  getCachedRestaurant,
  getCachedRestaurantsList,
  invalidateRestaurantCache,
} from '@/lib/redis/cache-helpers';
import { captureException } from '@/lib/sentry/config';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

export interface RestaurantFilters {
  city?: string;
  cuisineType?: string;
  priceRange?: number;
  isVegFriendly?: boolean;
  isFeatured?: boolean;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all restaurants with filters and caching
 */
export async function getRestaurants(
  filters: RestaurantFilters = {}
): Promise<{ restaurants: Restaurant[]; total: number }> {
  try {
    const {
      city,
      cuisineType,
      priceRange,
      minRating,
      isFeatured,
      search,
      page = 1,
      limit = 20,
    } = filters;

    // Try to get from cache
    const cached = await getCachedRestaurantsList(filters);
    if (cached) {
      return cached;
    }

    const supabase = await createClient();
    let query = supabase
      .from('restaurants')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (city) query = query.eq('city', city);
    if (cuisineType) query = query.eq('cuisine_type', cuisineType);
    if (priceRange) query = query.eq('price_range', priceRange);
    if (minRating) query = query.gte('rating', minRating);
    if (isFeatured !== undefined) query = query.eq('is_featured', isFeatured);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,cuisine_type.ilike.%${search}%`
      );
    }

    // Pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    // Ordering
    query = query.order('is_featured', { ascending: false });
    query = query.order('rating', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    const result = {
      restaurants: data || [],
      total: count || 0,
    };

    // Cache the result
    await cacheRestaurantsList(filters, result);

    return result;
  } catch (error) {
    console.error('Get restaurants error:', error);
    captureException(error);
    return { restaurants: [], total: 0 };
  }
}

/**
 * Get restaurant by ID with caching
 */
export async function getRestaurantById(
  id: string
): Promise<Restaurant | null> {
  try {
    // Try cache first
    const cached = await getCachedRestaurant(id);
    if (cached) return cached;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Cache the result
    if (data) {
      await cacheRestaurant(id, data);
    }

    return data;
  } catch (error) {
    console.error('Get restaurant error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Get restaurant by slug
 */
export async function getRestaurantBySlug(
  slug: string
): Promise<Restaurant | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get restaurant by slug error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Create a new restaurant (admin/owner only)
 */
export async function createRestaurant(
  restaurant: Database['public']['Tables']['restaurants']['Insert']
): Promise<Restaurant | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurant)
      .select()
      .single();

    if (error) throw error;

    // Invalidate restaurants list cache
    await invalidateRestaurantCache(data.id);

    return data;
  } catch (error) {
    console.error('Create restaurant error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Update restaurant
 */
export async function updateRestaurant(
  id: string,
  updates: Database['public']['Tables']['restaurants']['Update']
): Promise<Restaurant | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await invalidateRestaurantCache(id);

    return data;
  } catch (error) {
    console.error('Update restaurant error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Delete restaurant (soft delete by setting is_active to false)
 */
export async function deleteRestaurant(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('restaurants')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    // Invalidate cache
    await invalidateRestaurantCache(id);

    return true;
  } catch (error) {
    console.error('Delete restaurant error:', error);
    captureException(error);
    return false;
  }
}

/**
 * Get featured restaurants
 */
export async function getFeaturedRestaurants(
  limit: number = 10
): Promise<Restaurant[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get featured restaurants error:', error);
    captureException(error);
    return [];
  }
}

/**
 * Search restaurants with full-text search
 */
export async function searchRestaurants(query: string): Promise<Restaurant[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .textSearch('name', query, {
        type: 'websearch',
        config: 'english',
      })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Search restaurants error:', error);
    captureException(error);
    return [];
  }
}
