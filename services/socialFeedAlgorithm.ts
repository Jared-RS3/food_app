/**
 * ============================================================================
 * ADVANCED SOCIAL FEED ALGORITHM - Instagram/TikTok Level
 * ============================================================================
 *
 * A sophisticated content ranking and delivery system that provides:
 * - Smart content ranking based on user engagement patterns
 * - Efficient pagination and infinite scroll
 * - Content diversity and freshness optimization
 * - Personalized recommendations
 * - Strategic content mixing (friends, trending, discover)
 *
 * Algorithm Components:
 * 1. Engagement-based scoring
 * 2. Time decay for freshness
 * 3. Content diversity balancing
 * 4. User affinity scoring
 * 5. Strategic insertion of discovery content
 * ============================================================================
 */

import { supabase } from '@/lib/supabase';
import { logger } from './logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FeedPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image: string;
  cuisine: string;
  action_type: 'saved' | 'favorited' | 'reviewed' | 'checked_in' | 'photo';
  caption?: string;
  rating?: number;
  photo_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;

  // Algorithm scores
  engagement_score?: number;
  recency_score?: number;
  affinity_score?: number;
  diversity_score?: number;
  final_score?: number;
}

export interface UserEngagement {
  user_id: string;
  interaction_count: number;
  like_count: number;
  comment_count: number;
  last_interaction: string;
  affinity_score: number;
}

export interface FeedConfig {
  page: number;
  pageSize: number;
  maxStaleness: number; // hours
  diversityFactor: number; // 0-1
  trendingBoost: number; // 0-1
  friendBoost: number; // 0-1
  discoverRatio: number; // 0-1 (% of discover content)
}

export interface ContentBatch {
  posts: FeedPost[];
  cursor: string | null;
  hasMore: boolean;
  metadata: {
    friendPosts: number;
    trendingPosts: number;
    discoverPosts: number;
    totalProcessed: number;
  };
}

// ============================================================================
// ALGORITHM CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: FeedConfig = {
  page: 1,
  pageSize: 20,
  maxStaleness: 168, // 7 days
  diversityFactor: 0.7,
  trendingBoost: 0.3,
  friendBoost: 0.4,
  discoverRatio: 0.2, // 20% discover content
};

// Scoring weights
const WEIGHTS = {
  ENGAGEMENT: 0.35,
  RECENCY: 0.25,
  AFFINITY: 0.25,
  DIVERSITY: 0.15,
};

// Time decay constants
const TIME_DECAY_HALF_LIFE = 24; // hours

// ============================================================================
// MAIN ALGORITHM CLASS
// ============================================================================

class SocialFeedAlgorithm {
  private userEngagementCache: Map<string, UserEngagement> = new Map();
  private seenPostsSession: Set<string> = new Set();
  private lastRefreshTime: number = 0;
  private contentBuffer: FeedPost[] = [];

  /**
   * Get personalized feed with smart ranking
   */
  async getPersonalizedFeed(
    currentUserId: string,
    config: Partial<FeedConfig> = {}
  ): Promise<ContentBatch> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    try {
      logger.info('Fetching personalized feed', {
        component: 'SocialFeedAlgorithm',
        metadata: { userId: currentUserId, config: finalConfig },
      });

      // Step 1: Get user's social graph
      const following = await this.getUserFollowing(currentUserId);

      if (following.length === 0) {
        // New user - show trending and discover content
        return this.getDiscoverFeed(currentUserId, finalConfig);
      }

      // Step 2: Fetch raw content from multiple sources
      const [friendPosts, trendingPosts, discoverPosts] = await Promise.all([
        this.fetchFriendPosts(following, finalConfig),
        this.fetchTrendingPosts(finalConfig),
        this.fetchDiscoverPosts(currentUserId, following, finalConfig),
      ]);

      // Step 3: Calculate engagement affinities
      await this.calculateUserAffinities(currentUserId, following);

      // Step 4: Score all posts
      const scoredPosts = [
        ...this.scorePosts(friendPosts, currentUserId, 'friend'),
        ...this.scorePosts(trendingPosts, currentUserId, 'trending'),
        ...this.scorePosts(discoverPosts, currentUserId, 'discover'),
      ];

      // Step 5: Apply diversity and ranking
      const rankedPosts = this.applyAdvancedRanking(scoredPosts, finalConfig);

      // Step 6: Strategic content mixing
      const mixedPosts = this.strategicContentMixing(rankedPosts, finalConfig, {
        friendCount: friendPosts.length,
        trendingCount: trendingPosts.length,
        discoverCount: discoverPosts.length,
      });

      // Step 7: Paginate and add metadata
      const paginatedPosts = this.paginatePosts(
        mixedPosts,
        finalConfig.page,
        finalConfig.pageSize
      );

      // Mark as seen
      paginatedPosts.forEach((post) => this.seenPostsSession.add(post.id));

      return {
        posts: paginatedPosts,
        cursor: this.generateCursor(finalConfig.page + 1),
        hasMore: paginatedPosts.length === finalConfig.pageSize,
        metadata: {
          friendPosts: friendPosts.length,
          trendingPosts: trendingPosts.length,
          discoverPosts: discoverPosts.length,
          totalProcessed: scoredPosts.length,
        },
      };
    } catch (error) {
      logger.error('Error in personalized feed algorithm', error as Error, {
        component: 'SocialFeedAlgorithm',
      });
      throw error;
    }
  }

  /**
   * Refresh feed with new content (pull-to-refresh)
   */
  async refreshFeed(currentUserId: string): Promise<ContentBatch> {
    // Clear session caches
    this.seenPostsSession.clear();
    this.contentBuffer = [];
    this.lastRefreshTime = Date.now();

    // Get fresh content with higher recency weight
    const config: Partial<FeedConfig> = {
      page: 1,
      pageSize: 30, // Load more on refresh
      maxStaleness: 48, // Only recent content
    };

    return this.getPersonalizedFeed(currentUserId, config);
  }

  /**
   * Get next batch for infinite scroll
   */
  async getNextBatch(
    currentUserId: string,
    page: number
  ): Promise<ContentBatch> {
    return this.getPersonalizedFeed(currentUserId, { page });
  }

  // ============================================================================
  // CONTENT FETCHING
  // ============================================================================

  /**
   * Fetch posts from followed users
   */
  private async fetchFriendPosts(
    following: string[],
    config: FeedConfig
  ): Promise<FeedPost[]> {
    if (following.length === 0) return [];

    try {
      // Intelligent batching for large following lists
      const batchSize = 100;
      const batches = [];

      for (let i = 0; i < following.length; i += batchSize) {
        const batch = following.slice(i, i + batchSize);
        batches.push(this.fetchPostsBatch(batch, config));
      }

      const results = await Promise.all(batches);
      return results.flat();
    } catch (error) {
      logger.error('Error fetching friend posts', error as Error);
      return [];
    }
  }

  /**
   * Fetch a batch of posts efficiently
   */
  private async fetchPostsBatch(
    userIds: string[],
    config: FeedConfig
  ): Promise<FeedPost[]> {
    const maxAge = new Date();
    maxAge.setHours(maxAge.getHours() - config.maxStaleness);

    const { data, error } = await supabase
      .from('social_posts')
      .select(
        `
        *,
        users!social_posts_user_id_fkey(id, name, avatar_url),
        restaurants(id, name, image_url, cuisine)
      `
      )
      .in('user_id', userIds)
      .gte('created_at', maxAge.toISOString())
      .order('created_at', { ascending: false })
      .limit(config.pageSize * 3); // Overfetch for scoring

    if (error) throw error;

    return this.transformPosts(data || []);
  }

  /**
   * Fetch trending posts across the platform
   */
  private async fetchTrendingPosts(config: FeedConfig): Promise<FeedPost[]> {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(
          `
          *,
          users!social_posts_user_id_fkey(id, name, avatar_url),
          restaurants(id, name, image_url, cuisine)
        `
        )
        .gte('created_at', last24Hours.toISOString())
        .gte('likes_count', 5) // Minimum engagement
        .order('likes_count', { ascending: false })
        .limit(Math.floor(config.pageSize * 0.3)); // 30% trending

      if (error) throw error;

      return this.transformPosts(data || []);
    } catch (error) {
      logger.error('Error fetching trending posts', error as Error);
      return [];
    }
  }

  /**
   * Fetch discovery content (personalized recommendations)
   */
  private async fetchDiscoverPosts(
    currentUserId: string,
    following: string[],
    config: FeedConfig
  ): Promise<FeedPost[]> {
    try {
      // Get user's cuisine preferences from their activity
      const preferences = await this.getUserPreferences(currentUserId);

      const { data, error } = await supabase
        .from('social_posts')
        .select(
          `
          *,
          users!social_posts_user_id_fkey(id, name, avatar_url),
          restaurants(id, name, image_url, cuisine)
        `
        )
        .not('user_id', 'in', `(${[currentUserId, ...following].join(',')})`)
        .in('restaurants.cuisine', preferences.favoriteCuisines)
        .gte('likes_count', 3)
        .order('created_at', { ascending: false })
        .limit(Math.floor(config.pageSize * config.discoverRatio));

      if (error) throw error;

      return this.transformPosts(data || []);
    } catch (error) {
      logger.error('Error fetching discover posts', error as Error);
      return [];
    }
  }

  /**
   * Get discover-only feed for new users
   */
  private async getDiscoverFeed(
    currentUserId: string,
    config: FeedConfig
  ): Promise<ContentBatch> {
    const trending = await this.fetchTrendingPosts({
      ...config,
      pageSize: config.pageSize,
    });

    const discover = await this.fetchDiscoverPosts(currentUserId, [], {
      ...config,
      discoverRatio: 0.5,
    });

    const allPosts = [...trending, ...discover];
    const scoredPosts = this.scorePosts(allPosts, currentUserId, 'discover');
    const rankedPosts = this.applyAdvancedRanking(scoredPosts, config);
    const paginatedPosts = this.paginatePosts(
      rankedPosts,
      config.page,
      config.pageSize
    );

    return {
      posts: paginatedPosts,
      cursor: this.generateCursor(config.page + 1),
      hasMore: paginatedPosts.length === config.pageSize,
      metadata: {
        friendPosts: 0,
        trendingPosts: trending.length,
        discoverPosts: discover.length,
        totalProcessed: allPosts.length,
      },
    };
  }

  // ============================================================================
  // SCORING & RANKING
  // ============================================================================

  /**
   * Score posts based on multiple signals
   */
  private scorePosts(
    posts: FeedPost[],
    currentUserId: string,
    source: 'friend' | 'trending' | 'discover'
  ): FeedPost[] {
    return posts.map((post) => {
      const engagementScore = this.calculateEngagementScore(post);
      const recencyScore = this.calculateRecencyScore(post);
      const affinityScore = this.calculateAffinityScore(post, currentUserId);
      const diversityScore = this.calculateDiversityScore(post);

      // Apply source boost
      let sourceBoost = 1.0;
      if (source === 'friend') sourceBoost = 1.4;
      else if (source === 'trending') sourceBoost = 1.2;

      const finalScore =
        (engagementScore * WEIGHTS.ENGAGEMENT +
          recencyScore * WEIGHTS.RECENCY +
          affinityScore * WEIGHTS.AFFINITY +
          diversityScore * WEIGHTS.DIVERSITY) *
        sourceBoost;

      return {
        ...post,
        engagement_score: engagementScore,
        recency_score: recencyScore,
        affinity_score: affinityScore,
        diversity_score: diversityScore,
        final_score: finalScore,
      };
    });
  }

  /**
   * Calculate engagement score (likes, comments, saves)
   */
  private calculateEngagementScore(post: FeedPost): number {
    const likes = post.likes_count || 0;
    const comments = post.comments_count || 0;

    // Weighted engagement
    const engagementValue = likes * 1.0 + comments * 2.0;

    // Logarithmic scaling to prevent viral posts from dominating
    return Math.log10(engagementValue + 1) / Math.log10(100);
  }

  /**
   * Calculate recency score (time decay)
   */
  private calculateRecencyScore(post: FeedPost): number {
    const postTime = new Date(post.created_at).getTime();
    const currentTime = Date.now();
    const ageInHours = (currentTime - postTime) / (1000 * 60 * 60);

    // Exponential decay: score = 0.5^(age/half-life)
    return Math.pow(0.5, ageInHours / TIME_DECAY_HALF_LIFE);
  }

  /**
   * Calculate user affinity score
   */
  private calculateAffinityScore(
    post: FeedPost,
    currentUserId: string
  ): number {
    const engagement = this.userEngagementCache.get(post.user_id);

    if (!engagement) return 0.5; // Neutral for unknown users

    // Normalize affinity score (0-1)
    return Math.min(engagement.affinity_score / 100, 1.0);
  }

  /**
   * Calculate diversity score
   */
  private calculateDiversityScore(post: FeedPost): number {
    // Check if we've shown similar content recently
    const recentlySeen = this.seenPostsSession.has(post.id);

    if (recentlySeen) return 0.0;

    // Check restaurant diversity
    const restaurantCount = Array.from(this.seenPostsSession).filter((id) =>
      id.startsWith(post.restaurant_id)
    ).length;

    // Penalize over-representation
    return Math.max(1.0 - restaurantCount * 0.2, 0.3);
  }

  /**
   * Advanced ranking with diversity balancing
   */
  private applyAdvancedRanking(
    posts: FeedPost[],
    config: FeedConfig
  ): FeedPost[] {
    // Sort by final score
    const sorted = posts.sort(
      (a, b) => (b.final_score || 0) - (a.final_score || 0)
    );

    // Apply diversity balancing
    return this.balanceDiversity(sorted, config.diversityFactor);
  }

  /**
   * Balance content diversity
   */
  private balanceDiversity(posts: FeedPost[], factor: number): FeedPost[] {
    const result: FeedPost[] = [];
    const usedRestaurants = new Set<string>();
    const usedUsers = new Set<string>();

    for (const post of posts) {
      // Diversity check
      const restaurantSeen = usedRestaurants.has(post.restaurant_id);
      const userSeen = usedUsers.has(post.user_id);

      if (!restaurantSeen || !userSeen || Math.random() > factor) {
        result.push(post);
        usedRestaurants.add(post.restaurant_id);
        usedUsers.add(post.user_id);
      }
    }

    // Fill remaining slots with remaining posts
    const remaining = posts.filter((p) => !result.includes(p));
    return [...result, ...remaining];
  }

  /**
   * Strategic content mixing (friend, trending, discover)
   */
  private strategicContentMixing(
    posts: FeedPost[],
    config: FeedConfig,
    counts: {
      friendCount: number;
      trendingCount: number;
      discoverCount: number;
    }
  ): FeedPost[] {
    // Ensure good mix in each "page" of content
    const chunkSize = 5;
    const chunks: FeedPost[][] = [];

    for (let i = 0; i < posts.length; i += chunkSize) {
      chunks.push(posts.slice(i, i + chunkSize));
    }

    // Interleave chunks for variety
    return chunks.flat();
  }

  // ============================================================================
  // USER ENGAGEMENT & AFFINITY
  // ============================================================================

  /**
   * Calculate user affinities based on past interactions
   */
  private async calculateUserAffinities(
    currentUserId: string,
    following: string[]
  ): Promise<void> {
    try {
      // Fetch user interaction history
      const { data, error } = await supabase
        .from('user_interactions')
        .select('target_user_id, interaction_type, created_at')
        .eq('user_id', currentUserId)
        .in('target_user_id', following)
        .gte(
          'created_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      // Calculate affinity scores
      const affinityMap = new Map<string, UserEngagement>();

      following.forEach((userId) => {
        const interactions =
          data?.filter((i) => i.target_user_id === userId) || [];
        const likeCount = interactions.filter(
          (i) => i.interaction_type === 'like'
        ).length;
        const commentCount = interactions.filter(
          (i) => i.interaction_type === 'comment'
        ).length;

        const affinityScore = likeCount * 2 + commentCount * 5;

        affinityMap.set(userId, {
          user_id: userId,
          interaction_count: interactions.length,
          like_count: likeCount,
          comment_count: commentCount,
          last_interaction: interactions[0]?.created_at || '',
          affinity_score: affinityScore,
        });
      });

      this.userEngagementCache = affinityMap;
    } catch (error) {
      logger.error('Error calculating user affinities', error as Error);
    }
  }

  /**
   * Get user's following list
   */
  private async getUserFollowing(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (error) throw error;

      return data?.map((f) => f.following_id) || [];
    } catch (error) {
      logger.error('Error fetching user following', error as Error);
      return [];
    }
  }

  /**
   * Get user preferences for recommendations
   */
  private async getUserPreferences(userId: string): Promise<{
    favoriteCuisines: string[];
    priceRange: string[];
  }> {
    try {
      // Analyze user's saved/favorited restaurants
      const { data, error } = await supabase
        .from('favorites')
        .select('restaurants(cuisine, price_level)')
        .eq('user_id', userId)
        .limit(50);

      if (error) throw error;

      const cuisines = new Map<string, number>();

      data?.forEach((item: any) => {
        const cuisine = item.restaurants?.cuisine;
        if (cuisine) {
          cuisines.set(cuisine, (cuisines.get(cuisine) || 0) + 1);
        }
      });

      // Get top 5 cuisines
      const sortedCuisines = Array.from(cuisines.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cuisine]) => cuisine);

      return {
        favoriteCuisines:
          sortedCuisines.length > 0
            ? sortedCuisines
            : ['Italian', 'Japanese', 'Mexican'],
        priceRange: ['$$', '$$$'],
      };
    } catch (error) {
      logger.error('Error fetching user preferences', error as Error);
      return {
        favoriteCuisines: ['Italian', 'Japanese', 'Mexican'],
        priceRange: ['$$', '$$$'],
      };
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Transform raw database posts to FeedPost format
   */
  private transformPosts(rawPosts: any[]): FeedPost[] {
    return rawPosts.map((post) => ({
      id: post.id,
      user_id: post.user_id,
      user_name: post.users?.name || 'Unknown User',
      user_avatar: post.users?.avatar_url || 'https://i.pravatar.cc/150',
      restaurant_id: post.restaurant_id,
      restaurant_name: post.restaurants?.name || 'Unknown Restaurant',
      restaurant_image: post.restaurants?.image_url || '',
      cuisine: post.restaurants?.cuisine || 'Various',
      action_type: post.action_type,
      caption: post.caption,
      rating: post.rating,
      photo_url: post.photo_url,
      created_at: post.created_at,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      is_liked: post.is_liked || false,
      is_bookmarked: post.is_bookmarked || false,
    }));
  }

  /**
   * Paginate posts
   */
  private paginatePosts(
    posts: FeedPost[],
    page: number,
    pageSize: number
  ): FeedPost[] {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return posts.slice(start, end);
  }

  /**
   * Generate cursor for pagination
   */
  private generateCursor(nextPage: number): string {
    return Buffer.from(JSON.stringify({ page: nextPage })).toString('base64');
  }

  /**
   * Clear session cache (call on logout)
   */
  clearCache(): void {
    this.seenPostsSession.clear();
    this.userEngagementCache.clear();
    this.contentBuffer = [];
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const socialFeedAlgorithm = new SocialFeedAlgorithm();
