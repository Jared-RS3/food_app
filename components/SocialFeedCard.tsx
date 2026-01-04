import { router } from 'expo-router';
import { Bookmark, Heart, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { SocialPost } from '../services/socialService';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;

interface SocialFeedCardProps {
  post: SocialPost;
  onFavorite?: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onPress?: (post: SocialPost) => void;
}

export default function SocialFeedCard({
  post,
  onFavorite,
  onBookmark,
  onPress,
}: SocialFeedCardProps) {
  const [isFavorited, setIsFavorited] = useState(post.is_liked);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(post.id);
  };

  const handleUserPress = () => {
    // Navigate to friend's profile
    router.push(
      `/friend-profile?userId=${post.user_id}&userName=${encodeURIComponent(
        post.user_name
      )}`
    );
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  return (
    <View style={styles.card}>
      {/* User Header - Clickable */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleUserPress}
        activeOpacity={0.7}
      >
        <View style={styles.userInfo}>
          <Image
            source={{ uri: post.user_avatar || 'https://i.pravatar.cc/150' }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.user_name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.timeAgo}>{getTimeAgo(post.created_at)}</Text>
              {post.location && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <MapPin size={12} color={COLORS.gray[500]} />
                  <Text style={styles.location}>{post.location}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Content */}
      {post.content && <Text style={styles.content}>{post.content}</Text>}

      {/* Rating */}
      {post.rating && (
        <Text style={styles.rating}>{renderStars(post.rating)}</Text>
      )}

      {/* Image */}
      <TouchableOpacity
        onPress={() => {
          if (onPress) {
            onPress(post);
          } else if (post.restaurant_id) {
            router.push(`/restaurant/${post.restaurant_id}`);
          }
        }}
        activeOpacity={0.9}
      >
        <Image
          source={{
            uri:
              post.food_item_image ||
              post.restaurant_image ||
              'https://via.placeholder.com/400x300',
          }}
          style={styles.image}
        />

        {/* Restaurant Tag Overlay */}
        <View style={styles.restaurantTag}>
          <Text style={styles.restaurantName}>
            {post.food_item_name
              ? `${post.food_item_name} @ ${post.restaurant_name}`
              : post.restaurant_name}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons - Only Favorites and Bookmarks */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          {onFavorite && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavorite}
            >
              <Heart
                size={26}
                color={isFavorited ? COLORS.error : COLORS.gray[700]}
                fill={isFavorited ? COLORS.error : 'none'}
                strokeWidth={1.5}
              />
              <Text
                style={[
                  styles.actionText,
                  isFavorited && { color: COLORS.error, fontWeight: '700' },
                ]}
              >
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmark}
          activeOpacity={0.7}
        >
          <Bookmark
            size={26}
            color={isBookmarked ? COLORS.primary : COLORS.gray[700]}
            fill={isBookmarked ? COLORS.primary : 'none'}
            strokeWidth={1.5}
          />
          <Text
            style={[
              styles.actionText,
              isBookmarked && { color: COLORS.primary, fontWeight: '700' },
            ]}
          >
            {isBookmarked ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[200],
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md + 1,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: 2,
  },
  timeAgo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  dot: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
  },
  location: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  content: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rating: {
    fontSize: FONT_SIZES.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: COLORS.gray[100],
  },
  restaurantTag: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    backdropFilter: 'blur(10px)',
  },
  restaurantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
});
