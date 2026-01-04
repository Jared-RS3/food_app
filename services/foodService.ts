import { getCurrentUserId, supabase } from '@/lib/supabase';
import { logger } from './logger';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  image: string;
  restaurantId: string;
  restaurantName?: string;
  description?: string;
  tags: string[];
}

/**
 * Transform database food item to FoodItem interface
 */
const transformFoodItem = (item: any): FoodItem => ({
  id: item.id,
  name: item.name,
  category: item.category,
  price: item.price || 'R0',
  rating: Number(item.rating) || 4.0,
  image:
    item.image_url ||
    'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400',
  restaurantId: item.restaurant_id,
  restaurantName: item.restaurants?.name,
  description: item.description,
  tags: item.food_item_tags?.map((tag: any) => tag.tag) || [],
});

export const foodService = {
  // Get all food items for current user
  async getFoodItems(): Promise<FoodItem[]> {
    try {
      const userId = await getCurrentUserId();

      const { data: foodItems, error } = await supabase
        .from('food_items')
        .select(
          `
          *,
          restaurants(name),
          food_item_tags(tag)
        `
        )
        // REMOVED user_id filter to show ALL food items in database
        // .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return foodItems?.map(transformFoodItem) || [];
    } catch (error) {
      logger.error(
        'Error fetching food items',
        error instanceof Error ? error : undefined,
        {
          component: 'foodService',
        }
      );
      return [];
    }
  },

  // Get food items by restaurant
  async getFoodItemsByRestaurant(restaurantId: string): Promise<FoodItem[]> {
    try {
      const { data: foodItems, error } = await supabase
        .from('food_items')
        .select(
          `
          *,
          restaurants(name),
          food_item_tags(tag)
        `
        )
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return foodItems?.map(transformFoodItem) || [];
    } catch (error) {
      logger.error(
        'Error fetching food items by restaurant',
        error instanceof Error ? error : undefined,
        {
          component: 'foodService',
          metadata: { restaurantId },
        }
      );
      return [];
    }
  },

  // Delete food item
  async deleteFoodItem(foodItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', foodItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(
        'Error deleting food item',
        error instanceof Error ? error : undefined,
        {
          component: 'foodService',
          metadata: { foodItemId },
        }
      );
      return false;
    }
  },
};
