import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Award,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import RestaurantDetailsBottomSheet from '../../components/RestaurantDetailsBottomSheet';
import { theme } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { forYouService } from '../../services/forYouService';
import { ForYouPost } from '../../types/forYou';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

// Mock people to follow
const mockPeople = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: '@sarahfoodie',
    avatar: 'https://i.pravatar.cc/150?img=1',
    savedCount: 45,
    bio: 'Cape Town foodie 🍕',
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    username: '@marcuseats',
    avatar: 'https://i.pravatar.cc/150?img=12',
    savedCount: 78,
    bio: 'Food photographer 📸',
    isFollowing: false,
  },
  {
    id: '3',
    name: 'Emma Williams',
    username: '@emmafood',
    avatar: 'https://i.pravatar.cc/150?img=5',
    savedCount: 62,
    bio: 'Restaurant reviewer ⭐',
    isFollowing: false,
  },
  {
    id: '4',
    name: 'Alex Brown',
    username: '@alexdines',
    avatar: 'https://i.pravatar.cc/150?img=8',
    savedCount: 34,
    bio: 'Fine dining lover 🍷',
    isFollowing: false,
  },
];

// Mock editor's picks
const mockEditorsPicks = [
  {
    id: 'editor-1',
    restaurantName: 'La Colombe',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    reason: "Editor's Choice",
    description: 'Award-winning fine dining with spectacular views',
    cuisine: 'French',
    rating: 4.9,
  },
  {
    id: 'editor-2',
    restaurantName: 'The Pot Luck Club',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    reason: 'Trending This Week',
    description: 'Rooftop restaurant with creative small plates',
    cuisine: 'Fusion',
    rating: 4.7,
  },
  {
    id: 'editor-3',
    restaurantName: 'The Test Kitchen',
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop',
    reason: 'Must Try',
    description: 'Innovative tasting menus with local ingredients',
    cuisine: 'Contemporary',
    rating: 4.8,
  },
];

export default function ForYouScreen() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<ForYouPost[]>([]);
  const [people, setPeople] = useState(mockPeople);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    id?: string;
    name: string;
    cuisine: string;
    image: string;
    rating?: number;
    priceRange?: string;
    distance?: number;
    description?: string;
    address?: string;
  } | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user]);

  const getCurrentUser = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    setUser(currentUser);
  };

  const loadFeed = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const newPosts = await forYouService.getForYouFeed(user.id, 1, 10);
      setPosts(newPosts);
      setPage(1);
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Error loading For You feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!user || !hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const newPosts = await forYouService.getForYouFeed(user.id, nextPage, 10);

      if (newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
      }

      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      const freshPosts = await forYouService.refreshFeed(user.id);
      setPosts(freshPosts);
      setPage(1);
      setHasMore(freshPosts.length === 10);
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePostPress = async (post: ForYouPost) => {
    if (user) {
      await forYouService.trackInteraction(user.id, post.restaurantId, 'view');
    }
    router.push(`/restaurant/${post.restaurantId}` as any);
  };

  const handleEditorPickPress = (
    restaurantName: string,
    restaurantImage: string,
    cuisine: string
  ) => {
    // Show restaurant details bottom sheet
    setSelectedRestaurant({
      name: restaurantName,
      cuisine: cuisine,
      image: restaurantImage,
      rating: 4.5,
      priceRange: '$$',
      distance: 2.5,
      description: "Editor's pick - highly recommended!",
      address: 'Cape Town, South Africa',
    });
  };

  const handlePersonPress = (personId: string, personName: string) => {
    router.push(
      `/friend-profile?userId=${personId}&userName=${encodeURIComponent(
        personName
      )}` as any
    );
  };

  const handleRecommendationPress = (post: ForYouPost) => {
    // Show restaurant details bottom sheet
    setSelectedRestaurant({
      id: post.restaurantId,
      name: post.restaurantName,
      cuisine: post.cuisine,
      image: post.restaurantImage,
      rating: post.rating,
      priceRange: post.priceRange,
      distance: post.distance,
      description: post.recommendationReason,
      address: post.address,
    });
  };

  const handleFollowToggle = (personId: string) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === personId ? { ...p, isFollowing: !p.isFollowing } : p
      )
    );
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('nearby') || reason.includes('area')) {
      return <MapPin size={12} color={COLORS.primary} />;
    }
    if (reason.includes('Trending') || reason.includes('Hot spot')) {
      return <TrendingUp size={12} color={COLORS.warning} />;
    }
    if (reason.includes('rated')) {
      return <Star size={12} color={COLORS.warning} />;
    }
    if (reason.includes('lunch') || reason.includes('dinner')) {
      return <Clock size={12} color={COLORS.success} />;
    }
    return <Sparkles size={12} color={COLORS.accent} />;
  };

  const renderPost = ({ item, index }: { item: ForYouPost; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50)}
      style={styles.gridCard}
    >
      <TouchableOpacity
        onPress={() => handleRecommendationPress(item)}
        activeOpacity={0.9}
      >
        {/* Image */}
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: item.featuredDishImage || item.restaurantImage }}
            style={styles.cardImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.cardGradient}
          />

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
            <Text style={styles.ratingBadgeText}>{item.rating}</Text>
          </View>

          {/* Distance Badge */}
          {item.distance !== undefined && (
            <View style={styles.cardDistanceBadge}>
              <Text style={styles.cardDistanceText}>
                {item.distance.toFixed(1)}km
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardRestaurantName} numberOfLines={1}>
            {item.restaurantName}
          </Text>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardCuisine} numberOfLines={1}>
              {item.cuisine}
            </Text>
            <Text style={styles.cardPrice}>{item.priceRange}</Text>
          </View>
          <View style={styles.cardReasonBadge}>
            {getReasonIcon(item.recommendationReason)}
            <Text style={styles.cardReasonText} numberOfLines={1}>
              {item.recommendationReason}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPerson = ({
    item,
    index,
  }: {
    item: (typeof mockPeople)[0];
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 80)}
      style={styles.personCard}
    >
      <TouchableOpacity
        style={styles.personTouchable}
        onPress={() => handlePersonPress(item.id, item.name)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.personAvatar} />
        <View style={styles.personInfo}>
          <Text style={styles.personName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.personUsername} numberOfLines={1}>
            {item.username}
          </Text>
          <Text style={styles.personBio} numberOfLines={1}>
            {item.bio}
          </Text>
          <Text style={styles.personStats}>{item.savedCount} saves</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.followButton,
          item.isFollowing && styles.followingButton,
        ]}
        onPress={() => handleFollowToggle(item.id)}
      >
        <Text
          style={[
            styles.followButtonText,
            item.isFollowing && styles.followingButtonText,
          ]}
        >
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEditorPick = ({
    item,
    index,
  }: {
    item: (typeof mockEditorsPicks)[0];
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={styles.editorCard}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          handleEditorPickPress(item.restaurantName, item.image, item.cuisine)
        }
      >
        <Image source={{ uri: item.image }} style={styles.editorImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.editorGradient}
        />
        <View style={styles.editorBadge}>
          <Award size={12} color={COLORS.warning} />
          <Text style={styles.editorBadgeText}>{item.reason}</Text>
        </View>
        <View style={styles.editorContent}>
          <Text style={styles.editorTitle}>{item.restaurantName}</Text>
          <View style={styles.editorMeta}>
            <Text style={styles.editorCuisine}>{item.cuisine}</Text>
            <View style={styles.editorRating}>
              <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.editorRatingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>For You</Text>
            <Text style={styles.headerSubtitle}>
              Personalized recommendations
            </Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Curating your feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>For You</Text>
          <Text style={styles.headerSubtitle}>Personalized just for you</Text>
        </View>
        <View style={styles.sparkleIcon}>
          <Sparkles size={24} color={COLORS.primary} />
        </View>
      </View>

      {/* Scrollable Feed */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Editor's Picks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color={COLORS.warning} />
            <Text style={styles.sectionTitle}>Editor's Picks</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {mockEditorsPicks.map((item, index) => (
              <View key={item.id}>{renderEditorPick({ item, index })}</View>
            ))}
          </ScrollView>
        </View>

        {/* People Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>People You May Know</Text>
          </View>
          <View style={styles.peopleList}>
            {people.slice(0, 3).map((item, index) => (
              <View key={item.id}>{renderPerson({ item, index })}</View>
            ))}
          </View>
        </View>

        {/* Recommendations Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Recommended For You</Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          {posts.map((item, index) => (
            <View key={item.id}>{renderPost({ item, index })}</View>
          ))}
        </View>

        {/* Load More */}
        {hasMore && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
            <Plus size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Empty State */}
        {posts.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Sparkles size={60} color={COLORS.gray[300]} />
            <Text style={styles.emptyStateTitle}>No recommendations yet</Text>
            <Text style={styles.emptyStateText}>
              Explore restaurants and save your favorites to get personalized
              recommendations
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Restaurant Details Bottom Sheet */}
      {selectedRestaurant && (
        <RestaurantDetailsBottomSheet
          visible={!!selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          restaurant={selectedRestaurant}
          onAddToFavorites={() => {
            Alert.alert('Success', 'Added to favorites!');
          }}
          onAddToMustTry={() => {
            Alert.alert('Success', 'Added to must try list!');
          }}
          onAddToCollection={() => {
            Alert.alert('Success', 'Saved to collection!');
          }}
          onCheckIn={() => {
            Alert.alert('Success', 'Checked in!');
          }}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  sparkleIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  horizontalScroll: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  // Editor's Picks Styles
  editorCard: {
    width: 280,
    marginRight: SPACING.md,
  },
  editorImage: {
    width: 280,
    height: 180,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.gray[100],
  },
  editorGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderRadius: BORDER_RADIUS.xl,
  },
  editorBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    ...theme.shadows.sm,
  },
  editorBadgeText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '800',
    color: COLORS.warning,
  },
  editorContent: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
  },
  editorTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  editorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editorCuisine: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
  },
  editorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  editorRatingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  // People Section Styles
  peopleList: {
    paddingHorizontal: SPACING.lg,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.sm,
    ...theme.shadows.sm,
  },
  personTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  personInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  personName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  personUsername: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  personBio: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  personStats: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  followButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  followingButton: {
    backgroundColor: COLORS.surfaceLight,
  },
  followButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  followingButtonText: {
    color: COLORS.textSecondary,
  },
  // Grid Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg - 4,
  },
  gridCard: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cardImageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  ratingBadgeText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardDistanceBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  cardDistanceText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardContent: {
    padding: SPACING.sm,
  },
  cardRestaurantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardCuisine: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  cardPrice: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.success,
  },
  cardReasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  cardReasonText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  loadMoreText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});
