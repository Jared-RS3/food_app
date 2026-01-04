import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Heart, MessageCircle, Bookmark, MapPin, Star, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { SharedPlace } from '@/types/social';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

interface SharedPlaceCardProps {
  place: SharedPlace;
  onPress?: () => void;
  onReaction?: (reactionType: string) => void;
  onWantToGo?: () => void;
  onOpenComments?: () => void;
}

export const SharedPlaceCard: React.FC<SharedPlaceCardProps> = ({
  place,
  onPress,
  onReaction,
  onWantToGo,
  onOpenComments,
}) => {
  const isWantToGo = place.wantToGo.includes('current-user-id'); // TODO: Use actual current user ID
  const hasVisited = place.visitedBy.includes('current-user-id');

  const timeAgo = getTimeAgo(place.sharedAt);

  const reactionEmojis = ['❤️', '🔥', '😋', '👀', '🤤', '🎯', '✨'];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: place.restaurant.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />

        {/* Price & Rating Badge */}
        <View style={styles.badges}>
          {place.restaurant.rating && (
            <View style={styles.badge}>
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text style={styles.badgeText}>{place.restaurant.rating}</Text>
            </View>
          )}
          {place.restaurant.priceLevel && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {'$'.repeat(place.restaurant.priceLevel)}
              </Text>
            </View>
          )}
        </View>

        {/* Visited Badge */}
        {hasVisited && (
          <View style={styles.visitedBadge}>
            <Text style={styles.visitedBadgeText}>✓ Visited</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {place.sharedBy.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{place.sharedBy.name}</Text>
            <Text style={styles.timestamp}>shared {timeAgo}</Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{place.restaurant.name}</Text>
          <View style={styles.restaurantMeta}>
            <Text style={styles.cuisine}>{place.restaurant.cuisine}</Text>
            <Text style={styles.dot}>•</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={theme.colors.textSecondary} />
              <Text style={styles.location} numberOfLines={1}>
                {place.restaurant.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Note */}
        {place.note && (
          <Text style={styles.note} numberOfLines={2}>
            {place.note}
          </Text>
        )}

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <View style={styles.tags}>
            {place.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reactions */}
        {place.reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            <View style={styles.reactionsList}>
              {place.reactions.slice(0, 3).map((reaction, index) => (
                <Text key={index} style={styles.reactionEmoji}>
                  {reaction.type}
                </Text>
              ))}
            </View>
            <Text style={styles.reactionsCount}>
              {place.reactions.length} reaction{place.reactions.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Action Bar */}
        <View style={styles.actionBar}>
          {/* Quick Reactions */}
          <View style={styles.quickReactions}>
            {reactionEmojis.slice(0, 4).map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionButton}
                onPress={() => onReaction?.(emoji)}
              >
                <Text style={styles.reactionButtonEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, isWantToGo && styles.actionButtonActive]}
              onPress={onWantToGo}
            >
              <Bookmark
                size={18}
                color={isWantToGo ? theme.colors.primary : theme.colors.textSecondary}
                fill={isWantToGo ? theme.colors.primary : 'transparent'}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  isWantToGo && styles.actionButtonTextActive,
                ]}
              >
                {isWantToGo ? 'Saved' : 'Want to go'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Stats */}
        <View style={styles.socialStats}>
          <View style={styles.stat}>
            <Users size={14} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>
              {place.visitedBy.length} visited
            </Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <View style={styles.stat}>
            <Bookmark size={14} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>
              {place.wantToGo.length} want to go
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper function
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.md,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  badges: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  visitedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.success,
    borderRadius: 20,
  },
  visitedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  restaurantInfo: {
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cuisine: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  dot: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  location: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  reactionsList: {
    flexDirection: 'row',
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionsCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actionBar: {
    marginBottom: 12,
  },
  quickReactions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reactionButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  reactionButtonEmoji: {
    fontSize: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  actionButtonActive: {
    backgroundColor: '#f0f9ff',
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  actionButtonTextActive: {
    color: theme.colors.primary,
  },
  socialStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
