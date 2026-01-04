import { COLORS } from '@/constants';
import { Collection, Restaurant } from '@/types/restaurant';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Heart, Plus, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import CollectionBottomSheet from './CollectionBottomSheet';
import RestaurantCard from './RestaurantCard';

const { width } = Dimensions.get('window');

interface FavouritesViewProps {
  restaurants: Restaurant[];
  mustTryRestaurants: Restaurant[];
  collections: Collection[];
  onRestaurantPress: (restaurant: Restaurant) => void;
  onCreateCollection: () => void;
  onAddToCollection: (restaurantId: string, collectionId: string) => void;
  onAddPlace?: () => void; // New prop for adding places
}

export default function FavouritesView({
  restaurants,
  mustTryRestaurants,
  collections,
  onRestaurantPress,
  onCreateCollection,
  onAddToCollection,
  onAddPlace,
}: FavouritesViewProps) {
  const [activeTab, setActiveTab] = useState<
    'favorites' | 'mustTry' | 'collections'
  >('mustTry');
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const tabPosition = useSharedValue(0);

  const handleTabPress = (tab: 'mustTry' | 'favorites' | 'collections') => {
    setActiveTab(tab);
    const segmentWidth = (width - 48) / 3;
    const index = { mustTry: 0, favorites: 1, collections: 2 }[tab];
    tabPosition.value = withSpring(index * segmentWidth, {
      damping: 20,
      stiffness: 200,
    });
  };

  const handleCollectionPress = (collection: Collection) => {
    setSelectedCollection(collection);
    setShowCollectionSheet(true);
  };

  const getRestaurantsByIds = (ids: string[]) =>
    ids
      .map((id) => restaurants.find((r) => r.id === id))
      .filter((r): r is Restaurant => !!r);

  const renderFavoritesTab = () => {
    if (restaurants.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.primary + '05']}
              style={styles.emptyIcon}
            >
              <Heart size={56} color={COLORS.primary} strokeWidth={1.5} />
            </LinearGradient>
          </View>
          <Text style={styles.emptyStateTitle}>No Favourites Yet</Text>
          <Text style={styles.emptyStateText}>
            Start adding restaurants to your favorites by tapping the heart icon
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.listHeader}>
          <Text style={styles.resultsCount}>
            {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}{' '}
            saved
          </Text>
        </View>
        {restaurants.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <RestaurantCard
              restaurant={item}
              variant="horizontal"
              onPress={() => onRestaurantPress(item)}
            />
          </View>
        ))}
      </>
    );
  };

  const renderMustTryTab = () => {
    if (mustTryRestaurants.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={['#FFB80020', '#FFB80005']}
              style={styles.emptyIcon}
            >
              <Star size={56} color="#FFB800" strokeWidth={1.5} />
            </LinearGradient>
          </View>
          <Text style={styles.emptyStateTitle}>No Must Try Yet</Text>
          <Text style={styles.emptyStateText}>
            Mark restaurants as "Must Try" to prioritize places you want to
            visit
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.listHeader}>
          <Text style={styles.resultsCount}>
            {mustTryRestaurants.length} restaurant
            {mustTryRestaurants.length !== 1 ? 's' : ''} to try
          </Text>
        </View>
        {mustTryRestaurants.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <View style={styles.mustTryCardContainer}>
              <View style={styles.mustTryBadge}>
                <Star size={14} color="#FFB800" fill="#FFB800" />
                <Text style={styles.mustTryBadgeText}>Must Try</Text>
              </View>
              <RestaurantCard
                restaurant={item}
                variant="horizontal"
                onPress={() => onRestaurantPress(item)}
              />
            </View>
          </View>
        ))}
      </>
    );
  };

  const renderCollectionsTab = () => {
    const renderCollection = (collection: Collection) => {
      return (
        <TouchableOpacity
          key={collection.id}
          style={styles.collectionCard}
          onPress={() => handleCollectionPress(collection)}
          activeOpacity={0.7}
        >
          <View style={styles.collectionHeader}>
            <View style={styles.collectionHeaderLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: collection.color + '20' },
                ]}
              >
                <Text style={styles.collectionIcon}>{collection.icon}</Text>
              </View>
              <View style={styles.collectionInfo}>
                <Text style={styles.collectionTitle}>{collection.name}</Text>
                <Text style={styles.collectionCount}>
                  {collection.restaurantCount} restaurant
                  {collection.restaurantCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          {collection.recentAdditions.length > 0 && (
            <View style={styles.recentAdditions}>
              <Text style={styles.recentText}>Recent additions</Text>
              <View style={styles.recentNames}>
                <Text style={styles.recentNamesText} numberOfLines={1}>
                  {collection.recentAdditions.join(' • ')}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    };

    return (
      <>
        <View style={styles.listHeader}>
          <Text style={styles.resultsCount}>
            {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createCollectionCard}
          onPress={onCreateCollection}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createCollectionGradient}
          >
            <View style={styles.createCollectionContent}>
              <View style={styles.plusIconContainer}>
                <Plus size={20} color={COLORS.white} strokeWidth={3} />
              </View>
              <Text style={styles.createCollectionText}>
                Create New Collection
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        {collections.map(renderCollection)}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Clean Header - Fresha Style */}
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>My Collection</Text> */}

        {/* Simple Stats Pills */}
        {/* <View style={styles.statsPillsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillNumber}>{restaurants.length}</Text>
            <Text style={styles.statPillLabel}>Saved</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillNumber}>
              {mustTryRestaurants.length}
            </Text>
            <Text style={styles.statPillLabel}>Must Try</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillNumber}>{collections.length}</Text>
            <Text style={styles.statPillLabel}>Lists</Text>
          </View>
        </View> */}

        {/* Horizontal Tab Bar - Fresha Style with underline */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'mustTry' && styles.activeTab]}
            onPress={() => handleTabPress('mustTry')}
            activeOpacity={0.7}
          >
            <Star
              size={18}
              color={
                activeTab === 'mustTry' ? COLORS.primary : COLORS.gray[400]
              }
              fill={activeTab === 'mustTry' ? COLORS.primary : 'transparent'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'mustTry' && styles.activeTabText,
              ]}
            >
              Must Try
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => handleTabPress('favorites')}
            activeOpacity={0.7}
          >
            <Heart
              size={18}
              color={
                activeTab === 'favorites' ? COLORS.primary : COLORS.gray[400]
              }
              fill={activeTab === 'favorites' ? COLORS.primary : 'transparent'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'favorites' && styles.activeTabText,
              ]}
            >
              Saved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'collections' && styles.activeTab,
            ]}
            onPress={() => handleTabPress('collections')}
            activeOpacity={0.7}
          >
            <Bookmark
              size={18}
              color={
                activeTab === 'collections' ? COLORS.primary : COLORS.gray[400]
              }
              fill={
                activeTab === 'collections' ? COLORS.primary : 'transparent'
              }
              strokeWidth={2}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'collections' && styles.activeTabText,
              ]}
            >
              Lists
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {activeTab === 'mustTry'
          ? renderMustTryTab()
          : activeTab === 'favorites'
          ? renderFavoritesTab()
          : renderCollectionsTab()}
      </ScrollView>

      {/* Bottom Sheet */}
      <CollectionBottomSheet
        visible={showCollectionSheet}
        onClose={() => {
          setShowCollectionSheet(false);
          setSelectedCollection(null);
        }}
        collection={selectedCollection}
        restaurants={
          selectedCollection
            ? getRestaurantsByIds(selectedCollection.restaurants)
            : []
        }
        onRestaurantPress={onRestaurantPress}
      />

      {/* Floating Add Button */}
      {onAddPlace && (
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={onAddPlace}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, '#FF8FAE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingAddButtonInner}
          >
            <Plus size={28} color={COLORS.white} strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Clean Header - Fresha Style (No banner, no gradients)
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 16,
    letterSpacing: -0.5,
  },

  // Stats Pills Row - Minimal Design
  statsPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  statPillNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statPillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Horizontal Tab Bar - Fresha Style with underline indicator
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Content Area
  scrollContent: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  listHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Cards - Flatter Fresha Style
  cardWrapper: {
    marginBottom: 16,
  },
  mustTryCardContainer: {
    position: 'relative',
  },
  mustTryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  mustTryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F57C00',
    marginLeft: 4,
  },

  // Collections - Cleaner Design
  collectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    overflow: 'hidden',
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  collectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  collectionIcon: {
    fontSize: 24,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 13,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  recentAdditions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: 12,
  },
  recentText: {
    fontSize: 11,
    color: COLORS.gray[400],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  recentNames: {
    flexDirection: 'row',
  },
  recentNamesText: {
    fontSize: 13,
    color: COLORS.gray[600],
    fontWeight: '500',
  },

  // Create Collection Button - Minimal Gradient
  createCollectionCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createCollectionGradient: {
    padding: 16,
  },
  createCollectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  createCollectionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Empty States - Cleaner
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: 260,
  },

  // Floating Add Button
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingAddButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
