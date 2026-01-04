import AddItemModal from '@/components/AddItemModal';
import { CheckinModal } from '@/components/CheckinModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import EditRestaurantModal from '@/components/EditRestaurantModal';
import FavouriteBottomSheet from '@/components/FavouriteBottomSheet';
import { LevelUpModal } from '@/components/LevelUpModal';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { theme } from '@/constants/theme';
import { FoodItem, foodService } from '@/services/foodService';
import { mustTryService } from '@/services/mustTryService';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types/restaurant';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Check,
  ExternalLink,
  Globe,
  Heart,
  Image as ImageIcon,
  Instagram,
  MapPin,
  MoreHorizontal,
  Navigation,
  Phone,
  Plus,
  Share as ShareIcon,
  Star,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 320; // Reduced from 400 to make image smaller

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams();
  const scrollY = useSharedValue(0);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFavouriteBottomSheet, setShowFavouriteBottomSheet] =
    useState(false);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [similarRestaurants, setSimilarRestaurants] = useState<Restaurant[]>(
    []
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; xp: number }>(
    { level: 1, xp: 0 }
  );
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [myFoodItems, setMyFoodItems] = useState<FoodItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [mustTryItemName, setMustTryItemName] = useState('');
  const [mustTryItemPrice, setMustTryItemPrice] = useState('');
  const [mustTryItemImage, setMustTryItemImage] = useState<string | null>(null);
  const [uploadingMustTry, setUploadingMustTry] = useState(false);

  // Food log state
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedFoodCategory, setSelectedFoodCategory] =
    useState<string>('all');
  const [foodSortBy, setFoodSortBy] = useState<'recent' | 'rating' | 'name'>(
    'recent'
  );

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    }
  }, [id]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated header styles
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [0, 1],
      'clamp'
    );
    return { opacity };
  });

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-100, 0], [1.3, 1], 'clamp');
    return { transform: [{ scale }] };
  });

  const loadRestaurantData = async () => {
    try {
      setLoading(true);

      const restaurantData = await restaurantService.getRestaurant(
        id as string
      );
      if (restaurantData) {
        setRestaurant(restaurantData);
        setIsFavorite(restaurantData.isFavorite || false);

        // Load menu items (general)
        const menuData = await foodService.getFoodItemsByRestaurant(
          id as string
        );
        setMenuItems(menuData);

        // Load my food items (user's personal food log)
        const myItems = await foodService.getFoodItemsByRestaurant(
          id as string
        );
        setMyFoodItems(myItems);

        const similarData = await restaurantService.getRestaurantsByCuisine(
          restaurantData.cuisine
        );
        setSimilarRestaurants(
          similarData.filter((r) => r.id !== id).slice(0, 5)
        );
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      Alert.alert('Error', 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  // Food log filtering and sorting
  const getFilteredAndSortedFoodItems = () => {
    let filtered = [...myFoodItems];

    // Apply search filter
    if (foodSearchQuery.trim()) {
      const query = foodSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedFoodCategory !== 'all') {
      filtered = filtered.filter(
        (item) =>
          item.category?.toLowerCase() === selectedFoodCategory.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (foodSortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
        default:
          // Assuming newer items have higher IDs (or we can keep original order)
          return 0;
      }
    });

    return filtered;
  };

  // Get unique categories from food items
  const getFoodCategories = () => {
    const categories = new Set(
      myFoodItems
        .map((item) => item.category)
        .filter((cat): cat is string => !!cat)
    );
    return ['all', ...Array.from(categories)];
  };

  const handleShare = async () => {
    if (!restaurant) return;

    try {
      await Share.share({
        message: `Check out ${restaurant.name} on Curated Corners! 🍽️\n\n${
          restaurant.description || restaurant.cuisine
        }\n\nRating: ${restaurant.rating}⭐`,
        title: restaurant.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGetDirections = () => {
    if (!restaurant) return;

    const lat = restaurant.latitude || -33.9249;
    const lng = restaurant.longitude || 18.4241;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (!restaurant?.phone) return;
    Linking.openURL(`tel:${restaurant.phone}`);
  };

  const handleAddToFavorites = async (restaurantId: string) => {
    const newStatus = await restaurantService.toggleFavorite(restaurantId);
    setIsFavorite(newStatus);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!restaurant) return;

    setDeleteLoading(true);
    try {
      const success = await restaurantService.deleteRestaurant(restaurant.id);
      if (success) {
        setShowDeleteModal(false);
        router.back();
        Alert.alert('Success', 'Restaurant deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete restaurant');
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      Alert.alert('Error', 'Failed to delete restaurant');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveEdit = (updatedRestaurant: Restaurant) => {
    setRestaurant(updatedRestaurant);
  };

  const handleAddToMustTry = async () => {
    if (!restaurant) return;

    try {
      const success = await mustTryService.addRestaurantToMustTry(
        restaurant.id
      );
      if (success) {
        Alert.alert('Success', '✨ Added to Must-Try list!');
      }
    } catch (error) {
      console.error('Error adding to must try:', error);
      Alert.alert('Error', 'Failed to add to Must-Try list');
    }
  };

  const handleCheckinSuccess = (
    xpEarned: number,
    levelUp?: boolean,
    newLevel?: number
  ) => {
    if (levelUp && newLevel) {
      setLevelUpData({ level: newLevel, xp: xpEarned });
      setShowLevelUpModal(true);
    } else {
      Alert.alert('🎉 Check-in Success!', `You earned ${xpEarned} XP!`, [
        { text: 'Awesome!', style: 'default' },
      ]);
    }
  };

  const handleAddPhoto = async () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            // For now, open the add item modal
            setShowAddItemModal(true);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            // For now, open the add item modal
            setShowAddItemModal(true);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddFoodItem = () => {
    setShowAddItemModal(true);
  };

  const handleSaveFoodItem = async () => {
    // Refresh food items after saving
    await loadRestaurantData();
    setShowAddItemModal(false);
  };

  const handleDeleteFoodItem = async (
    foodItemId: string,
    foodItemName: string
  ) => {
    Alert.alert(
      'Delete Food Item',
      `Are you sure you want to delete "${foodItemName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await foodService.deleteFoodItem(foodItemId);
            if (success) {
              setMyFoodItems((prev) =>
                prev.filter((item) => item.id !== foodItemId)
              );
              Alert.alert('Success', 'Food item deleted');
            } else {
              Alert.alert('Error', 'Failed to delete food item');
            }
          },
        },
      ]
    );
  };

  const handlePickMustTryImage = async () => {
    // For now, just show an alert since expo-image-picker isn't installed
    Alert.alert('Add Photo', 'Photo upload feature coming soon!');
    // TODO: Implement image picker when expo-image-picker is available
  };

  const handleSaveMustTryItem = async () => {
    if (!mustTryItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!restaurant) return;

    try {
      setUploadingMustTry(true);

      // Save to database using mustTryService
      const success = await mustTryService.addMustTryItem(
        restaurant.id,
        mustTryItemName.trim(),
        mustTryItemPrice.trim() || undefined,
        mustTryItemImage || undefined
      );

      if (success) {
        Alert.alert('Success', '⭐ Must-try item saved!');
        // Clear the form
        setMustTryItemName('');
        setMustTryItemPrice('');
        setMustTryItemImage(null);
      } else {
        Alert.alert('Error', 'Failed to save must-try item');
      }
    } catch (error) {
      console.error('Error saving must-try item:', error);
      Alert.alert('Error', 'Failed to save must-try item');
    } finally {
      setUploadingMustTry(false);
    }
  };

  const openInstagram = () => {
    if (!restaurant?.instagramUrl) return;
    Linking.openURL(restaurant.instagramUrl);
  };

  const openWebsite = () => {
    if (!restaurant?.website) return;
    Linking.openURL(restaurant.website);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.skeletonContainer}>
          {/* Hero skeleton */}
          <SkeletonLoader width="100%" height={320} borderRadius={0} />

          {/* Content skeleton */}
          <View style={styles.skeletonContent}>
            <SkeletonLoader width="80%" height={28} borderRadius={8} />
            <SkeletonLoader
              width="50%"
              height={18}
              borderRadius={6}
              style={{ marginTop: 12 }}
            />

            {/* Meta pills */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <SkeletonLoader width={70} height={28} borderRadius={14} />
              <SkeletonLoader width={60} height={28} borderRadius={14} />
              <SkeletonLoader width={80} height={28} borderRadius={14} />
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <SkeletonLoader width="32%" height={44} borderRadius={12} />
              <SkeletonLoader width="32%" height={44} borderRadius={12} />
              <SkeletonLoader width="32%" height={44} borderRadius={12} />
            </View>

            {/* Description lines */}
            <View style={{ marginTop: 20 }}>
              <SkeletonLoader width="100%" height={16} borderRadius={6} />
              <SkeletonLoader
                width="95%"
                height={16}
                borderRadius={6}
                style={{ marginTop: 8 }}
              />
              <SkeletonLoader
                width="85%"
                height={16}
                borderRadius={6}
                style={{ marginTop: 8 }}
              />
            </View>

            {/* Map skeleton */}
            <View style={{ marginTop: 20 }}>
              <SkeletonLoader width="100%" height={220} borderRadius={20} />
            </View>

            {/* Contact sections skeleton */}
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 14 }}>
              <SkeletonLoader width="32%" height={110} borderRadius={20} />
              <SkeletonLoader width="32%" height={110} borderRadius={20} />
              <SkeletonLoader width="32%" height={110} borderRadius={20} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Restaurant not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Animated Header Bar (Instagram-style) */}
      <Animated.View style={[styles.topBar, headerStyle]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
          style={styles.topBarGradient}
        >
          <TouchableOpacity
            style={styles.topBarButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <TouchableOpacity style={styles.topBarButton} onPress={handleShare}>
            <ShareIcon size={22} color={theme.colors.white} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Hero Image Section */}
        <Animated.View style={[styles.heroContainer, imageStyle]}>
          <Image
            source={{ uri: restaurant.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
            style={styles.heroGradient}
          />

          {/* Floating Action Buttons */}
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={theme.colors.white} />
            </TouchableOpacity>

            <View style={styles.heroRightActions}>
              <TouchableOpacity style={styles.heroButton} onPress={handleShare}>
                <ShareIcon size={20} color={theme.colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroButton}>
                <MoreHorizontal size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category & Status Badge */}
          <View style={styles.heroBadges}>
            <View style={styles.cuisineBadge}>
              <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                !restaurant.isOpen && styles.closedBadge,
              ]}
            >
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {restaurant.isOpen ? 'Open Now' : 'Closed'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Main Content Card */}
        <Animated.View
          style={styles.contentCard}
          entering={FadeInUp.delay(200).springify()}
        >
          {/* Restaurant Name & Cuisine */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View style={styles.titleContent}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.cuisineRow}>
                  <Text style={styles.cuisineLabel}>{restaurant.cuisine}</Text>
                  {restaurant.featured && (
                    <View style={styles.verifiedBadge}>
                      <Check size={12} color={theme.colors.white} />
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => setShowFavouriteBottomSheet(true)}
              >
                <Heart
                  size={24}
                  color={isFavorite ? theme.colors.error : theme.colors.text}
                  fill={isFavorite ? theme.colors.error : 'none'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>

            {/* Rating & Price Row */}
            <View style={styles.metaRow}>
              <View style={styles.ratingPill}>
                <Star
                  size={14}
                  color={theme.colors.warning}
                  fill={theme.colors.warning}
                />
                <Text style={styles.ratingValue}>{restaurant.rating}</Text>
                {restaurant.reviews > 0 && (
                  <Text style={styles.reviewCount}>({restaurant.reviews})</Text>
                )}
              </View>
              <View style={styles.pricePill}>
                <Text style={styles.priceValue}>
                  {restaurant.priceRange || '$$'}
                </Text>
              </View>
              <View style={styles.distancePill}>
                <MapPin size={14} color={theme.colors.textSecondary} />
                <Text style={styles.distanceValue}>{restaurant.distance}</Text>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowFavouriteBottomSheet(true)}
              >
                <Bookmark
                  size={18}
                  color={theme.colors.primary}
                  strokeWidth={2}
                />
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Navigate to Dine Plan with proper URL format
                  // Convert restaurant name to slug: "Ariel Modern Italian" -> "ariel-modern-italian"
                  const slug = restaurant.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  Linking.openURL(
                    `https://www.dineplan.com/restaurants/${slug}`
                  );
                }}
              >
                <Star size={18} color={theme.colors.primary} strokeWidth={2} />
                <Text style={styles.actionButtonText}>Book Table</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGetDirections}
              >
                <Navigation
                  size={18}
                  color={theme.colors.primary}
                  strokeWidth={2}
                />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          {restaurant.tags && restaurant.tags.length > 0 && (
            <View style={styles.tagsSection}>
              {restaurant.tags.slice(0, 4).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {restaurant.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionText}>
                {restaurant.description}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Location Section with Map */}
        <Animated.View
          style={styles.section}
          entering={FadeIn.delay(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity
              style={styles.directionsLink}
              onPress={handleGetDirections}
            >
              <Navigation size={16} color={theme.colors.primary} />
              <Text style={styles.directionsLinkText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Google Maps Integration */}
          {restaurant.latitude && restaurant.longitude && (
            <TouchableOpacity
              style={styles.mapContainer}
              onPress={handleGetDirections}
              activeOpacity={0.9}
            >
              <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={{
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                  }}
                  title={restaurant.name}
                  description={restaurant.address || ''}
                />
              </MapView>
              <View style={styles.mapOverlay}>
                <ExternalLink size={16} color={theme.colors.white} />
                <Text style={styles.mapOverlayText}>Open in Maps</Text>
              </View>
            </TouchableOpacity>
          )}

          {restaurant.address && (
            <View style={styles.addressCard}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text style={styles.addressText}>{restaurant.address}</Text>
            </View>
          )}
        </Animated.View>

        {/* Contact & Links Section */}
        <Animated.View
          style={styles.section}
          entering={FadeIn.delay(600).springify()}
        >
          <Text style={styles.sectionTitle}>Contact & Links</Text>

          <View style={styles.contactGrid}>
            {restaurant.phone && (
              <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
                <View style={styles.contactIconContainer}>
                  <Phone size={20} color={theme.colors.white} />
                </View>
                <Text style={styles.contactLabel}>Call</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                  {restaurant.phone}
                </Text>
              </TouchableOpacity>
            )}

            {restaurant.website && (
              <TouchableOpacity
                style={styles.contactCard}
                onPress={openWebsite}
              >
                <View
                  style={[
                    styles.contactIconContainer,
                    { backgroundColor: theme.colors.secondary },
                  ]}
                >
                  <Globe size={20} color={theme.colors.white} />
                </View>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                  Visit
                </Text>
              </TouchableOpacity>
            )}

            {restaurant.instagramUrl && (
              <TouchableOpacity
                style={styles.contactCard}
                onPress={openInstagram}
              >
                <View
                  style={[
                    styles.contactIconContainer,
                    { backgroundColor: '#E1306C' },
                  ]}
                >
                  <Instagram size={20} color={theme.colors.white} />
                </View>
                <Text style={styles.contactLabel}>Instagram</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                  Follow
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Must Try Next Time Section */}
        <Animated.View
          style={styles.section}
          entering={FadeIn.delay(650).springify()}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Must Try Next Time</Text>
              <Text style={styles.sectionSubtitle}>
                Save a dish to remember for your next visit
              </Text>
            </View>
          </View>

          <View style={styles.mustTryCard}>
            {mustTryItemImage && (
              <View style={styles.mustTryImageContainer}>
                <Image
                  source={{ uri: mustTryItemImage }}
                  style={styles.mustTryImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setMustTryItemImage(null)}
                >
                  <X size={16} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            )}

            {!mustTryItemImage && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handlePickMustTryImage}
              >
                <Camera size={20} color={theme.colors.textSecondary} />
                <Text style={styles.addPhotoText}>Add Photo (Optional)</Text>
              </TouchableOpacity>
            )}

            <View style={styles.mustTryInputContainer}>
              <Text style={styles.mustTryLabel}>
                Item Name <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={styles.mustTryInput}
                placeholder="e.g., Lamb Ragu Pasta"
                placeholderTextColor={theme.colors.textSecondary}
                value={mustTryItemName}
                onChangeText={setMustTryItemName}
              />
            </View>

            <View style={styles.mustTryInputContainer}>
              <Text style={styles.mustTryLabel}>Price (Optional)</Text>
              <TextInput
                style={styles.mustTryInput}
                placeholder="e.g., R185"
                placeholderTextColor={theme.colors.textSecondary}
                value={mustTryItemPrice}
                onChangeText={setMustTryItemPrice}
                keyboardType="default"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveMustTryButton,
                !mustTryItemName.trim() && styles.saveMustTryButtonDisabled,
              ]}
              onPress={handleSaveMustTryItem}
              disabled={!mustTryItemName.trim() || uploadingMustTry}
            >
              {uploadingMustTry ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Star
                    size={18}
                    color={theme.colors.white}
                    fill={theme.colors.white}
                  />
                  <Text style={styles.saveMustTryButtonText}>
                    Save Must-Try Item
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* My Food Items - What I've Had Here */}
        <Animated.View
          style={styles.section}
          entering={FadeIn.delay(700).springify()}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>My Food Log</Text>
              <Text style={styles.sectionSubtitle}>
                {myFoodItems.length}{' '}
                {myFoodItems.length === 1 ? 'item' : 'items'} saved
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddFoodItem}
            >
              <Plus size={18} color={theme.colors.white} />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {myFoodItems.length === 0 ? (
            <View style={styles.emptyFoodLog}>
              <View style={styles.emptyIconCircle}>
                <ImageIcon size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyFoodTitle}>No items logged yet</Text>
              <Text style={styles.emptyFoodText}>
                Start tracking what you've had at this restaurant
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={handleAddFoodItem}
              >
                <Plus size={16} color={theme.colors.primary} />
                <Text style={styles.emptyAddButtonText}>
                  Add Your First Item
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Search Bar */}
              <View style={styles.foodLogControls}>
                <View style={styles.searchContainer}>
                  <ImageIcon size={16} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search items..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={foodSearchQuery}
                    onChangeText={setFoodSearchQuery}
                  />
                  {foodSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setFoodSearchQuery('')}>
                      <X size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Category Filters */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryFilters}
                contentContainerStyle={styles.categoryFiltersContent}
              >
                {getFoodCategories().map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedFoodCategory === category &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedFoodCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedFoodCategory === category &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Sort Options */}
              <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <View style={styles.sortButtons}>
                  {(['recent', 'rating', 'name'] as const).map((sort) => (
                    <TouchableOpacity
                      key={sort}
                      style={[
                        styles.sortButton,
                        foodSortBy === sort && styles.sortButtonActive,
                      ]}
                      onPress={() => setFoodSortBy(sort)}
                    >
                      <Text
                        style={[
                          styles.sortButtonText,
                          foodSortBy === sort && styles.sortButtonTextActive,
                        ]}
                      >
                        {sort.charAt(0).toUpperCase() + sort.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Food Items List */}
              <View style={styles.foodItemsList}>
                {getFilteredAndSortedFoodItems().map((item, index) => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInUp.delay(800 + index * 100).springify()}
                  >
                    <View style={styles.foodItemCard}>
                      {item.image ? (
                        <View style={styles.foodItemWithImage}>
                          <Image
                            source={{ uri: item.image }}
                            style={styles.foodItemImage}
                            resizeMode="cover"
                          />
                          <View style={styles.foodItemContent}>
                            <View style={styles.foodItemHeader}>
                              <View style={styles.foodItemInfo}>
                                <Text
                                  style={styles.foodItemName}
                                  numberOfLines={1}
                                >
                                  {item.name}
                                </Text>
                                {item.category && (
                                  <Text style={styles.foodItemCategory}>
                                    {item.category}
                                  </Text>
                                )}
                              </View>
                              <TouchableOpacity
                                style={styles.deleteFoodButton}
                                onPress={() =>
                                  handleDeleteFoodItem(item.id, item.name)
                                }
                              >
                                <Trash2 size={16} color={theme.colors.error} />
                              </TouchableOpacity>
                            </View>
                            {item.description && (
                              <Text
                                style={styles.foodItemDescription}
                                numberOfLines={2}
                              >
                                {item.description}
                              </Text>
                            )}
                            <View style={styles.foodItemFooter}>
                              {item.price && (
                                <Text style={styles.foodItemPrice}>
                                  {item.price}
                                </Text>
                              )}
                              {item.rating > 0 && (
                                <View style={styles.foodItemRating}>
                                  <Star
                                    size={12}
                                    color={theme.colors.warning}
                                    fill={theme.colors.warning}
                                  />
                                  <Text style={styles.foodItemRatingText}>
                                    {item.rating}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.foodItemWithoutImage}>
                          <View style={styles.foodItemIconPlaceholder}>
                            <ImageIcon size={24} color={theme.colors.primary} />
                          </View>
                          <View style={styles.foodItemContent}>
                            <View style={styles.foodItemHeader}>
                              <View style={styles.foodItemInfo}>
                                <Text
                                  style={styles.foodItemName}
                                  numberOfLines={1}
                                >
                                  {item.name}
                                </Text>
                                {item.category && (
                                  <Text style={styles.foodItemCategory}>
                                    {item.category}
                                  </Text>
                                )}
                              </View>
                              <TouchableOpacity
                                style={styles.deleteFoodButton}
                                onPress={() =>
                                  handleDeleteFoodItem(item.id, item.name)
                                }
                              >
                                <Trash2 size={16} color={theme.colors.error} />
                              </TouchableOpacity>
                            </View>
                            {item.description && (
                              <Text
                                style={styles.foodItemDescription}
                                numberOfLines={2}
                              >
                                {item.description}
                              </Text>
                            )}
                            <View style={styles.foodItemFooter}>
                              {item.price && (
                                <Text style={styles.foodItemPrice}>
                                  {item.price}
                                </Text>
                              )}
                              {item.rating > 0 && (
                                <View style={styles.foodItemRating}>
                                  <Star
                                    size={12}
                                    color={theme.colors.warning}
                                    fill={theme.colors.warning}
                                  />
                                  <Text style={styles.foodItemRatingText}>
                                    {item.rating}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                ))}
              </View>
            </>
          )}
        </Animated.View>

        {/* Menu Items */}
        {menuItems.length > 0 && (
          <Animated.View
            style={styles.section}
            entering={FadeIn.delay(800).springify()}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Dishes</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.menuScroll}
            >
              {menuItems.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={SlideInRight.delay(1000 + index * 100).springify()}
                >
                  <TouchableOpacity style={styles.menuCard}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.menuImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                      style={styles.menuGradient}
                    >
                      <Text style={styles.menuItemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.menuFooter}>
                        <Text style={styles.menuPrice}>{item.price}</Text>
                        {item.rating && (
                          <View style={styles.menuRating}>
                            <Star
                              size={12}
                              color={theme.colors.warning}
                              fill={theme.colors.warning}
                            />
                            <Text style={styles.menuRatingText}>
                              {item.rating}
                            </Text>
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Similar Restaurants */}
        {similarRestaurants.length > 0 && (
          <Animated.View
            style={styles.section}
            entering={FadeIn.delay(1200).springify()}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Similar Places</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.menuScroll}
            >
              {similarRestaurants.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={SlideInRight.delay(1400 + index * 100).springify()}
                >
                  <TouchableOpacity
                    style={styles.similarCard}
                    onPress={() => router.push(`/restaurant/${item.id}`)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.similarImage}
                      resizeMode="cover"
                    />
                    <View style={styles.similarInfo}>
                      <Text style={styles.similarName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.similarRating}>
                        <Star
                          size={12}
                          color={theme.colors.warning}
                          fill={theme.colors.warning}
                        />
                        <Text style={styles.similarRatingText}>
                          {item.rating}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Add Photo Section */}
        <Animated.View
          style={styles.section}
          entering={FadeInUp.delay(1600).springify()}
        >
          <TouchableOpacity
            style={styles.addPhotoCard}
            onPress={handleAddPhoto}
          >
            <Camera size={32} color={theme.colors.primary} />
            <Text style={styles.addPhotoTitle}>Add Photos & Memories</Text>
            <Text style={styles.addPhotoSubtitle}>
              Share photos of food items or the restaurant
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Check-in FAB */}
      <TouchableOpacity
        style={styles.checkInFAB}
        onPress={() => setShowCheckinModal(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MapPin size={20} color={theme.colors.white} />
          <Text style={styles.fabText}>Check In</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modals */}
      <FavouriteBottomSheet
        visible={showFavouriteBottomSheet}
        onClose={() => setShowFavouriteBottomSheet(false)}
        restaurant={restaurant}
        onAddToFavorites={handleAddToFavorites}
        onSaveToCollection={() => setShowFavouriteBottomSheet(false)}
        onShare={() => {
          setShowFavouriteBottomSheet(false);
          handleShare();
        }}
        onGetDirections={() => {
          setShowFavouriteBottomSheet(false);
          handleGetDirections();
        }}
        onCall={() => {
          setShowFavouriteBottomSheet(false);
          handleCall();
        }}
      />

      <CheckinModal
        visible={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        userId="10606b48-de66-4322-886b-ed13230a264e"
        userLocation={{
          latitude: restaurant.latitude || -33.9249,
          longitude: restaurant.longitude || 18.4241,
        }}
        onSuccess={handleCheckinSuccess}
      />

      <LevelUpModal
        visible={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        level={levelUpData.level}
        xpEarned={levelUpData.xp}
      />

      <DeleteConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={restaurant?.name || ''}
        itemType="restaurant"
        loading={deleteLoading}
      />

      <EditRestaurantModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        restaurant={restaurant}
        onSave={handleSaveEdit}
      />

      <AddItemModal
        visible={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSave={handleSaveFoodItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },

  // Animated Top Bar (Instagram-style)
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: StatusBar.currentHeight || 44,
  },
  topBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.white,
    marginHorizontal: 16,
  },

  // Hero Section
  heroContainer: {
    height: HEADER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  heroActions: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 8,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(20px)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  heroRightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroBadges: {
    position: 'absolute',
    bottom: 40, // Moved up from 16 to 40
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cuisineBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...theme.shadows.lg,
  },
  cuisineText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    ...theme.shadows.md,
  },
  closedBadge: {
    backgroundColor: theme.colors.gray[500],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Main Content Card
  contentCard: {
    backgroundColor: theme.colors.white,
    marginTop: -30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    ...theme.shadows.xl,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContent: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.6,
    lineHeight: 32,
    marginBottom: 6,
  },
  cuisineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cuisineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },

  // Meta Row (Rating, Price, Distance Pills)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reviewCount: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  pricePill: {
    backgroundColor: theme.colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  // Action Buttons Row
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border + '40',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Quick Actions (Old - keeping for compatibility)
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '40',
    paddingTop: 18,
  },
  actionIcon: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceLight + '80',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },

  // Info Bar (Old - keeping for compatibility)
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    marginHorizontal: -4,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceLight,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  reviewsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.3,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  // Tags
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.15)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Description
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    marginTop: 8,
    ...theme.shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  statSubtext: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Section Styles
  section: {
    backgroundColor: theme.colors.white,
    marginTop: 12,
    padding: 24,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  directionsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 20,
  },
  directionsLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Map Section
  mapContainer: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    ...theme.shadows.lg,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  mapOverlayText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 20,
  },

  // Contact Grid
  contactGrid: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border + '30',
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  contactLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  contactValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Menu Items
  menuScroll: {
    paddingVertical: 4,
    gap: 12,
  },
  menuCard: {
    width: 180,
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    ...theme.shadows.lg,
  },
  menuImage: {
    width: '100%',
    height: '100%',
  },
  menuGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    justifyContent: 'flex-end',
  },
  menuItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 6,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  menuRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  menuRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Similar Restaurants
  similarCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    ...theme.shadows.md,
  },
  similarImage: {
    width: '100%',
    height: 120,
  },
  similarInfo: {
    padding: 12,
  },
  similarName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  similarRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  similarRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  // Add Photo Card
  addPhotoCard: {
    backgroundColor: theme.colors.surfaceLight,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  addPhotoTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 12,
  },
  addPhotoSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // My Food Items Section
  sectionTitleContainer: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...theme.shadows.md,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Empty Food Log
  emptyFoodLog: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyFoodTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyFoodText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  emptyAddButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Food Items List
  foodItemsList: {
    gap: 12,
  },
  foodItemCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border + '40',
    ...theme.shadows.sm,
  },

  // Food Item with Image
  foodItemWithImage: {
    flexDirection: 'row',
  },
  foodItemImage: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.gray[100],
  },
  foodItemContent: {
    flex: 1,
    padding: 12,
  },

  // Food Item without Image
  foodItemWithoutImage: {
    flexDirection: 'row',
    padding: 12,
  },
  foodItemIconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  // Food Item Content
  foodItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  foodItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  foodItemCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteFoodButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.error + '10',
  },
  foodItemDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  foodItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.success,
  },
  foodItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foodItemRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.warning,
  },

  // Check-in FAB
  checkInFAB: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    overflow: 'hidden',
    ...theme.shadows.xl,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  fabText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Must Try Section Styles
  mustTryHeader: {
    marginBottom: 16,
  },
  mustTrySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  mustTryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.sm,
  },
  mustTryImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mustTryImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    fontSize: 24,
    color: theme.colors.white,
    fontWeight: '300',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.gray[300],
    borderStyle: 'dashed',
    backgroundColor: theme.colors.gray[50],
    marginBottom: 16,
  },
  addPhotoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  mustTryInputContainer: {
    marginBottom: 16,
  },
  mustTryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  requiredMark: {
    color: theme.colors.error,
  },
  mustTryInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  saveMustTryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
    ...theme.shadows.sm,
  },
  saveMustTryButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
    opacity: 0.6,
  },
  saveMustTryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Skeleton Loading Styles
  skeletonContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  skeletonContent: {
    backgroundColor: theme.colors.white,
    marginTop: -30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },

  // Food Log Controls
  foodLogControls: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    padding: 0,
  },
  categoryFilters: {
    marginBottom: 16,
  },
  categoryFiltersContent: {
    paddingRight: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  categoryChipTextActive: {
    color: theme.colors.white,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  sortButtonTextActive: {
    color: theme.colors.primary,
  },
});
