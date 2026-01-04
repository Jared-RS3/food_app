import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {
  gamificationService,
  XP_REWARDS,
} from '@/services/gamificationService';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChefHat,
  MapPin,
  Plus,
  Search,
  Star,
  Utensils,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { height, width } = Dimensions.get('window');

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
}

interface RestaurantSummary {
  id: string;
  name: string;
  cuisine: string;
}

interface SerpAPIPlace {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  reviews?: number;
  phone?: string;
  website?: string;
  hours?: string;
  price?: string;
  type?: string;
  thumbnail?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const cuisineTypes = [
  'African',
  'American',
  'Asian',
  'Bakery',
  'Bar & Grill',
  'BBQ',
  'Breakfast',
  'Burgers',
  'Cafe',
  'Chinese',
  'Contemporary',
  'Deli',
  'Desserts',
  'European',
  'Family',
  'Fast Food',
  'Fine Dining',
  'French',
  'Fusion',
  'Greek',
  'Halal',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Latin American',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Pizza',
  'Portuguese',
  'Seafood',
  'Sushi',
  'Steakhouse',
  'Street Food',
  'Thai',
  'Turkish',
  'Vegan',
  'Vegetarian',
  'Vietnamese',
];

const foodCategories = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Beverage',
  'Snack',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Side Dish',
  'Salad',
  'Soup',
  'Pasta',
];

const quickTags = {
  restaurant: [
    'Fine Dining',
    'Casual Dining',
    'Family Friendly',
    'Date Night',
    'View',
    'Rooftop',
  ],
  food: [
    'Spicy',
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Popular',
    'Chef Special',
  ],
};

export default function AddItemModal({
  visible,
  onClose,
  onSave,
}: AddItemModalProps) {
  const [mode, setMode] = useState<'restaurant' | 'food'>('restaurant');
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(true); // Online (API search) or Offline (manual)
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [apiPlaces, setApiPlaces] = useState<SerpAPIPlace[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    category: '',
    priceLevel: '$$',
    price: '',
    address: '',
    description: '',
    linkedRestaurant: null as RestaurantSummary | null,
    tags: [] as string[],
    rating: 4.5,
    instagramUrl: '',
    image_url: null as string | null,
    phone: '',
    website: '',
    hours: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);

  const slideAnim = useSharedValue(height);
  const switchAnim = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      slideAnim.value = withSpring(0, {
        damping: 30,
        stiffness: 400,
        mass: 0.5,
        overshootClamping: false,
      });
      fetchRestaurants();
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      slideAnim.value = withTiming(height, {
        duration: 250,
      });
    }
  }, [visible]);

  useEffect(() => {
    switchAnim.value = withTiming(mode === 'restaurant' ? 0 : 1, {
      duration: 200,
    });

    // Clear form data when switching modes
    setFormData((prev) => ({
      ...prev,
      name: '',
      cuisine: '',
      category: '',
      priceLevel: '$$',
      price: '',
      address: '',
      description: '',
      linkedRestaurant: null,
      tags: [],
      rating: 4.5,
      instagramUrl: '',
      extractedImage: null,
    }));
    setShowRestaurantForm(false);
  }, [mode]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedSwitchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: switchAnim.value * (width * 0.4) }],
  }));

  const resetForm = () => {
    setFormData({
      name: '',
      cuisine: '',
      category: '',
      priceLevel: '$$',
      price: '',
      address: '',
      description: '',
      linkedRestaurant: null,
      tags: [],
      rating: 4.5,
      instagramUrl: '',
      image_url: null,
      phone: '',
      website: '',
      hours: '',
    });
    setShowRestaurantForm(false);
    setSearchQuery('');
    setApiPlaces([]);
    setIsOnlineMode(true);
  };

  // SerpAPI search for restaurants
  const searchRestaurantsAPI = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setApiPlaces([]);
      return;
    }

    setSearchingPlaces(true);
    try {
      const SERPAPI_KEY =
        'e8613b61ad1871519a29951f7c8ecb3021e2c6d774b7f1214e10c19dc1dfbd07';

      const params = new URLSearchParams({
        engine: 'google_maps',
        q: `${query} restaurant`,
        ll: '@-33.918,18.423,14z', // Cape Town coordinates
        type: 'search',
        api_key: SERPAPI_KEY,
      });

      const response = await fetch(
        `https://serpapi.com/search?${params.toString()}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      if (!response.ok) {
        console.error('SerpAPI error:', response.status);
        setApiPlaces([]);
        return;
      }

      const data = await response.json();

      if (data.error || !data.local_results) {
        setApiPlaces([]);
        return;
      }

      // Process and filter results to restaurants only
      const places: SerpAPIPlace[] = data.local_results
        .filter((result: any) => {
          if (!result.title || !result.gps_coordinates) return false;

          const isRestaurant =
            result.type?.toLowerCase().includes('restaurant') ||
            result.type?.toLowerCase().includes('food') ||
            result.type?.toLowerCase().includes('cafe') ||
            result.type?.toLowerCase().includes('bar') ||
            result.type?.toLowerCase().includes('dining');

          return isRestaurant;
        })
        .slice(0, 10)
        .map((result: any) => ({
          place_id: result.place_id || `serp_${result.position}`,
          name: result.title,
          address: result.address || '',
          rating: result.rating,
          reviews: result.reviews,
          phone: result.phone,
          website: result.website,
          hours: result.hours,
          price: result.price,
          type: result.type,
          thumbnail: result.thumbnail,
          gps_coordinates: result.gps_coordinates,
        }));

      setApiPlaces(places);
    } catch (error) {
      console.error('Error searching places:', error);
      setApiPlaces([]);
    } finally {
      setSearchingPlaces(false);
    }
  };

  // Handle restaurant name input with debounced API search
  const handleRestaurantNameChange = (text: string) => {
    setFormData((prev) => ({ ...prev, name: text }));

    if (isOnlineMode && mode === 'restaurant') {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for search
      const timeout = setTimeout(() => {
        searchRestaurantsAPI(text);
      }, 500);

      setSearchTimeout(timeout);
    }
  };

  // Select place from API results and auto-populate fields
  const handleSelectAPIPlace = (place: SerpAPIPlace) => {
    // Determine cuisine from type
    const determineCuisine = (type?: string) => {
      if (!type) return '';
      const typeLower = type.toLowerCase();
      if (typeLower.includes('italian')) return 'Italian';
      if (typeLower.includes('chinese')) return 'Chinese';
      if (typeLower.includes('japanese') || typeLower.includes('sushi'))
        return 'Japanese';
      if (typeLower.includes('mexican')) return 'Mexican';
      if (typeLower.includes('indian')) return 'Indian';
      if (typeLower.includes('thai')) return 'Thai';
      if (typeLower.includes('french')) return 'French';
      if (typeLower.includes('greek')) return 'Greek';
      if (typeLower.includes('seafood')) return 'Seafood';
      if (typeLower.includes('steakhouse') || typeLower.includes('grill'))
        return 'Steakhouse';
      if (typeLower.includes('pizza')) return 'Pizza';
      if (typeLower.includes('cafe') || typeLower.includes('coffee'))
        return 'Cafe';
      if (typeLower.includes('bakery')) return 'Bakery';
      if (typeLower.includes('bar')) return 'Bar & Grill';
      if (typeLower.includes('fast food') || typeLower.includes('burger'))
        return 'Fast Food';
      return 'Contemporary';
    };

    // Determine price level from $ signs
    const determinePriceLevel = (price?: string) => {
      if (!price) return '$$';
      return price.length > 4 ? '$$$$' : price;
    };

    setFormData((prev) => ({
      ...prev,
      name: place.name,
      address: place.address,
      cuisine: determineCuisine(place.type),
      priceLevel: determinePriceLevel(place.price),
      rating: place.rating || 4.5,
      phone: place.phone || '',
      website: place.website || '',
      hours: place.hours || '',
      image_url: place.thumbnail || null,
    }));

    setApiPlaces([]); // Clear search results
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleRestaurantSelect = (restaurant: RestaurantSummary) => {
    setFormData((prev) => ({ ...prev, linkedRestaurant: restaurant }));
  };

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine')
        .order('name');

      if (error) throw error;

      if (data) {
        setRestaurants(data);
      }
    } catch (err: any) {
      console.error('Error fetching restaurants:', err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Missing Info', 'Please enter a name');
      return;
    }

    setLoading(true);

    try {
      // Get current authenticated user
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        Alert.alert('Error', 'You must be logged in to add items');
        setLoading(false);
        return;
      }

      const userEmail = authData.user.email;

      if (!userEmail) {
        Alert.alert('Error', 'User email not found');
        setLoading(false);
        return;
      }

      // Get user profile using authenticated email
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userEmail)
        .limit(1)
        .single();

      if (userError) throw userError;

      if (!user) {
        Alert.alert('Error', 'User profile not found. Please contact support.');
        setLoading(false);
        return;
      }

      if (mode === 'restaurant') {
        // Insert restaurant
        const { data: insertRestaurant, error: insertError } = await supabase
          .from('restaurants')
          .insert([
            {
              user_id: user.id,
              name: formData.name,
              cuisine: formData.cuisine,
              address: formData.address,
              price_level: formData.priceLevel,
              notes: formData.description,
              instagram_url: formData.instagramUrl || null,
              image_url: formData.image_url || null,
            },
          ])
          .select('id')
          .single();

        if (insertError) throw insertError;

        const restaurantId = insertRestaurant.id;
        const tags = formData.tags || [];

        // Insert restaurant tags if any
        if (tags.length > 0) {
          const tagsRows = tags.map((tagItem) => ({
            restaurant_id: restaurantId,
            tag: tagItem,
          }));

          const { error: restaurantTagError } = await supabase
            .from('restaurant_tags')
            .insert(tagsRows);

          if (restaurantTagError) throw restaurantTagError;
        }

        // Award XP for adding restaurant
        try {
          await gamificationService.addPoints(
            XP_REWARDS.ADD_RESTAURANT,
            'add_restaurant'
          );
        } catch (xpError) {
          console.error('Error awarding XP:', xpError);
          // Don't fail the whole operation if XP fails
        }

        Alert.alert(
          'Success',
          `Restaurant added successfully! +${XP_REWARDS.ADD_RESTAURANT} XP`
        );
        onSave(insertRestaurant);
      } else {
        // Insert food item
        const { data: insertFood, error: insertError } = await supabase
          .from('food_items')
          .insert([
            {
              user_id: user.id,
              name: formData.name,
              category: formData.category || 'Main Course',
              restaurant_id: formData.linkedRestaurant?.id || null,
              description: formData.description,
              price: formData.price,
              rating: formData.rating,
              image_url: formData.image_url || null,
            },
          ])
          .select('id')
          .single();

        if (insertError) throw insertError;

        const foodItemId = insertFood.id;
        const tags = formData.tags || [];

        // Insert food item tags if any
        if (tags.length > 0) {
          const tagsRows = tags.map((tagItem) => ({
            food_item_id: foodItemId,
            tag: tagItem,
          }));

          const { error: foodTagError } = await supabase
            .from('food_item_tags')
            .insert(tagsRows);

          if (foodTagError) throw foodTagError;
        }

        // Award XP for adding food item
        try {
          await gamificationService.addPoints(
            XP_REWARDS.ADD_FOOD_ITEM,
            'add_food_item'
          );
        } catch (xpError) {
          console.error('Error awarding XP:', xpError);
          // Don't fail the whole operation if XP fails
        }

        Alert.alert(
          'Success',
          `Food item added successfully! +${XP_REWARDS.ADD_FOOD_ITEM} XP`
        );
        onSave(insertFood);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message);
      console.error('Insert error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />

            {/* Mode Switch */}
            <View style={styles.switchContainer}>
              <View style={styles.switchBackground}>
                <Animated.View
                  style={[styles.switchIndicator, animatedSwitchStyle]}
                />
                <TouchableOpacity
                  style={styles.switchOption}
                  onPress={() => setMode('restaurant')}
                >
                  <Utensils
                    size={18}
                    color={
                      mode === 'restaurant'
                        ? theme.colors.white
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.switchText,
                      mode === 'restaurant' && styles.switchTextActive,
                    ]}
                  >
                    Restaurant
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.switchOption}
                  onPress={() => setMode('food')}
                >
                  <ChefHat
                    size={18}
                    color={
                      mode === 'food'
                        ? theme.colors.white
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.switchText,
                      mode === 'food' && styles.switchTextActive,
                    ]}
                  >
                    Food
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Name Input with Online/Offline Toggle (Restaurant Mode Only) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  {mode === 'restaurant' ? 'Restaurant Name' : 'Food Name'} *
                </Text>

                {/* Online/Offline Toggle for Restaurant Mode */}
                {mode === 'restaurant' && (
                  <TouchableOpacity
                    style={styles.onlineToggle}
                    onPress={() => {
                      setIsOnlineMode(!isOnlineMode);
                      setApiPlaces([]);
                    }}
                    activeOpacity={0.7}
                  >
                    {isOnlineMode ? (
                      <Wifi size={16} color={theme.colors.primary} />
                    ) : (
                      <WifiOff size={16} color={theme.colors.textSecondary} />
                    )}
                    <Text
                      style={[
                        styles.onlineToggleText,
                        !isOnlineMode && styles.onlineToggleTextOff,
                      ]}
                    >
                      {isOnlineMode ? 'Online' : 'Offline'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Input Field */}
              <View style={styles.searchInputContainer}>
                {mode === 'restaurant' && isOnlineMode && (
                  <Search
                    size={18}
                    color={theme.colors.textSecondary}
                    style={styles.searchIcon}
                  />
                )}
                <TextInput
                  style={[
                    styles.input,
                    mode === 'restaurant' &&
                      isOnlineMode &&
                      styles.inputWithIcon,
                  ]}
                  placeholder={
                    mode === 'restaurant'
                      ? isOnlineMode
                        ? 'Search restaurant name...'
                        : 'Enter restaurant name manually'
                      : 'Enter food name'
                  }
                  value={formData.name}
                  onChangeText={
                    mode === 'restaurant' && isOnlineMode
                      ? handleRestaurantNameChange
                      : (text) =>
                          setFormData((prev) => ({ ...prev, name: text }))
                  }
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={!searchingPlaces}
                />
                {searchingPlaces && (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={styles.searchLoader}
                  />
                )}
              </View>

              {/* API Search Results Dropdown */}
              {mode === 'restaurant' &&
                isOnlineMode &&
                apiPlaces.length > 0 && (
                  <View style={styles.apiResultsContainer}>
                    <ScrollView
                      style={styles.apiResultsList}
                      keyboardShouldPersistTaps="handled"
                    >
                      {apiPlaces.map((place) => (
                        <TouchableOpacity
                          key={place.place_id}
                          style={styles.apiResultItem}
                          onPress={() => handleSelectAPIPlace(place)}
                        >
                          <View style={styles.apiResultContent}>
                            <Text
                              style={styles.apiResultName}
                              numberOfLines={1}
                            >
                              {place.name}
                            </Text>
                            <Text
                              style={styles.apiResultAddress}
                              numberOfLines={1}
                            >
                              {place.address}
                            </Text>
                            <View style={styles.apiResultMeta}>
                              {place.rating && (
                                <View style={styles.apiResultRating}>
                                  <Star
                                    size={12}
                                    color="#F59E0B"
                                    fill="#F59E0B"
                                  />
                                  <Text style={styles.apiResultRatingText}>
                                    {place.rating}
                                  </Text>
                                </View>
                              )}
                              {place.type && (
                                <Text style={styles.apiResultType}>
                                  {place.type}
                                </Text>
                              )}
                              {place.price && (
                                <Text style={styles.apiResultPrice}>
                                  {place.price}
                                </Text>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
            </View>

            {/* Restaurant Link (Food Mode Only) */}
            {mode === 'food' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Restaurant</Text>
                {formData.linkedRestaurant ? (
                  <View style={styles.linkedRestaurant}>
                    <View style={styles.linkedRestaurantInfo}>
                      <Text style={styles.linkedRestaurantName}>
                        {formData.linkedRestaurant.name}
                      </Text>
                      <Text style={styles.linkedRestaurantCuisine}>
                        {formData.linkedRestaurant.cuisine}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          linkedRestaurant: null,
                        }))
                      }
                      style={styles.unlinkButton}
                    >
                      <X size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                      <Search size={18} color={theme.colors.textSecondary} />
                      <TextInput
                        placeholder="Search restaurants..."
                        placeholderTextColor={theme.colors.textSecondary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                    </View>

                    {/* Restaurant List */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingVertical: 8 }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.restaurantCard,
                          styles.addRestaurantCard,
                        ]}
                        onPress={() => setShowRestaurantForm(true)}
                      >
                        <Plus size={18} color={theme.colors.primary} />
                        <Text style={styles.addRestaurantText}>
                          Add New Restaurant
                        </Text>
                      </TouchableOpacity>

                      {filteredRestaurants.map((restaurant) => (
                        <TouchableOpacity
                          key={restaurant.id}
                          style={styles.restaurantCard}
                          onPress={() => handleRestaurantSelect(restaurant)}
                        >
                          <View style={styles.restaurantIcon}>
                            <Text style={styles.restaurantIconText}>
                              {restaurant.name.charAt(0)}
                            </Text>
                          </View>
                          <View style={styles.restaurantInfo}>
                            <Text style={styles.restaurantName}>
                              {restaurant.name}
                            </Text>
                            <Text style={styles.restaurantCuisine}>
                              {restaurant.cuisine}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>
            )}

            {/* Category / Cuisine */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {mode === 'restaurant' ? 'Cuisine Type' : 'Category'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
              >
                <View style={styles.chipContainer}>
                  {(mode === 'restaurant' ? cuisineTypes : foodCategories).map(
                    (item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.chip,
                          (mode === 'restaurant'
                            ? formData.cuisine
                            : formData.category) === item && styles.chipActive,
                        ]}
                        onPress={() =>
                          setFormData((prev) => ({
                            ...prev,
                            [mode === 'restaurant' ? 'cuisine' : 'category']:
                              item,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            (mode === 'restaurant'
                              ? formData.cuisine
                              : formData.category) === item &&
                              styles.chipTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price</Text>
              {mode === 'restaurant' ? (
                <View style={styles.priceContainer}>
                  {['$', '$$', '$$$', '$$$$'].map((price) => (
                    <TouchableOpacity
                      key={price}
                      style={[
                        styles.priceButton,
                        formData.priceLevel === price &&
                          styles.priceButtonActive,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({ ...prev, priceLevel: price }))
                      }
                    >
                      <Text
                        style={[
                          styles.priceButtonText,
                          formData.priceLevel === price &&
                            styles.priceButtonTextActive,
                        ]}
                      >
                        {price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="e.g., R120"
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, price: text }))
                  }
                  placeholderTextColor={theme.colors.textSecondary}
                />
              )}
            </View>

            {/* Location / Description */}
            <View style={styles.inputGroup}>
              {mode === 'restaurant' ? (
                <>
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.locationInput}>
                    <MapPin size={20} color={theme.colors.primary} />
                    <TextInput
                      style={styles.locationTextInput}
                      placeholder="Area or address"
                      value={formData.address}
                      onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, address: text }))
                      }
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the food item"
                    value={formData.description}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, description: text }))
                    }
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </>
              )}
            </View>

            {/* Restaurant Notes (Restaurant Mode Only) */}
            {mode === 'restaurant' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any additional notes about this restaurant"
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, description: text }))
                  }
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Instagram URL (Restaurant Mode Only) */}
            {mode === 'restaurant' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Instagram URL (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://instagram.com/restaurant_name"
                  value={formData.instagramUrl}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, instagramUrl: text }))
                  }
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Tags */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.tagsContainer}>
                {quickTags[mode].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tag,
                      formData.tags.includes(tag) && styles.tagActive,
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        formData.tags.includes(tag) && styles.tagTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!formData.name.trim() ||
                  (mode === 'restaurant' && !formData.cuisine.trim()) ||
                  (mode === 'food' && !formData.category.trim()) ||
                  loading) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!formData.name.trim() || loading}
            >
              <Plus size={20} color={theme.colors.white} />
              <Text style={styles.submitButtonText}>
                {loading
                  ? 'Adding...'
                  : `Add ${mode === 'restaurant' ? 'Restaurant' : 'Food'}`}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
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
    height: height * 0.92,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: 20,
  },
  switchContainer: {
    width: width * 0.8,
    marginBottom: 8,
  },
  switchBackground: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  switchIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: width * 0.4 - 8,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  switchOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    zIndex: 1,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  switchTextActive: {
    color: theme.colors.white,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.15)',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priceButton: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priceButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  priceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  priceButtonTextActive: {
    color: theme.colors.white,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationTextInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.15)',
  },
  tagActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  tagTextActive: {
    color: theme.colors.white,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  linkedRestaurant: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  linkedRestaurantInfo: {
    flex: 1,
  },
  linkedRestaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  linkedRestaurantCuisine: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  unlinkButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: 8,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    minWidth: 160,
  },
  addRestaurantCard: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
  },
  addRestaurantText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  restaurantIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  restaurantCuisine: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // Online/Offline Toggle Styles
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  onlineToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  onlineToggleTextOff: {
    color: theme.colors.textSecondary,
  },
  // Search Input Container
  searchInputContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  searchLoader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  // API Results Dropdown
  apiResultsContainer: {
    marginTop: 8,
    maxHeight: 300,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  apiResultsList: {
    maxHeight: 300,
  },
  apiResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  apiResultContent: {
    flex: 1,
  },
  apiResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  apiResultAddress: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  apiResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  apiResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  apiResultRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  apiResultType: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  apiResultPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
