import FilterBottomSheet from '@/components/FilterBottomSheet';
import FoodCard from '@/components/FoodCard';
import MarketCard from '@/components/MarketCard';
import RestaurantCard from '@/components/RestaurantCard';
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
  Search,
  SlidersHorizontal,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const HEADER_IMAGE_HEIGHT = 420;

type SearchType = 'restaurants' | 'food' | 'markets';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const HEADER_TOP_OFFSET = 96;
const HEADER_OVERLAP = 144;
const ICON_SIZE = 20; // Consistent icon size throughout
const SWITCH_ICON_SIZE = 18; // Slightly smaller for switch
const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export default function MyPlacesPage() {
  const [query, setQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeChip, setActiveChip] = useState<string>('all');
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
    setRestaurants(data);
  };

  const loadFoodItems = async () => {
    const data = await foodService.getFoodItems();
    setFoodItems(data);
  };

  const loadMarkets = async () => {
    const data = await marketService.getMarkets();
    setMarkets(data);
  };

  const handleSwitchPress = (type: SearchType) => {
    setSearchType(type);
    // Calculate segment width: total width minus horizontal padding and switch padding
    const containerWidth = width - SPACING.md * 2; // Account for container padding
    const switchInnerWidth = containerWidth - SPACING.xs * 2; // Account for switch padding
    const segmentWidth = switchInnerWidth / 3;
    const index = { restaurants: 0, food: 1, markets: 2 }[type];

    // Animation: Switch indicator slides to selected tab
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

    // Handle chip filters
    let matchesChip = true;
    if (activeChip === 'visited') {
      matchesChip =
        restaurant.lastVisited !== undefined && restaurant.lastVisited !== null;
    } else if (activeChip === 'mustTry') {
      matchesChip = restaurant.mustTry === true;
    }

    return matchesQuery && matchesFilters && matchesChip;
  });

  const filteredMarkets = markets.filter((market) => {
    const matchesQuery =
      query === '' || market.name.toLowerCase().includes(query.toLowerCase());

    const matchesTag = market.tags.some((tag) =>
      tag.toLowerCase().includes(query.toLowerCase())
    );

    // Handle chip filters (markets don't have visited/mustTry for now)
    let matchesChip = true;
    if (activeChip === 'visited' || activeChip === 'mustTry') {
      matchesChip = false; // Markets don't support these filters
    }

    return matchesQuery && matchesTag && matchesChip;
  });

  const filteredFoodItems = foodItems.filter((food) => {
    const matchesQuery =
      query === '' ||
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      (food.restaurantName &&
        food.restaurantName.toLowerCase().includes(query.toLowerCase())) ||
      food.category.toLowerCase().includes(query.toLowerCase());

    const matchesFilters =
      activeFilters.length === 0 ||
      activeFilters.some(
        (filter) =>
          filter === 'All' ||
          food.category === filter ||
          food.tags.includes(filter)
      );

    // Handle chip filters (food items don't have visited/mustTry for now)
    let matchesChip = true;
    if (activeChip === 'visited' || activeChip === 'mustTry') {
      matchesChip = false; // Food items don't support these filters
    }

    return matchesQuery && matchesFilters && matchesChip;
  });

  const filteredData =
    searchType === 'markets'
      ? filteredMarkets
      : searchType === 'food'
      ? filteredFoodItems
      : filteredRestaurants;

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
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']}
            style={styles.backgroundGradient}
          />

          {/* Header Controls */}
          <View style={styles.headerControls}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={ICON_SIZE} color={theme.colors.textSecondary} />
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
                  <X size={ICON_SIZE} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setIsFilterVisible(true)}
              >
                <SlidersHorizontal
                  size={ICON_SIZE}
                  color={theme.colors.primary}
                />
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
                <UtensilsCrossed
                  size={SWITCH_ICON_SIZE}
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
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => handleSwitchPress('food')}
                activeOpacity={0.7}
              >
                <Coffee
                  size={SWITCH_ICON_SIZE}
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
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => handleSwitchPress('markets')}
                activeOpacity={0.7}
              >
                <Store
                  size={SWITCH_ICON_SIZE}
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
              </TouchableOpacity>
            </View>

            {/* Fresha-Style Filter Chips */}
            {/* <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeChip === 'all' && styles.activeFilterChip,
                ]}
                onPress={() => setActiveChip('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeChip === 'all' && styles.activeFilterChipText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeChip === 'visited' && styles.activeFilterChip,
                ]}
                onPress={() =>
                  setActiveChip(activeChip === 'visited' ? 'all' : 'visited')
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeChip === 'visited' && styles.activeFilterChipText,
                  ]}
                >
                  Visited
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeChip === 'mustTry' && styles.activeFilterChip,
                ]}
                onPress={() =>
                  setActiveChip(activeChip === 'mustTry' ? 'all' : 'mustTry')
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeChip === 'mustTry' && styles.activeFilterChipText,
                  ]}
                >
                  Must Try
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterChipWithIcon}
                onPress={() => setIsSortVisible(true)}
              >
                <ArrowUpDown size={14} color={theme.colors.text} />
                <Text style={styles.filterChipText}>Sort</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterChipWithIcon}
                onPress={() => setIsFilterVisible(true)}
              >
                <SlidersHorizontal size={14} color={theme.colors.text} />
                <Text style={styles.filterChipText}>Filters</Text>
              </TouchableOpacity>
            </ScrollView> */}
          </View>
        </ImageBackground>
      </View>

      {/* Content Area - Search Results */}
      <Animated.View
        style={styles.contentArea}
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(250)}
      >
        {searchType === 'markets' ? (
          <FlatList
            data={filteredMarkets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MarketCard
                market={item}
                onPress={() => router.push(`/market/${item.id}`)}
                width={width - 32}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No markets found</Text>
            }
          />
        ) : searchType === 'food' ? (
          <FlatList
            data={filteredFoodItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FoodCard food={item} width={width - 32} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No food items found</Text>
            }
          />
        ) : (
          <FlatList
            data={filteredRestaurants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RestaurantCard
                restaurant={item}
                onPress={() => router.push(`/restaurant/${item.id}`)}
                width={width - 32}
                variant="horizontal"
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No restaurants found</Text>
            }
          />
        )}
      </Animated.View>

      <FilterBottomSheet
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApplyFilters={(filters) => {
          setActiveFilters(filters);
          setIsFilterVisible(false);
        }}
      />

      {/* Sort Modal */}
      <Modal
        visible={isSortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSortVisible(false)}
      >
        <TouchableOpacity
          style={styles.sortModalOverlay}
          activeOpacity={1}
          onPress={() => setIsSortVisible(false)}
        >
          <TouchableOpacity
            style={styles.sortModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setIsSortVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => setIsSortVisible(false)}
            >
              <Text style={styles.sortOptionText}>Recommended</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => setIsSortVisible(false)}
            >
              <Text style={styles.sortOptionText}>Highest Rated</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => setIsSortVisible(false)}
            >
              <Text style={styles.sortOptionText}>Most Popular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => setIsSortVisible(false)}
            >
              <Text style={styles.sortOptionText}>Nearest</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Gray-ish background like home page
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
    top: HEADER_TOP_OFFSET,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    gap: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDER_RADIUS.xl + 4, // Match index page (28px)
    paddingHorizontal: SPACING.lg, // Match index page (24px)
    paddingVertical: 14, // Match index page
    gap: SPACING.md, // Match index page (16px)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Subtle Fresha shadow
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15, // Fresha size
    fontWeight: '500', // Fresha medium weight
    color: theme.colors.text,
    padding: 0,
  },
  filterButton: {
    padding: SPACING.xs,
  },
  switchBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.lg + 4, // Rounder switch (20px)
    padding: SPACING.xs,
    position: 'relative',
  },
  switchIndicator: {
    position: 'absolute',
    left: SPACING.xs,
    top: SPACING.xs,
    bottom: SPACING.xs,
    width: (width - SPACING.md * 2 - SPACING.xs * 2) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDER_RADIUS.md + 4, // Rounder indicator (16px)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2, // More breathing room
    gap: SPACING.xs + 2,
  },
  switchText: {
    fontSize: 14, // Better balance with 18px icons
    fontWeight: '600', // Fresha uses semibold consistently
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: -0.2, // Tight Fresha spacing
  },
  activeSwitchText: {
    color: theme.colors.primary,
  },
  contentArea: {
    flex: 1,
    marginTop: -HEADER_OVERLAP,
    backgroundColor: '#F8F9FA', // Gray-ish background like home page
    borderTopLeftRadius: BORDER_RADIUS.xl, // More balanced radius
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    paddingTop: SPACING.md,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.md, // Fresha spacing between cards
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
    marginTop: SPACING.xl,
    letterSpacing: -0.2,
  },
  filterChipsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl, // Fully rounded pills (24px)
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.2,
  },
  activeFilterChipText: {
    color: theme.colors.primary,
  },
  filterChipWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl, // Fully rounded pills (24px)
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  sortOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
});
