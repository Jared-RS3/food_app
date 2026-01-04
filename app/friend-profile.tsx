import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MapPin,
  Star,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavouriteBottomSheet from '../components/FavouriteBottomSheet';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;

// Mock data for friend's restaurants and food
const mockRestaurants = [
  {
    id: '1',
    name: 'The Test Kitchen',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    cuisine: 'Contemporary',
    rating: 4.8,
    isSaved: true,
    isFavorited: true,
    location: 'Woodstock',
    likeCount: 12,
  },
  {
    id: '2',
    name: 'Mama Africa',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    cuisine: 'African',
    rating: 4.7,
    isSaved: true,
    isFavorited: false,
    location: 'Long Street',
    likeCount: 8,
  },
  {
    id: '3',
    name: 'La Colombe',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    cuisine: 'Fine Dining',
    rating: 4.9,
    isSaved: false,
    isFavorited: true,
    location: 'Constantia',
    likeCount: 15,
  },
  {
    id: '4',
    name: 'Codfather',
    image:
      'https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=400&h=300&fit=crop',
    cuisine: 'Seafood',
    rating: 4.6,
    isSaved: true,
    isFavorited: false,
    location: 'Camps Bay',
    likeCount: 6,
  },
];

const mockFoodItems = [
  {
    id: '1',
    name: 'Bunny Chow',
    restaurant: 'Mama Africa',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    rating: 5,
    isSaved: true,
    likeCount: 5,
  },
  {
    id: '2',
    name: 'Kingklip',
    restaurant: 'Codfather',
    image:
      'https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=400&h=300&fit=crop',
    rating: 4.8,
    isSaved: true,
    likeCount: 3,
  },
  {
    id: '3',
    name: 'Tasting Menu',
    restaurant: 'The Test Kitchen',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    rating: 5,
    isSaved: false,
    likeCount: 9,
  },
];

export default function FriendProfileScreen() {
  const { userId, userName } = useLocalSearchParams<{
    userId: string;
    userName: string;
  }>();
  const [activeTab, setActiveTab] = useState<
    'saved' | 'favorited' | 'dishes' | 'mustTry' | 'collections' | 'preferences'
  >('saved');

  // State for liked items
  const [likedRestaurants, setLikedRestaurants] = useState<Set<string>>(
    new Set()
  );
  const [likedDishes, setLikedDishes] = useState<Set<string>>(new Set());

  // Bottom sheet state
  const [showFavouriteBottomSheet, setShowFavouriteBottomSheet] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    type: 'restaurant' | 'dish';
    image?: string;
    cuisine?: string;
    restaurant?: string;
  } | null>(null);

  // Filter based on active tab
  const filteredRestaurants = mockRestaurants.filter((r) =>
    activeTab === 'saved' ? r.isSaved : r.isFavorited
  );

  const userAvatar = `https://i.pravatar.cc/150?u=${userId}`;

  // Mock profile data
  const profile = {
    points: 2450,
    level: 12,
    badges: 8,
    restaurantsVisited: 45,
    dishesLogged: 127,
    friendsCount: 234,
  };

  const collections = [
    {
      id: '1',
      name: 'Date Night Spots',
      itemCount: 12,
      image:
        'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      name: 'Best Sushi',
      itemCount: 8,
      image:
        'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      name: 'Budget Eats',
      itemCount: 15,
      image:
        'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const preferences = {
    cuisines: ['Italian', 'Japanese', 'Thai', 'Mexican'],
    dietary: ['Pescatarian'],
    priceRange: '$$-$$$',
    ambiance: ['Casual', 'Romantic', 'Trendy'],
  };

  // Handler functions
  const handleLikeRestaurant = (restaurant: any) => {
    if (likedRestaurants.has(restaurant.id)) {
      // Already liked, remove from set
      const newLiked = new Set(likedRestaurants);
      newLiked.delete(restaurant.id);
      setLikedRestaurants(newLiked);
    } else {
      // Not liked yet, show bottom sheet
      setSelectedItem({
        id: restaurant.id,
        name: restaurant.name,
        type: 'restaurant',
        image: restaurant.image,
        cuisine: restaurant.cuisine,
      });
      setShowFavouriteBottomSheet(true);
    }
  };

  const handleLikeDish = (dish: any) => {
    if (likedDishes.has(dish.id)) {
      // Already liked, remove from set
      const newLiked = new Set(likedDishes);
      newLiked.delete(dish.id);
      setLikedDishes(newLiked);
    } else {
      // Not liked yet, show bottom sheet
      setSelectedItem({
        id: dish.id,
        name: dish.name,
        type: 'dish',
        image: dish.image,
        restaurant: dish.restaurant,
      });
      setShowFavouriteBottomSheet(true);
    }
  };

  const handleAddToFavorites = (restaurantId: string) => {
    // Add to liked set
    const newLiked = new Set(likedRestaurants);
    newLiked.add(restaurantId);
    setLikedRestaurants(newLiked);
    setShowFavouriteBottomSheet(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dishes':
        return (
          <View style={styles.grid}>
            {mockFoodItems.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(100 + index * 80).springify()}
                style={styles.dishCard}
              >
                <Image source={{ uri: item.image }} style={styles.dishImage} />

                {/* Like Button and Count */}
                <TouchableOpacity
                  style={styles.dishLikeButton}
                  onPress={() => handleLikeDish(item)}
                >
                  <Heart
                    size={18}
                    color={
                      likedDishes.has(item.id) ? COLORS.error : COLORS.white
                    }
                    fill={likedDishes.has(item.id) ? COLORS.error : 'none'}
                  />
                </TouchableOpacity>

                {item.likeCount > 0 && (
                  <View style={styles.dishLikeCount}>
                    <Users size={12} color={COLORS.white} />
                    <Text style={styles.dishLikeCountText}>
                      {item.likeCount}
                    </Text>
                  </View>
                )}

                <View style={styles.dishInfo}>
                  <Text style={styles.dishName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.dishRestaurant} numberOfLines={1}>
                    {item.restaurant}
                  </Text>
                  <View style={styles.dishRating}>
                    <Star
                      size={12}
                      color={COLORS.warning}
                      fill={COLORS.warning}
                    />
                    <Text style={styles.dishRatingText}>{item.rating}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        );

      case 'mustTry':
        return (
          <View style={styles.mustTryList}>
            {mockRestaurants.slice(0, 3).map((restaurant, index) => (
              <Animated.View
                key={restaurant.id}
                entering={FadeInDown.delay(100 + index * 80).springify()}
                style={styles.mustTryCard}
              >
                <Image
                  source={{ uri: restaurant.image }}
                  style={styles.mustTryImage}
                />
                <View style={styles.mustTryInfo}>
                  <Text style={styles.mustTryName}>{restaurant.name}</Text>
                  <Text style={styles.mustTryCuisine}>
                    {restaurant.cuisine}
                  </Text>
                </View>
                <Bookmark size={20} color={COLORS.primary} />
              </Animated.View>
            ))}
          </View>
        );

      case 'collections':
        return (
          <View style={styles.collectionsList}>
            {collections.map((collection, index) => (
              <Animated.View
                key={collection.id}
                entering={FadeInDown.delay(100 + index * 80).springify()}
                style={styles.collectionCard}
              >
                <Image
                  source={{ uri: collection.image }}
                  style={styles.collectionImage}
                />
                <View style={styles.collectionOverlay}>
                  <Text style={styles.collectionName}>{collection.name}</Text>
                  <Text style={styles.collectionCount}>
                    {collection.itemCount} places
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        );

      case 'preferences':
        return (
          <View style={styles.preferencesList}>
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>Favorite Cuisines</Text>
              <View style={styles.preferenceTags}>
                {preferences.cuisines.map((cuisine) => (
                  <View key={cuisine} style={styles.preferenceTag}>
                    <Text style={styles.preferenceTagText}>{cuisine}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>Dietary</Text>
              <View style={styles.preferenceTags}>
                {preferences.dietary.map((diet) => (
                  <View key={diet} style={styles.preferenceTag}>
                    <Text style={styles.preferenceTagText}>{diet}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>Price Range</Text>
              <Text style={styles.preferenceValue}>
                {preferences.priceRange}
              </Text>
            </View>
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>Ambiance</Text>
              <View style={styles.preferenceTags}>
                {preferences.ambiance.map((amb) => (
                  <View key={amb} style={styles.preferenceTag}>
                    <Text style={styles.preferenceTagText}>{amb}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.grid}>
            {filteredRestaurants.map((restaurant, index) => (
              <Animated.View
                key={restaurant.id}
                entering={FadeInDown.delay(100 + index * 80).springify()}
              >
                <TouchableOpacity
                  style={styles.restaurantCard}
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: restaurant.image }}
                    style={styles.restaurantImage}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                    style={styles.restaurantGradient}
                  >
                    <View style={styles.restaurantInfo}>
                      <Text style={styles.restaurantName} numberOfLines={1}>
                        {restaurant.name}
                      </Text>
                      <View style={styles.restaurantMeta}>
                        <View style={styles.ratingBadge}>
                          <Star
                            size={12}
                            color={COLORS.warning}
                            fill={COLORS.warning}
                          />
                          <Text style={styles.ratingText}>
                            {restaurant.rating}
                          </Text>
                        </View>
                        <View style={styles.locationBadge}>
                          <MapPin size={10} color={COLORS.white} />
                          <Text style={styles.locationText}>
                            {restaurant.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* Like Button */}
                  <TouchableOpacity
                    style={styles.restaurantLikeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleLikeRestaurant(restaurant);
                    }}
                  >
                    <Heart
                      size={20}
                      color={
                        likedRestaurants.has(restaurant.id)
                          ? COLORS.error
                          : COLORS.white
                      }
                      fill={
                        likedRestaurants.has(restaurant.id)
                          ? COLORS.error
                          : 'none'
                      }
                    />
                  </TouchableOpacity>

                  {/* Like Count */}
                  {restaurant.likeCount > 0 && (
                    <View style={styles.restaurantLikeCount}>
                      <Users size={12} color={COLORS.white} />
                      <Text style={styles.restaurantLikeCountText}>
                        {restaurant.likeCount}
                      </Text>
                    </View>
                  )}

                  {/* Status Badge */}
                  <View style={styles.statusBadge}>
                    {restaurant.isSaved && (
                      <View style={styles.savedBadge}>
                        <Bookmark
                          size={12}
                          color={COLORS.white}
                          fill={COLORS.white}
                        />
                      </View>
                    )}
                    {restaurant.isFavorited && (
                      <View style={styles.favoritedBadge}>
                        <Heart
                          size={12}
                          color={COLORS.white}
                          fill={COLORS.white}
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName || 'Profile'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <Animated.View
          style={styles.profileHeader}
          entering={FadeInUp.springify()}
        >
          <LinearGradient
            colors={[COLORS.primaryLight, COLORS.white]}
            style={styles.profileGradient}
          >
            <Image source={{ uri: userAvatar }} style={styles.profileAvatar} />
            <Text style={styles.profileName}>{userName}</Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {mockRestaurants.filter((r) => r.isSaved).length}
                </Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {mockRestaurants.filter((r) => r.isFavorited).length}
                </Text>
                <Text style={styles.statLabel}>Favorited</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mockFoodItems.length}</Text>
                <Text style={styles.statLabel}>Dishes</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabs}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Bookmark
              size={18}
              color={activeTab === 'saved' ? COLORS.primary : COLORS.gray[600]}
              fill={activeTab === 'saved' ? COLORS.primary : 'none'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'saved' && styles.activeTabText,
              ]}
            >
              Saved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorited' && styles.activeTab]}
            onPress={() => setActiveTab('favorited')}
          >
            <Heart
              size={18}
              color={
                activeTab === 'favorited' ? COLORS.error : COLORS.gray[600]
              }
              fill={activeTab === 'favorited' ? COLORS.error : 'none'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'favorited' && styles.activeTabText,
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'dishes' && styles.activeTab]}
            onPress={() => setActiveTab('dishes')}
          >
            <Star
              size={18}
              color={activeTab === 'dishes' ? COLORS.primary : COLORS.gray[600]}
              fill={activeTab === 'dishes' ? COLORS.primary : 'none'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'dishes' && styles.activeTabText,
              ]}
            >
              Dishes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'mustTry' && styles.activeTab]}
            onPress={() => setActiveTab('mustTry')}
          >
            <Bookmark
              size={18}
              color={
                activeTab === 'mustTry' ? COLORS.primary : COLORS.gray[600]
              }
              fill={activeTab === 'mustTry' ? COLORS.primary : 'none'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'mustTry' && styles.activeTabText,
              ]}
            >
              Must-Try
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'collections' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('collections')}
          >
            <Star
              size={18}
              color={
                activeTab === 'collections' ? COLORS.primary : COLORS.gray[600]
              }
              fill={activeTab === 'collections' ? COLORS.primary : 'none'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'collections' && styles.activeTabText,
              ]}
            >
              Collections
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'preferences' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('preferences')}
          >
            <Heart
              size={18}
              color={
                activeTab === 'preferences' ? COLORS.primary : COLORS.gray[600]
              }
              fill={activeTab === 'preferences' ? COLORS.primary : 'none'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'preferences' && styles.activeTabText,
              ]}
            >
              Preferences
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Empty State for saved/favorited tabs */}
        {(activeTab === 'saved' || activeTab === 'favorited') &&
          filteredRestaurants.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No {activeTab} restaurants yet
              </Text>
            </View>
          )}
      </ScrollView>

      {/* Favourite Bottom Sheet */}
      {selectedItem && (
        <FavouriteBottomSheet
          visible={showFavouriteBottomSheet}
          onClose={() => setShowFavouriteBottomSheet(false)}
          restaurant={{
            id: selectedItem.id,
            name: selectedItem.name,
            cuisine: selectedItem.cuisine || '',
            image: selectedItem.image || '',
            rating: 0,
            distance: '0',
            priceRange: '',
            description: '',
            address: '',
            phone: '',
            latitude: 0,
            longitude: 0,
            isOpen: true,
            website: '',
            instagramUrl: '',
            mustTry: false,
            reviews: 0,
            deliveryTime: '',
            deliveryFee: '',
            tags: [],
            featured: false,
            isFavorite: false,
          }}
          onAddToFavorites={handleAddToFavorites}
          onSaveToCollection={() => {}}
          onShare={() => {}}
          onGetDirections={() => {}}
          onCall={() => {}}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.massive,
  },
  profileHeader: {
    marginBottom: SPACING.lg,
  },
  profileGradient: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray[200],
    borderWidth: 4,
    borderColor: COLORS.white,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  profileName: {
    fontSize: FONT_SIZES.xxl + 2,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  tabs: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  restaurantCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  restaurantInfo: {
    gap: 4,
  },
  restaurantName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.white,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '600',
    color: COLORS.white,
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    gap: 4,
  },
  savedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  favoritedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.massive,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  foodSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  foodScroll: {
    gap: SPACING.sm,
  },
  foodCard: {
    width: 140,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  foodImage: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.gray[100],
  },
  foodInfo: {
    padding: SPACING.sm,
  },
  foodName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  foodRestaurant: {
    fontSize: FONT_SIZES.xxs,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  foodRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  foodRatingText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Dish Grid Styles
  dishCard: {
    width: (width - 64) / 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  dishImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.gray[100],
  },
  dishInfo: {
    padding: SPACING.sm,
  },
  dishName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  dishRestaurant: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    marginBottom: 6,
  },
  dishRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dishRatingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Must-Try List Styles
  mustTryList: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  mustTryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  mustTryImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
  },
  mustTryInfo: {
    flex: 1,
  },
  mustTryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  mustTryCuisine: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
  },

  // Collections Styles
  collectionsList: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  collectionCard: {
    height: 140,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  collectionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  collectionName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },

  // Preferences Styles
  preferencesList: {
    gap: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  preferenceSection: {
    gap: SPACING.sm,
  },
  preferenceLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  preferenceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  preferenceTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  preferenceTagText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  preferenceValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },

  // Like Button Styles
  dishLikeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dishLikeCount: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  dishLikeCountText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.white,
  },
  restaurantLikeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  restaurantLikeCount: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    zIndex: 10,
  },
  restaurantLikeCountText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
});
