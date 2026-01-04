import { getCurrentUserId, supabase } from '@/lib/supabase';
import { Restaurant } from '@/types/restaurant';
import { CacheKeys, cacheService } from './cacheService';
import { logger } from './logger';

/**
 * Transform database restaurant to app Restaurant type
 */
const transformRestaurant = (restaurant: any): Restaurant => ({
  id: restaurant.id,
  name: restaurant.name,
  cuisine: restaurant.cuisine,
  rating: restaurant.rating || 4.5,
  reviews: restaurant.reviews || 0,
  distance: restaurant.distance || '2.1 km',
  deliveryTime: restaurant.delivery_time || '30-45 min',
  deliveryFee: restaurant.delivery_fee || 'R25',
  image:
    restaurant.image_url ||
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
  tags: restaurant.restaurant_tags?.map((tag: any) => tag.tag) || [],
  featured: restaurant.featured || false,
  isOpen: restaurant.is_open ?? true,
  description: restaurant.notes,
  address: restaurant.address,
  phone: restaurant.phone,
  priceRange: restaurant.price_level,
  latitude: restaurant.latitude ? Number(restaurant.latitude) : -33.9249,
  longitude: restaurant.longitude ? Number(restaurant.longitude) : 18.4241,
  dateAdded: restaurant.created_at,
  lastVisited: restaurant.last_visited,
  isFavorite: restaurant.is_favorite,
});

export const restaurantService = {
  // Get all restaurants for current user
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      console.log('[restaurantService] Fetching user ID...');
      const userId = await getCurrentUserId();
      console.log('[restaurantService] User ID:', userId);

      // Check cache first
      const cacheKey = CacheKeys.allRestaurants();
      const cached = cacheService.get<Restaurant[]>(cacheKey);
      if (cached) {
        console.log('[restaurantService] Returning cached restaurants');
        return cached;
      }

      console.log('[restaurantService] Querying restaurants from Supabase...');
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(
          `
          *,
          restaurant_tags(tag)
        `
        )
        // REMOVED user_id filter to show ALL restaurants in database
        // .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[restaurantService] Supabase error:', error);
        throw error;
      }

      console.log(
        `[restaurantService] Successfully fetched ${
          restaurants?.length || 0
        } restaurants`
      );

      const transformed = restaurants?.map(transformRestaurant) || [];

      // Cache the results for 5 minutes
      cacheService.set(cacheKey, transformed);

      return transformed;
    } catch (error) {
      logger.error(
        'Error fetching restaurants',
        error instanceof Error ? error : undefined,
        {
          component: 'restaurantService',
        }
      );
      return [];
    }
  },

  // Get Must Try restaurants for current user
  async getMustTryRestaurants(): Promise<Restaurant[]> {
    try {
      const userId = await getCurrentUserId();

      // Query favorites table for must_try restaurants
      const { data: mustTryFavorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', userId)
        .eq('must_try', true);

      if (favoritesError) throw favoritesError;

      if (!mustTryFavorites || mustTryFavorites.length === 0) {
        return [];
      }

      // Get restaurant details for must_try restaurants
      const restaurantIds = mustTryFavorites.map((f) => f.restaurant_id);

      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(
          `
          *,
          restaurant_tags(tag)
        `
        )
        .in('id', restaurantIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return restaurants?.map(transformRestaurant) || [];
    } catch (error) {
      console.error('❌ Must Try Restaurants Error:', error);
      logger.error(
        'Error fetching Must Try restaurants',
        error instanceof Error ? error : undefined,
        {
          component: 'restaurantService',
          metadata: { error },
        }
      );
      return [];
    }
  },

  // Get restaurants by cuisine
  async getRestaurantsByCuisine(cuisine: string): Promise<Restaurant[]> {
    try {
      const userId = await getCurrentUserId();

      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(
          `
          *,
          restaurant_tags(tag)
        `
        )
        .eq('user_id', userId)
        .eq('cuisine', cuisine)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return restaurants?.map(transformRestaurant) || [];
    } catch (error) {
      logger.error(
        'Error fetching restaurants by cuisine',
        error instanceof Error ? error : undefined,
        {
          component: 'restaurantService',
          metadata: { cuisine },
        }
      );
      return [];
    }
  },

  // Get single restaurant by ID
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const userId = await getCurrentUserId();

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select(
          `
          *,
          restaurant_tags(tag)
        `
        )
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return restaurant ? transformRestaurant(restaurant) : null;
    } catch (error) {
      logger.error(
        'Error fetching restaurant by ID',
        error instanceof Error ? error : undefined,
        {
          component: 'restaurantService',
          metadata: { id },
        }
      );
      return null;
    }
  },

  // Alias for getRestaurantById (for backward compatibility)
  async getRestaurant(id: string): Promise<Restaurant | null> {
    return this.getRestaurantById(id);
  },

  // Get favorite restaurants for current user
  async getFavoriteRestaurants(): Promise<Restaurant[]> {
    try {
      const userId = await getCurrentUserId();

      // Query favorites table
      const { data: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', userId);

      if (favoritesError) throw favoritesError;

      if (!favorites || favorites.length === 0) {
        return [];
      }

      // Get restaurant details
      const restaurantIds = favorites.map((f) => f.restaurant_id);

      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(
          `
          *,
          restaurant_tags(tag)
        `
        )
        .in('id', restaurantIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return restaurants?.map(transformRestaurant) || [];
    } catch (error) {
      logger.error(
        'Error fetching favorite restaurants',
        error instanceof Error ? error : undefined,
        {
          component: 'restaurantService',
        }
      );
      return [];
    }
  },

  // Toggle favorite status for a restaurant
  async toggleFavorite(restaurantId: string): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();

      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single();

      if (existing) {
        // Remove from favorites
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);

        if (deleteError) throw deleteError;

        // Invalidate cache
        cacheService.invalidatePattern('restaurants:');
        cacheService.invalidatePattern('collection:');

        return false; // Now not favorited
      } else {
        // Add to favorites
        const { error: insertError } = await supabase.from('favorites').insert({
          user_id: userId,
          restaurant_id: restaurantId,
        });

        if (insertError) throw insertError;

        // Invalidate cache
        cacheService.invalidatePattern('restaurants:');
        cacheService.invalidatePattern('collection:');

        return true; // Now favorited
      }
    } catch (error) {
      logger.error(
        'Error toggling favorite',
        error instanceof Error ? error : undefined,
        {
          component: 'restaurantService',
          metadata: { restaurantId },
        }
      );
      return false;
    }
  },

  // Update restaurant
  async updateRestaurant(
    id: string,
    updates: Partial<Restaurant>
  ): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('restaurants')
        .update({
          name: updates.name,
          cuisine: updates.cuisine,
          address: updates.address,
          phone: updates.phone,
          notes: updates.description,
          image_url: updates.image,
          latitude: updates.latitude,
          longitude: updates.longitude,
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(
        'Error updating restaurant',
        error instanceof Error ? error : undefined,
        {
          component: 'restaurantService',
          metadata: { id },
        }
      );
      return false;
    }
  },

  // Delete restaurant
  async deleteRestaurant(id: string): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(
        'Error deleting restaurant',
        error instanceof Error ? error : undefined,
        {
          component: 'restaurantService',
          metadata: { id },
        }
      );
      return false;
    }
  },
};
