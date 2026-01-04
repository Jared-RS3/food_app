// =====================================================
// GAMIFICATION SYSTEM - TYPESCRIPT TYPES
// =====================================================

// =====================================================
// 1. DISTRICTS
// =====================================================
export type DistrictRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface District {
  id: string;
  name: string;
  city: string;
  state: string | null;
  country: string;
  polygon: any; // GeoJSON geometry
  center_lat: number;
  center_lng: number;
  rarity: DistrictRarity;
  unlock_requirement: string | null;
  required_xp: number;
  required_level: number;
  unlock_xp_reward: number;
  description: string | null;
  icon_emoji: string;
  color_hex: string;
  restaurant_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// 2. USER MAP PROGRESS
// =====================================================
export interface UserMapProgress {
  id: string;
  user_id: string;
  district_id: string;
  unlocked: boolean;
  unlocked_at: string | null;
  fog_cleared_percentage: number; // 0.00 to 100.00
  restaurants_visited: number;
  xp_reward_claimed: boolean;
  first_visit_at: string | null;
  last_visit_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  district?: District;
}

// =====================================================
// 3. RESTAURANT CHECK-INS
// =====================================================
export interface RestaurantCheckin {
  id: string;
  user_id: string;
  restaurant_id: string;
  checked_in_at: string;
  location_lat: number | null;
  location_lng: number | null;
  xp_earned: number;
  bonus_xp: number;
  calories_consumed: number | null;
  amount_spent: number | null;
  was_hidden_gem: boolean;
  was_first_visit: boolean;
  was_mystery_menu: boolean;
  was_event_visit: boolean;
  event_id: string | null;
  user_notes: string | null;
  rating: number | null; // 1-5
  created_at: string;
}

// =====================================================
// 4. EXTENDED USER PROFILE
// =====================================================
export type AvatarTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface GamifiedUserProfile {
  // Existing fields (from user_profiles)
  id: string;
  email: string;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
  
  // New gamification fields
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  avatar_tier: AvatarTier;
  avatar_items: string[]; // ['hat_chef', 'badge_burger_king']
  title: string | null; // 'Burger Master', 'Vegan Explorer'
  
  // Calorie tracking
  daily_calorie_goal: number;
  daily_calorie_consumed: number;
  last_calorie_reset: string;
  
  // Budget tracking
  weekly_budget_limit: number;
  weekly_budget_spent: number;
  last_budget_reset: string;
  
  // Stats
  total_restaurants_visited: number;
  total_districts_unlocked: number;
  total_hidden_gems_found: number;
  total_challenges_completed: number;
}

// =====================================================
// 5. ACHIEVEMENTS
// =====================================================
export type AchievementCategory = 'cuisine' | 'district' | 'streak' | 'special' | 'social' | 'budget' | 'health' | 'explorer' | 'foodie' | 'collector';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type RequirementType = 'visit_count' | 'cuisine_type' | 'district_unlock' | 'streak_days' | 'cuisine_visits' | 'district_unlocks' | 'hidden_gems' | 'mystery_unlocks' | 'checkins' | 'unique_visits' | 'budget_weeks' | 'calorie_days';

export interface Achievement {
  id: string; // 'burger_master', 'vegan_explorer'
  name?: string; // Database field
  title?: string; // UI display field
  description: string;
  category: AchievementCategory;
  tier?: AchievementTier;
  icon_emoji?: string; // Database field
  icon?: string; // UI display field
  xp_reward?: number; // Database field
  points?: number; // UI display field
  requirement_type?: RequirementType | null;
  requirement_value?: number | null;
  requirement_data?: Record<string, any> | null;
  is_hidden?: boolean;
  display_order?: number;
  created_at?: string;
  // User progress fields
  unlocked?: boolean;
  unlockedAt?: string | null;
  progress?: number;
  maxProgress?: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  total_required: number;
  unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  achievement?: Achievement;
}

// =====================================================
// 6. CHALLENGES / EVENTS
// =====================================================
export type ChallengeType = 'burger_hunt' | 'vegan_marathon' | 'cuisine_explorer' | 'district_race' | 'budget_challenge' | 'calorie_challenge' | 'seasonal';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface ChallengeRequirement {
  visit_count?: number;
  cuisine?: string;
  within_budget?: number;
  district_id?: string;
  calorie_limit?: number;
  [key: string]: any;
}

export interface ChallengeReward {
  xp?: number;
  badge?: string;
  avatar_item?: string;
  discount?: number;
  [key: string]: any;
}

export interface ActiveChallenge {
  id: string;
  name: string;
  description: string;
  challenge_type: ChallengeType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  requirements: ChallengeRequirement;
  rewards: ChallengeReward;
  icon_emoji: string;
  color_hex: string;
  banner_image_url: string | null;
  difficulty: ChallengeDifficulty;
  total_participants: number;
  total_completions: number;
  created_at: string;
  updated_at: string;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  total_required: number;
  completed: boolean;
  completed_at: string | null;
  rewards_claimed: boolean;
  started_at: string;
  updated_at: string;
  // Relations
  challenge?: ActiveChallenge;
}

// =====================================================
// 7. HIDDEN GEMS
// =====================================================
export type HiddenGemRarity = 'rare' | 'epic' | 'legendary';

export interface HiddenGem {
  id: string;
  restaurant_id: string;
  appears_after_district: string | null;
  required_level: number;
  required_achievement: string | null;
  rarity: HiddenGemRarity;
  spawn_radius: number; // meters
  spawn_chance: number; // percentage
  max_daily_spawns: number;
  xp_reward: number;
  special_rewards: Record<string, any> | null;
  notification_title: string;
  notification_message: string;
  icon_emoji: string;
  times_discovered: number;
  last_spawn_at: string | null;
  is_active: boolean;
  created_at: string;
}

// =====================================================
// 8. MYSTERY MENUS
// =====================================================
export interface MysteryMenu {
  id: string;
  restaurant_id: string;
  dish_name: string;
  description: string | null;
  calories: number | null;
  price: number | null;
  cuisine_type: string | null;
  unlock_condition: string | null;
  required_visits: number;
  required_district: string | null;
  required_achievement: string | null;
  xp_reward: number;
  icon_emoji: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  times_unlocked: number;
  is_active: boolean;
  created_at: string;
}

export interface UserMysteryUnlock {
  id: string;
  user_id: string;
  mystery_menu_id: string;
  unlocked_at: string;
  viewed: boolean;
  ordered: boolean;
  // Relations
  mystery_menu?: MysteryMenu;
}

// =====================================================
// 9. EXTENDED RESTAURANT TYPE
// =====================================================
export type RestaurantRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface GamifiedRestaurant {
  // Existing restaurant fields...
  id: string;
  name: string;
  cuisine: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  rating: number;
  price_level: string;
  image_url: string | null;
  created_at: string;
  
  // New gamification fields
  avg_calories_per_meal: number | null;
  avg_price_per_meal: number | null;
  is_hidden_gem: boolean;
  required_level: number;
  unlock_district: string | null;
  total_checkins: number;
  xp_reward: number; // base XP for check-in
  rarity_tier: RestaurantRarityTier;
}

// =====================================================
// 10. LEADERBOARDS
// =====================================================
export interface LeaderboardEntry {
  user_id: string;
  email: string;
  total_xp: number;
  level: number;
  current_streak: number;
  total_restaurants_visited: number;
  total_districts_unlocked: number;
  avatar_tier: AvatarTier;
  title: string | null;
  rank: number;
  updated_at: string;
}

export interface CityLeaderboardEntry {
  user_id: string;
  email: string;
  city: string;
  total_xp: number;
  level: number;
  current_streak: number;
  rank: number;
  updated_at: string;
}

// =====================================================
// 11. HELPER TYPES
// =====================================================

// For check-in flow
export interface CheckinData {
  restaurant_id: string;
  location_lat: number;
  location_lng: number;
  calories_consumed?: number;
  amount_spent?: number;
  user_notes?: string;
  rating?: number; // 1-5
}

// For XP calculation
export interface XPReward {
  base_xp: number;
  streak_bonus: number;
  first_visit_bonus: number;
  hidden_gem_bonus: number;
  challenge_bonus: number;
  total_xp: number;
}

// For map exploration
export interface MapExplorationState {
  current_district: District | null;
  unlocked_districts: District[];
  nearby_hidden_gems: HiddenGem[];
  fog_cleared_percentage: number;
  can_unlock_next: boolean;
}

// For notifications
export interface GamificationNotification {
  id: string;
  type: 'xp_earned' | 'level_up' | 'achievement_unlocked' | 'hidden_gem_found' | 'challenge_completed' | 'streak_milestone' | 'district_unlocked';
  title: string;
  message: string;
  icon_emoji: string;
  data: Record<string, any>;
  created_at: string;
}

// For avatar customization
export interface AvatarItem {
  id: string;
  name: string;
  category: 'hat' | 'badge' | 'background' | 'effect';
  icon_emoji: string;
  required_level: number;
  required_achievement?: string;
  cost_xp?: number;
}

// For progress tracking
export interface ProgressSummary {
  xp: {
    current: number;
    next_level_required: number;
    progress_percentage: number;
  };
  streak: {
    current: number;
    longest: number;
    days_until_milestone: number;
  };
  stats: {
    restaurants_visited: number;
    districts_unlocked: number;
    hidden_gems_found: number;
    challenges_completed: number;
    achievements_unlocked: number;
  };
  calories: {
    consumed: number;
    goal: number;
    remaining: number;
    progress_percentage: number;
  };
  budget: {
    spent: number;
    limit: number;
    remaining: number;
    progress_percentage: number;
  };
}

// For filtering restaurants by constraints
export interface RestaurantFilters {
  max_calories?: number;
  max_price?: number;
  min_level?: number;
  unlocked_only?: boolean;
  hidden_gems_only?: boolean;
  rarity?: RestaurantRarityTier[];
  cuisine?: string[];
  district_id?: string;
}

// For challenge participation
export interface ChallengeParticipation {
  challenge: ActiveChallenge;
  progress: UserChallengeProgress;
  is_eligible: boolean;
  can_complete_now: boolean;
  completion_percentage: number;
}

// Constants
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 50000,
  // Old format (for backwards compatibility)
  Bronze: 0,
  Silver: 500,
  Gold: 2000,
  Platinum: 5000,
  Diamond: 10000,
};

export const XP_PER_LEVEL = 100; // Base XP formula: level^2 * 100
export const LEVEL_UP_POINTS = 100; // Legacy constant

// =====================================================
// LEGACY TYPES (for backwards compatibility with profile screen)
// =====================================================

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  points: number;
  totalPoints: number;
  streak: number;
  lastCheckIn: string;
  avatar?: string;
  badges: Badge[];
  achievements: LegacyAchievement[];
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface LegacyAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: 'explorer' | 'foodie' | 'social' | 'collector' | 'streaker';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  type: 'daily' | 'weekly' | 'special';
  expiresAt: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: 'discount' | 'badge' | 'feature' | 'boost';
  available: boolean;
}
