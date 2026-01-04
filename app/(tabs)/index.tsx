import AddItemModal from '@/components/AddItemModal';
import CategoryButton from '@/components/CategoryButton';
import FavouritesView from '@/components/FavouritesView';
import { GooglePlacesSearch } from '@/components/GooglePlacesSearch';
import InstagramImportModal from '@/components/InstagramImportModal';
import MenuBottomSheet from '@/components/MenuBottomSheet';
import RestaurantCard from '@/components/RestaurantCard';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { supabase } from '@/lib/supabase';
import { collectionService } from '@/services/collectionService';
import { MustTryItem, mustTryService } from '@/services/mustTryService';
import { restaurantService } from '@/services/restaurantService';
import { Collection, Restaurant } from '@/types/restaurant';
import { hapticLight } from '@/utils/helpers';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowUpDown,
  Bell,
  ChevronUp,
  Clipboard,
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react-native';

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Dynamic import for MapView to avoid web bundling issues
let MapViewModule: any = null;
try {
  if (Platform.OS !== 'web') {
    MapViewModule = require('react-native-maps');
  }
} catch (error) {
  console.log('MapView not available on this platform');
}
const MapView = MapViewModule?.default || null;
const Marker = MapViewModule?.Marker || null;
const PROVIDER_GOOGLE = MapViewModule?.PROVIDER_GOOGLE || null;

import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  FadeOutDown,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  'Fine Dining',
  'African',
  'Contemporary',
  'Asian',
  'Italian',
  'Japanese',
  'Family',
  'Fast Food',
  'Breakfast',
  'Seafood',
];

export default function HomeScreen() {
  // Bottom sheet mode: 'recommended' or 'myPlaces'
  const [bottomSheetMode, setBottomSheetMode] = useState<
    'recommended' | 'myPlaces'
  >('recommended');

  const [activeTab, setActiveTab] = useState<
    'Featured' | 'Recent' | 'Favourites'
  >('Featured');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlacesSearch, setShowPlacesSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('');

  // Map-specific states
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isSheetClosed, setIsSheetClosed] = useState(false); // Track if sheet is completely closed
  const featuresSheetHeight = useSharedValue(320); // Start height - low enough to hide top border line
  const mapRef = useRef<any>(null); // Use 'any' for cross-platform compatibility
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrollAtTop, setIsScrollAtTop] = useState(true);
  const startHeight = useRef(320); // Match initial height
  const isDragging = useRef(false);

  // Add these states to your HomeScreen component
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastFoodRestaurant, setLastFoodRestaurant] = useState<any>(null);
  const [mustTryItemName, setMustTryItemName] = useState('');
  const [mustTryItemPrice, setMustTryItemPrice] = useState('');

  const [recentRestaurants, setRecentRestaurants] = useState<Restaurant[]>([]);
  const [restaurantMenus, setRestaurantMenus] = useState<{
    [key: string]: any[];
  }>({});
  const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);

  // Instagram import state
  const [showInstagramImport, setShowInstagramImport] = useState(false);

  // typed states to avoid the never[] inference issue
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [mustTryItems, setMustTryItems] = useState<MustTryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial map region (Cape Town area - Kuils River)
  const initialRegion = {
    latitude: -33.918,
    longitude: 18.423,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Pan Responder for the drag handle ONLY
  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        isDragging.current = true;
        startHeight.current = featuresSheetHeight.value;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isDragging.current) return;

        // Calculate new height
        const newHeight = startHeight.current - gestureState.dy;

        // Allow dragging down to 0 to close, up to calculated max (leaves 12px gap from search bar)
        const maxHeight = height - 212; // Account for search bar + filters + 12px gap
        const clampedHeight = Math.max(0, Math.min(maxHeight, newHeight));

        // Direct assignment for smooth tracking
        featuresSheetHeight.value = clampedHeight;
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false;
        const currentHeight = featuresSheetHeight.value;
        const velocity = gestureState.vy;
        const movement = gestureState.dy;
        const maxSheetHeight = height - 212; // 12px gap from search bar

        let targetHeight = 320; // Default start height - hides top line

        // Very strong downward swipe OR dragged below 100 -> close completely
        if (
          velocity > 1.2 ||
          currentHeight < 100 ||
          (velocity > 0.5 && movement > 150)
        ) {
          targetHeight = 0;
          setIsSheetClosed(true);
        }
        // Strong downward swipe -> collapse to start height
        else if (velocity > 0.6 || (velocity > 0.3 && movement > 80)) {
          targetHeight = 320;
        }
        // Strong upward swipe -> expand to max (with 12px gap)
        else if (velocity < -0.6 || (velocity < -0.3 && movement < -80)) {
          targetHeight = maxSheetHeight;
        }
        // Weak velocity -> snap to nearest (320 or max)
        else {
          const midpoint = (320 + maxSheetHeight) / 2;
          targetHeight = currentHeight > midpoint ? maxSheetHeight : 320;
        }

        // Smooth spring animation
        featuresSheetHeight.value = withSpring(targetHeight, {
          damping: 30,
          stiffness: 300,
          mass: 0.5,
          overshootClamping: false,
        });
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        const currentHeight = featuresSheetHeight.value;
        const maxSheetHeight = height - 212; // 12px gap from search bar

        // If very low, close it; otherwise snap to default
        if (currentHeight < 100) {
          setIsSheetClosed(true);
          featuresSheetHeight.value = withSpring(0, {
            damping: 30,
            stiffness: 300,
            mass: 0.5,
            overshootClamping: false,
          });
        } else {
          const midpoint = (320 + maxSheetHeight) / 2;
          const targetHeight = currentHeight > midpoint ? maxSheetHeight : 320;
          featuresSheetHeight.value = withSpring(targetHeight, {
            damping: 30,
            stiffness: 300,
            mass: 0.5,
            overshootClamping: false,
          });
        }
      },
    })
  ).current;

  // Pan Responder for restaurant bottom sheet drag to dismiss
  const restaurantSheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // User started dragging
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down (positive dy)
        if (gestureState.dy > 0) {
          // Visual feedback could be added here if needed
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down more than 100px or with velocity > 0.5, close the sheet
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeBottomSheet();
        }
      },
    })
  ).current;

  // Animated style for the features sheet
  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      height: featuresSheetHeight.value,
    };
  });

  // Handle closing the bottom sheet completely
  const handleCloseSheet = () => {
    setIsSheetClosed(true);
    featuresSheetHeight.value = withSpring(0, {
      damping: 30,
      stiffness: 300,
      mass: 0.5,
      overshootClamping: false,
    });
  };

  // Handle reopening the bottom sheet
  const handleReopenSheet = () => {
    setIsSheetClosed(false);
    featuresSheetHeight.value = withSpring(320, {
      damping: 30,
      stiffness: 300,
      mass: 0.5,
      overshootClamping: false,
    });
  };

  // Dummy featured restaurants data for Cape Town
  const dummyFeaturedRestaurants: Restaurant[] = [
    {
      id: 'featured-1',
      name: 'The Test Kitchen',
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 1247,
      cuisine: 'Contemporary',
      description: 'Award-winning fine dining in Woodstock',
      distance: '2.5 km',
      deliveryTime: '45-60 min',
      deliveryFee: 'R50',
      tags: ['Fine Dining', 'Contemporary', "Chef's Table"],
      featured: true,
      isOpen: true,
      isFavorite: false,
      latitude: -33.9258,
      longitude: 18.4476,
      address: 'The Old Biscuit Mill, 375 Albert Rd, Woodstock',
    },
    {
      id: 'featured-2',
      name: 'La Colombe',
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 892,
      cuisine: 'French',
      description: 'Elegant French cuisine with Table Mountain views',
      distance: '8.2 km',
      deliveryTime: '50-65 min',
      deliveryFee: 'R60',
      tags: ['French', 'Fine Dining', 'Romantic'],
      featured: true,
      isOpen: true,
      isFavorite: false,
      latitude: -33.9853,
      longitude: 18.4128,
      address: 'Silvermist Wine Estate, Constantia',
    },
    {
      id: 'featured-3',
      name: 'Mama Africa',
      image:
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      rating: 4.5,
      reviews: 2134,
      cuisine: 'African',
      description: 'Authentic African cuisine and live music',
      distance: '5.1 km',
      deliveryTime: '35-50 min',
      deliveryFee: 'R45',
      tags: ['African', 'Live Music', 'Traditional'],
      featured: true,
      isOpen: true,
      isFavorite: false,
      latitude: -33.9221,
      longitude: 18.4185,
      address: '178 Long Street, Cape Town City Centre',
    },
    {
      id: 'featured-4',
      name: 'Codfather Seafood',
      image:
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
      rating: 4.6,
      reviews: 1567,
      cuisine: 'Seafood',
      description: 'Fresh seafood and sushi at the V&A Waterfront',
      distance: '7.8 km',
      deliveryTime: '40-55 min',
      deliveryFee: 'R55',
      tags: ['Seafood', 'Sushi', 'Waterfront'],
      featured: true,
      isOpen: true,
      isFavorite: false,
      latitude: -33.9058,
      longitude: 18.4196,
      address: 'The Wharf, V&A Waterfront',
    },
    {
      id: 'featured-5',
      name: "Nando's Kuils River",
      image:
        'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
      rating: 4.3,
      reviews: 834,
      cuisine: 'Portuguese',
      description: 'Flame-grilled PERi-PERi chicken',
      distance: '1.2 km',
      deliveryTime: '20-35 min',
      deliveryFee: 'Free',
      tags: ['Portuguese', 'Chicken', 'Fast Food'],
      featured: true,
      isOpen: true,
      isFavorite: false,
      latitude: -33.9201,
      longitude: 18.4219,
      address: 'Kuils River Square, Van Riebeeck Road',
    },
  ];

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // loadAllData with typed destructuring and error handling
  const loadAllData = async () => {
    try {
      setLoading(true);

      console.log('Loading restaurants data...');

      // Type annotation for Promise.all results (helps TypeScript)
      const [restaurantsData, collectionsData, mustTryData]: [
        Restaurant[],
        Collection[],
        MustTryItem[]
      ] = await Promise.all([
        restaurantService.getRestaurants(),
        collectionService.getCollections(),
        mustTryService.getMustTryItems(),
      ]);

      console.log('Restaurants loaded:', restaurantsData?.length || 0);
      console.log('Collections loaded:', collectionsData?.length || 0);

      // Merge dummy featured restaurants with real data
      const allRestaurants = [
        ...dummyFeaturedRestaurants,
        ...(restaurantsData ?? []),
      ];

      setRestaurants(allRestaurants);
      setCollections(collectionsData ?? []);
      setMustTryItems(mustTryData ?? []);

      console.log('Total restaurants set:', allRestaurants.length);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(
        'Error',
        'Failed to load data. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Add this function to update recent restaurants when a restaurant is pressed
  const handleRestaurantPress = (restaurant: Restaurant) => {
    // Add to recent restaurants (max 5)
    setRecentRestaurants((prev) => {
      const filtered = prev.filter((r) => r.id !== restaurant.id);
      return [restaurant, ...filtered].slice(0, 5);
    });

    router.push(`/restaurant/${restaurant.id}`);
  };

  const handleFoodAdded = (restaurant: any, foodItem: any) => {
    // Update the restaurant menus state (append new item instead of override)
    setRestaurantMenus((prev) => {
      const existingMenu = prev[restaurant.id] || [];
      return {
        ...prev,
        [restaurant.id]: [...existingMenu, foodItem],
      };
    });

    // Set this restaurant as the active one for the menu
    setLastFoodRestaurant(restaurant);

    // Close the modal and open the menu
    setShowAddModal(false);
    setTimeout(() => {
      setIsMenuVisible(true);
    }, 300); // Small delay to ensure smooth transition
  };

  // Add this function to handle food additions
  const handleAddFoodToMenu = (food: any) => {
    setRestaurantMenus((prev) => {
      const restaurantId = food.restaurantId;
      const existingMenu = prev[restaurantId] || [];

      return {
        ...prev,
        [restaurantId]: [...existingMenu, food],
      };
    });

    Alert.alert('Success', 'Food item added to restaurant menu!');
  };

  const tabs = ['Featured', 'Recent', 'Favourites'] as const;

  // const handleRestaurantPress = (restaurant: Restaurant) => {
  //   router.push(`/restaurant/${restaurant.id}`);
  // };

  const handleAddItem = async (item: any) => {
    try {
      // If AddItemModal returns something that needs to be sent to an API,
      // you would call that service here. For now we just reload lists.
      await loadAllData();
      Alert.alert('Success', 'Item added successfully!');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleAddFood = (newFood: any) => {
    if (newFood.restaurantId) {
      setRestaurantMenus((prev) => ({
        ...prev,
        [newFood.restaurantId]: [
          ...(prev[newFood.restaurantId] || []),
          newFood,
        ],
      }));

      // Update last food restaurant for quick access
      const restaurant = restaurants.find((r) => r.id === newFood.restaurantId);
      if (restaurant) {
        setLastFoodRestaurant(restaurant);
      }

      // Fetch the most recent restaurant and food items from Supabase
      fetchRecentRestaurantAndFood();
    }
  };

  const fetchRecentRestaurantAndFood = async () => {
    try {
      // Fetch the most recently added restaurant
      const { data: recentRestaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (restaurantError) {
        console.error('Error fetching recent restaurant:', restaurantError);
        return;
      }

      if (recentRestaurant) {
        // Update the last food restaurant
        setLastFoodRestaurant(recentRestaurant);

        // Fetch food items for this restaurant
        const { data: foodItems, error: foodError } = await supabase
          .from('food_items')
          .select('*')
          .eq('restaurant_id', recentRestaurant.id)
          .order('created_at', { ascending: false });

        if (foodError) {
          console.error('Error fetching food items:', foodError);
          return;
        }

        // Update restaurant menus with the fetched food items
        if (foodItems) {
          setRestaurantMenus((prev) => ({
            ...prev,
            [recentRestaurant.id]: foodItems,
          }));
        }

        // Update restaurants list if this restaurant isn't already in it
        setRestaurants((prev) => {
          const exists = prev.some((r) => r.id === recentRestaurant.id);
          if (!exists) {
            return [recentRestaurant, ...prev];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error in fetchRecentRestaurantAndFood:', error);
    }
  };

  // Get the current restaurant to display in the menu
  const getCurrentRestaurant = () => {
    if (lastFoodRestaurant) {
      return lastFoodRestaurant;
    }
    // Return the first restaurant as default if no specific restaurant is selected
    return restaurants[0] || null;
  };

  // Filter restaurants based on selected category
  const filteredRestaurants =
    selectedCategory === 'All'
      ? restaurants
      : selectedCategory === 'Must Try'
      ? restaurants.filter(
          (r) =>
            r.mustTry === true ||
            mustTryItems.some((item) => item.restaurantId === r.id)
        )
      : selectedCategory === 'Visited'
      ? restaurants.filter(
          (r) => r.lastVisited !== undefined && r.lastVisited !== null
        )
      : restaurants.filter((r) => r.cuisine === selectedCategory);

  // Handle marker press
  const handleMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowBottomSheet(true);

    // Animate to restaurant location
    if (mapRef.current && restaurant.latitude && restaurant.longitude) {
      mapRef.current.animateToRegion(
        {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        300
      );
    }
  };

  // Close bottom sheet
  const closeBottomSheet = () => {
    setShowBottomSheet(false);
    setTimeout(() => setSelectedRestaurant(null), 300);
  };

  // Handle Google Place selection
  const handleSelectPlace = async (place: any) => {
    try {
      // Close the search modal
      setShowPlacesSearch(false);

      // Create a new restaurant from the Place API
      const newRestaurant: Restaurant = {
        id: place.place_id,
        name: place.name,
        image:
          place.photos?.[0]?.photo_reference ||
          place.thumbnail ||
          'https://via.placeholder.com/400x300?text=Restaurant',
        rating: place.rating || 0,
        reviews: place.user_ratings_total || place.reviews || 0,
        cuisine:
          place.types?.[0]
            ?.replace(/_/g, ' ')
            ?.replace('restaurant', 'Dining')
            ?.replace('cafe', 'Café') || 'Restaurant',
        description: place.vicinity || place.formatted_address || '',
        distance: '0 km',
        deliveryTime: '30-45 min',
        deliveryFee: 'Free',
        tags:
          place.types?.slice(0, 3).map((t: string) => t.replace(/_/g, ' ')) ||
          [],
        featured: false,
        isOpen: place.opening_hours?.open_now || true,
        isFavorite: false,
        latitude:
          place.geometry?.location?.lat || place.gps_coordinates?.latitude,
        longitude:
          place.geometry?.location?.lng || place.gps_coordinates?.longitude,
        address: place.formatted_address || place.address,
        phone: place.phone,
        website: place.website,
      };

      // Save to database
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          Alert.alert('Error', 'You must be logged in to add restaurants');
          return;
        }

        const userEmail = authData.user.email;

        if (!userEmail) {
          Alert.alert('Error', 'User email not found');
          return;
        }

        // Get user profile
        const { data: user, error: userError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', userEmail)
          .limit(1)
          .single();

        if (userError || !user) {
          console.error('User profile error:', userError);
          Alert.alert('Error', 'User profile not found');
          return;
        }

        // Check if restaurant already exists for this user
        const { data: existingRestaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', newRestaurant.name)
          .eq('address', newRestaurant.address || '')
          .single();

        let restaurantId = existingRestaurant?.id;

        if (!existingRestaurant) {
          // Insert new restaurant into database
          const { data: insertedRestaurant, error: insertError } =
            await supabase
              .from('restaurants')
              .insert([
                {
                  user_id: user.id,
                  name: newRestaurant.name,
                  cuisine: newRestaurant.cuisine,
                  address: newRestaurant.address,
                  latitude: newRestaurant.latitude,
                  longitude: newRestaurant.longitude,
                  image_url: newRestaurant.image,
                  notes: newRestaurant.description,
                  // Optional fields - only include if they exist in schema
                  ...(newRestaurant.phone && { phone: newRestaurant.phone }),
                  ...(newRestaurant.website && {
                    website: newRestaurant.website,
                  }),
                },
              ])
              .select('id')
              .single();

          if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
          }

          restaurantId = insertedRestaurant.id;
          newRestaurant.id = restaurantId;

          // Insert tags if any
          if (newRestaurant.tags && newRestaurant.tags.length > 0) {
            const tagsRows = newRestaurant.tags.map((tag) => ({
              restaurant_id: restaurantId,
              tag: tag,
            }));

            const { error: tagError } = await supabase
              .from('restaurant_tags')
              .insert(tagsRows);

            if (tagError) {
              console.error('Tag insert error:', tagError);
            }
          }

          Alert.alert(
            'Success',
            `${newRestaurant.name} has been added to your restaurants!`
          );
        } else {
          newRestaurant.id = restaurantId;
          Alert.alert(
            'Already Added',
            'This restaurant is already in your list'
          );
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        Alert.alert('Error', 'Failed to save restaurant to database');
      }

      // Add to local restaurants list (for immediate UI update)
      setRestaurants((prev) => {
        const exists = prev.some(
          (r) => r.id === newRestaurant.id || r.name === newRestaurant.name
        );
        if (exists) return prev;
        return [newRestaurant, ...prev];
      });

      // Select and show the new restaurant on map
      setSelectedRestaurant(newRestaurant);
      setShowBottomSheet(true);

      // Animate map to the new location
      if (mapRef.current && newRestaurant.latitude && newRestaurant.longitude) {
        mapRef.current.animateToRegion(
          {
            latitude: newRestaurant.latitude,
            longitude: newRestaurant.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          500
        );
      }

      hapticLight();
    } catch (error) {
      console.error('Error selecting place:', error);
      Alert.alert('Error', 'Failed to add restaurant');
    }
  };

  // Handle Google Place selection with Must Try flag
  const handleSelectPlaceAsMustTry = async (place: any) => {
    try {
      // First, add the restaurant normally
      await handleSelectPlace(place);

      // Then flag it as must-try
      const restaurantId = place.place_id;
      if (restaurantId) {
        await mustTryService.addRestaurantToMustTry(restaurantId);
        Alert.alert(
          'Success!',
          `${place.name} has been added to your Must Try list! 🌟`
        );
      }
    } catch (error) {
      console.error('Error adding as must-try:', error);
      Alert.alert('Error', 'Failed to add to Must Try list');
    }
  };

  const renderMapHeader = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.mapHeader}>
      <SafeAreaView edges={['top']}>
        {/* Floating Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => setShowPlacesSearch(true)}
            activeOpacity={0.9}
          >
            <Search size={20} color="#9CA3AF" strokeWidth={2.5} />
            <Text style={styles.searchPlaceholder}>
              Search restaurants nearby...
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsMenuVisible(true)}
          >
            <Clipboard size={20} color={COLORS.primary} strokeWidth={2.5} />
            {lastFoodRestaurant &&
              Object.values(restaurantMenus).flat().length > 0 && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>
                    {Object.values(restaurantMenus).flat().length}
                  </Text>
                </View>
              )}
          </TouchableOpacity>
        </View>

        {/* Quick Filters - Fresha Style */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFilters}
          contentContainerStyle={styles.quickFiltersContent}
        >
          {/* Sort Chip */}
          <TouchableOpacity
            style={styles.filterChipWithIcon}
            onPress={() => setIsSortModalVisible(true)}
          >
            <ArrowUpDown size={14} color={COLORS.text} />
            <Text style={styles.filterChipText}>Sort</Text>
          </TouchableOpacity>

          {/* Filters Chip */}
          <TouchableOpacity
            style={styles.filterChipWithIcon}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <SlidersHorizontal size={14} color={COLORS.text} />
            <Text style={styles.filterChipText}>Filters</Text>
          </TouchableOpacity>

          {/* Price Range Chip */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedPriceRange && styles.filterChipActive,
            ]}
            onPress={() => {
              if (selectedPriceRange === '$$') {
                setSelectedPriceRange('');
              } else {
                setSelectedPriceRange('$$');
              }
            }}
          >
            <DollarSign
              size={14}
              color={selectedPriceRange ? COLORS.white : COLORS.text}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedPriceRange && styles.filterChipTextActive,
              ]}
            >
              {selectedPriceRange || 'Price'}
            </Text>
          </TouchableOpacity>

          {/* Rating Chip */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedRatingFilter && styles.filterChipActive,
            ]}
            onPress={() => {
              if (selectedRatingFilter === '4.0+') {
                setSelectedRatingFilter('');
              } else {
                setSelectedRatingFilter('4.0+');
              }
            }}
          >
            <Star
              size={14}
              color={selectedRatingFilter ? COLORS.white : COLORS.text}
              fill={selectedRatingFilter ? COLORS.white : 'none'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedRatingFilter && styles.filterChipTextActive,
              ]}
            >
              {selectedRatingFilter || 'Rating'}
            </Text>
          </TouchableOpacity>

          {/* Open Now Chip */}
          <TouchableOpacity style={styles.filterChip} onPress={() => {}}>
            <Clock size={14} color={COLORS.text} />
            <Text style={styles.filterChipText}>Open Now</Text>
          </TouchableOpacity>

          {/* Must Try Filter */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === 'Must Try' && styles.filterChipActive,
            ]}
            onPress={() =>
              setSelectedCategory(
                selectedCategory === 'Must Try' ? 'All' : 'Must Try'
              )
            }
          >
            <Star
              size={14}
              color={selectedCategory === 'Must Try' ? COLORS.white : '#FFC107'}
              fill="#FFC107"
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === 'Must Try' && styles.filterChipTextActive,
              ]}
            >
              Must Try
            </Text>
          </TouchableOpacity>

          {/* Visited Filter */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === 'Visited' && styles.filterChipActive,
            ]}
            onPress={() =>
              setSelectedCategory(
                selectedCategory === 'Visited' ? 'All' : 'Visited'
              )
            }
          >
            <MapPin
              size={14}
              color={selectedCategory === 'Visited' ? COLORS.white : '#FF6B9D'}
              fill="#FF6B9D"
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === 'Visited' && styles.filterChipTextActive,
              ]}
            >
              Visited
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );

  const renderBottomSheet = () => {
    if (!selectedRestaurant || !showBottomSheet) return null;

    return (
      <Animated.View
        entering={SlideInDown.duration(350).damping(30).stiffness(400)}
        exiting={SlideOutDown.duration(250)}
        style={styles.bottomSheet}
      >
        <View
          style={styles.bottomSheetHandleContainer}
          {...restaurantSheetPanResponder.panHandlers}
        >
          <View style={styles.bottomSheetHandle} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.bottomSheetScroll}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeBottomSheet}
          >
            <X size={20} color={COLORS.gray[600]} />
          </TouchableOpacity>

          {selectedRestaurant.image && (
            <Image
              source={{ uri: selectedRestaurant.image }}
              style={styles.bottomSheetImage}
            />
          )}

          <View style={styles.bottomSheetContent}>
            <View style={styles.restaurantHeader}>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>
                  {selectedRestaurant.name}
                </Text>
                <Text style={styles.restaurantCuisine}>
                  {selectedRestaurant.cuisine}
                </Text>
              </View>

              <View style={styles.ratingBadge}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.ratingText}>
                  {selectedRestaurant.rating}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <MapPin size={16} color={COLORS.gray[500]} />
                <Text style={styles.detailText}>
                  {selectedRestaurant.distance}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>•</Text>
                <Text style={styles.detailText}>
                  {selectedRestaurant.deliveryTime}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>•</Text>
                <Text style={styles.detailText}>
                  {selectedRestaurant.deliveryFee}
                </Text>
              </View>
            </View>

            {selectedRestaurant.description && (
              <Text style={styles.description}>
                {selectedRestaurant.description}
              </Text>
            )}

            <View style={styles.tagsContainer}>
              {selectedRestaurant.tags?.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.bottomSheetActions}>
              <TouchableOpacity
                style={styles.bottomSheetActionButton}
                onPress={() => {
                  closeBottomSheet();
                  // Navigate to Dine Plan with proper URL format
                  // Convert restaurant name to slug: "Ariel Modern Italian" -> "ariel-modern-italian"
                  const slug = selectedRestaurant.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  Linking.openURL(
                    `https://www.dineplan.com/restaurants/${slug}`
                  );
                }}
              >
                <Star size={20} color={COLORS.white} fill={COLORS.white} />
                <Text style={styles.bottomSheetActionText}>Book Table</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomSheetActionButton,
                  styles.secondaryActionButton,
                ]}
                onPress={() => {
                  closeBottomSheet();
                  const lat = selectedRestaurant.latitude || -33.9249;
                  const lng = selectedRestaurant.longitude || 18.4241;
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                  Linking.openURL(url);
                }}
              >
                <Navigation size={20} color={COLORS.primary} />
                <Text style={styles.bottomSheetActionTextSecondary}>
                  Get Directions
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => {
                closeBottomSheet();
                router.push(`/restaurant/${selectedRestaurant.id}`);
              }}
            >
              <Text style={styles.viewDetailsButtonText}>
                View Full Details
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.delay(100)}>
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={['#FF6B9D', '#FF8FAE', '#FFA6BE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <SafeAreaView style={styles.headerContainer}>
            <View style={styles.headerTop}>
              <View style={styles.locationContainer}>
                <MapPin size={14} color={COLORS.white} />
                <Text style={styles.locationText}>Kuils River</Text>
              </View>
              <View style={styles.headerIcons}>
                {/* XP & Streak - Compact Mode */}
                <View style={styles.gamificationCompact}>
                  <StreakCounter currentStreak={7} longestStreak={15} compact />
                </View>
                <TouchableOpacity style={styles.iconButton}>
                  <Bell size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setIsMenuVisible(true)}
                >
                  <Clipboard size={20} color={COLORS.white} />
                  {lastFoodRestaurant && <View style={styles.menuBadge} />}
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroSubtitle}>Discover</Text>
              <Text style={styles.heroTitle}>Great Places{'\n'}Near You</Text>
            </View>
            {/* XP Progress Bar */}
            <View style={styles.xpProgressContainer}>
              <XPProgressBar
                currentXP={3450}
                level={12}
                onPress={() => router.push('/(tabs)/gamification' as any)}
              />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.searchWrapper}>
          <TouchableOpacity
            style={styles.searchContainer}
            onPress={() => router.push('/search')}
          >
            <Search size={20} color={COLORS.gray[400]} strokeWidth={2.5} />
            <Text style={styles.searchPlaceholder}>
              Search for restaurants...
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderTabs = () => (
    <Animated.View
      entering={FadeInRight.delay(200)}
      style={styles.tabContainer}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const renderCategories = () => (
    <Animated.View entering={FadeInRight.delay(300)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
      >
        {/* Add an "All" category */}
        <CategoryButton
          title="All"
          isActive={selectedCategory === 'All'}
          onPress={() => setSelectedCategory('All')}
        />
        {CATEGORIES.map((category) => (
          <CategoryButton
            key={category}
            title={category}
            isActive={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderFeatured = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Featured Restaurants */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Restaurants</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        ) : restaurants.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {restaurants.slice(0, 5).map((restaurant, index) => (
              <Animated.View
                key={restaurant.id}
                entering={FadeInRight.delay(500 + index * 100)}
                style={styles.featuredCardContainer}
              >
                <RestaurantCard
                  restaurant={restaurant}
                  onPress={() => handleRestaurantPress(restaurant)}
                />
              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No restaurants found</Text>
        )}
      </Animated.View>

      {/* Must Try */}
      <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Must Try</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading must try items...</Text>
        ) : mustTryItems.length > 0 ? (
          mustTryItems.slice(0, 3).map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(700 + index * 100)}
              style={styles.mustTryCard}
            >
              <TouchableOpacity
                style={styles.mustTryCardContent}
                onPress={() => {
                  // handle item click; supports both restaurant and dish types
                  if (
                    (item as any).type === 'restaurant' &&
                    (item as any).restaurantId
                  ) {
                    router.push(`/restaurant/${(item as any).restaurantId}`);
                  } else if ((item as any).restaurantId) {
                    router.push(`/restaurant/${(item as any).restaurantId}`);
                  }
                }}
              >
                <View style={styles.mustTryImageContainer}>
                  {/* defensive rendering for missing image */}
                  {(item as any).image ? (
                    <Image
                      source={{ uri: (item as any).image }}
                      style={styles.mustTryImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.mustTryImage,
                        { backgroundColor: COLORS.gray[100] },
                      ]}
                    />
                  )}
                  <View style={styles.mustTryBadge}>
                    <Text style={styles.mustTryBadgeText}>Must Try</Text>
                  </View>
                </View>

                <View style={styles.mustTryInfo}>
                  <Text style={styles.mustTryName}>
                    {(item as any).type === 'restaurant'
                      ? (item as any).restaurantName ?? (item as any).name
                      : (item as any).foodItemName ?? (item as any).name}
                  </Text>
                  <Text style={styles.mustTrySubtitle}>
                    {(item as any).type === 'restaurant'
                      ? (item as any).cuisine ?? ''
                      : `${(item as any).category ?? 'Dish'} at ${
                          (item as any).restaurantName ?? ''
                        }`}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyMustTry}>
            <Text style={styles.emptyMustTryText}>No Must-Try Items Yet</Text>
            <Text style={styles.emptyMustTrySubtext}>
              Add your favorite restaurants and dishes to your must-try list
            </Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );

  const renderRecent = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      ) : restaurants.length > 0 ? (
        restaurants.slice(0, 10).map((restaurant, index) => (
          <Animated.View
            key={restaurant.id}
            entering={FadeInDown.delay(500 + index * 100)}
          >
            <RestaurantCard
              restaurant={restaurant}
              width={350}
              height={300}
              onPress={() => handleRestaurantPress(restaurant)}
            />
          </Animated.View>
        ))
      ) : (
        <Text style={styles.emptyText}>No recent orders</Text>
      )}
    </Animated.View>
  );

  const renderFavourites = () => {
    const favoriteRestaurants = restaurants.filter((r) => r.isFavorite);
    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Favourites</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          {favoriteRestaurants.length} favorite
          {favoriteRestaurants.length !== 1 ? 's' : ''}
        </Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading favorites...</Text>
        ) : favoriteRestaurants.length > 0 ? (
          favoriteRestaurants.map((restaurant, index) => (
            <Animated.View
              key={restaurant.id}
              entering={FadeInDown.delay(500 + index * 100)}
            >
              <RestaurantCard
                restaurant={restaurant}
                variant="horizontal"
                onPress={() => handleRestaurantPress(restaurant)}
              />
            </Animated.View>
          ))
        ) : (
          <Animated.View
            entering={FadeInDown.delay(600)}
            style={styles.emptyState}
          >
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>♡</Text>
            </View>
            <Text style={styles.emptyStateText}>No Favorites Yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the heart icon on restaurants to add them to your favorites
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Map View - Only render on native platforms */}
      {Platform.OS !== 'web' && MapView ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={mapStyle}
        >
          {filteredRestaurants.map((restaurant) => {
            if (!restaurant.latitude || !restaurant.longitude) return null;

            // Determine marker color: yellow for must-try, pink for visited, primary for others
            const isMustTry =
              restaurant.mustTry ||
              mustTryItems.some(
                (item) => (item as any).restaurantId === restaurant.id
              );
            const hasVisited = restaurant.lastVisited;
            const isSelected = selectedRestaurant?.id === restaurant.id;

            let markerColor = COLORS.primary; // Default color
            if (isMustTry) {
              markerColor = '#FFC107'; // Yellow for must-try
            } else if (hasVisited) {
              markerColor = '#FF6B9D'; // Pink for visited
            }

            return (
              <Marker
                key={restaurant.id}
                coordinate={{
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                }}
                onPress={() => handleMarkerPress(restaurant)}
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: markerColor },
                    isSelected && styles.markerContainerSelected,
                  ]}
                >
                  <MapPin
                    size={isSelected ? 22 : 18}
                    color={COLORS.white}
                    fill={COLORS.white}
                    strokeWidth={0}
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>
      ) : (
        // Fallback for web - show a placeholder
        <View
          style={[
            styles.map,
            {
              backgroundColor: COLORS.gray[100],
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <MapPin size={48} color={COLORS.gray[400]} />
          <Text style={{ color: COLORS.gray[600], marginTop: 12 }}>
            Map view not available on web
          </Text>
          <Text style={{ color: COLORS.gray[500], marginTop: 4, fontSize: 12 }}>
            Please use a mobile device
          </Text>
        </View>
      )}

      {/* Map Header */}
      {renderMapHeader()}

      {/* Bottom Sheet with Restaurant Details */}
      {renderBottomSheet()}

      {/* Unified Bottom Sheet - Only show when no restaurant selected */}
      {!showBottomSheet && !isSheetClosed && (
        <>
          {/* Unified Bottom Sheet with Recommended | My Places Tabs */}
          <Animated.View
            style={[styles.floatingFeaturesContainer, animatedSheetStyle]}
          >
            {/* Drag Handle with Close Button */}
            <View style={styles.dragHandleContainer}>
              {/* Close Button - Left Side */}
              <TouchableOpacity
                style={styles.closeSheetButton}
                onPress={handleCloseSheet}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={15} color={COLORS.gray[600]} strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Centered Drag Handle */}
              <View
                style={styles.dragHandle}
                {...dragHandlePanResponder.panHandlers}
              >
                <View style={styles.dragHandleBar} />
              </View>

              {/* Spacer for symmetry */}
              <View style={{ width: 34 }} />
            </View>

            {/* Mode Tab Switcher: Recommended | Favourites */}
            <View style={styles.modeSwitcherContainer}>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  bottomSheetMode === 'recommended' && styles.modeTabActive,
                ]}
                onPress={() => setBottomSheetMode('recommended')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    bottomSheetMode === 'recommended' &&
                      styles.modeTabTextActive,
                  ]}
                >
                  Recommended
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeTab,
                  bottomSheetMode === 'myPlaces' && styles.modeTabActive,
                ]}
                onPress={() => setBottomSheetMode('myPlaces')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    bottomSheetMode === 'myPlaces' && styles.modeTabTextActive,
                  ]}
                >
                  Favourites
                </Text>
              </TouchableOpacity>
            </View>

            {/* Conditional Content based on Mode */}
            {bottomSheetMode === 'recommended' ? (
              <ScrollView
                ref={scrollViewRef}
                style={styles.featuresScrollView}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={(event) => {
                  const offsetY = event.nativeEvent.contentOffset.y;
                  setIsScrollAtTop(offsetY <= 0);
                }}
                bounces={true}
              >
                {/* Quick Actions Section */}
                {/* <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => {
                    // Navigate to nutrition tab to log meal
                    router.push('/nutrition');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickActionIcon}>
                    <Text style={styles.quickActionEmoji}>📝</Text>
                  </View>
                  <Text style={styles.quickActionText}>Log Meal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => setShowAddModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickActionIcon}>
                    <Text style={styles.quickActionEmoji}>⭐</Text>
                  </View>
                  <Text style={styles.quickActionText}>Add Place</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push('/favorites')}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickActionIcon}>
                    <Text style={styles.quickActionEmoji}>❤️</Text>
                  </View>
                  <Text style={styles.quickActionText}>Favorites</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push('/search')}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickActionIcon}>
                    <Text style={styles.quickActionEmoji}>�</Text>
                  </View>
                  <Text style={styles.quickActionText}>Search</Text>
                </TouchableOpacity>
              </View> */}

                {/* Featured Near You Section - Shows all restaurants */}
                {/* <View style={styles.featuredSection}>
                <View style={styles.featuredHeader}>
                  <Text style={styles.featuredTitle}>Featured Near You</Text>
                  <TouchableOpacity onPress={() => router.push('/search')}>
                    <Text style={styles.seeAllLink}>See All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredScroll}
                >
                  {restaurants
                    .slice(0, 10) // Show first 10 restaurants (featured OR not)
                    .map((restaurant, index) => (
                      <Animated.View
                        key={restaurant.id}
                        entering={FadeInRight.delay(500 + index * 100)}
                      >
                        <TouchableOpacity
                          style={styles.featuredCard}
                          onPress={() => handleMarkerPress(restaurant)}
                        >
                          <Image
                            source={{ uri: restaurant.image }}
                            style={styles.featuredCardImage}
                          />
                          <View style={styles.featuredCardContent}>
                            <Text
                              style={styles.featuredCardName}
                              numberOfLines={1}
                            >
                              {restaurant.name}
                            </Text>
                            <View style={styles.featuredCardMeta}>
                              <View style={styles.featuredRating}>
                                <Star
                                  size={12}
                                  color={COLORS.warning}
                                  fill={COLORS.warning}
                                />
                                <Text style={styles.featuredRatingText}>
                                  {restaurant.rating}
                                </Text>
                              </View>
                              <Text style={styles.featuredDistance}>
                                {restaurant.distance}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                </ScrollView>
              </View> */}

                {/* Collections Quick Access */}

                {/* 1️⃣ Close By Right Now Section */}
                <View style={styles.bottomSheetSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeaderTitle}>
                      📍 Close By Right Now
                    </Text>
                    <Text style={styles.sectionHeaderSubtitle}>Within 2km</Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalCardScroll}
                  >
                    {dummyFeaturedRestaurants.slice(0, 3).map((restaurant) => (
                      <TouchableOpacity
                        key={restaurant.id}
                        style={styles.compactCard}
                        onPress={() => handleMarkerPress(restaurant)}
                      >
                        <Image
                          source={{ uri: restaurant.image }}
                          style={styles.compactCardImage}
                        />
                        <View style={styles.compactCardContent}>
                          <Text
                            style={styles.compactCardName}
                            numberOfLines={1}
                          >
                            {restaurant.name}
                          </Text>
                          <View style={styles.compactCardMeta}>
                            <Star
                              size={12}
                              color={COLORS.warning}
                              fill={COLORS.warning}
                            />
                            <Text style={styles.compactCardRating}>
                              {restaurant.rating}
                            </Text>
                            <Text style={styles.compactCardDot}>•</Text>
                            <Text style={styles.compactCardDistance}>
                              {restaurant.distance}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* 2️⃣ Trending in Cape Town Section */}
                <View style={styles.bottomSheetSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeaderTitle}>
                      🔥 Trending in Cape Town
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/search')}>
                      <Text style={styles.seeMoreLink}>See All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.trendingList}>
                    <TouchableOpacity
                      style={styles.trendingItem}
                      onPress={() =>
                        handleMarkerPress(dummyFeaturedRestaurants[0])
                      }
                    >
                      <View style={styles.trendingRank}>
                        <Text style={styles.trendingRankText}>1</Text>
                      </View>
                      <Image
                        source={{ uri: dummyFeaturedRestaurants[0].image }}
                        style={styles.trendingImage}
                      />
                      <View style={styles.trendingContent}>
                        <Text style={styles.trendingName}>
                          {dummyFeaturedRestaurants[0].name}
                        </Text>
                        <Text style={styles.trendingCuisine}>
                          {dummyFeaturedRestaurants[0].cuisine}
                        </Text>
                      </View>
                      <View style={styles.trendingStats}>
                        <Text style={styles.trendingViews}>12.3k views</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.trendingItem}
                      onPress={() =>
                        handleMarkerPress(dummyFeaturedRestaurants[2])
                      }
                    >
                      <View style={styles.trendingRank}>
                        <Text style={styles.trendingRankText}>2</Text>
                      </View>
                      <Image
                        source={{ uri: dummyFeaturedRestaurants[2].image }}
                        style={styles.trendingImage}
                      />
                      <View style={styles.trendingContent}>
                        <Text style={styles.trendingName}>
                          {dummyFeaturedRestaurants[2].name}
                        </Text>
                        <Text style={styles.trendingCuisine}>
                          {dummyFeaturedRestaurants[2].cuisine}
                        </Text>
                      </View>
                      <View style={styles.trendingStats}>
                        <Text style={styles.trendingViews}>8.9k views</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.trendingItem}
                      onPress={() =>
                        handleMarkerPress(dummyFeaturedRestaurants[3])
                      }
                    >
                      <View style={styles.trendingRank}>
                        <Text style={styles.trendingRankText}>3</Text>
                      </View>
                      <Image
                        source={{ uri: dummyFeaturedRestaurants[3].image }}
                        style={styles.trendingImage}
                      />
                      <View style={styles.trendingContent}>
                        <Text style={styles.trendingName}>
                          {dummyFeaturedRestaurants[3].name}
                        </Text>
                        <Text style={styles.trendingCuisine}>
                          {dummyFeaturedRestaurants[3].cuisine}
                        </Text>
                      </View>
                      <View style={styles.trendingStats}>
                        <Text style={styles.trendingViews}>7.2k views</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3️⃣ AI Picks For You Section */}
                <View style={styles.bottomSheetSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeaderTitle}>
                      ✨ AI Picks For You
                    </Text>
                    <Text style={styles.sectionHeaderSubtitle}>
                      Based on your taste
                    </Text>
                  </View>

                  <View style={styles.aiPicksList}>
                    <TouchableOpacity
                      style={styles.aiPickCard}
                      onPress={() =>
                        handleMarkerPress(dummyFeaturedRestaurants[1])
                      }
                    >
                      <Image
                        source={{ uri: dummyFeaturedRestaurants[1].image }}
                        style={styles.aiPickImage}
                      />
                      <View style={styles.aiPickBadge}>
                        <Text style={styles.aiPickBadgeText}>95% Match</Text>
                      </View>
                      <View style={styles.aiPickContent}>
                        <Text style={styles.aiPickName}>
                          {dummyFeaturedRestaurants[1].name}
                        </Text>
                        <Text style={styles.aiPickReason}>
                          You love French cuisine
                        </Text>
                        <View style={styles.aiPickMeta}>
                          <Star
                            size={12}
                            color={COLORS.warning}
                            fill={COLORS.warning}
                          />
                          <Text style={styles.aiPickRating}>
                            {dummyFeaturedRestaurants[1].rating}
                          </Text>
                          <Text style={styles.aiPickDot}>•</Text>
                          <Text style={styles.aiPickDistance}>
                            {dummyFeaturedRestaurants[1].distance}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.aiPickCard}
                      onPress={() =>
                        handleMarkerPress(dummyFeaturedRestaurants[4])
                      }
                    >
                      <Image
                        source={{ uri: dummyFeaturedRestaurants[4].image }}
                        style={styles.aiPickImage}
                      />
                      <View style={styles.aiPickBadge}>
                        <Text style={styles.aiPickBadgeText}>88% Match</Text>
                      </View>
                      <View style={styles.aiPickContent}>
                        <Text style={styles.aiPickName}>
                          {dummyFeaturedRestaurants[4].name}
                        </Text>
                        <Text style={styles.aiPickReason}>
                          Popular with similar users
                        </Text>
                        <View style={styles.aiPickMeta}>
                          <Star
                            size={12}
                            color={COLORS.warning}
                            fill={COLORS.warning}
                          />
                          <Text style={styles.aiPickRating}>
                            {dummyFeaturedRestaurants[4].rating}
                          </Text>
                          <Text style={styles.aiPickDot}>•</Text>
                          <Text style={styles.aiPickDistance}>
                            {dummyFeaturedRestaurants[4].distance}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            ) : (
              // Favourites Mode - Show Full FavouritesView Component
              <View style={styles.favouritesScrollView}>
                <FavouritesView
                  restaurants={restaurants.filter((r) => r.isFavorite)}
                  mustTryRestaurants={mustTryItems
                    .map((item) =>
                      restaurants.find((r) => r.id === item.restaurantId)
                    )
                    .filter((r): r is Restaurant => r !== undefined)}
                  collections={collections}
                  onRestaurantPress={handleMarkerPress}
                  onCreateCollection={() => {
                    // Open collection creation modal
                    setShowAddModal(true);
                  }}
                  onAddToCollection={(
                    restaurantId: string,
                    collectionId: string
                  ) => {
                    // Handle adding restaurant to collection
                    console.log(
                      'Add restaurant to collection:',
                      restaurantId,
                      collectionId
                    );
                  }}
                  onAddPlace={() => setShowAddModal(true)}
                />
              </View>
            )}
          </Animated.View>
        </>
      )}

      {/* Reopen Sheet Button - Show when sheet is closed */}
      {!showBottomSheet && isSheetClosed && (
        <Animated.View
          entering={FadeInUp.delay(200)}
          exiting={FadeOutDown}
          style={styles.reopenSheetButton}
        >
          <TouchableOpacity
            onPress={handleReopenSheet}
            style={styles.reopenSheetButtonInner}
            activeOpacity={0.8}
          >
            <ChevronUp size={24} color={COLORS.white} strokeWidth={3} />
            <Text style={styles.reopenSheetButtonText}>Show Places</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Floating Add Button */}
      {!showBottomSheet && (
        <Animated.View
          style={[
            styles.floatingAddButton,
            isSheetClosed && styles.floatingAddButtonClosed,
          ]}
        >
          <TouchableOpacity
            style={styles.floatingAddButtonInner}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.9}
          >
            <Plus size={29} color={COLORS.white} strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddItem}
      />

      {/* Instagram Import Modal */}
      <InstagramImportModal
        visible={showInstagramImport}
        onClose={() => setShowInstagramImport(false)}
        onImportSuccess={(restaurant) => {
          setRestaurants((prev) => [restaurant, ...prev]);
          setShowInstagramImport(false);
        }}
      />

      {/* Menu Bottom Sheet */}
      <MenuBottomSheet
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        restaurant={getCurrentRestaurant()}
        menuItems={
          getCurrentRestaurant()
            ? restaurantMenus[getCurrentRestaurant().id] || []
            : []
        }
        onAddFood={handleAddFood}
      />

      {/* Sort Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSortModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Apply recommended sort
                setIsSortModalVisible(false);
              }}
            >
              <Text style={styles.modalOptionText}>Recommended</Text>
              <Text style={styles.modalOptionSubtext}>
                Our top picks for you
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Apply rating sort
                setIsSortModalVisible(false);
              }}
            >
              <Text style={styles.modalOptionText}>Highest Rated</Text>
              <Text style={styles.modalOptionSubtext}>
                Best reviewed places
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Apply popularity sort
                setIsSortModalVisible(false);
              }}
            >
              <Text style={styles.modalOptionText}>Most Popular</Text>
              <Text style={styles.modalOptionSubtext}>Trending right now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Apply distance sort
                setIsSortModalVisible(false);
              }}
            >
              <Text style={styles.modalOptionText}>Nearest</Text>
              <Text style={styles.modalOptionSubtext}>Closest to you</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                // Apply price sort
                setIsSortModalVisible(false);
              }}
            >
              <Text style={styles.modalOptionText}>Price: Low to High</Text>
              <Text style={styles.modalOptionSubtext}>
                Most affordable first
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.modalContent, { maxHeight: height * 0.7 }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterScrollView}>
              {/* Cuisine Type */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Cuisine Type</Text>
                <View style={styles.filterOptionsGrid}>
                  {CATEGORIES.map((cuisine) => (
                    <TouchableOpacity
                      key={cuisine}
                      style={[
                        styles.filterOption,
                        selectedCategory === cuisine &&
                          styles.filterOptionActive,
                      ]}
                      onPress={() =>
                        setSelectedCategory(
                          selectedCategory === cuisine ? 'All' : cuisine
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedCategory === cuisine &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        {cuisine}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Price Range</Text>
                <View style={styles.filterOptionsGrid}>
                  {['R', 'RR', 'RRR', 'RRRR'].map((price, index) => (
                    <TouchableOpacity
                      key={price}
                      style={[
                        styles.filterOption,
                        selectedPriceRange === price &&
                          styles.filterOptionActive,
                      ]}
                      onPress={() =>
                        setSelectedPriceRange(
                          selectedPriceRange === price ? '' : price
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedPriceRange === price &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        {price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Distance */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Distance</Text>
                <View style={styles.filterOptionsGrid}>
                  {['1km', '3km', '5km', '10km', '20km'].map((distance) => (
                    <TouchableOpacity
                      key={distance}
                      style={styles.filterOption}
                      onPress={() => {}}
                    >
                      <Text style={styles.filterOptionText}>{distance}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Meal Type */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Meal Type</Text>
                <View style={styles.filterOptionsGrid}>
                  {['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Late Night'].map(
                    (meal) => (
                      <TouchableOpacity
                        key={meal}
                        style={styles.filterOption}
                        onPress={() => {}}
                      >
                        <Text style={styles.filterOptionText}>{meal}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              {/* Dietary Options */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Dietary Options</Text>
                <View style={styles.filterOptionsGrid}>
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'].map(
                    (diet) => (
                      <TouchableOpacity
                        key={diet}
                        style={styles.filterOption}
                        onPress={() => {}}
                      >
                        <Text style={styles.filterOptionText}>{diet}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              {/* Amenities */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>Amenities</Text>
                <View style={styles.filterOptionsGrid}>
                  {[
                    'Outdoor Seating',
                    'WiFi',
                    'Parking',
                    'Delivery',
                    'Pet Friendly',
                  ].map((amenity) => (
                    <TouchableOpacity
                      key={amenity}
                      style={styles.filterOption}
                      onPress={() => {}}
                    >
                      <Text style={styles.filterOptionText}>{amenity}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedPriceRange('');
                  setSelectedRatingFilter('');
                  setSelectedCategory('All');
                }}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Google Places Search Modal */}
      <Modal
        visible={showPlacesSearch}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowPlacesSearch(false)}
      >
        <GooglePlacesSearch
          onClose={() => setShowPlacesSearch(false)}
          onSelectPlace={handleSelectPlace}
          onSelectPlaceAsMustTry={handleSelectPlaceAsMustTry}
          initialLocation={initialRegion}
        />
      </Modal>
    </View>
  );
}

// Custom map style (light, clean design similar to Curated Corners)
const mapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    width: width,
    height: height,
  },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: SPACING.md,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl + 4,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    gap: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[400],
    letterSpacing: -0.3,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quickFilters: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  quickFiltersContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowOpacity: 0.15,
  },
  filterChipText: {
    fontSize: FONT_SIZES.xs + 1,
    fontWeight: '700',
    color: COLORS.gray[700],
    letterSpacing: -0.2,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  filterChipWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  modalOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  modalOptionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  modalOptionSubtext: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '400',
    color: COLORS.gray[500],
    letterSpacing: -0.1,
  },
  filterScrollView: {
    maxHeight: height * 0.5,
  },
  filterGroup: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  filterGroupTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: SPACING.md,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  filterOptionTextActive: {
    color: COLORS.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  clearButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  applyButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  markerContainer: {
    // backgroundColor will be set dynamically (yellow for must-try, pink for visited, primary for default)
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
    paddingBottom: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainerSelected: {
    // Keep the same background color, just enhance the styling
    paddingHorizontal: 5,
    paddingVertical: 5,
    paddingBottom: 3,
    borderRadius: 16,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 2.5,
  },
  markerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    maxHeight: height * 0.55,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 24,
    zIndex: 30,
    padding: SPACING.md,
  },
  bottomSheetHandleContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.sm,
  },
  bottomSheetScroll: {
    flex: 1,
  },
  bottomSheetImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.gray[100],
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
  },
  bottomSheetContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  restaurantInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  restaurantName: {
    fontSize: FONT_SIZES.xl + 2,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  restaurantCuisine: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    lineHeight: 18,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.warning,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '600',
    lineHeight: 18,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 21,
    marginBottom: SPACING.lg,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  tagText: {
    fontSize: FONT_SIZES.xs + 1,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 16,
  },
  // Must Try Section Styles
  mustTrySection: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  mustTrySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  mustTrySectionSubtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginBottom: SPACING.md,
  },
  mustTryInput: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    fontSize: 14,
    color: COLORS.gray[900],
  },
  mustTryPriceInput: {
    width: '40%',
  },
  saveMustTryButton: {
    backgroundColor: '#FFC107',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.sm,
  },
  saveMustTryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  bottomSheetActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryActionButton: {
    backgroundColor: COLORS.gray[50],
    shadowColor: COLORS.gray[400],
    shadowOpacity: 0.1,
  },
  bottomSheetActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 18,
  },
  bottomSheetActionTextSecondary: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: 18,
  },
  viewDetailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  viewDetailsButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    backgroundColor: COLORS.primary,
  },
  heroGradient: {
    paddingBottom: SPACING.xxl,
  },
  headerContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md + 4,
    paddingVertical: SPACING.sm + 4,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  locationText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  gamificationCompact: {
    marginRight: SPACING.xs,
  },
  xpProgressContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  heroContent: {
    marginBottom: SPACING.lg,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.massive,
    fontWeight: '800',
    lineHeight: FONT_SIZES.massive * 1.2,
    letterSpacing: -1,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.xl,
    marginTop: -SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  content: {
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: -0.2,
  },
  activeTabText: {
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontWeight: '500',
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  clearAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoriesScroll: {
    marginHorizontal: -SPACING.xl,
  },
  featuredCardContainer: {
    marginRight: SPACING.lg,
  },
  horizontalScrollContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  mustTryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mustTryCardContent: {
    flexDirection: 'row',
    padding: SPACING.lg + 4,
  },
  mustTryImageContainer: {
    position: 'relative',
    marginRight: SPACING.lg,
  },
  mustTryImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
  },
  mustTryBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  mustTryBadgeText: {
    fontSize: FONT_SIZES.xxxs,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  mustTryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mustTryName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: -0.4,
  },
  mustTrySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  emptyMustTry: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginVertical: SPACING.md,
  },
  emptyMustTryText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyMustTrySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },

  menuBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  menuBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  collectionCard: {
    width: 180,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  collectionCardContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  collectionIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  collectionEmoji: {
    fontSize: FONT_SIZES.xxxl,
  },
  collectionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  collectionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptyCollections: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyCollectionsText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  emptyCollectionsSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.massive,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyIconText: {
    fontSize: FONT_SIZES.massive,
    color: COLORS.gray[300],
  },
  emptyStateText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.xxl,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.xxl,
    fontWeight: '500',
  },
  floatingFeaturesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl + 8,
    borderTopRightRadius: BORDER_RADIUS.xxl + 8,
    paddingBottom: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    zIndex: 25,
  },
  dragHandle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  dragHandleBar: {
    width: 36,
    height: 3.5,
    backgroundColor: COLORS.gray[400],
    borderRadius: BORDER_RADIUS.full,
  },
  featuresScrollView: {
    flex: 1,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionText: {
    fontSize: FONT_SIZES.xs + 1,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  // Recent Activity Section Styles
  recentActivitySection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  recentActivityHeader: {
    marginBottom: SPACING.md,
  },
  recentActivityTitle: {
    fontSize: FONT_SIZES.md + 2,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.xxs,
  },
  recentActivitySubtitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray[500],
    letterSpacing: -0.2,
  },
  recentActivityList: {
    gap: SPACING.xs,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    gap: SPACING.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
    marginBottom: SPACING.xxs / 2,
  },
  activityHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  activityTime: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.gray[500],
    letterSpacing: -0.1,
  },
  featuredSection: {
    marginBottom: SPACING.lg,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  featuredTitle: {
    fontSize: FONT_SIZES.md + 2,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  seeAllLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.2,
  },
  featuredScroll: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  featuredCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg + 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    overflow: 'hidden',
  },
  featuredCardImage: {
    width: '100%',
    height: 80,
    backgroundColor: COLORS.gray[100],
  },
  featuredCardContent: {
    padding: SPACING.sm + 2,
  },
  featuredCardName: {
    fontSize: FONT_SIZES.sm + 1,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs - 2,
    letterSpacing: -0.3,
  },
  featuredCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs - 2,
  },
  featuredRatingText: {
    fontSize: FONT_SIZES.xs + 2,
    fontWeight: '700',
    color: COLORS.text,
  },
  featuredDistance: {
    fontSize: FONT_SIZES.xxs + 1,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  collectionsSection: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  collectionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  collectionsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  collectionsScroll: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  collectionQuickCard: {
    width: 100,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  collectionQuickIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  collectionQuickEmoji: {
    fontSize: FONT_SIZES.xl,
  },
  collectionQuickName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxs,
    letterSpacing: -0.2,
  },
  collectionQuickCount: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  // Exploration Challenges Styles
  explorationSection: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  explorationChallenges: {
    gap: SPACING.md,
  },
  challengeCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  challengeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  challengeIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeEmoji: {
    fontSize: 28,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  challengeDescription: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  challengeProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
  },
  challengeProgressText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  challengeReward: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  challengeRewardText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  // Bottom Sheet Sections Styles
  bottomSheetSection: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sectionHeaderSubtitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seeMoreLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Close By Right Now Styles
  horizontalCardScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  compactCard: {
    width: 160,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  compactCardImage: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.gray[100],
  },
  compactCardContent: {
    padding: SPACING.sm,
  },
  compactCardName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xxs,
    letterSpacing: -0.2,
  },
  compactCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  compactCardRating: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  compactCardDot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
  },
  compactCardDistance: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  // Trending in Cape Town Styles
  trendingList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  trendingRank: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingRankText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
  },
  trendingImage: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
  },
  trendingContent: {
    flex: 1,
  },
  trendingName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xxs,
    letterSpacing: -0.2,
  },
  trendingCuisine: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  trendingStats: {
    alignItems: 'flex-end',
  },
  trendingViews: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  // AI Picks For You Styles
  aiPicksList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  aiPickCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  aiPickImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.gray[100],
  },
  aiPickBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  aiPickBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  aiPickContent: {
    padding: SPACING.md,
  },
  aiPickName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xxs,
    letterSpacing: -0.3,
  },
  aiPickReason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  aiPickMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  aiPickRating: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  aiPickDot: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
  },
  aiPickDistance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  // Floating Add Button
  floatingAddButton: {
    position: 'absolute',
    bottom: 330, // Above the bottom sheet with margin
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10, // Added vertical margin
  },
  floatingAddButtonClosed: {
    bottom: 120, // 30px above the "Show Places" button (which is at bottom: 30 + ~60px button height)
  },
  floatingAddButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary, // Primary pink color
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Bottom Sheet Close/Reopen Controls
  dragHandleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    width: '100%',
  },
  closeSheetButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.md - 8, // 12px margin all around
  },
  // Mode Switcher (Recommended | My Places)
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingHorizontal: SPACING.lg,
  },
  modeTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeTabActive: {
    borderBottomColor: COLORS.primary,
  },
  modeTabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[500],
    letterSpacing: -0.3,
  },
  modeTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  myPlacesContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // Favourites List in Bottom Sheet
  favouritesScrollView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  favouritesListContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: 100, // Extra space for better scrolling
  },
  emptyFavouritesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 3,
    paddingHorizontal: SPACING.xl,
  },
  emptyFavouritesEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyFavouritesTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyFavouritesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  reopenSheetButton: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  reopenSheetButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  reopenSheetButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.lg,
    marginLeft: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  legendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
});
