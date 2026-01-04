// =====================================================
// CHECK-IN SERVICE - Restaurant Visit & XP Rewards
// =====================================================

import { supabase } from '@/lib/supabase';
import type {
  CheckinData,
  RestaurantCheckin,
  XPReward,
} from '@/types/gamification';
import { logger } from './logger';

class CheckinService {
  /**
   * Perform restaurant check-in and award rewards
   */
  async checkin(
    userId: string,
    checkinData: CheckinData
  ): Promise<{
    success: boolean;
    checkin?: RestaurantCheckin;
    xpReward?: XPReward;
    levelUp?: boolean;
    newLevel?: number;
    error?: string;
  }> {
    try {
      logger.info('Processing check-in', {
        component: 'CheckinService',
        metadata: { userId, restaurantId: checkinData.restaurant_id },
      });

      // Get user profile for streak and level info
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('current_streak, level, total_xp')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get restaurant details
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', checkinData.restaurant_id)
        .single();

      if (restaurantError) throw restaurantError;

      // Check if first visit
      const { data: previousCheckins, error: checkinsError } = await supabase
        .from('restaurant_checkins')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', checkinData.restaurant_id)
        .limit(1);

      if (checkinsError) throw checkinsError;

      const isFirstVisit = !previousCheckins || previousCheckins.length === 0;

      // Calculate XP reward
      const xpReward = this.calculateCheckinXP({
        isFirstVisit,
        isHiddenGem: restaurant.is_hidden_gem || false,
        currentStreak: profile?.current_streak || 0,
        restaurantRarityTier: restaurant.rarity_tier || 'common',
        wasEventVisit: false, // TODO: Check active challenges
      });

      // Create check-in record
      const { data: checkin, error: checkinError } = await supabase
        .from('restaurant_checkins')
        .insert({
          user_id: userId,
          restaurant_id: checkinData.restaurant_id,
          location_lat: checkinData.location_lat,
          location_lng: checkinData.location_lng,
          xp_earned: xpReward.base_xp,
          bonus_xp: xpReward.total_xp - xpReward.base_xp,
          calories_consumed: checkinData.calories_consumed,
          amount_spent: checkinData.amount_spent,
          was_hidden_gem: restaurant.is_hidden_gem || false,
          was_first_visit: isFirstVisit,
          user_notes: checkinData.user_notes,
          rating: checkinData.rating,
        })
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Remove Must Try flag if set
      await this.removeMustTryFlag(userId, checkinData.restaurant_id);

      // Update streak
      await this.updateStreak(userId);

      // Award XP and check for level-up
      const oldLevel = profile?.level || 1;
      const newXP = (profile?.total_xp || 0) + xpReward.total_xp;
      const newLevel = this.calculateLevelFromXP(newXP);
      const levelUp = newLevel > oldLevel;

      const { error: xpError } = await supabase
        .from('user_profiles')
        .update({
          total_xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (xpError) throw xpError;

      // Update calorie and budget tracking
      if (checkinData.calories_consumed) {
        await this.updateCalories(userId, checkinData.calories_consumed);
      }

      if (checkinData.amount_spent) {
        await this.updateBudget(userId, checkinData.amount_spent);
      }

      // Update restaurant total_checkins
      const { error: restaurantUpdateError } = await supabase.rpc(
        'increment_restaurant_checkins',
        {
          restaurant_id: checkinData.restaurant_id,
        }
      );

      // Update user stats
      if (isFirstVisit) {
        const { error: statsError } = await supabase.rpc(
          'increment_user_restaurants_visited',
          {
            user_id: userId,
          }
        );
      }

      // TODO: Check achievements, challenges, hidden gems

      logger.info('Check-in successful', {
        component: 'CheckinService',
        metadata: { checkinId: checkin.id, xpEarned: xpReward.total_xp },
      });

      return {
        success: true,
        checkin: checkin as RestaurantCheckin,
        xpReward,
        levelUp,
        newLevel: levelUp ? newLevel : undefined,
      };
    } catch (error) {
      logger.error(
        'Check-in failed',
        error instanceof Error ? error : undefined,
        { component: 'CheckinService' }
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Calculate XP for check-in
   */
  private calculateCheckinXP(data: {
    isFirstVisit: boolean;
    isHiddenGem: boolean;
    currentStreak: number;
    restaurantRarityTier: string;
    wasEventVisit: boolean;
  }): XPReward {
    const BASE_CHECKIN_XP = 10;
    const FIRST_VISIT_BONUS = 25;
    const HIDDEN_GEM_BONUS = 100;
    const STREAK_MULTIPLIER = 0.1;
    const MAX_STREAK_BONUS = 2.0;

    let baseXP = BASE_CHECKIN_XP;

    // Rarity bonus
    const rarityBonus: Record<string, number> = {
      common: 0,
      uncommon: 5,
      rare: 15,
      epic: 30,
      legendary: 50,
    };
    baseXP += rarityBonus[data.restaurantRarityTier] || 0;

    // Bonuses
    const firstVisitBonus = data.isFirstVisit ? FIRST_VISIT_BONUS : 0;
    const hiddenGemBonus = data.isHiddenGem ? HIDDEN_GEM_BONUS : 0;

    // Streak bonus (10% per day, max 200%)
    const streakMultiplier = Math.min(
      1 + data.currentStreak * STREAK_MULTIPLIER,
      MAX_STREAK_BONUS
    );
    const streakBonus = Math.round(baseXP * (streakMultiplier - 1));

    // Challenge bonus
    const challengeBonus = data.wasEventVisit ? 50 : 0;

    const totalXP =
      baseXP + firstVisitBonus + hiddenGemBonus + streakBonus + challengeBonus;

    return {
      base_xp: baseXP,
      streak_bonus: streakBonus,
      first_visit_bonus: firstVisitBonus,
      hidden_gem_bonus: hiddenGemBonus,
      challenge_bonus: challengeBonus,
      total_xp: totalXP,
    };
  }

  /**
   * Remove Must Try flag when user checks in
   */
  private async removeMustTryFlag(
    userId: string,
    restaurantId: string
  ): Promise<void> {
    try {
      await supabase
        .from('favorites')
        .update({ must_try: false })
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);

      logger.info('Must Try flag removed on check-in', {
        component: 'CheckinService',
        metadata: { restaurantId },
      });
    } catch (error) {
      logger.error(
        'Failed to remove Must Try flag',
        error instanceof Error ? error : undefined,
        { component: 'CheckinService' }
      );
    }
  }

  /**
   * Calculate level from XP
   */
  private calculateLevelFromXP(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100));
  }

  /**
   * Update user streak
   */
  private async updateStreak(userId: string): Promise<void> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('current_streak, longest_streak, last_checkin_date')
        .eq('id', userId)
        .single();

      const today = new Date().toISOString().split('T')[0];
      const lastCheckin = profile?.last_checkin_date;

      let currentStreak = profile?.current_streak || 0;
      let longestStreak = profile?.longest_streak || 0;

      if (!lastCheckin) {
        currentStreak = 1;
      } else {
        const lastDate = new Date(lastCheckin);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          return; // Same day, don't update
        } else if (diffDays === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1; // Streak broken
        }
      }

      longestStreak = Math.max(currentStreak, longestStreak);

      await supabase
        .from('user_profiles')
        .update({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_checkin_date: today,
        })
        .eq('id', userId);

      logger.info('Streak updated', {
        component: 'CheckinService',
        metadata: { currentStreak },
      });
    } catch (error) {
      logger.error(
        'Failed to update streak',
        error instanceof Error ? error : undefined,
        { component: 'CheckinService' }
      );
    }
  }

  /**
   * Update daily calorie consumption
   */
  private async updateCalories(
    userId: string,
    caloriesConsumed: number
  ): Promise<void> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('daily_calorie_consumed, last_calorie_reset')
        .eq('id', userId)
        .single();

      const today = new Date().toISOString().split('T')[0];
      const lastReset = profile?.last_calorie_reset;

      let currentCalories = profile?.daily_calorie_consumed || 0;

      // Reset if new day
      if (lastReset !== today) {
        currentCalories = 0;
      }

      currentCalories += caloriesConsumed;

      await supabase
        .from('user_profiles')
        .update({
          daily_calorie_consumed: currentCalories,
          last_calorie_reset: today,
        })
        .eq('id', userId);
    } catch (error) {
      logger.error(
        'Failed to update calories',
        error instanceof Error ? error : undefined,
        { component: 'CheckinService' }
      );
    }
  }

  /**
   * Update weekly budget spending
   */
  private async updateBudget(
    userId: string,
    amountSpent: number
  ): Promise<void> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('weekly_budget_spent, last_budget_reset')
        .eq('id', userId)
        .single();

      const today = new Date();
      const lastReset = profile?.last_budget_reset
        ? new Date(profile.last_budget_reset)
        : new Date();
      const diffDays = Math.floor(
        (today.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
      );

      let currentSpent = profile?.weekly_budget_spent || 0;

      // Reset if 7+ days
      if (diffDays >= 7) {
        currentSpent = 0;
      }

      currentSpent += amountSpent;

      await supabase
        .from('user_profiles')
        .update({
          weekly_budget_spent: currentSpent,
          last_budget_reset:
            diffDays >= 7 ? today.toISOString() : lastReset.toISOString(),
        })
        .eq('id', userId);
    } catch (error) {
      logger.error(
        'Failed to update budget',
        error instanceof Error ? error : undefined,
        { component: 'CheckinService' }
      );
    }
  }

  /**
   * Get user's check-in history
   */
  async getCheckinHistory(
    userId: string,
    limit: number = 20
  ): Promise<RestaurantCheckin[]> {
    try {
      const { data, error } = await supabase
        .from('restaurant_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checked_in_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data as RestaurantCheckin[]) || [];
    } catch (error) {
      logger.error(
        'Failed to fetch checkin history',
        error instanceof Error ? error : undefined,
        { component: 'CheckinService' }
      );
      return [];
    }
  }

  /**
   * Get restaurant checkin count for user
   */
  async getRestaurantCheckinCount(
    userId: string,
    restaurantId: string
  ): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('restaurant_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      logger.error(
        'Failed to get checkin count',
        error instanceof Error ? error : undefined,
        { component: 'CheckinService' }
      );
      return 0;
    }
  }
}

export const checkinService = new CheckinService();
