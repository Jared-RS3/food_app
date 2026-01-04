// RestaurantCard.tsx - Production ready component
import { theme } from '@/constants/theme';
import { Restaurant } from '@/types/restaurant';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Star } from 'lucide-react-native';
import React, { memo } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = width * 0.75;
const DEFAULT_CARD_HEIGHT = 280; // Reduced from 320 since tags are now on image
const IMAGE_HEIGHT_RATIO = 0.55;

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
  variant?: 'default' | 'horizontal' | 'compact';
  featured?: boolean;
  width?: number;
  height?: number;
}

const RestaurantCard = ({
  restaurant,
  onPress,
  variant = 'default',
  featured = false,
  width: cardWidth = DEFAULT_CARD_WIDTH,
  height: cardHeight = DEFAULT_CARD_HEIGHT,
}: RestaurantCardProps) => {
  const isCompact = variant === 'compact';
  const isHorizontal = variant === 'horizontal';

  return (
    <TouchableOpacity
      style={[
        styles.restaurantCard,
        { width: cardWidth, height: cardHeight },
        isCompact && styles.compactCard,
        isHorizontal && styles.horizontalCard,
      ]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View
        style={[
          styles.cardImageContainer,
          { height: cardHeight * IMAGE_HEIGHT_RATIO },
        ]}
      >
        <Image
          source={{ uri: restaurant.image }}
          style={[
            styles.cardImage,
            { height: cardHeight * IMAGE_HEIGHT_RATIO },
          ]}
          resizeMode="cover"
        />

        {/* Gradient overlay with tags */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          {/* Tags on image */}
          {!isCompact && restaurant.tags && restaurant.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {restaurant.tags.slice(0, 3).map((tag, index) => (
                <View key={`${tag}-${index}`} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        {/* Status badges */}
        <View style={styles.cardBadges}>
          {restaurant.featured && !isCompact && (
            <View style={styles.featuredBadge}>
              <View style={styles.featuredBadgeIcon}>
                <Star
                  size={10}
                  color={theme.colors.white}
                  fill={theme.colors.white}
                />
              </View>
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              !restaurant.isOpen && styles.closedBadge,
            ]}
          >
            <Text
              style={[styles.badgeText, isCompact && styles.compactBadgeText]}
            >
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.cardContent, isCompact && styles.compactContent]}>
        {/* Name and Rating Row */}
        <View style={styles.nameRatingRow}>
          <Text
            style={[styles.restaurantName, isCompact && styles.compactName]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {restaurant.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Star
              size={isCompact ? 12 : 14}
              color={theme.colors.star}
              fill={theme.colors.star}
            />
            <Text
              style={[styles.ratingText, isCompact && styles.compactRating]}
            >
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Location */}
        {restaurant.address && (
          <View style={styles.locationRow}>
            <MapPin
              size={12}
              color={theme.colors.textSecondary}
              style={styles.locationIcon}
            />
            <Text
              style={[styles.locationText, isCompact && styles.compactLocation]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {restaurant.address}
            </Text>
          </View>
        )}

        {/* Visit Count Badge */}
        {!isCompact && restaurant.visitCount && restaurant.visitCount > 0 && (
          <View style={styles.visitCountContainer}>
            <View style={styles.visitCountBadge}>
              <Text style={styles.visitCountText}>
                Visited {restaurant.visitCount}{' '}
                {restaurant.visitCount === 1 ? 'time' : 'times'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(RestaurantCard, (prevProps, nextProps) => {
  return (
    prevProps.restaurant.id === nextProps.restaurant.id &&
    prevProps.restaurant.isFavorite === nextProps.restaurant.isFavorite &&
    prevProps.restaurant.rating === nextProps.restaurant.rating &&
    prevProps.featured === nextProps.featured &&
    prevProps.variant === nextProps.variant &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height
  );
});

const styles = StyleSheet.create({
  restaurantCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20, // Rounder look
    marginBottom: 12, // Fresha-style tight spacing
    width: '100%',
    overflow: 'hidden',
    // Shadow for separation from gray background
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, // More visible shadow for contrast
        shadowRadius: 8,
      },
      android: {
        elevation: 4, // Higher elevation for better visibility
      },
    }),
  },
  compactCard: {
    marginBottom: 12,
    borderRadius: 20,
  },
  horizontalCard: {
    width: '100%',
    marginBottom: 12,
  },
  cardImageContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardImage: {
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: 12,
  },
  cardBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16, // Pill shape
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featuredBadgeIcon: {
    marginRight: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 10,
    padding: 3,
  },
  statusBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16, // Pill shape
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  closedBadge: {
    backgroundColor: theme.colors.gray[400],
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  compactBadgeText: {
    fontSize: 10,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  compactContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  restaurantName: {
    flex: 1, // Allow name to take available space
    fontSize: 16, // Fresha uses 16px for card titles
    fontWeight: '600', // Fresha semibold
    color: theme.colors.text,
    lineHeight: 20,
    letterSpacing: -0.3, // Fresha tight tracking
    marginRight: 8, // Space before rating
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0, // Prevent rating from shrinking
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600', // Semibold
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  compactRating: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    flex: 1, // Allow text to take available space
    fontSize: 13, // Slightly smaller than name
    color: theme.colors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  compactLocation: {
    fontSize: 12,
  },
  cuisineType: {
    fontSize: 14, // Fresha size
    color: theme.colors.textSecondary, // Use secondary text color
    fontWeight: '500', // Medium weight
    marginTop: 2,
    marginBottom: 10, // Fresha spacing
    letterSpacing: -0.2,
  },
  compactCuisine: {
    fontSize: 13,
    marginBottom: 6,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Consistent spacing
  },
  reviewsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6, // Tighter gap for cleaner look
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Glass effect like market cards
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Rounder tags
    backdropFilter: 'blur(10px)', // Glass blur effect
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.white, // White text on glass
    fontWeight: '700', // Bold like market cards
    letterSpacing: -0.1,
  },
  visitCountContainer: {
    marginTop: 8,
  },
  visitCountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  visitCountText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
