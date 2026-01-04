import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MapPin, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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

interface AirbnbStyleCardProps {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  priceRange?: string;
  badge?: string;
  isFavorite?: boolean;
  onPress: () => void;
  onFavoritePress?: () => void;
}

/**
 * Airbnb-inspired card with smooth animations
 * Features:
 * - Smooth scale on press
 * - Heart animation for favorites
 * - Elegant shadows
 * - Clean, minimal design
 */
export default function AirbnbStyleCard({
  id,
  image,
  title,
  subtitle,
  rating,
  reviewCount,
  distance,
  priceRange,
  badge,
  isFavorite = false,
  onPress,
  onFavoritePress,
}: AirbnbStyleCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const heartScale = useSharedValue(1);
  const cardScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleFavoritePress = () => {
    setFavorite(!favorite);

    // Heart beat animation
    heartScale.value = withSpring(1.3, {
      damping: 8,
      stiffness: 400,
    });
    heartScale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });

    onFavoritePress?.();
  };

  const handleCardPressIn = () => {
    cardScale.value = withSpring(0.98, theme.animation.spring.snappy);
  };

  const handleCardPressOut = () => {
    cardScale.value = withSpring(1, theme.animation.spring.smooth);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handleCardPressIn}
      onPressOut={handleCardPressOut}
      style={styles.container}
      scaleDown={0.98}
    >
      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.gradient}
          />

          {/* Badge */}
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          {/* Favorite Button */}
          <AnimatedPressable
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            scaleDown={0.9}
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
              {title}
            </Text>
            {rating && (
              <View style={styles.ratingBadge}>
                <Star size={12} color={COLORS.text} fill={COLORS.text} />
                <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {/* Subtitle */}
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {/* Meta Row */}
          <View style={styles.metaRow}>
            {distance !== undefined && (
              <View style={styles.metaItem}>
                <MapPin size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>
                  {distance.toFixed(1)}km away
                </Text>
              </View>
            )}
            {priceRange && <Text style={styles.priceRange}>{priceRange}</Text>}
          </View>

          {/* Review Count */}
          {reviewCount && (
            <Text style={styles.reviewCount}>{reviewCount} reviews</Text>
          )}
        </View>
      </Animated.View>
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
