import RestaurantCard from '@/components/RestaurantCard';
import { Collection, Restaurant } from '@/types/restaurant';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function CollectionRestaurantsScreen() {
  const router = useRouter();
  const { collectionId } = useLocalSearchParams();

  // You'll need to fetch collection and restaurants data based on collectionId
  // This is placeholder - implement your data fetching logic
  const collection: Collection = {} as Collection;
  const restaurants: Restaurant[] = [];

  const collectionRestaurants =
    collection.restaurants
      ?.map((id) => restaurants.find((r) => r.id === id))
      .filter((r): r is Restaurant => !!r) || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={collectionRestaurants}
        keyExtractor={(r) => r.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}` as any)}
            width={CARD_WIDTH}
            height={CARD_WIDTH * 1.2}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
