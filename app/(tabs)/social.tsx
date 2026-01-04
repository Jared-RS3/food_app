import { router } from 'expo-router';
import {
  Bookmark,
  Calendar,
  ChevronRight,
  Heart,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventCard from '../../components/EventCard';
import InstagramImportModal from '../../components/InstagramImportModal';
import RestaurantDetailsBottomSheet from '../../components/RestaurantDetailsBottomSheet';
import SocialFeedCard from '../../components/SocialFeedCard';
import { theme } from '../../constants/theme';
import { eventService } from '../../services/eventService';
import { SocialPost, socialService } from '../../services/socialService';
import { Event } from '../../types/event';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;

// Mock friends data
const mockFriends = [
  {
    id: 'user1',
    name: 'Sarah Chen',
    avatar: 'https://i.pravatar.cc/150?img=1',
    savedCount: 12,
    favoritedCount: 8,
    recentRestaurant: 'The Test Kitchen',
  },
  {
    id: 'user2',
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?img=12',
    savedCount: 24,
    favoritedCount: 15,
    recentRestaurant: 'Mama Africa',
  },
  {
    id: 'user3',
    name: 'Emma Williams',
    avatar: 'https://i.pravatar.cc/150?img=5',
    savedCount: 18,
    favoritedCount: 12,
    recentRestaurant: 'La Colombe',
  },
  {
    id: 'user4',
    name: 'Alex Brown',
    avatar: 'https://i.pravatar.cc/150?img=8',
    savedCount: 9,
    favoritedCount: 6,
    recentRestaurant: 'Codfather',
  },
  {
    id: 'user5',
    name: 'Lisa Park',
    avatar: 'https://i.pravatar.cc/150?img=9',
    savedCount: 31,
    favoritedCount: 22,
    recentRestaurant: 'Harbour House',
  },
];

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'friends'>(
    'feed'
  );
  const [feedPosts, setFeedPosts] = useState<SocialPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
    loadFeed();
    loadEvents();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const posts = await socialService.getSocialFeed();
      setFeedPosts(posts);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const allEvents = await eventService.getEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleFavorite = async (postId: string) => {
    try {
      const post = feedPosts.find((p) => p.id === postId);
      if (!post) return;

      // Update local state
      setFeedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                is_liked: !p.is_liked,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error favoriting post:', error);
    }
  };

  const handlePostPress = (post: SocialPost) => {
    // Show restaurant details bottom sheet
    setSelectedRestaurant({
      id: post.restaurant_id,
      name: post.restaurant_name || 'Restaurant',
      cuisine: 'Various Cuisine',
      image:
        post.restaurant_image ||
        post.food_item_image ||
        post.images?.[0] ||
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      rating: post.rating || 4.5,
      priceRange: '$$',
      distance: 2.5,
      description: post.content || 'Discover this amazing restaurant',
      address: post.location || 'Cape Town, South Africa',
    });
  };

  const handleEventPress = (event: Event) => {
    // Show event restaurant details
    setSelectedRestaurant({
      id: (event as any).restaurant_id,
      name: event.title,
      cuisine: 'Various Cuisine',
      image:
        (event as any).image_url ||
        event.image ||
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      rating: 4.5,
      priceRange: '$$',
      distance: 2.5,
      description: event.description,
      address: event.location || 'Cape Town, South Africa',
    });
  };

  const handleBookmark = async (postId: string) => {
    try {
      const post = feedPosts.find((p) => p.id === postId);
      if (!post) return;

      if (post.is_bookmarked) {
        await socialService.removeBookmark(postId);
      } else {
        await socialService.bookmarkPost(postId);
      }

      // Update local state
      setFeedPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, is_bookmarked: !p.is_bookmarked } : p
        )
      );
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleImportSuccess = (restaurant: any) => {
    Alert.alert(
      'Success!',
      `${restaurant.name} has been added to your restaurant list.`
    );
    loadFeed();
  };

  const renderFeed = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadFeed} />
      }
    >
      {/* Friend Activity Summary */}
      <View style={styles.activityBanner}>
        <View style={styles.activityIcon}>
          <TrendingUp size={20} color={COLORS.primary} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Friend Activity</Text>
          <Text style={styles.activitySubtitle}>
            Discover what your friends are saving and favoriting
          </Text>
        </View>
      </View>

      {/* Feed Posts */}
      {feedPosts.map((post, index) => (
        <Animated.View
          key={post.id}
          entering={FadeInDown.delay(100 + index * 50)}
        >
          <SocialFeedCard
            post={post}
            onFavorite={handleFavorite}
            onBookmark={handleBookmark}
            onPress={handlePostPress}
          />
        </Animated.View>
      ))}

      {/* Empty State */}
      {feedPosts.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Users size={48} color={COLORS.gray[300]} />
          </View>
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Follow friends to see their restaurant discoveries
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderFriends = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.friendsHeader}>Your Friends</Text>
      <Text style={styles.friendsSubheader}>
        Tap to see their favorite restaurants and food
      </Text>

      {mockFriends.map((friend, index) => (
        <Animated.View
          key={friend.id}
          entering={FadeInDown.delay(100 + index * 80)}
        >
          <TouchableOpacity
            style={styles.friendCard}
            onPress={() => {
              router.push(
                `/friend-profile?userId=${
                  friend.id
                }&userName=${encodeURIComponent(friend.name)}`
              );
            }}
            activeOpacity={0.7}
          >
            <View style={styles.friendInfo}>
              <Image
                source={{ uri: friend.avatar }}
                style={styles.friendAvatar}
              />
              <View style={styles.friendDetails}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <View style={styles.friendStats}>
                  <View style={styles.friendStat}>
                    <Bookmark size={14} color={COLORS.primary} />
                    <Text style={styles.friendStatText}>
                      {friend.savedCount} saved
                    </Text>
                  </View>
                  <View style={styles.friendStat}>
                    <Heart size={14} color={COLORS.error} />
                    <Text style={styles.friendStatText}>
                      {friend.favoritedCount} favorited
                    </Text>
                  </View>
                </View>
                <Text style={styles.friendRecent}>
                  Latest: {friend.recentRestaurant}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );

  const renderEvents = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadEvents} />
      }
    >
      <View style={styles.eventsHeader}>
        <Calendar size={20} color={COLORS.primary} />
        <Text style={styles.eventsHeaderText}>Upcoming Events & Specials</Text>
      </View>

      {events.map((event, index) => (
        <Animated.View
          key={event.id}
          entering={FadeInDown.delay(100 + index * 50)}
        >
          <EventCard
            event={event}
            onPress={() => handleEventPress(event)}
            featured={event.is_featured}
          />
        </Animated.View>
      ))}

      {events.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Calendar size={48} color={COLORS.gray[300]} />
          </View>
          <Text style={styles.emptyTitle}>No Events Yet</Text>
          <Text style={styles.emptySubtitle}>
            Check back soon for exciting events and specials
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowImportModal(true)}
        >
          <Plus size={24} color={COLORS.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'feed' && styles.activeTabText,
            ]}
          >
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'events' && styles.activeTabText,
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'friends' && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'feed' && renderFeed()}
      {activeTab === 'events' && renderEvents()}
      {activeTab === 'friends' && renderFriends()}

      {/* Instagram Import Modal */}
      <InstagramImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  activityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.massive,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  comingSoonText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.massive,
    marginBottom: SPACING.sm,
  },
  comingSoonSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 24,
  },
  // Friends List Styles
  friendsHeader: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  friendsSubheader: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  eventsHeaderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[200],
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: FONT_SIZES.md + 1,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: 4,
  },
  friendStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendStatText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    fontWeight: '600',
  },
  friendRecent: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    fontStyle: 'italic',
  },
});
