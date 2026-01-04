/**
 * EXAMPLE: How to Integrate My Places Onboarding Modal
 * 
 * This shows the complete integration in AirbnbStyleCard.tsx
 * Copy this pattern to other components
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { Heart } from 'lucide-react-native';
import { MyPlacesOnboardingModal } from './MyPlacesOnboardingModal';
import { useMyPlacesOnboarding } from '@/hooks/useMyPlacesOnboarding';
import { restaurantService } from '@/services/restaurantService';

interface AirbnbStyleCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export const AirbnbStyleCard: React.FC<AirbnbStyleCardProps> = ({
  restaurant,
  onPress,
  onFavoritePress,
}) => {
  const [favorite, setFavorite] = useState(restaurant.isFavorite);
  
  // ✨ ADD THIS: Hook for onboarding modal
  const {
    isVisible,
    actionType,
    collectionName,
    showOnboarding,
    closeOnboarding,
  } = useMyPlacesOnboarding();

  // ✨ UPDATE THIS: Add onboarding trigger to favorite handler
  const handleFavoritePress = async () => {
    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);

    // Heart animation (your existing code)
    // ... your animation code ...

    // Save to database
    await restaurantService.toggleFavorite(restaurant.id);

    // ✨ NEW: Show onboarding modal if adding to favorites
    if (newFavoriteState) {
      await showOnboarding('favorite');
    }

    // Call parent callback
    onFavoritePress?.();
  };

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        {/* Your card UI */}
        <Image source={{ uri: restaurant.image }} />
        <Text>{restaurant.name}</Text>

        {/* Favorite button */}
        <TouchableOpacity onPress={handleFavoritePress}>
          <Heart
            size={24}
            color={favorite ? '#FF6B6B' : '#fff'}
            fill={favorite ? '#FF6B6B' : 'transparent'}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* ✨ ADD THIS: Onboarding modal */}
      <MyPlacesOnboardingModal
        visible={isVisible}
        onClose={() => closeOnboarding(false)} // false = don't navigate
        actionType={actionType}
        collectionName={collectionName}
      />
    </>
  );
};

// ==========================================
// EXAMPLE 2: With Must-Try Button
// ==========================================

export const RestaurantCardWithMustTry: React.FC = ({ restaurant }) => {
  const onboarding = useMyPlacesOnboarding();

  const handleFavorite = async () => {
    await restaurantService.toggleFavorite(restaurant.id);
    await onboarding.showOnboarding('favorite');
  };

  const handleMustTry = async () => {
    await restaurantService.markAsMustTry(restaurant.id);
    await onboarding.showOnboarding('mustTry');
  };

  return (
    <>
      <View>
        <TouchableOpacity onPress={handleFavorite}>
          <Heart />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleMustTry}>
          <Star />
        </TouchableOpacity>
      </View>

      <MyPlacesOnboardingModal
        visible={onboarding.isVisible}
        onClose={() => onboarding.closeOnboarding(false)}
        actionType={onboarding.actionType}
        collectionName={onboarding.collectionName}
      />
    </>
  );
};

// ==========================================
// EXAMPLE 3: With Collection Selection
// ==========================================

export const CollectionSelectorModal: React.FC = () => {
  const onboarding = useMyPlacesOnboarding();
  const [visible, setVisible] = useState(false);

  const handleAddToCollection = async (collection: Collection) => {
    // Add to collection
    await collectionService.addRestaurant(collection.id, restaurant.id);

    // Close collection selector
    setVisible(false);

    // Show onboarding with collection name
    await onboarding.showOnboarding('collection', collection.name);
  };

  return (
    <>
      <Modal visible={visible}>
        {collections.map(collection => (
          <TouchableOpacity
            key={collection.id}
            onPress={() => handleAddToCollection(collection)}
          >
            <Text>{collection.name}</Text>
          </TouchableOpacity>
        ))}
      </Modal>

      <MyPlacesOnboardingModal
        visible={onboarding.isVisible}
        onClose={() => onboarding.closeOnboarding(true)} // true = navigate to My Places
        actionType={onboarding.actionType}
        collectionName={onboarding.collectionName}
      />
    </>
  );
};

// ==========================================
// EXAMPLE 4: In Bottom Sheet
// ==========================================

export const RestaurantBottomSheet: React.FC = ({ restaurant }) => {
  const onboarding = useMyPlacesOnboarding();
  const [sheetVisible, setSheetVisible] = useState(true);

  const handleAction = async (type: 'favorite' | 'mustTry') => {
    if (type === 'favorite') {
      await restaurantService.toggleFavorite(restaurant.id);
    } else {
      await restaurantService.markAsMustTry(restaurant.id);
    }

    // Close bottom sheet first
    setSheetVisible(false);

    // Then show onboarding
    await onboarding.showOnboarding(type);
  };

  return (
    <>
      <BottomSheet visible={sheetVisible}>
        <TouchableOpacity onPress={() => handleAction('favorite')}>
          <Text>Add to Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleAction('mustTry')}>
          <Text>Mark as Must Try</Text>
        </TouchableOpacity>
      </BottomSheet>

      <MyPlacesOnboardingModal
        visible={onboarding.isVisible}
        onClose={() => onboarding.closeOnboarding(false)}
        actionType={onboarding.actionType}
      />
    </>
  );
};

/**
 * KEY POINTS:
 * 
 * 1. Import the hook: useMyPlacesOnboarding()
 * 2. Import the modal: MyPlacesOnboardingModal
 * 3. Call showOnboarding() after saving to database
 * 4. Pass action type: 'favorite' | 'mustTry' | 'collection'
 * 5. For collections, pass collection name
 * 6. Modal only shows ONCE per user (stored in database)
 * 7. closeOnboarding(true) navigates to My Places
 * 8. closeOnboarding(false) just closes modal
 */
