import CreateCollectionModal from '@/components/CreateCollectionModal';
import FavouriteBottomSheet from '@/components/FavouriteBottomSheet';
import FavouritesView from '@/components/FavouritesView';
import { COLORS } from '@/constants';
import { collectionService } from '@/services/collectionService';
import { restaurantService } from '@/services/restaurantService';
import { Collection, Restaurant } from '@/types/restaurant';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [mustTryRestaurants, setMustTryRestaurants] = useState<Restaurant[]>(
    []
  );
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] =
    useState(false);
  const [showFavouriteBottomSheet, setShowFavouriteBottomSheet] =
    useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch favorite restaurants
      const favoriteRestaurants =
        await restaurantService.getFavoriteRestaurants();
      setRestaurants(favoriteRestaurants);

      // Fetch Must Try restaurants
      const mustTryRestaurantsData =
        await restaurantService.getMustTryRestaurants();
      setMustTryRestaurants(mustTryRestaurantsData);

      // Fetch collections
      const collectionsData = await collectionService.getCollections();
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowFavouriteBottomSheet(true);
  };

  const handleCreateCollection = async (collection: any) => {
    try {
      const collectionId = await collectionService.createCollection(
        collection.name,
        collection.icon,
        collection.color
      );

      if (collectionId) {
        await loadData(); // Reload collections
        Alert.alert('Success', 'Collection created successfully!');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    }
  };

  const handleAddToFavorites = async (restaurantId: string) => {
    try {
      const updatedStatus = await restaurantService.toggleFavorite(
        restaurantId
      );
      // setRestaurants((prev) =>
      //   prev.map((r) =>
      //     r.id === restaurantId ? { ...r, isFavorite: updatedStatus } : r
      //   )
      // );
      Alert.alert(
        'Success',
        updatedStatus ? 'Added to favorites!' : 'Removed from favorites!'
      );
    } catch (error) {
      console.error('Error updating favorite status:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleSaveToCollection = async (
    restaurantId: string,
    collectionId: string
  ) => {
    try {
      await collectionService.addRestaurantToCollection(
        restaurantId,
        collectionId
      );
      Alert.alert('Success', 'Restaurant added to collection!');
    } catch (error) {
      console.error('Error saving to collection:', error);
      Alert.alert('Error', 'Failed to save to collection');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FavouritesView
        restaurants={restaurants}
        mustTryRestaurants={mustTryRestaurants}
        collections={collections}
        onRestaurantPress={handleRestaurantPress}
        onCreateCollection={() => setShowCreateCollectionModal(true)}
        onAddToCollection={handleSaveToCollection}
      />

      <CreateCollectionModal
        visible={showCreateCollectionModal}
        onClose={() => setShowCreateCollectionModal(false)}
        onSave={handleCreateCollection}
      />

      <FavouriteBottomSheet
        visible={showFavouriteBottomSheet}
        onClose={() => setShowFavouriteBottomSheet(false)}
        restaurant={selectedRestaurant}
        onAddToFavorites={() => {
          if (selectedRestaurant) {
            handleAddToFavorites(selectedRestaurant.id);
          }
          setShowFavouriteBottomSheet(false);
        }}
        onSaveToCollection={() => {
          if (selectedRestaurant) {
            // Example: Save to the first collection (you can implement a UI to select a collection)
            const collectionId = collections[0]?.id;
            if (collectionId) {
              handleSaveToCollection(selectedRestaurant.id, collectionId);
            }
          }
          setShowFavouriteBottomSheet(false);
        }}
        onShare={() => {
          setShowFavouriteBottomSheet(false);
          // Share logic
        }}
        onGetDirections={() => {
          setShowFavouriteBottomSheet(false);
          // Directions logic
        }}
        onCall={() => {
          setShowFavouriteBottomSheet(false);
          // Call logic
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});
