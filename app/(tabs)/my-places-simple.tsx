import FilterBottomSheet from '@/components/FilterBottomSheet';
import FoodCard from '@/components/FoodCard';
import MarketCard from '@/components/MarketCard';
import RestaurantCard from '@/components/RestaurantCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { theme } from '@/constants/theme';
import { FoodItem, foodService } from '@/services/foodService';
import { marketService } from '@/services/marketService';
import { restaurantService } from '@/services/restaurantService';
import { FoodMarket } from '@/types/market';
import { Restaurant } from '@/types/restaurant';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect } from 'expo-router';
import {
  Coffee,
  Plus,
  Search,
  SlidersHorizontal,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const HEADER_IMAGE_HEIGHT = 320;

type SearchType = 'restaurants' | 'food' | 'markets';

export default function MyPlacesPage() {
  const [query, setQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<SearchType>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [markets, setMarkets] = useState<FoodMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<TextInput>(null);
  const switchPosition = useSharedValue(0);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRestaurants(), loadFoodItems(), loadMarkets()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurants = async () => {
    const data = await restaurantService.getRestaurants();
    setRestaurants(data || []);
  };

  const loadFoodItems = async () => {
    const data = await foodService.getFoodItems();
    setFoodItems(data || []);
  };

  const loadMarkets = async () => {
    const data = await marketService.getMarkets();
    setMarkets(data || []);
  };

  const handleSwitchPress = (type: SearchType) => {
    setSearchType(type);
    const segmentWidth = (width - 48) / 3;
    const index = { restaurants: 0, food: 1, markets: 2 }[type];
    switchPosition.value = withSpring(index * segmentWidth, {
      damping: 20,
      stiffness: 200,
    });
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesQuery =
      query === '' ||
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(query.toLowerCase());

    const matchesFilters =
      activeFilters.length === 0 ||
      activeFilters.some(
        (filter) => filter === 'All' || restaurant.cuisine === filter
      );

    return matchesQuery && matchesFilters;
  });

  const filteredFoodItems = foodItems.filter((food) => {
    const matchesQuery =
      query === '' ||
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      food.category.toLowerCase().includes(query.toLowerCase()) ||
      food.restaurantName?.toLowerCase().includes(query.toLowerCase());

    return matchesQuery;
  });

  const filteredMarkets = markets.filter((market) => {
    const matchesQuery =
      query === '' ||
      market.name.toLowerCase().includes(query.toLowerCase()) ||
      market.tags.some((tag) =>
        tag.toLowerCase().includes(query.toLowerCase())
      );

    return matchesQuery;
  });

  const filteredData =
    searchType === 'markets'
      ? filteredMarkets
      : searchType === 'food'
      ? filteredFoodItems
      : filteredRestaurants;

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => router.push(`/restaurant/${item.id}`)}
      width={width - 48}
    />
  );

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <FoodCard food={item} width={width - 48} />
  );

  const renderMarketItem = ({ item }: { item: FoodMarket }) => (
    <MarketCard
      market={item}
      onPress={() => router.push(`/market/${item.id}`)}
      width={width - 48}
    />
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <SkeletonLoader width={width - 48} height={280} borderRadius={20} />
          <SkeletonLoader
            width={width - 48}
            height={280}
            borderRadius={20}
            style={{ marginTop: 16 }}
          />
          <SkeletonLoader
            width={width - 48}
            height={280}
            borderRadius={20}
            style={{ marginTop: 16 }}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {query ? 'No results found' : `No ${searchType} yet`}
        </Text>
        <Text style={styles.emptySubtitle}>
          {query
            ? 'Try adjusting your search'
            : `Start adding ${searchType} to see them here`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header Section with Background Image */}
      <View style={styles.headerSection}>
        <ImageBackground
          source={{
            uri: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
            style={styles.backgroundGradient}
          />

          {/* Header Controls */}
          <View style={styles.headerControls}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={20} color={theme.colors.textSecondary} />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search restaurants, cuisines, markets..."
                placeholderTextColor={theme.colors.textSecondary}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={() => setQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setIsFilterVisible(true)}
              >
                <SlidersHorizontal size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Type Switcher */}
            <View style={styles.switchBackground}>
              <Animated.View
                style={[
                  styles.switchIndicator,
                  {
                    transform: [{ translateX: switchPosition }],
                  },
                ]}
              />

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => handleSwitchPress('restaurants')}
                activeOpacity={0.7}
              >
                <View style={styles.switchContent}>
                  <UtensilsCrossed
                    size={16}
                    color={
                      searchType === 'restaurants'
                        ? theme.colors.primary
                        : 'rgba(255, 255, 255, 0.85)'
                    }
                  />
                  <Text
                    style={[
                      styles.switchText,
                      searchType === 'restaurants' && styles.activeSwitchText,
                    ]}
                  >
                    Restaurants
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => handleSwitchPress('food')}
                activeOpacity={0.7}
              >
                <View style={styles.switchContent}>
                  <Coffee
                    size={16}
                    color={
                      searchType === 'food'
                        ? theme.colors.primary
                        : 'rgba(255, 255, 255, 0.85)'
                    }
                  />
                  <Text
                    style={[
                      styles.switchText,
                      searchType === 'food' && styles.activeSwitchText,
                    ]}
                  >
                    Food
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => handleSwitchPress('markets')}
                activeOpacity={0.7}
              >
                <View style={styles.switchContent}>
                  <Store
                    size={16}
                    color={
                      searchType === 'markets'
                        ? theme.colors.primary
                        : 'rgba(255, 255, 255, 0.85)'
                    }
                  />
                  <Text
                    style={[
                      styles.switchText,
                      searchType === 'markets' && styles.activeSwitchText,
                    ]}
                  >
                    Markets
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {/* Count Header */}
        <View style={styles.countHeader}>
          <Text style={styles.countHeaderText}>
            {searchType === 'restaurants' ? (
              <>
                {filteredRestaurants.length} restaurant
                {filteredRestaurants.length !== 1 ? 's' : ''}{' '}
                {query ? 'found' : ''}
              </>
            ) : searchType === 'food' ? (
              <>
                {filteredFoodItems.length} food item
                {filteredFoodItems.length !== 1 ? 's' : ''}{' '}
                {query ? 'found' : ''}
              </>
            ) : (
              <>
                {filteredMarkets.length} market
                {filteredMarkets.length !== 1 ? 's' : ''} {query ? 'found' : ''}
              </>
            )}
          </Text>
        </View>

        {searchType === 'markets' ? (
          <FlatList
            data={filteredMarkets}
            renderItem={renderMarketItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState()}
          />
        ) : searchType === 'food' ? (
          <FlatList
            data={filteredFoodItems}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState()}
          />
        ) : (
          <FlatList
            data={filteredRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState()}
          />
        )}
      </View>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        currentFilters={activeFilters}
        onApplyFilters={(filters: string[]) => {
          setActiveFilters(filters);
          setIsFilterVisible(false);
        }}
      />

      {/* Floating Plus Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          // Show alert with options based on current tab
          const itemType =
            searchType === 'restaurants'
              ? 'Restaurant'
              : searchType === 'food'
              ? 'Food Item'
              : 'Market';
          Alert.alert(
            `Add ${itemType}`,
            `Add a new ${itemType.toLowerCase()} to your collection`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Add',
                onPress: () => {
                  // TODO: Navigate to appropriate add screen when created
                  Alert.alert(
                    'Coming Soon',
                    `Add ${itemType} feature will be available soon!`
                  );
                },
              },
            ]
          );
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.floatingButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={24} color={theme.colors.white} strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    height: HEADER_IMAGE_HEIGHT,
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerControls: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 24, // Increased spacing between search bar and switch tabs (was 20)
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
  },
  filterButton: {
    padding: 4,
  },
  switchBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 5,
    position: 'relative',
  },
  switchIndicator: {
    position: 'absolute',
    left: 5,
    top: 5,
    bottom: 5,
    width: (width - 48 - 24) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  activeSwitchText: {
    color: theme.colors.primary,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCountBadge: {
    backgroundColor: theme.colors.primary,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  activeCountText: {
    color: theme.colors.white,
  },
  contentArea: {
    flex: 1,
    marginTop: -80, // Adjusted to show more banner (was -60, original -100)
    backgroundColor: theme.colors.gray[50], // Light gray background to show card shadows
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
  },
  countHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  countHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
