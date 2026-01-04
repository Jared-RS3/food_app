import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Bookmark,
  Clock,
  DollarSign,
  Heart,
  MapPin,
  Plus,
  Star,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;

interface RestaurantDetailsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  restaurant: {
    id?: string;
    name: string;
    cuisine: string;
    image: string;
    rating?: number;
    priceRange?: string;
    distance?: number;
    description?: string;
    address?: string;
  };
  onAddToFavorites?: () => void;
  onAddToMustTry?: () => void;
  onAddToCollection?: () => void;
  onCheckIn?: () => void;
}

export default function RestaurantDetailsBottomSheet({
  visible,
  onClose,
  restaurant,
  onAddToFavorites,
  onAddToMustTry,
  onAddToCollection,
  onCheckIn,
}: RestaurantDetailsBottomSheetProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMustTry, setIsMustTry] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Animation values
  const heartScale = useSharedValue(1);
  const starScale = useSharedValue(1);
  const bookmarkScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite);
    // Heart beat animation
    heartScale.value = withSpring(1.4, { damping: 8, stiffness: 400 });
    heartScale.value = withSpring(1, theme.animation.spring.smooth);
    onAddToFavorites?.();
  };

  const handleAddToMustTry = () => {
    setIsMustTry(!isMustTry);
    // Star pop animation
    starScale.value = withSpring(1.3, { damping: 10, stiffness: 500 });
    starScale.value = withSpring(1, theme.animation.spring.smooth);
    onAddToMustTry?.();
  };

  const handleAddToCollection = () => {
    setIsSaved(!isSaved);
    // Bookmark slide animation
    bookmarkScale.value = withSpring(1.3, { damping: 12, stiffness: 300 });
    bookmarkScale.value = withSpring(1, theme.animation.spring.smooth);
    onAddToCollection?.();
  };

  const handleCheckIn = () => {
    onCheckIn?.();
    onClose();
  };

  const handleViewFullDetails = () => {
    onClose();
    // Navigate to search for this restaurant if ID doesn't exist
    if (restaurant.id) {
      router.push(`/restaurant/${restaurant.id}` as any);
    } else {
      router.push('/(tabs)/home' as any);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.duration(400)
            .springify()
            .damping(15)
            .stiffness(150)}
          style={styles.bottomSheet}
        >
          {/* Header with Image */}
          <View style={styles.imageHeader}>
            <Image
              source={{ uri: restaurant.image }}
              style={styles.headerImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
            />

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.white} strokeWidth={2.5} />
            </TouchableOpacity>

            {/* Restaurant Name on Image */}
            <View style={styles.imageContent}>
              <Text style={styles.imageRestaurantName}>{restaurant.name}</Text>
              <View style={styles.imageMetaRow}>
                <Text style={styles.imageCuisine}>{restaurant.cuisine}</Text>
                {restaurant.rating && (
                  <View style={styles.imageRating}>
                    <Star
                      size={14}
                      color={COLORS.warning}
                      fill={COLORS.warning}
                    />
                    <Text style={styles.imageRatingText}>
                      {restaurant.rating}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Cards */}
            <View style={styles.infoCards}>
              {restaurant.priceRange && (
                <View style={styles.infoCard}>
                  <View style={styles.infoIcon}>
                    <DollarSign size={18} color={COLORS.success} />
                  </View>
                  <Text style={styles.infoLabel}>Price</Text>
                  <Text style={styles.infoValue}>{restaurant.priceRange}</Text>
                </View>
              )}

              {restaurant.distance !== undefined && (
                <View style={styles.infoCard}>
                  <View style={styles.infoIcon}>
                    <MapPin size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{restaurant.distance}km</Text>
                </View>
              )}

              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Clock size={18} color={COLORS.warning} />
                </View>
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoValue}>Open</Text>
              </View>
            </View>

            {/* Description */}
            {restaurant.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{restaurant.description}</Text>
              </View>
            )}

            {/* Address */}
            {restaurant.address && (
              <View style={styles.section}>
                <View style={styles.addressRow}>
                  <MapPin size={20} color={COLORS.primary} />
                  <Text style={styles.address}>{restaurant.address}</Text>
                </View>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              {/* Add to Favorites */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isFavorite && styles.actionButtonActive,
                ]}
                onPress={handleAddToFavorites}
              >
                <Animated.View style={heartAnimatedStyle}>
                  <Heart
                    size={22}
                    color={isFavorite ? COLORS.error : COLORS.text}
                    fill={isFavorite ? COLORS.error : 'none'}
                    strokeWidth={2}
                  />
                </Animated.View>
                <View style={styles.actionContent}>
                  <Text
                    style={[
                      styles.actionTitle,
                      isFavorite && { color: COLORS.error },
                    ]}
                  >
                    {isFavorite ? 'Added to Favorites' : 'Add to Favorites'}
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    Save to your favorites list
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Add to Must Try */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isMustTry && styles.actionButtonActive,
                ]}
                onPress={handleAddToMustTry}
              >
                <Animated.View style={starAnimatedStyle}>
                  <Star
                    size={22}
                    color={isMustTry ? COLORS.warning : COLORS.text}
                    fill={isMustTry ? COLORS.warning : 'none'}
                    strokeWidth={2}
                  />
                </Animated.View>
                <View style={styles.actionContent}>
                  <Text
                    style={[
                      styles.actionTitle,
                      isMustTry && { color: COLORS.warning },
                    ]}
                  >
                    {isMustTry ? 'Added to Must Try' : 'Add to Must Try'}
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    Priority restaurants to visit
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Add to Collection */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isSaved && styles.actionButtonActive,
                ]}
                onPress={handleAddToCollection}
              >
                <Animated.View style={bookmarkAnimatedStyle}>
                  <Bookmark
                    size={22}
                    color={isSaved ? COLORS.primary : COLORS.text}
                    fill={isSaved ? COLORS.primary : 'none'}
                    strokeWidth={2}
                  />
                </Animated.View>
                <View style={styles.actionContent}>
                  <Text
                    style={[
                      styles.actionTitle,
                      isSaved && { color: COLORS.primary },
                    ]}
                  >
                    {isSaved ? 'Saved to Collection' : 'Save to Collection'}
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    Organize in custom lists
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={handleCheckIn}
            >
              <Plus size={20} color={COLORS.white} strokeWidth={2.5} />
              <Text style={styles.checkInButtonText}>Check In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={handleViewFullDetails}
            >
              <Text style={styles.viewDetailsButtonText}>
                View Full Details
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    height: '95%',
    overflow: 'hidden',
  },
  imageHeader: {
    height: 240,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContent: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  imageRestaurantName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  imageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  imageCuisine: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  imageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  imageRatingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  infoCards: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  address: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  actionButtonActive: {
    backgroundColor: `${COLORS.primary}10`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  bottomActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  checkInButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    ...theme.shadows.md,
  },
  checkInButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  viewDetailsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  viewDetailsButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
});
