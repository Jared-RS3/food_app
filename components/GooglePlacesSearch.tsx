import { useMyPlacesOnboarding } from '@/hooks/useMyPlacesOnboarding';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  MapPin,
  Navigation,
  Phone,
  Search,
  Star,
  Store,
  X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { hapticLight, hapticSelection } from '../utils/helpers';
import { MyPlacesOnboardingModal } from './MyPlacesOnboardingModal';

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  price_level?: number;
  types?: string[];
  vicinity?: string;
  phone?: string;
  website?: string;
  hours?: string;
  service_options?: {
    dine_in?: boolean;
    takeout?: boolean;
    delivery?: boolean;
  };
  price?: string;
  description?: string;
  thumbnail?: string;
}

interface GooglePlacesSearchProps {
  onSelectPlace: (place: GooglePlace) => void;
  onSelectPlaceAsMustTry?: (place: GooglePlace) => void;
  onClose: () => void;
  initialLocation?: { latitude: number; longitude: number };
}

// Free OpenStreetMap API - No API key required!

export const GooglePlacesSearch: React.FC<GooglePlacesSearchProps> = ({
  onSelectPlace,
  onSelectPlaceAsMustTry,
  onClose,
  initialLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✨ Add onboarding modal hook
  const {
    isVisible: onboardingVisible,
    actionType,
    collectionName,
    showOnboarding,
    closeOnboarding,
  } = useMyPlacesOnboarding();

  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      searchTimeout.current = setTimeout(() => {
        searchPlaces(searchQuery);
      }, 500);
    } else {
      setPlaces([]);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const searchPlaces = async (query: string) => {
    setLoading(true);
    try {
      const lat = initialLocation?.latitude || -33.918;
      const lng = initialLocation?.longitude || 18.423;

      // SerpAPI Google Maps Search - You'll need to get a free API key from serpapi.com
      const SERPAPI_KEY =
        'e8613b61ad1871519a29951f7c8ecb3021e2c6d774b7f1214e10c19dc1dfbd07'; // Replace with your actual API key

      const params = new URLSearchParams({
        engine: 'google_maps',
        q: `${query} restaurant`, // Force restaurant search
        ll: `@${lat},${lng},14z`,
        type: 'search',
        api_key: SERPAPI_KEY,
      });

      const response = await fetch(
        `https://serpapi.com/search?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('SerpAPI error:', response.status, response.statusText);
        setPlaces([]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Check for API errors
      if (data.error) {
        console.error('SerpAPI error:', data.error);
        setPlaces([]);
        setLoading(false);
        return;
      }

      // Check if we have local results
      if (!data.local_results || data.local_results.length === 0) {
        console.log('No restaurants found for query:', query);
        setPlaces([]);
        setLoading(false);
        return;
      }

      // Convert SerpAPI data to our format - Filter restaurants only
      const processedPlaces = data.local_results
        .filter((result: any) => {
          // Only include restaurants
          if (!result.title || !result.gps_coordinates) return false;

          // Check if it's a restaurant based on type or title
          const isRestaurant =
            result.type?.toLowerCase().includes('restaurant') ||
            result.type?.toLowerCase().includes('food') ||
            result.type?.toLowerCase().includes('cafe') ||
            result.type?.toLowerCase().includes('bar') ||
            result.type?.toLowerCase().includes('dining') ||
            result.title?.toLowerCase().includes('restaurant') ||
            result.title?.toLowerCase().includes('cafe') ||
            result.title?.toLowerCase().includes('kitchen') ||
            result.title?.toLowerCase().includes('grill') ||
            result.title?.toLowerCase().includes('bistro');

          return isRestaurant;
        })
        .map((result: any) => ({
          place_id: result.place_id || `serp_${result.position}`,
          name: result.title,
          formatted_address: result.address || 'Address not available',
          vicinity: result.address || '',
          geometry: {
            location: {
              lat: result.gps_coordinates?.latitude || lat,
              lng: result.gps_coordinates?.longitude || lng,
            },
          },
          rating: result.rating || undefined,
          user_ratings_total: result.reviews || undefined,
          opening_hours: result.open_state
            ? { open_now: result.open_state === 'Open' }
            : undefined,
          hours: result.hours || result.service_options?.dine_in || undefined,
          photos: result.thumbnail
            ? [
                {
                  photo_reference: result.thumbnail,
                  height: 300,
                  width: 400,
                },
              ]
            : undefined,
          thumbnail: result.thumbnail,
          price_level: result.price ? result.price.length : undefined,
          price: result.price,
          types: result.type ? [result.type] : ['restaurant'],
          phone: result.phone,
          website: result.website,
          description: result.description,
          service_options: result.service_options || {},
        }))
        .slice(0, 15);

      console.log(`Found ${processedPlaces.length} restaurants for "${query}"`);
      setPlaces(processedPlaces);
    } catch (error) {
      console.error('Error fetching places from SerpAPI:', error);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoReference: string, maxWidth: number = 400) => {
    // Use the thumbnail URL directly from SerpAPI or fallback to placeholder
    return (
      photoReference ||
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
    );
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return '';
    return '₹'.repeat(level);
  };

  const handleSelectPlace = (place: GooglePlace) => {
    hapticSelection();
    setSelectedPlace(place);
  };

  const handleConfirmPlace = () => {
    if (selectedPlace) {
      hapticLight();
      onSelectPlace(selectedPlace);
      onClose();
    }
  };

  const handleAddAsMustTry = async () => {
    if (selectedPlace) {
      hapticLight();
      if (onSelectPlaceAsMustTry) {
        onSelectPlaceAsMustTry(selectedPlace);
      } else {
        // Fallback to regular onSelectPlace
        onSelectPlace(selectedPlace);
      }

      // ✨ Show onboarding modal for must-try
      await showOnboarding('mustTry');

      onClose();
    }
  };

  const clearSearch = () => {
    hapticLight();
    setSearchQuery('');
    setPlaces([]);
    setSelectedPlace(null);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <LinearGradient
        colors={['#FF6B9D', '#FF8FAE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.searchHeader}
      >
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" strokeWidth={2.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants nearby..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color="#6B7280" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {loading && <ActivityIndicator size="small" color="#FF6B9D" />}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Results */}
      <ScrollView
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInset={{ top: 12 }}
        contentOffset={{ x: 0, y: -12 }}
      >
        {places.length === 0 && !loading && searchQuery.length > 2 && (
          <View style={styles.emptyState}>
            <Search size={48} color="#D1D5DB" strokeWidth={2} />
            <Text style={styles.emptyTitle}>No restaurants found</Text>
            <Text style={styles.emptyDescription}>
              Try a different search term or location
            </Text>
          </View>
        )}

        {places.length === 0 && searchQuery.length === 0 && (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#D1D5DB" strokeWidth={2} />
            <Text style={styles.emptyTitle}>Search for restaurants</Text>
            <Text style={styles.emptyDescription}>
              Find great places to eat near you
            </Text>
          </View>
        )}

        {places.map((place, index) => (
          <Animated.View
            key={place.place_id}
            entering={FadeInRight.delay(index * 50)}
          >
            <TouchableOpacity
              style={[
                styles.placeCard,
                selectedPlace?.place_id === place.place_id &&
                  styles.placeCardSelected,
              ]}
              onPress={() => handleSelectPlace(place)}
              activeOpacity={0.7}
            >
              {/* Image with overlay */}
              <View style={styles.imageContainer}>
                {place.photos && place.photos.length > 0 ? (
                  <Image
                    source={{
                      uri: getPhotoUrl(place.photos[0].photo_reference),
                    }}
                    style={styles.placeImage}
                  />
                ) : (
                  <View style={[styles.placeImage, styles.placeholderImage]}>
                    <Store size={40} color="#D1D5DB" strokeWidth={2} />
                  </View>
                )}

                {/* Top overlay badges */}
                <View style={styles.imageOverlay}>
                  {place.opening_hours?.open_now && (
                    <View style={styles.openBadge}>
                      <View style={styles.openDot} />
                      <Text style={styles.openText}>Open Now</Text>
                    </View>
                  )}
                  {place.price && (
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceText}>{place.price}</Text>
                    </View>
                  )}
                </View>

                {/* Rating badge */}
                {place.rating && (
                  <View style={styles.ratingBadge}>
                    <Star
                      size={12}
                      color="#FFFFFF"
                      fill="#FFFFFF"
                      strokeWidth={2}
                    />
                    <Text style={styles.ratingBadgeText}>
                      {place.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Content */}
              <View style={styles.placeContent}>
                <View style={styles.placeHeader}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {place.name}
                  </Text>
                </View>

                {/* Address */}
                <View style={styles.infoRow}>
                  <MapPin size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.placeAddress} numberOfLines={1}>
                    {place.vicinity || place.formatted_address}
                  </Text>
                </View>

                {/* Rating and reviews */}
                {place.rating && (
                  <View style={styles.infoRow}>
                    <Star
                      size={14}
                      color="#F59E0B"
                      fill="#F59E0B"
                      strokeWidth={2}
                    />
                    <Text style={styles.ratingText}>
                      {place.rating.toFixed(1)}
                    </Text>
                    {place.user_ratings_total && (
                      <Text style={styles.ratingsCount}>
                        ({place.user_ratings_total.toLocaleString()} reviews)
                      </Text>
                    )}
                  </View>
                )}

                {/* Phone */}
                {place.phone && (
                  <View style={styles.infoRow}>
                    <Phone size={14} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {place.phone}
                    </Text>
                  </View>
                )}

                {/* Hours */}
                {place.hours && (
                  <View style={styles.infoRow}>
                    <Clock size={14} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {place.hours}
                    </Text>
                  </View>
                )}

                {/* Service options */}
                {place.service_options &&
                  Object.keys(place.service_options).length > 0 && (
                    <View style={styles.serviceOptions}>
                      {place.service_options.dine_in && (
                        <View style={styles.serviceTag}>
                          <Text style={styles.serviceTagText}>🍽️ Dine-in</Text>
                        </View>
                      )}
                      {place.service_options.takeout && (
                        <View style={styles.serviceTag}>
                          <Text style={styles.serviceTagText}>🥡 Takeout</Text>
                        </View>
                      )}
                      {place.service_options.delivery && (
                        <View style={styles.serviceTag}>
                          <Text style={styles.serviceTagText}>🚚 Delivery</Text>
                        </View>
                      )}
                    </View>
                  )}

                {/* Description */}
                {place.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {place.description}
                  </Text>
                )}

                {/* Types */}
                {place.types && place.types.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {place.types.slice(0, 3).map((type, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>
                          {type.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Website link */}
                {place.website && (
                  <TouchableOpacity
                    style={styles.websiteButton}
                    onPress={() => Linking.openURL(place.website!)}
                  >
                    <Text style={styles.websiteButtonText}>Visit Website</Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedPlace?.place_id === place.place_id && (
                <View style={styles.selectedIndicator}>
                  <View style={styles.selectedCheck} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Confirm Buttons */}
      {selectedPlace && (
        <Animated.View entering={FadeInDown} style={styles.confirmContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmPlace}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8FAE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>Add to My Places</Text>
                <Navigation size={20} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mustTryButton}
              onPress={handleAddAsMustTry}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFB84D', '#FFC97B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mustTryGradient}
              >
                <Star
                  size={20}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                  strokeWidth={2.5}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ✨ Onboarding Modal */}
      <MyPlacesOnboardingModal
        visible={onboardingVisible}
        onClose={() => closeOnboarding(false)}
        actionType={actionType}
        collectionName={collectionName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchHeader: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.3,
  },
  clearButton: {
    padding: 4,
  },
  closeButton: {
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 20,
    paddingTop: 32, // Extra 12px margin to prevent hitting top banner (20 + 12)
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: -0.5,
  },
  emptyDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  placeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  placeCardSelected: {
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  placeImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  priceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  placeContent: {
    padding: 16,
    gap: 10,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  placeName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  openText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: -0.2,
  },
  placeAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  placeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  ratingsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },
  serviceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  serviceTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  websiteButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  websiteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: -0.2,
  },
  priceLevel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: -0.2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  confirmContainer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  mustTryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FFB84D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mustTryGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
