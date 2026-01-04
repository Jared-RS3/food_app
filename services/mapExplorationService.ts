// =====================================================
// MAP EXPLORATION SERVICE - District & Fog-of-War Management
// =====================================================

import { supabase } from '@/lib/supabase';
import { logger } from './logger';
import type {
  District,
  UserMapProgress,
  MapExplorationState,
} from '@/types/gamification';

class MapExplorationService {
  /**
   * Get all districts for a city
   */
  async getDistrictsForCity(city: string): Promise<District[]> {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('city', city)
        .eq('is_active', true)
        .order('rarity', { ascending: true });

      if (error) throw error;

      return (data as District[]) || [];
    } catch (error) {
      logger.error('Failed to fetch districts', error instanceof Error ? error : undefined, { component: 'MapExplorationService', metadata: { city } });
      return [];
    }
  }

  /**
   * Get user's map progress for all districts
   */
  async getUserMapProgress(userId: string): Promise<UserMapProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_map_progress')
        .select(`
          *,
          district:districts(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return (data as any[]) || [];
    } catch (error) {
      logger.error('Failed to fetch map progress', error instanceof Error ? error : undefined, { component: 'MapExplorationService', metadata: { userId } });
      return [];
    }
  }

  /**
   * Get exploration state for user
   */
  async getExplorationState(userId: string, city: string): Promise<MapExplorationState> {
    try {
      const districts = await this.getDistrictsForCity(city);
      const progress = await this.getUserMapProgress(userId);

      const unlockedDistricts = progress
        .filter(p => p.unlocked)
        .map(p => p.district)
        .filter((d): d is District => d !== undefined);

      // Calculate total fog cleared
      const totalFogCleared = progress.reduce((sum, p) => sum + p.fog_cleared_percentage, 0) / Math.max(districts.length, 1);

      return {
        current_district: null,
        unlocked_districts: unlockedDistricts,
        nearby_hidden_gems: [],
        fog_cleared_percentage: totalFogCleared,
        can_unlock_next: true,
      };
    } catch (error) {
      logger.error('Failed to fetch exploration state', error instanceof Error ? error : undefined, { component: 'MapExplorationService' });
      return {
        current_district: null,
        unlocked_districts: [],
        nearby_hidden_gems: [],
        fog_cleared_percentage: 0,
        can_unlock_next: false,
      };
    }
  }

  /**
   * Check if user is within a district
   */
  isWithinDistrict(userLat: number, userLng: number, district: District): boolean {
    // Simple distance check (can be enhanced with polygon checking)
    const distance = this.calculateDistance(userLat, userLng, district.center_lat, district.center_lng);
    return distance <= 5000; // 5km radius
  }

  /**
   * Calculate distance between two coordinates (meters)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Unlock a district for user
   */
  async unlockDistrict(userId: string, districtId: string): Promise<boolean> {
    try {
      logger.info('Unlocking district', { component: 'MapExplorationService', metadata: { userId, districtId } });

      // Check if progress already exists
      const { data: existing } = await supabase
        .from('user_map_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('district_id', districtId)
        .single();

      if (existing && existing.unlocked) {
        return true; // Already unlocked
      }

      // Get district details for XP reward
      const { data: district } = await supabase
        .from('districts')
        .select('*')
        .eq('id', districtId)
        .single();

      if (!district) return false;

      if (existing) {
        // Update existing progress
        const { error } = await supabase
          .from('user_map_progress')
          .update({
            unlocked: true,
            unlocked_at: new Date().toISOString(),
            xp_reward_claimed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('district_id', districtId);

        if (error) throw error;
      } else {
        // Create new progress
        const { error } = await supabase
          .from('user_map_progress')
          .insert({
            user_id: userId,
            district_id: districtId,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
            xp_reward_claimed: false,
            fog_cleared_percentage: 10, // Initial 10% for unlocking
          });

        if (error) throw error;
      }

      // Update user stats
      const { error: statsError } = await supabase.rpc('increment', {
        table_name: 'user_profiles',
        column_name: 'total_districts_unlocked',
        row_id: userId,
      });

      // Award XP (will be claimed separately)
      logger.info('District unlocked successfully', { component: 'MapExplorationService', metadata: { districtId } });

      return true;
    } catch (error) {
      logger.error('Failed to unlock district', error instanceof Error ? error : undefined, { component: 'MapExplorationService' });
      return false;
    }
  }

  /**
   * Update fog cleared percentage for district
   */
  async updateFogCleared(userId: string, districtId: string, percentage: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_map_progress')
        .update({
          fog_cleared_percentage: Math.min(percentage, 100),
          last_visit_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('district_id', districtId);

      if (error) throw error;

      return true;
    } catch (error) {
      logger.error('Failed to update fog cleared', error instanceof Error ? error : undefined, { component: 'MapExplorationService' });
      return false;
    }
  }

  /**
   * Record restaurant visit in district
   */
  async recordDistrictVisit(userId: string, districtId: string): Promise<void> {
    try {
      // Increment restaurants_visited count
      const { data: progress } = await supabase
        .from('user_map_progress')
        .select('restaurants_visited, fog_cleared_percentage')
        .eq('user_id', userId)
        .eq('district_id', districtId)
        .single();

      if (!progress) return;

      const newCount = progress.restaurants_visited + 1;
      // Increase fog cleared by 5% per visit
      const newFogCleared = Math.min(progress.fog_cleared_percentage + 5, 100);

      const { error } = await supabase
        .from('user_map_progress')
        .update({
          restaurants_visited: newCount,
          fog_cleared_percentage: newFogCleared,
          last_visit_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('district_id', districtId);

      if (error) throw error;

      logger.info('District visit recorded', { component: 'MapExplorationService', metadata: { districtId, newCount } });
    } catch (error) {
      logger.error('Failed to record district visit', error instanceof Error ? error : undefined, { component: 'MapExplorationService' });
    }
  }
}

export const mapExplorationService = new MapExplorationService();
