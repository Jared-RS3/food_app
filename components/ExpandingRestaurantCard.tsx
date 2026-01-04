import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Heart, MapPin, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';
import AnimatedPressable from './AnimatedPressable';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExpandingRestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    image: string;
    rating?: number;
    reviewCount?: number;
    distance?: number;
    priceRange?: string;
    badge?: string;
    isFavorite?: boolean;
  };
  onPress?: () => void;
  onFavoritePress?: () => void;
  style?: any;
}

/**
 * Restaurant card with Airbnb-style expansion animation
 * Expands to full screen when pressed
 */
export default function ExpandingRestaurantCard({
  restaurant,
  onPress,
  onFavoritePress,
  style,
}: ExpandingRestaurantCardProps) {
  const [favorite, setFavorite] = useState(restaurant.isFavorite || false);

  // Animation values
  const heartScale = useSharedValue(1);
  const cardScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    setFavorite(!favorite);

    // Heart beat animation
    heartScale.value = withSpring(1.4, { damping: 8, stiffness: 400 });
    setTimeout(() => {
      heartScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }, 100);

    onFavoritePress?.();
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to restaurant details
      router.push(`/restaurant/${restaurant.id}` as any);
    }
  };

  return (
    <AnimatedPressable
      onPress={handleCardPress}
      style={[styles.container, style]}
      scaleDown={0.98}
    >
      <View style={styles.card}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.image} />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.25)']}
            style={styles.gradient}
          />

          {/* Badge */}
          {restaurant.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{restaurant.badge}</Text>
            </View>
          )}

          {/* Favorite Button */}
          <AnimatedPressable
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            scaleDown={0.85}
          >
            <Animated.View style={heartAnimatedStyle}>
              <Heart
                size={20}
                color={favorite ? COLORS.primary : COLORS.white}
                fill={favorite ? COLORS.primary : 'none'}
                strokeWidth={2}
              />
            </Animated.View>
          </AnimatedPressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {restaurant.name}
            </Text>
            {restaurant.rating && (
              <View style={styles.ratingBadge}>
                <Star size={12} color={COLORS.text} fill={COLORS.text} />
                <Text style={styles.rating}>
                  {restaurant.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle} numberOfLines={1}>
            {restaurant.cuisine}
          </Text>

          {/* Meta Row */}
          <View style={styles.metaRow}>
            {restaurant.distance !== undefined && (
              <View style={styles.metaItem}>
                <MapPin size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>
                  {restaurant.distance.toFixed(1)}km away
                </Text>
              </View>
            )}
            {restaurant.priceRange && (
              <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
            )}
          </View>

          {/* Review Count */}
          {restaurant.reviewCount && (
            <Text style={styles.reviewCount}>
              {restaurant.reviewCount} reviews
            </Text>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.xs,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  content: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxs,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceRange: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
});
