import { getCurrentUserId, supabase } from '@/lib/supabase';
import { logger } from './logger';

export interface MustTryItem {
  id: string;
  type: 'restaurant' | 'food';
  restaurantId?: string;
  foodItemId?: string;
  restaurantName?: string;
  foodItemName?: string;
  cuisine?: string;
  category?: string;
  image?: string;
  dateAdded: string;
}

export const mustTryService = {
  // Get all must-try items for current user
  async getMustTryItems(): Promise<MustTryItem[]> {
    try {
      const userId = await getCurrentUserId();

      // Query favourites table with must_try = true
      const { data: mustTryFavorites, error } = await supabase
        .from('favourites')
        .select(
          `
          *,
          restaurants(id, name, cuisine, image_url, address, latitude, longitude)
        `
        )
        .eq('user_id', userId)
        .eq('must_try', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching must-try items:', error);
        throw error;
      }

      return (
        mustTryFavorites?.map((item) => ({
          id: item.id,
          type: 'restaurant' as const,
          restaurantId: item.restaurant_id,
          foodItemId: undefined,
          restaurantName: item.restaurants?.name,
          foodItemName: undefined,
          cuisine: item.restaurants?.cuisine,
          category: undefined,
          image:
            item.restaurants?.image_url ||
            'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
          dateAdded: item.created_at,
        })) || []
      );
    } catch (error) {
      logger.error(
        'Error fetching must-try items',
        error instanceof Error ? error : undefined,
        {
          component: 'mustTryService',
        }
      );
      return [];
    }
  },

  // Add restaurant to must-try
  async addRestaurantToMustTry(restaurantId: string): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();

      // Check if already exists in favourites
      const { data: existing } = await supabase
        .from('favourites')
        .select('id, must_try')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single();

      if (existing) {
        // If it exists but must_try is false, update it
        if (!existing.must_try) {
          const { error: updateError } = await supabase
            .from('favourites')
            .update({ must_try: true })
            .eq('id', existing.id);

          if (updateError) throw updateError;
        }
        return true; // Already in must-try or updated
      }

      // Insert new favorite with must_try = true
      const { error } = await supabase.from('favourites').insert({
        user_id: userId,
        restaurant_id: restaurantId,
        must_try: true,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(
        'Error adding restaurant to must-try',
        error instanceof Error ? error : undefined,
        {
          component: 'mustTryService',
          metadata: { restaurantId },
        }
      );
      return false;
    }
  },

  // Remove from must-try (sets must_try to false)
  async removeFromMustTry(favoriteId: string): Promise<boolean> {
    try {
      // Update the must_try flag to false instead of deleting
      const { error } = await supabase
        .from('favourites')
        .update({ must_try: false })
        .eq('id', favoriteId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(
        'Error removing from must-try',
        error instanceof Error ? error : undefined,
        {
          component: 'mustTryService',
          metadata: { favoriteId },
        }
      );
      return false;
    }
  },

  // Check if restaurant is in must-try
  async isInMustTry(restaurantId: string): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('favourites')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .eq('must_try', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error(
        'Error checking must-try status',
        error instanceof Error ? error : undefined,
        {
          component: 'mustTryService',
          metadata: { restaurantId },
        }
      );
      return false;
    }
  },

  // Add food item to must-try (deprecated - keeping for backward compatibility)
  async addFoodToMustTry(foodItemId: string): Promise<boolean> {
    logger.warn(
      'addFoodToMustTry is deprecated - must-try only supports restaurants now'
    );
    return false;
  },

  // Add a must-try item with details (dish name, price, image)
  async addMustTryItem(
    restaurantId: string,
    itemName: string,
    price?: string,
    imageUrl?: string
  ): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();

      // Insert into must_try_items table (or create a notes field in favourites)
      // For now, we'll use the favourites table with additional fields
      const { data: existing } = await supabase
        .from('favourites')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single();

      if (existing) {
        // Update existing favorite with must-try details
        const { error: updateError } = await supabase
          .from('favourites')
          .update({
            must_try: true,
            notes: JSON.stringify({
              itemName,
              price,
              imageUrl,
              addedAt: new Date().toISOString(),
            }),
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new favorite with must-try details
        const { error } = await supabase.from('favourites').insert({
          user_id: userId,
          restaurant_id: restaurantId,
          must_try: true,
          notes: JSON.stringify({
            itemName,
            price,
            imageUrl,
            addedAt: new Date().toISOString(),
          }),
        });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      logger.error(
        'Error adding must-try item',
        error instanceof Error ? error : undefined,
        {
          component: 'mustTryService',
          metadata: { restaurantId, itemName },
        }
      );
      return false;
    }
  },
};
