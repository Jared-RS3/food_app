import { theme } from '@/constants/theme';
import { useMyPlacesOnboarding } from '@/hooks/useMyPlacesOnboarding';
import { getCurrentUserId, supabase } from '@/lib/supabase';
import { cacheService } from '@/services/cacheService';
import { Restaurant } from '@/types/restaurant';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Heart, MapPin, Phone, Star, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MyPlacesOnboardingModal } from './MyPlacesOnboardingModal';

const { height } = Dimensions.get('window');

interface Collection {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

interface FavouriteBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  onAddToFavorites: (restaurantId: string) => void;
  onSaveToCollection: () => void;
  onShare: () => void;
  onGetDirections: () => void;
  onCall: () => void;
  onDataChanged?: () => void; // New callback for when data changes
}

export default function FavouriteBottomSheet({
  visible,
  onClose,
  restaurant,
  onAddToFavorites,
  onSaveToCollection,
  onShare,
  onGetDirections,
  onCall,
  onDataChanged,
}: FavouriteBottomSheetProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMustTry, setIsMustTry] = useState(false);

  const slideAnim = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);

  // ✨ Add onboarding modal hook
  const {
    isVisible: onboardingVisible,
    actionType,
    collectionName,
    showOnboarding,
    closeOnboarding,
  } = useMyPlacesOnboarding();

  useEffect(() => {
    if (visible && restaurant) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      slideAnim.value = withSpring(0, {
        damping: 30,
        stiffness: 400,
        mass: 0.5,
        overshootClamping: false,
      });
      fetchCollections();
      checkExistingCollections();
      checkFavoriteStatus();
      checkMustTryStatus();
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      slideAnim.value = withTiming(height, { duration: 250 });
      setShowSuccess(false);
      setSelectedCollections([]);
    }
  }, [visible, restaurant]);

  const fetchCollections = async () => {
    try {
      const userId = await getCurrentUserId();
      const { data } = await supabase
        .from('collections')
        .select('*, collection_items(count)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        const collectionsWithCount = data.map((collection) => ({
          ...collection,
          count: collection.collection_items?.length || 0,
        }));
        setCollections(collectionsWithCount);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const checkExistingCollections = async () => {
    if (!restaurant) return;

    try {
      const { data } = await supabase
        .from('collection_items')
        .select('collection_id')
        .eq('restaurant_id', restaurant.id);

      if (data) {
        setSelectedCollections(data.map((item) => item.collection_id));
      }
    } catch (error) {
      console.error('Error checking collections:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!restaurant) return;

    try {
      const userId = await getCurrentUserId();
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .eq('user_id', userId)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite
      setIsFavorite(false);
    }
  };

  const checkMustTryStatus = async () => {
    if (!restaurant) return;

    try {
      const userId = await getCurrentUserId();
      const { data } = await supabase
        .from('favorites')
        .select('must_try')
        .eq('restaurant_id', restaurant.id)
        .eq('user_id', userId)
        .single();

      setIsMustTry(data?.must_try || false);
    } catch (error) {
      // Not marked as must try
      setIsMustTry(false);
    }
  };

  const toggleFavorite = async () => {
    if (!restaurant) return;

    setLoading(true);
    try {
      const userId = await getCurrentUserId();

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('restaurant_id', restaurant.id)
          .eq('user_id', userId);

        setIsFavorite(false);
      } else {
        // Add to favorites
        await supabase.from('favorites').insert({
          restaurant_id: restaurant.id,
          user_id: userId,
        });

        setIsFavorite(true);
        setShowSuccess(true);

        // ✨ Show onboarding modal when adding to favorites
        await showOnboarding('favorite');

        // Hide success message after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000);
      }

      onAddToFavorites(restaurant.id);
      // Don't refresh the parent - it causes glitches
      // onDataChanged?.();

      // Invalidate cache so next load gets fresh data
      cacheService.invalidatePattern('restaurants:');
      cacheService.invalidatePattern('collection:');
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMustTry = async () => {
    if (!restaurant) return;

    setLoading(true);
    try {
      const userId = await getCurrentUserId();

      if (isMustTry) {
        // Remove must try status
        await supabase
          .from('favorites')
          .update({ must_try: false })
          .eq('restaurant_id', restaurant.id)
          .eq('user_id', userId);

        setIsMustTry(false);
      } else {
        // Check if restaurant is already in favourites
        const { data: existing } = await supabase
          .from('favorites')
          .select('id')
          .eq('restaurant_id', restaurant.id)
          .eq('user_id', userId)
          .single();

        if (existing) {
          // Update existing record
          await supabase
            .from('favorites')
            .update({ must_try: true })
            .eq('restaurant_id', restaurant.id)
            .eq('user_id', userId);
        } else {
          // Create new record with must_try
          await supabase.from('favorites').insert({
            restaurant_id: restaurant.id,
            user_id: userId,
            must_try: true,
          });
        }

        setIsMustTry(true);
        setShowSuccess(true);

        // ✨ Show onboarding modal when marking as must-try
        await showOnboarding('mustTry');

        // Hide success message after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000);
      }

      // Don't refresh the parent - it causes glitches
      // onDataChanged?.();

      // Invalidate cache so next load gets fresh data
      cacheService.invalidatePattern('restaurants:');
      cacheService.invalidatePattern('collection:');
    } catch (error) {
      console.error('Error toggling must try:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = async (collectionId: string) => {
    if (!restaurant) return;

    setLoading(true);
    try {
      const isSelected = selectedCollections.includes(collectionId);

      if (isSelected) {
        // Remove from collection
        await supabase
          .from('collection_items')
          .delete()
          .eq('collection_id', collectionId)
          .eq('restaurant_id', restaurant.id);

        setSelectedCollections((prev) =>
          prev.filter((id) => id !== collectionId)
        );
      } else {
        // Add to collection
        await supabase.from('collection_items').insert({
          collection_id: collectionId,
          restaurant_id: restaurant.id,
        });

        setSelectedCollections((prev) => [...prev, collectionId]);
      }

      // Don't refresh the parent - it causes glitches
      // onDataChanged?.();

      // Invalidate cache so next load gets fresh data
      cacheService.invalidatePattern('restaurants:');
      cacheService.invalidatePattern('collection:');
    } catch (error) {
      console.error('Error toggling collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible || !restaurant) return null;

  const actionButtons = [
    {
      icon: (
        <Heart
          size={20}
          color={isFavorite ? theme.colors.error : theme.colors.primary}
          fill={isFavorite ? theme.colors.error : 'none'}
        />
      ),
      label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      onPress: toggleFavorite,
    },
    {
      icon: (
        <Star
          size={20}
          color={isMustTry ? '#FFB800' : theme.colors.primary}
          fill={isMustTry ? '#FFB800' : 'none'}
        />
      ),
      label: isMustTry ? 'Remove from Must Try' : 'Mark as Must Try',
      onPress: toggleMustTry,
      highlight: isMustTry,
    },
    // {
    //   icon: <Bookmark size={20} color={theme.colors.primary} />,
    //   label: 'Save to Collection',
    //   onPress: onSaveToCollection,
    // },
    // {
    //   icon: <Share size={20} color={theme.colors.primary} />,
    //   label: 'Share',
    //   onPress: onShare,
    // },
  ];

  const contactButtons = [
    {
      icon: <MapPin size={20} color={theme.colors.white} />,
      label: 'Get Directions',
      onPress: onGetDirections,
      style: styles.primaryButton,
      textStyle: styles.primaryButtonText,
    },
    {
      icon: <Phone size={20} color={theme.colors.gray[700]} />,
      label: 'Call',
      onPress: onCall,
      style: styles.secondaryButton,
      textStyle: styles.secondaryButtonText,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity
          style={styles.backdropButton}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
        <LinearGradient
          colors={[theme.colors.white, '#f8f9fa']}
          style={styles.modalContent}
        >
          {/* Success Banner */}
          {showSuccess && (
            <View style={styles.successBanner}>
              <Check size={20} color={theme.colors.success} />
              <Text style={styles.successText}>Added to favorites!</Text>
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{restaurant.name}</Text>
              <Text style={styles.itemType}>{restaurant.cuisine}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Restaurant Details */}
            {restaurant.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{restaurant.description}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={styles.actionsContainer}>
                {actionButtons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      button.highlight && styles.mustTryButton,
                    ]}
                    onPress={button.onPress}
                    disabled={loading}
                  >
                    {button.icon}
                    <Text
                      style={[
                        styles.actionButtonText,
                        button.highlight && styles.mustTryButtonText,
                      ]}
                    >
                      {button.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Collections */}
            {collections.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Save to collection</Text>
                {collections.map((collection) => {
                  const isSelected = selectedCollections.includes(
                    collection.id
                  );

                  return (
                    <TouchableOpacity
                      key={collection.id}
                      style={styles.collectionItem}
                      onPress={() => toggleCollection(collection.id)}
                      disabled={loading}
                    >
                      <View style={styles.collectionIcon}>
                        <Text style={styles.collectionIconText}>
                          {collection.icon}
                        </Text>
                      </View>

                      <View style={styles.collectionInfo}>
                        <Text style={styles.collectionName}>
                          {collection.name}
                        </Text>
                        <Text style={styles.collectionCount}>
                          {collection.count} items
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Check size={16} color={theme.colors.white} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Contact Buttons */}
          <View style={styles.footer}>
            <View style={styles.contactButtons}>
              {contactButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.contactButton, button.style]}
                  onPress={button.onPress}
                >
                  {button.icon}
                  <Text style={[styles.contactButtonText, button.textStyle]}>
                    {button.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ✨ Onboarding Modal */}
      <MyPlacesOnboardingModal
        visible={onboardingVisible}
        onClose={() => closeOnboarding(false)}
        actionType={actionType}
        collectionName={collectionName}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropButton: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: 12,
    gap: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.success,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemType: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceLight,
  },
  mustTryButton: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  actionButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    marginLeft: 12,
  },
  mustTryButtonText: {
    color: '#F57C00',
    fontWeight: '600',
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionIconText: {
    fontSize: 18,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  collectionCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: theme.colors.white,
  },
  secondaryButtonText: {
    color: theme.colors.text,
  },
});
