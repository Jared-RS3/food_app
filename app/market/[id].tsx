import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Heart,
  MapPin,
  Plus,
  Star,
  Store,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { marketService } from '../../services/marketService';
import { FoodMarket, FoodStall } from '../../types/market';

const { width } = Dimensions.get('window');
const COLORS = theme.colors;
const SPACING = theme.spacing;
const FONT_SIZES = theme.typography.sizes;
const BORDER_RADIUS = theme.borderRadius;

export default function MarketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [market, setMarket] = useState<FoodMarket | null>(null);
  const [stalls, setStalls] = useState<FoodStall[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddStallModal, setShowAddStallModal] = useState(false);

  // Add stall form state
  const [stallName, setStallName] = useState('');
  const [stallDescription, setStallDescription] = useState('');
  const [stallCuisine, setStallCuisine] = useState('');
  const [stallImage, setStallImage] = useState(
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
  );

  useEffect(() => {
    loadMarketData();
  }, [id]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const marketData = await marketService.getMarketById(id);
      if (marketData) {
        setMarket(marketData);
        setStalls(marketData.stalls);
        setIsFavorite(marketData.is_favorite);
      }
    } catch (error) {
      console.error('Error loading market:', error);
      Alert.alert('Error', 'Failed to load market details');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    const newFavoriteState = await marketService.toggleFavoriteMarket(id);
    setIsFavorite(newFavoriteState);
  };

  const handleAddStall = async () => {
    if (!stallName.trim() || !stallCuisine.trim()) {
      Alert.alert(
        'Required Fields',
        'Please enter stall name and cuisine type'
      );
      return;
    }

    try {
      const newStall = await marketService.addStallToMarket(id, {
        name: stallName,
        description: stallDescription || 'Delicious food at this market stall',
        cuisine: stallCuisine,
        image: stallImage,
        rating: 4.5,
        price_range: 'moderate',
        is_favorite: false,
        market_id: id,
      });

      setStalls([...stalls, newStall]);
      setShowAddStallModal(false);

      // Reset form
      setStallName('');
      setStallDescription('');
      setStallCuisine('');

      Alert.alert('Success! 🎉', `${stallName} has been added to the market`);
    } catch (error) {
      console.error('Error adding stall:', error);
      Alert.alert('Error', 'Failed to add stall');
    }
  };

  if (loading || !market) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading market...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: market.banner_image }}
            style={styles.bannerImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bannerGradient}
          />

          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, isFavorite && styles.favoriteActive]}
              onPress={handleFavorite}
            >
              <Heart
                size={24}
                color={isFavorite ? COLORS.error : COLORS.white}
                fill={isFavorite ? COLORS.error : 'none'}
              />
            </TouchableOpacity>
          </View>

          {/* Market Info Overlay */}
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>{market.name}</Text>
            <View style={styles.bannerMeta}>
              <View style={styles.bannerBadge}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.bannerBadgeText}>{market.rating}</Text>
              </View>
              <View style={styles.bannerBadge}>
                <Store size={16} color={COLORS.white} />
                <Text style={styles.bannerBadgeText}>
                  {market.total_stalls} stalls
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <Animated.View
          style={styles.detailsSection}
          entering={FadeInUp.delay(200).springify()}
        >
          <Text style={styles.description}>{market.description}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{market.address}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Clock size={20} color={COLORS.success} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Opening Hours</Text>
                <Text style={styles.infoValue}>
                  {market.days_open.join(', ')} • {market.opening_hours}
                </Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            {market.tags.map((tag: string) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Stalls Section */}
        <View style={styles.stallsSection}>
          <View style={styles.stallsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Food Stalls</Text>
              <Text style={styles.sectionSubtitle}>
                {stalls.length} delicious options
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addStallButton}
              onPress={() => setShowAddStallModal(true)}
            >
              <Plus size={20} color={COLORS.white} strokeWidth={3} />
              <Text style={styles.addStallButtonText}>Add Stall</Text>
            </TouchableOpacity>
          </View>

          {stalls.length === 0 ? (
            <View style={styles.emptyState}>
              <Store size={48} color={COLORS.gray[300]} />
              <Text style={styles.emptyTitle}>No stalls yet</Text>
              <Text style={styles.emptyText}>
                Be the first to add a food stall to this market!
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowAddStallModal(true)}
              >
                <Text style={styles.emptyButtonText}>Add First Stall</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stallsGrid}>
              {stalls.map((stall, index) => (
                <Animated.View
                  key={stall.id}
                  entering={FadeInDown.delay(100 + index * 80).springify()}
                  style={styles.stallCard}
                >
                  <Image
                    source={{ uri: stall.image }}
                    style={styles.stallImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.stallGradient}
                  >
                    <View style={styles.stallInfo}>
                      <Text style={styles.stallName} numberOfLines={1}>
                        {stall.name}
                      </Text>
                      <Text style={styles.stallCuisine}>{stall.cuisine}</Text>
                      <View style={styles.stallRating}>
                        <Star
                          size={12}
                          color={COLORS.warning}
                          fill={COLORS.warning}
                        />
                        <Text style={styles.stallRatingText}>
                          {stall.rating}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Stall Modal */}
      <Modal
        visible={showAddStallModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddStallModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food Stall</Text>
              <TouchableOpacity onPress={() => setShowAddStallModal(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Stall Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., The Paella Guys"
                  placeholderTextColor={COLORS.gray[400]}
                  value={stallName}
                  onChangeText={setStallName}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Cuisine Type *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Spanish, Greek, Italian"
                  placeholderTextColor={COLORS.gray[400]}
                  value={stallCuisine}
                  onChangeText={setStallCuisine}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="What makes this stall special?"
                  placeholderTextColor={COLORS.gray[400]}
                  value={stallDescription}
                  onChangeText={setStallDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddStall}
              >
                <Text style={styles.addButtonText}>Add Stall to Market</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.massive,
  },
  bannerContainer: {
    height: 300,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerButtons: {
    position: 'absolute',
    top: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  favoriteActive: {
    backgroundColor: COLORS.white,
  },
  bannerInfo: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  bannerTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backdropFilter: 'blur(10px)',
  },
  bannerBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  detailsSection: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...theme.shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tagChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  tagChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stallsSection: {
    paddingHorizontal: SPACING.lg,
  },
  stallsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addStallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...theme.shadows.md,
  },
  addStallButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  stallsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  stallCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...theme.shadows.md,
  },
  stallImage: {
    width: '100%',
    height: '100%',
  },
  stallGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  stallInfo: {
    gap: 2,
  },
  stallName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  stallCuisine: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
  },
  stallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  stallRatingText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.massive,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    maxWidth: 250,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.lg,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalScroll: {
    padding: SPACING.lg,
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  formInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...theme.shadows.md,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
  },
});
