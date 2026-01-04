import { theme } from '@/constants/theme';
import { FoodItem } from '@/services/foodService';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Store, X } from 'lucide-react-native';
import React, { memo, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = width * 0.75;
const DEFAULT_CARD_HEIGHT = 280;
const IMAGE_HEIGHT_RATIO = 0.55;

interface FoodCardProps {
  food: FoodItem;
  width?: number;
  height?: number;
}

const FoodCard = ({
  food,
  width: cardWidth = DEFAULT_CARD_WIDTH,
  height: cardHeight = DEFAULT_CARD_HEIGHT,
}: FoodCardProps) => {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.foodCard, { width: cardWidth }]}
        onPress={() => setShowImageModal(true)}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: food.image }}
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
            {food.tags && food.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {food.tags.slice(0, 3).map((tag, index) => (
                  <View key={`${tag}-${index}`} style={styles.tag}>
                    <Text style={styles.tagText} numberOfLines={1}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>

          {/* Rating badge at top right */}
          <View style={styles.ratingBadge}>
            <Star
              size={14}
              color={theme.colors.warning}
              fill={theme.colors.warning}
            />
            <Text style={styles.ratingText}>{food.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* Name and Price Row */}
          <View style={styles.nameRow}>
            <Text
              style={styles.foodName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {food.name}
            </Text>
            <Text style={styles.priceText}> R {food.price}</Text>
          </View>

          {/* Restaurant Name */}
          {food.restaurantName && (
            <View style={styles.restaurantRow}>
              <Store
                size={12}
                color={theme.colors.textSecondary}
                style={styles.restaurantIcon}
              />
              <Text
                style={styles.restaurantText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {food.restaurantName}
              </Text>
            </View>
          )}

          {/* Category */}
          {food.category && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {food.category}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Image Enlargement Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowImageModal(false)}
          />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowImageModal(false)}
          >
            <X size={24} color={theme.colors.white} />
          </TouchableOpacity>

          {/* Enlarged Image */}
          <View style={styles.imageModalContent}>
            <Image
              source={{ uri: food.image }}
              style={styles.enlargedImage}
              resizeMode="contain"
            />

            {/* Info Overlay */}
            <View style={styles.imageInfoOverlay}>
              <Text style={styles.modalFoodName}>{food.name}</Text>
              <Text style={styles.modalPrice}>R {food.price}</Text>
              {food.restaurantName && (
                <View style={styles.modalRestaurantRow}>
                  <Store size={16} color={theme.colors.white} />
                  <Text style={styles.modalRestaurantName}>
                    {food.restaurantName}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default memo(FoodCard);

const styles = StyleSheet.create({
  foodCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    marginBottom: 12,
    width: '100%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  foodName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.2,
    flexShrink: 0,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restaurantIcon: {
    marginTop: 1,
  },
  restaurantText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  categoryText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageModalContent: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: width,
    height: width,
  },
  imageInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 24,
    alignItems: 'center',
  },
  modalFoodName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  modalRestaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalRestaurantName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.white,
  },
});
