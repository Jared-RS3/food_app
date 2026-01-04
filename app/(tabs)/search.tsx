import FilterBottomSheet from '@/components/FilterBottomSheet';
import FilterChip from '@/components/FilterChip';
import MarketCard from '@/components/MarketCard';
import RestaurantCard from '@/components/RestaurantCard';
import { theme } from '@/constants/theme';
import { marketService } from '@/services/marketService';
import { restaurantService } from '@/services/restaurantService';
import { FoodMarket } from '@/types/market';
import { Restaurant } from '@/types/restaurant';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Coffee,
  MapPin,
  Search,
  SlidersHorizontal,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = 400;
const SEARCH_INITIAL_OFFSET = 140; // Position search bar in middle-high area of banner
const STICKY_THRESHOLD = 100;
const SEARCH_BAR_HEIGHT = 56;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 44;
const SEARCH_CONTAINER_TOP_MARGIN = 16; // Margin from status bar

type SearchType = 'restaurants' | 'food' | 'markets';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<SearchType>('restaurants');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [markets, setMarkets] = useState<FoodMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<TextInput>(null);
  const scrollY = useSharedValue(0);
  const switchPosition = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
    loadRestaurants();
    loadMarkets();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const loadMarkets = async () => {
    try {
      const data = await marketService.getMarkets();
      setMarkets(data);
    } catch (error) {
      console.error('Error loading markets:', error);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      // Update header visibility
      const shouldHideHeader = event.contentOffset.y > STICKY_THRESHOLD;
      if (shouldHideHeader !== !isHeaderVisible) {
        runOnJS(setIsHeaderVisible)(!shouldHideHeader);
      }
    },
  });

  // Banner parallax and fade effect
  const bannerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, BANNER_HEIGHT],
      [0, -BANNER_HEIGHT * 1.0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-100, 0, BANNER_HEIGHT],
      [1.1, 1, 0.98],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, STICKY_THRESHOLD, BANNER_HEIGHT * 0.8],
      [1, 0.7, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  // Top navigation fade
  const topNavStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, STICKY_THRESHOLD * 0.5, STICKY_THRESHOLD],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, STICKY_THRESHOLD],
      [0, -10],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Search container smooth transition
  const searchContainerStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, STICKY_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    const animatedTop = interpolate(
      scrollY.value,
      [0, STICKY_THRESHOLD],
      [SEARCH_INITIAL_OFFSET + 40, STATUS_BAR_HEIGHT + 10],
      Extrapolation.CLAMP
    );

    const backgroundColor = `rgba(255, 255, 255, ${progress * 0.98})`;

    const backdropBlur = interpolate(
      scrollY.value,
      [STICKY_THRESHOLD - 20, STICKY_THRESHOLD + 20],
      [0, 10],
      Extrapolation.CLAMP
    );

    const shadowOpacity = interpolate(
      scrollY.value,
      [STICKY_THRESHOLD - 10, STICKY_THRESHOLD + 30],
      [0, 0.15],
      Extrapolation.CLAMP
    );

    const paddingTop = interpolate(
      scrollY.value,
      [STICKY_THRESHOLD - 20, STICKY_THRESHOLD + 20],
      [0, 20], // Reduced for snug fit
      Extrapolation.CLAMP
    );

    const paddingBottom = interpolate(
      scrollY.value,
      [STICKY_THRESHOLD - 100, STICKY_THRESHOLD + 100],
      [4, 0], // Reduced for minimal spacing
      Extrapolation.CLAMP
    );

    return {
      top: animatedTop,
      backgroundColor,
      paddingTop,
      paddingBottom,
      shadowOpacity,
      borderBottomWidth: progress > 0.98 ? 0.5 : 0,
      borderColor: 'rgba(0,0,0,0.05)',
      zIndex: 100,
      position: 'absolute',
      width: '100%',
      // Optional: for blur effect if supported
      // backdropFilter: `blur(${backdropBlur}px)`,
    };
  });

  // Switch container animation - hide when scrolled
  const switchContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [STICKY_THRESHOLD - 40, STICKY_THRESHOLD - 10],
      [1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [STICKY_THRESHOLD - 40, STICKY_THRESHOLD - 10],
      [0, -30],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [STICKY_THRESHOLD - 40, STICKY_THRESHOLD - 10],
      [1, 0.8],
      Extrapolation.CLAMP
    );

    const isHidden = scrollY.value > STICKY_THRESHOLD - 5;

    return {
      opacity,
      transform: [{ translateY }, { scale }],
      display: isHidden ? 'none' : 'flex',
    };
  });
  // Status bar blur strip animation
  const statusBarBlurStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [STICKY_THRESHOLD - 20, STICKY_THRESHOLD + 20],
      [0, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });
  // Switch indicator animation
  const switchIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(switchPosition.value * ((width - 80) / 3), {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
  }));

  // Search input container animation
  const searchInputStyle = useAnimatedStyle(() => {
    const isSticky = scrollY.value > STICKY_THRESHOLD;

    const shadowOpacity = interpolate(
      scrollY.value,
      [0, STICKY_THRESHOLD],
      [0.08, 0.15],
      Extrapolation.CLAMP
    );

    return {
      shadowOpacity,
      backgroundColor: theme.colors.white,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: isSticky ? 4 : 2 },
      shadowRadius: isSticky ? 12 : 8,
      elevation: isSticky ? 6 : 3,
    };
  });

  const handleSwitchPress = (type: SearchType) => {
    setSearchType(type);
    switchPosition.value = withTiming(
      type === 'restaurants' ? 0 : type === 'food' ? 1 : 2,
      { duration: 250 }
    );
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      !query ||
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(query.toLowerCase());

    const matchesFilters =
      activeFilters.length === 0 ||
      activeFilters.some(
        (filter) => filter === 'All' || restaurant.cuisine === filter
      );

    return matchesSearch && matchesFilters;
  });

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      !query ||
      market.name.toLowerCase().includes(query.toLowerCase()) ||
      market.location.toLowerCase().includes(query.toLowerCase()) ||
      market.tags.some((tag) =>
        tag.toLowerCase().includes(query.toLowerCase())
      );

    return matchesSearch;
  });

  const displayData =
    searchType === 'markets' ? filteredMarkets : filteredRestaurants;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Banner Background */}
      <Animated.View style={[styles.bannerContainer, bannerStyle]}>
        <ImageBackground
          source={{
            uri: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          }}
          style={styles.bannerImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.7)',
              'rgba(0,0,0,0.5)',
              'rgba(0,0,0,0.3)',
              'rgba(0,0,0,0.1)',
              'transparent',
            ]}
            locations={[0, 0.3, 0.6, 0.8, 1]}
            style={styles.bannerGradient}
          />
        </ImageBackground>
      </Animated.View>

      {/* Top Navigation */}
      <Animated.View style={[styles.topNavigation, topNavStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={theme.colors.white} size={24} />
        </TouchableOpacity>

        <View style={styles.locationContainer}>
          <View style={styles.locationBadge}>
            <MapPin size={16} color={theme.colors.white} />
            <Text style={styles.locationText}>Kuils River, Cape Town</Text>
          </View>
        </View>
      </Animated.View>

      {/* Search Container */}
      <Animated.View style={[styles.searchContainer, searchContainerStyle]}>
        <View style={styles.searchContent}>
          {/* Search Bar */}
          <View style={styles.searchRow}>
            <Animated.View
              style={[styles.searchInputContainer, searchInputStyle]}
            >
              <Search size={22} color={theme.colors.textSecondary} />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder={`Search ${searchType}...`}
                placeholderTextColor={theme.colors.textSecondary}
                value={query}
                onChangeText={setQuery}
                selectionColor={theme.colors.primary}
              />
              {query !== '' && (
                <TouchableOpacity
                  onPress={() => setQuery('')}
                  style={styles.clearButton}
                >
                  <X size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                // onPress={() => router.push(`/restaurant/${item.id}`)}
              )}
            </Animated.View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setIsFilterVisible(true)}
              activeOpacity={0.8}
            >
              <SlidersHorizontal size={22} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          {/* Type Switch */}
          <Animated.View style={[styles.switchContainer, switchContainerStyle]}>
            <Animated.View
              style={[styles.switchIndicator, switchIndicatorStyle]}
            />

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => handleSwitchPress('restaurants')}
              activeOpacity={0.7}
            >
              <UtensilsCrossed
                size={18}
                color={
                  searchType === 'restaurants'
                    ? theme.colors.primary
                    : 'rgba(255, 255, 255, 0.8)'
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
                size={18}
                color={
                  searchType === 'food'
                    ? theme.colors.primary
                    : 'rgba(255, 255, 255, 0.8)'
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
                size={18}
                color={
                  searchType === 'markets'
                    ? theme.colors.primary
                    : 'rgba(255, 255, 255, 0.8)'
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
          </Animated.View>
        </View>
      </Animated.View>

      {/* Content List */}
      {searchType === 'markets' ? (
        <Animated.FlatList
          data={filteredMarkets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentInsetAdjustmentBehavior="never"
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 80)
                .springify()
                .damping(15)}
            >
              <MarketCard
                market={item}
                width={width - 40}
                onPress={() => router.push(`/market/${item.id}` as any)}
              />
            </Animated.View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.resultsCount}>
                {filteredMarkets.length} food market
                {filteredMarkets.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          )}
          ListEmptyComponent={() =>
            loading ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Loading markets...</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No Markets Found</Text>
                <Text style={styles.emptyText}>Try adjusting your search</Text>
              </View>
            )
          }
        />
      ) : (
        <Animated.FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentInsetAdjustmentBehavior="never"
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 80)
                .springify()
                .damping(15)}
            >
              <RestaurantCard
                restaurant={item}
                featured={false}
                width={width - 40}
                onPress={() => router.push(`/restaurant/${item.id}`)}
              />
            </Animated.View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              {/* Filter Chips */}
              <FlatList
                horizontal
                data={[
                  'All',
                  'Fine Dining',
                  'African',
                  'Contemporary',
                  'European',
                  'Seafood',
                  'Asian',
                  'Italian',
                ]}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
                renderItem={({ item }) => (
                  <FilterChip
                    label={item}
                    active={
                      activeFilters.includes(item) ||
                      (item === 'All' && activeFilters.length === 0)
                    }
                    onPress={() => {
                      if (item === 'All') {
                        setActiveFilters([]);
                      } else {
                        setActiveFilters((prev) =>
                          prev.includes(item)
                            ? prev.filter((f) => f !== item)
                            : [...prev, item]
                        );
                      }
                    }}
                  />
                )}
              />

              {/* Results Header */}
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {filteredRestaurants.length} result
                  {filteredRestaurants.length !== 1 ? 's' : ''} found
                </Text>
                <Text style={styles.resultsSubtext}>
                  {searchType === 'restaurants'
                    ? 'Top restaurants'
                    : 'Popular dishes'}{' '}
                  near you
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() =>
            loading ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Loading restaurants...</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No Results Found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )
          }
        />
      )}

      <FilterBottomSheet
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApplyFilters={() => setIsFilterVisible(false)}
        currentFilters={{}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  bannerContainer: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
    zIndex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topNavigation: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 6,
    fontWeight: '500',
  },
  searchContainer: {
    position: 'absolute',
    top: SEARCH_INITIAL_OFFSET + 40,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    backgroundColor: 'transparent',
  },
  searchContent: {
    paddingHorizontal: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 18,
    height: SEARCH_BAR_HEIGHT,
    borderRadius: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
    fontWeight: '400',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: SEARCH_BAR_HEIGHT,
    height: SEARCH_BAR_HEIGHT,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    padding: 4,
    height: 52,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (width - 80) / 2,
    height: 44,
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  switchText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  activeSwitchText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: BANNER_HEIGHT - 80 + 12, // Extra 12px margin to prevent hitting top banner
    paddingBottom: 140,
  },
  listHeader: {
    marginBottom: 24,
  },
  filtersContainer: {
    paddingVertical: 12,
    marginBottom: 24,
    gap: 8,
  },
  resultsHeader: {
    gap: 6,
  },
  resultsCount: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: '700',
  },
  resultsSubtext: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  loadingState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statusBarBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STATUS_BAR_HEIGHT + 30,
    zIndex: 1001,
  },
  solidStatusBar: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
