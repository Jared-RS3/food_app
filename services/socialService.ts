/**
 * ============================================================================
 * ENHANCED SOCIAL SERVICE - Instagram/TikTok Level
 * ============================================================================
 * 
 * Comprehensive social features including:
 * - User search with autocomplete
 * - Follow/unfollow system
 * - Feed interactions (like, comment, save)
 * - Profile management
 * - Engagement tracking
 * - Instagram link parsing (legacy feature)
 * ============================================================================
 */

import { getStringAsync } from 'expo-clipboard';
import { supabase } from '../lib/supabase';
import { logger } from './logger';
import { socialFeedAlgorithm, FeedPost, ContentBatch } from './socialFeedAlgorithm';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SocialPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  type: 'restaurant' | 'food' | 'review' | 'checkin';
  restaurant_id?: string;
  restaurant_name?: string;
  restaurant_image?: string;
  food_item_id?: string;
  food_item_name?: string;
  food_item_image?: string;
  content?: string;
  rating?: number;
  images?: string[];
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  location?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface FriendActivity {
  id: string;
  friend_name: string;
  friend_avatar?: string;
  action: string;
  restaurant_name?: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  is_private: boolean;
}

export interface SearchResult {
  users: UserProfile[];
  hasMore: boolean;
}

export interface FollowAction {
  success: boolean;
  followers_count: number;
  following_count: number;
}

export interface PostInteraction {
  success: boolean;
  count: number;
}

// ============================================================================
// MAIN SOCIAL SERVICE
// ============================================================================

class SocialService {
  private searchCache: Map<string, SearchResult> = new Map();
  private profileCache: Map<string, UserProfile> = new Map();

  // ==========================================================================
  // ADVANCED FEED OPERATIONS (New)
  // ==========================================================================

  /**
   * Get personalized social feed with intelligent ranking
   */
  async getPersonalizedFeed(userId: string, page: number = 1): Promise<ContentBatch> {
    try {
      logger.info('Fetching personalized feed', {
        component: 'SocialService',
        metadata: { userId, page },
      });

      return await socialFeedAlgorithm.getPersonalizedFeed(userId, { page });
    } catch (error) {
      logger.error('Error fetching personalized feed', error as Error, {
        component: 'SocialService',
      });
      // Fallback to basic feed
      return this.getBasicFeed(userId, page);
    }
  }

  /**
   * Refresh feed (pull-to-refresh)
   */
  async refreshFeed(userId: string): Promise<ContentBatch> {
    try {
      return await socialFeedAlgorithm.refreshFeed(userId);
    } catch (error) {
      logger.error('Error refreshing feed', error as Error);
      return this.getBasicFeed(userId, 1);
    }
  }

  /**
   * Get next batch for infinite scroll
   */
  async getNextBatch(userId: string, page: number): Promise<ContentBatch> {
    try {
      return await socialFeedAlgorithm.getNextBatch(userId, page);
    } catch (error) {
      logger.error('Error fetching next batch', error as Error);
      return this.getBasicFeed(userId, page);
    }
  }

  /**
   * Fallback basic feed (when algorithm fails)
   */
  private async getBasicFeed(userId: string, page: number): Promise<ContentBatch> {
    const basicPosts = await this.getSocialFeed(20);
    return {
      posts: basicPosts as any,
      cursor: null,
      hasMore: false,
      metadata: {
        friendPosts: 0,
        trendingPosts: basicPosts.length,
        discoverPosts: 0,
        totalProcessed: basicPosts.length,
      },
    };
  }

  // ==========================================================================
  // USER SEARCH & DISCOVERY (New)
  // ==========================================================================

  /**
   * Search users by name or username
   */
  async searchUsers(
    currentUserId: string,
    query: string,
    limit: number = 20
  ): Promise<SearchResult> {
    const cacheKey = `${query}_${limit}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    try {
      logger.info('Searching users', {
        component: 'SocialService',
        metadata: { query, limit },
      });

      const searchTerm = `%${query.toLowerCase()}%`;

      const { data: users, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          username,
          bio,
          avatar_url,
          followers_count,
          following_count,
          posts_count,
          is_private
        `)
        .or(`username.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .neq('user_id', currentUserId)
        .limit(limit);

      if (error) throw error;

      const userProfiles = await Promise.all(
        (users || []).map(async (user) => {
          const isFollowing = await this.checkIfFollowing(currentUserId, user.user_id);
          
          return {
            id: user.user_id,
            username: user.username,
            name: user.username,
            bio: user.bio,
            avatar_url: user.avatar_url || 'https://i.pravatar.cc/150',
            followers_count: user.followers_count || 0,
            following_count: user.following_count || 0,
            posts_count: user.posts_count || 0,
            is_following: isFollowing,
            is_private: user.is_private || false,
          };
        })
      );

      const result: SearchResult = {
        users: userProfiles,
        hasMore: userProfiles.length === limit,
      };

      this.searchCache.set(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Error searching users', error as Error);
      return { users: [], hasMore: false };
    }
  }

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(
    currentUserId: string,
    limit: number = 10
  ): Promise<UserProfile[]> {
    try {
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('user_id', currentUserId)
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.transformUserProfiles(users || [], currentUserId);
    } catch (error) {
      logger.error('Error fetching suggested users', error as Error);
      return [];
    }
  }

  // ==========================================================================
  // FOLLOW/UNFOLLOW OPERATIONS (New)
  // ==========================================================================

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<FollowAction> {
    try {
      logger.info('Following user', {
        component: 'SocialService',
        metadata: { followerId, followingId },
      });

      const { error: followError } = await supabase
        .from('user_follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
        });

      if (followError) throw followError;

      await this.trackInteraction(followerId, followingId, 'follow');

      const counts = await this.getFollowCounts(followerId);

      this.profileCache.delete(followerId);
      this.profileCache.delete(followingId);

      return {
        success: true,
        ...counts,
      };
    } catch (error) {
      logger.error('Error following user', error as Error);
      return {
        success: false,
        followers_count: 0,
        following_count: 0,
      };
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<FollowAction> {
    try {
      logger.info('Unfollowing user', {
        component: 'SocialService',
        metadata: { followerId, followingId },
      });

      const { error: unfollowError } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (unfollowError) throw unfollowError;

      const counts = await this.getFollowCounts(followerId);

      this.profileCache.delete(followerId);
      this.profileCache.delete(followingId);

      return {
        success: true,
        ...counts,
      };
    } catch (error) {
      logger.error('Error unfollowing user', error as Error);
      return {
        success: false,
        followers_count: 0,
        following_count: 0,
      };
    }
  }

  /**
   * Check if user is following another user
   */
  async checkIfFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return !!data;
    } catch (error) {
      logger.error('Error checking follow status', error as Error);
      return false;
    }
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, limit: number = 50): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          user_profiles!user_follows_follower_id_fkey(*)
        `)
        .eq('following_id', userId)
        .limit(limit);

      if (error) throw error;

      return this.transformUserProfiles(
        data?.map((f: any) => f.user_profiles) || [],
        userId
      );
    } catch (error) {
      logger.error('Error fetching followers', error as Error);
      return [];
    }
  }

  /**
   * Get user's following
   */
  async getFollowing(userId: string, limit: number = 50): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          user_profiles!user_follows_following_id_fkey(*)
        `)
        .eq('follower_id', userId)
        .limit(limit);

      if (error) throw error;

      return this.transformUserProfiles(
        data?.map((f: any) => f.user_profiles) || [],
        userId
      );
    } catch (error) {
      logger.error('Error fetching following', error as Error);
      return [];
    }
  }

  /**
   * Get follow counts
   */
  private async getFollowCounts(
    userId: string
  ): Promise<{ followers_count: number; following_count: number }> {
    const { data } = await supabase
      .from('user_profiles')
      .select('followers_count, following_count')
      .eq('user_id', userId)
      .single();

    return {
      followers_count: data?.followers_count || 0,
      following_count: data?.following_count || 0,
    };
  }

  // ==========================================================================
  // PROFILE OPERATIONS (New)
  // ==========================================================================

  /**
   * Get user profile
   */
  async getUserProfile(userId: string, currentUserId: string): Promise<UserProfile | null> {
    if (this.profileCache.has(userId)) {
      return this.profileCache.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const isFollowing = await this.checkIfFollowing(currentUserId, userId);

      const profile: UserProfile = {
        id: data.user_id,
        username: data.username,
        name: data.username,
        bio: data.bio,
        avatar_url: data.avatar_url || 'https://i.pravatar.cc/150',
        followers_count: data.followers_count || 0,
        following_count: data.following_count || 0,
        posts_count: data.posts_count || 0,
        is_following: isFollowing,
        is_private: data.is_private || false,
      };

      this.profileCache.set(userId, profile);

      return profile;
    } catch (error) {
      logger.error('Error fetching user profile', error as Error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'username' | 'bio' | 'avatar_url'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      this.profileCache.delete(userId);

      return true;
    } catch (error) {
      logger.error('Error updating profile', error as Error);
      return false;
    }
  }

  // ==========================================================================
  // ENGAGEMENT TRACKING (New)
  // ==========================================================================

  /**
   * Track user interaction for affinity scoring
   */
  private async trackInteraction(
    userId: string,
    targetUserId: string,
    interactionType: 'like' | 'comment' | 'share' | 'profile_view' | 'follow',
    postId?: string
  ): Promise<void> {
    try {
      await supabase.from('user_interactions').insert({
        user_id: userId,
        target_user_id: targetUserId,
        interaction_type: interactionType,
        post_id: postId,
      });
    } catch (error) {
      logger.warn('Failed to track interaction', {
        component: 'SocialService',
        metadata: { userId, targetUserId, interactionType },
      });
    }
  }

  // ==========================================================================
  // UTILITY FUNCTIONS (New)
  // ==========================================================================

  /**
   * Transform raw user profiles
   */
  private async transformUserProfiles(
    rawProfiles: any[],
    currentUserId: string
  ): Promise<UserProfile[]> {
    return Promise.all(
      rawProfiles.map(async (profile) => {
        const isFollowing = await this.checkIfFollowing(currentUserId, profile.user_id);

        return {
          id: profile.user_id,
          username: profile.username,
          name: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url || 'https://i.pravatar.cc/150',
          followers_count: profile.followers_count || 0,
          following_count: profile.following_count || 0,
          posts_count: profile.posts_count || 0,
          is_following: isFollowing,
          is_private: profile.is_private || false,
        };
      })
    );
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.searchCache.clear();
    this.profileCache.clear();
    socialFeedAlgorithm.clearCache();
  }

  // ==========================================================================
  // LEGACY METHODS (Preserved for compatibility)
  // ==========================================================================
  // Parse Instagram link and extract restaurant info
  async parseInstagramLink(url: string): Promise<{
    username: string;
    profile_url: string;
    bio?: string;
    name?: string;
  } | null> {
    try {
      // Clean the URL - remove query parameters and fragments
      const cleanUrl = url.split('?')[0].split('#')[0];

      // Extract Instagram username from various URL formats
      const patterns = [
        /instagram\.com\/([^/?#]+)/, // Profile URL with query params
        /instagram\.com\/p\/([^/?#]+)/, // Post URL
        /instagr\.am\/([^/?#]+)/, // Short URL
        /instagram\.com\/reel\/([^/?#]+)/, // Reel URL
        /instagram\.com\/stories\/([^/?#]+)/, // Stories URL
      ];

      let username = '';
      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match) {
          username = match[1];
          break;
        }
      }

      if (!username) {
        throw new Error('Invalid Instagram URL');
      }

      // Format the name: remove underscores, capitalize first letters
      const formattedName = username
        .replace(/_/g, ' ')
        .replace(/\./g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // In a real implementation, you'd call Instagram's API
      // For now, we'll return the username and construct a basic profile
      return {
        username,
        profile_url: `https://instagram.com/${username}`,
        name: formattedName,
      };
    } catch (error) {
      console.error('Error parsing Instagram link:', error);
      return null;
    }
  }

  // Import restaurant from Instagram link
  async importFromInstagram(instagramUrl: string): Promise<any> {
    try {
      const profileInfo = await this.parseInstagramLink(instagramUrl);

      if (!profileInfo) {
        throw new Error('Could not parse Instagram link');
      }

      // Create a restaurant entry from Instagram profile
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert({
          name: profileInfo.name || profileInfo.username,
          instagram_handle: profileInfo.username,
          instagram_url: profileInfo.profile_url,
          description:
            profileInfo.bio || `Follow @${profileInfo.username} on Instagram`,
          source: 'instagram_import',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return restaurant;
    } catch (error) {
      console.error('Error importing from Instagram:', error);
      throw error;
    }
  }

  // Get clipboard content (for Instagram links)
  async getClipboardContent(): Promise<string> {
    try {
      const text = await getStringAsync();
      return text;
    } catch (error) {
      console.error('Error getting clipboard:', error);
      return '';
    }
  }

  // Check if clipboard has Instagram link
  async hasInstagramLinkInClipboard(): Promise<boolean> {
    const text = await this.getClipboardContent();
    return text.includes('instagram.com') || text.includes('instagr.am');
  }

  // Get social feed (friends' activities)
  async getSocialFeed(limit: number = 20): Promise<SocialPost[]> {
    try {
      // Mock data for now - in real app, fetch from Supabase
      const mockFeed: SocialPost[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Sarah Chen',
          user_avatar: 'https://i.pravatar.cc/150?img=1',
          type: 'restaurant',
          restaurant_id: 'featured-1',
          restaurant_name: 'The Test Kitchen',
          restaurant_image:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
          content:
            'Finally tried this place! The tasting menu was incredible 🍽️',
          rating: 5,
          likes_count: 24,
          comments_count: 5,
          is_liked: false,
          is_bookmarked: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: 'Woodstock, Cape Town',
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Marcus Johnson',
          user_avatar: 'https://i.pravatar.cc/150?img=12',
          type: 'food',
          restaurant_id: 'featured-3',
          restaurant_name: 'Mama Africa',
          food_item_name: 'Bunny Chow',
          food_item_image:
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
          content: 'Best bunny chow in Cape Town! 🔥',
          rating: 5,
          likes_count: 42,
          comments_count: 8,
          is_liked: true,
          is_bookmarked: true,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          location: 'Long Street',
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Emma Williams',
          user_avatar: 'https://i.pravatar.cc/150?img=5',
          type: 'checkin',
          restaurant_id: 'featured-2',
          restaurant_name: 'La Colombe',
          restaurant_image:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
          content: 'Celebrating our anniversary here 🥂💕',
          rating: 5,
          likes_count: 67,
          comments_count: 12,
          is_liked: false,
          is_bookmarked: false,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          location: 'Constantia',
        },
      ];

      return mockFeed;
    } catch (error) {
      console.error('Error fetching social feed:', error);
      return [];
    }
  }

  // Like a post
  async likePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  // Unlike a post
  async unlikePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  // Bookmark a post
  async bookmarkPost(postId: string): Promise<void> {
    try {
      const { error } = await supabase.from('post_bookmarks').insert({
        post_id: postId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error bookmarking post:', error);
      throw error;
    }
  }

  // Remove bookmark
  async removeBookmark(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  // Add comment to post
  async addComment(postId: string, content: string): Promise<Comment> {
    try {
      const user = (await supabase.auth.getUser()).data.user;

      const { data: comment, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user?.id,
          content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get comments for a post
  async getComments(postId: string): Promise<Comment[]> {
    try {
      // Mock comments for now
      const mockComments: Comment[] = [
        {
          id: '1',
          post_id: postId,
          user_id: 'user4',
          user_name: 'Alex Brown',
          user_avatar: 'https://i.pravatar.cc/150?img=8',
          content: 'I need to try this place! 😍',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          post_id: postId,
          user_id: 'user5',
          user_name: 'Lisa Park',
          user_avatar: 'https://i.pravatar.cc/150?img=9',
          content: "Let's go together next week!",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ];

      return mockComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Share restaurant to feed
  async shareRestaurant(
    restaurantId: string,
    restaurantName: string,
    restaurantImage: string,
    content?: string,
    rating?: number
  ): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;

      const { error } = await supabase.from('social_posts').insert({
        user_id: user?.id,
        type: 'restaurant',
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        restaurant_image: restaurantImage,
        content: content || `Just discovered ${restaurantName}!`,
        rating,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sharing restaurant:', error);
      throw error;
    }
  }

  // Share food item to feed
  async shareFoodItem(
    restaurantId: string,
    restaurantName: string,
    foodItemName: string,
    foodItemImage: string,
    content?: string,
    rating?: number
  ): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;

      const { error } = await supabase.from('social_posts').insert({
        user_id: user?.id,
        type: 'food',
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        food_item_name: foodItemName,
        food_item_image: foodItemImage,
        content: content || `Amazing ${foodItemName} at ${restaurantName}!`,
        rating,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sharing food item:', error);
      throw error;
    }
  }

  // Get friend activities
  async getFriendActivities(limit: number = 10): Promise<FriendActivity[]> {
    try {
      const mockActivities: FriendActivity[] = [
        {
          id: '1',
          friend_name: 'Sarah Chen',
          friend_avatar: 'https://i.pravatar.cc/150?img=1',
          action: 'saved',
          restaurant_name: 'The Test Kitchen',
          timestamp: '2h ago',
        },
        {
          id: '2',
          friend_name: 'Marcus Johnson',
          friend_avatar: 'https://i.pravatar.cc/150?img=12',
          action: 'reviewed',
          restaurant_name: 'Mama Africa',
          timestamp: '5h ago',
        },
        {
          id: '3',
          friend_name: 'Emma Williams',
          friend_avatar: 'https://i.pravatar.cc/150?img=5',
          action: 'checked in at',
          restaurant_name: 'La Colombe',
          timestamp: '1d ago',
        },
      ];

      return mockActivities;
    } catch (error) {
      console.error('Error fetching friend activities:', error);
      return [];
    }
  }
}

export const socialService = new SocialService();
