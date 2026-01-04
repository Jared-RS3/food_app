import { getCurrentUserId, supabase } from '@/lib/supabase';
import { Collection } from '@/types/restaurant';
import { logger } from './logger';

export const collectionService = {
  // Get all collections for current user
  async getCollections(): Promise<Collection[]> {
    try {
      const userId = await getCurrentUserId();

      const { data: collections, error } = await supabase
        .from('collections')
        .select(
          `
          *,
          collection_items(
            restaurant_id,
            food_item_id
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (
        collections?.map((collection) => ({
          id: collection.id,
          name: collection.name,
          icon: collection.icon,
          restaurantCount: collection.collection_items?.length || 0,
          recentAdditions: [], // You can implement this by getting recent restaurant names
          color: collection.color,
          restaurants:
            collection.collection_items
              ?.map((item: any) => item.restaurant_id)
              .filter(Boolean) || [],
        })) || []
      );
    } catch (error) {
      logger.error('Error fetching collections', error instanceof Error ? error : undefined, {
        component: 'collectionService',
      });
      return [];
    }
  },

  // Create new collection
  async createCollection(
    name: string,
    icon: string,
    color: string
  ): Promise<string | null> {
    try {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: userId,
          name,
          icon,
          color,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      logger.error('Error creating collection', error instanceof Error ? error : undefined, {
        component: 'collectionService',
        metadata: { name, icon, color },
      });
      return null;
    }
  },

  // Add restaurant to collection
  async addRestaurantToCollection(
    collectionId: string,
    restaurantId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('collection_items').insert({
        collection_id: collectionId,
        restaurant_id: restaurantId,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error adding restaurant to collection', error instanceof Error ? error : undefined, {
        component: 'collectionService',
        metadata: { collectionId, restaurantId },
      });
      return false;
    }
  },

  // Remove restaurant from collection
  async removeRestaurantFromCollection(
    collectionId: string,
    restaurantId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(
        'Error removing restaurant from collection',
        error instanceof Error ? error : undefined,
        {
          component: 'collectionService',
          metadata: { collectionId, restaurantId },
        }
      );
      return false;
    }
  },

  // Delete collection
  async deleteCollection(collectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting collection', error instanceof Error ? error : undefined, {
        component: 'collectionService',
        metadata: { collectionId },
      });
      return false;
    }
  },
};
