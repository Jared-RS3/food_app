import { supabase } from '@/lib/supabase';
import {
  Achievement,
  Badge,
  Challenge,
  LEVEL_UP_POINTS,
  Reward,
  TIER_THRESHOLDS,
  UserProfile,
} from '@/types/gamification';

// XP Reward Constants
export const XP_REWARDS = {
  ADD_RESTAURANT: 50,
  ADD_FOOD_ITEM: 25,
  CHECK_IN: 20,
  ADD_TO_COLLECTION: 15,
  WRITE_REVIEW: 30,
  UPLOAD_PHOTO: 10,
  SHARE_ITEM: 5,
} as const;

class GamificationService {
  async getUserProfile(): Promise<UserProfile> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!profile) throw new Error('Profile not found');

      // Calculate current points (points to next level)
      const currentLevelPoints = (profile.level - 1) * LEVEL_UP_POINTS;
      const currentPoints = profile.total_xp - currentLevelPoints;

      return {
        id: profile.id,
        username: profile.email?.split('@')[0] || 'User',
        level: profile.level || 1,
        points: currentPoints,
        totalPoints: profile.total_xp || 0,
        streak: profile.current_streak || 0,
        lastCheckIn: profile.last_checkin_date || new Date().toISOString(),
        avatar: '👨‍🍳',
        badges: [],
        achievements: [],
        tier: this.calculateTier(profile.total_xp || 0),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async addPoints(points: number, reason: string): Promise<UserProfile> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Fetch current profile
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!profile) throw new Error('Profile not found');

      const newTotalXP = (profile.total_xp || 0) + points;
      const newLevel = Math.floor(newTotalXP / LEVEL_UP_POINTS) + 1;
      const newTier = this.calculateTier(newTotalXP);

      // Update profile with new XP and level
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          avatar_tier: newTier.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Return updated profile
      return await this.getUserProfile();
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  private calculateTier(
    totalXP: number
  ): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' {
    if (totalXP >= TIER_THRESHOLDS.Diamond) return 'Diamond';
    if (totalXP >= TIER_THRESHOLDS.Platinum) return 'Platinum';
    if (totalXP >= TIER_THRESHOLDS.Gold) return 'Gold';
    if (totalXP >= TIER_THRESHOLDS.Silver) return 'Silver';
    return 'Bronze';
  }

  async getAchievements(): Promise<Achievement[]> {
    return [
      {
        id: '1',
        title: 'First Bite',
        description: 'Visit your first restaurant',
        icon: '🍽️',
        points: 50,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress: 1,
        maxProgress: 1,
        category: 'explorer',
      },
      {
        id: '2',
        title: 'Food Explorer',
        description: 'Visit 10 different restaurants',
        icon: '🗺️',
        points: 200,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress: 10,
        maxProgress: 10,
        category: 'explorer',
      },
      {
        id: '3',
        title: 'Cuisine Master',
        description: 'Try 5 different cuisine types',
        icon: '🌍',
        points: 150,
        unlocked: false,
        progress: 3,
        maxProgress: 5,
        category: 'foodie',
      },
      {
        id: '4',
        title: 'Review Guru',
        description: 'Leave 20 reviews',
        icon: '⭐',
        points: 300,
        unlocked: false,
        progress: 12,
        maxProgress: 20,
        category: 'social',
      },
      {
        id: '5',
        title: 'Collection Curator',
        description: 'Create 5 collections',
        icon: '📚',
        points: 100,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress: 5,
        maxProgress: 5,
        category: 'collector',
      },
      {
        id: '6',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        points: 250,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress: 7,
        maxProgress: 7,
        category: 'streak',
      },
      {
        id: '7',
        title: 'Must-Try Hunter',
        description: 'Complete 15 must-try items',
        icon: '🎯',
        points: 200,
        unlocked: false,
        progress: 8,
        maxProgress: 15,
        category: 'foodie',
      },
      {
        id: '8',
        title: 'Social Butterfly',
        description: 'Share 10 restaurants with friends',
        icon: '🦋',
        points: 150,
        unlocked: false,
        progress: 4,
        maxProgress: 10,
        category: 'social',
      },
    ];
  }

  async getDailyChallenges(): Promise<Challenge[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return [
      {
        id: '1',
        title: 'Daily Explorer',
        description: 'Visit 1 new restaurant today',
        icon: '🚀',
        points: 25,
        type: 'daily',
        expiresAt: tomorrow.toISOString(),
        progress: 0,
        maxProgress: 1,
        completed: false,
      },
      {
        id: '2',
        title: 'Review Master',
        description: 'Leave a review today',
        icon: '✍️',
        points: 20,
        type: 'daily',
        expiresAt: tomorrow.toISOString(),
        progress: 1,
        maxProgress: 1,
        completed: true,
      },
      {
        id: '3',
        title: 'Collection Builder',
        description: 'Add 2 restaurants to collections',
        icon: '📂',
        points: 15,
        type: 'daily',
        expiresAt: tomorrow.toISOString(),
        progress: 1,
        maxProgress: 2,
        completed: false,
      },
    ];
  }

  async getWeeklyChallenges(): Promise<Challenge[]> {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: 'w1',
        title: 'Weekend Warrior',
        description: 'Visit 5 restaurants this week',
        icon: '🗓️',
        points: 100,
        type: 'weekly',
        expiresAt: nextWeek.toISOString(),
        progress: 3,
        maxProgress: 5,
        completed: false,
      },
      {
        id: 'w2',
        title: 'Diverse Palate',
        description: 'Try 3 different cuisines',
        icon: '🌮',
        points: 80,
        type: 'weekly',
        expiresAt: nextWeek.toISOString(),
        progress: 2,
        maxProgress: 3,
        completed: false,
      },
    ];
  }

  async getBadges(): Promise<Badge[]> {
    return [
      {
        id: 'b1',
        name: 'Early Adopter',
        description: 'Joined in the first month',
        icon: '🌟',
        rarity: 'legendary',
        earnedAt: new Date().toISOString(),
      },
      {
        id: 'b2',
        name: 'Foodie Level 10',
        description: 'Reached level 10',
        icon: '👑',
        rarity: 'epic',
        earnedAt: new Date().toISOString(),
      },
      {
        id: 'b3',
        name: 'Review Champion',
        description: 'Left 50+ reviews',
        icon: '🏆',
        rarity: 'rare',
      },
      {
        id: 'b4',
        name: 'Local Legend',
        description: 'Visited 50+ restaurants',
        icon: '🎖️',
        rarity: 'epic',
        progress: 34,
        maxProgress: 50,
      },
    ];
  }

  async getRewards(): Promise<Reward[]> {
    return [
      {
        id: 'r1',
        name: '10% Off Coupon',
        description: 'Get 10% off at partner restaurants',
        icon: '🎟️',
        cost: 500,
        type: 'discount',
        available: true,
      },
      {
        id: 'r2',
        name: 'Priority Support',
        description: '24/7 priority customer support',
        icon: '💬',
        cost: 1000,
        type: 'feature',
        available: true,
      },
      {
        id: 'r3',
        name: 'Golden Star Badge',
        description: 'Exclusive badge for your profile',
        icon: '⭐',
        cost: 750,
        type: 'badge',
        available: true,
      },
      {
        id: 'r4',
        name: '2x Points Boost',
        description: 'Double points for 7 days',
        icon: '🚀',
        cost: 300,
        type: 'boost',
        available: true,
      },
    ];
  }

  async completeChallenge(challengeId: string): Promise<UserProfile> {
    // TODO: Update challenge completion and award points
    return await this.getUserProfile();
  }

  async unlockAchievement(achievementId: string): Promise<UserProfile> {
    // TODO: Unlock achievement and award points
    return await this.getUserProfile();
  }

  async redeemReward(rewardId: string): Promise<boolean> {
    // TODO: Redeem reward if user has enough points
    return true;
  }
}

export const gamificationService = new GamificationService();
