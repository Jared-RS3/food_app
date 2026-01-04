import { Clock, List, MapPin, Navigation, Star, Lock, Eye } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { mapExplorationService } from '@/services/mapExplorationService';

const { width, height } = Dimensions.get('window');

interface MapRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  deliveryTime: string;
  image: string;
  latitude: number;
  longitude: number;
}

const SAMPLE_MAP_RESTAURANTS: MapRestaurant[] = [
  {
    id: '1',
    name: 'La Colombe',
    cuisine: 'Fine Dining',
    rating: 4.9,
    distance: '2.1 km',
    deliveryTime: '45-60 min',
    image:
      'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
    latitude: -33.9249,
    longitude: 18.4241,
  },
  {
    id: '2',
    name: 'Kyoto Garden',
    cuisine: 'Japanese',
    rating: 4.8,
    distance: '1.2 km',
    deliveryTime: '25-35 min',
    image:
      'https://images.pexels.com/photos/884596/pexels-photo-884596.jpeg?auto=compress&cs=tinysrgb&w=400',
    latitude: -33.918,
    longitude: 18.423,
  },
];

// Mock districts with fog status
interface District {
  id: string;
  name: string;
  unlocked: boolean;
  fogCleared: number; // 0-100%
  position: { top: number; left: number };
  color: string;
}

const MOCK_DISTRICTS: District[] = [
  { id: '1', name: 'City Center', unlocked: true, fogCleared: 85, position: { top: 100, left: 50 }, color: '#10B981' },
  { id: '2', name: 'Waterfront', unlocked: true, fogCleared: 60, position: { top: 150, left: 150 }, color: '#3B82F6' },
  { id: '3', name: 'Gardens', unlocked: true, fogCleared: 40, position: { top: 200, left: 100 }, color: '#8B5CF6' },
  { id: '4', name: 'Camps Bay', unlocked: false, fogCleared: 0, position: { top: 250, left: 200 }, color: '#6B7280' },
  { id: '5', name: 'Constantia', unlocked: false, fogCleared: 0, position: { top: 150, left: 250 }, color: '#6B7280' },
];

export default function MapScreen() {
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<MapRestaurant | null>(null);
  const [restaurants] = useState<MapRestaurant[]>(SAMPLE_MAP_RESTAURANTS);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [districts] = useState<District[]>(MOCK_DISTRICTS);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [fogEnabled, setFogEnabled] = useState(true);

  // Calculate total fog cleared
  const totalFogCleared = Math.round(
    districts.reduce((sum, d) => sum + (d.unlocked ? d.fogCleared : 0), 0) / districts.length
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      {/* Fog Stats Header */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.fogStatsHeader}>
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fogStatsGradient}
        >
          <View style={styles.fogStatsLeft}>
            <Eye size={20} color="#10B981" />
            <View>
              <Text style={styles.fogStatsLabel}>Map Explored</Text>
              <Text style={styles.fogStatsValue}>{totalFogCleared}%</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.fogToggle}
            onPress={() => setFogEnabled(!fogEnabled)}
          >
            <Text style={styles.fogToggleText}>
              {fogEnabled ? '🌫️ Fog ON' : '👁️ Show All'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <View style={styles.mapPlaceholder}>
        <MapPin size={48} color="#FF6B6B" />
        <Text style={styles.mapPlaceholderTitle}>Fog of War Map</Text>
        <Text style={styles.mapPlaceholderText}>
          Explore districts to clear the fog and discover hidden restaurants!
        </Text>
        <Text style={styles.mapLocationText}>📍 Kuils River, Cape Town</Text>
      </View>

      {/* Districts with Fog Overlay */}
      <View style={styles.mapPinsContainer}>
        {districts.map((district) => (
          <TouchableOpacity
            key={district.id}
            style={[
              styles.districtArea,
              district.position,
            ]}
            onPress={() => setSelectedDistrict(district)}
          >
            {/* District Background */}
            <View style={[styles.districtCircle, { backgroundColor: district.color + '30' }]}>
              {/* Fog Overlay */}
              {fogEnabled && (
                <View style={[
                  styles.fogOverlay,
                  { opacity: district.unlocked ? (100 - district.fogCleared) / 100 : 0.9 }
                ]}>
                  <LinearGradient
                    colors={district.unlocked
                      ? ['rgba(71, 85, 105, 0.7)', 'rgba(51, 65, 85, 0.9)']
                      : ['rgba(15, 23, 42, 0.85)', 'rgba(0, 0, 0, 0.95)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fogGradient}
                  >
                    {!district.unlocked && (
                      <Lock size={16} color="rgba(255, 255, 255, 0.5)" />
                    )}
                  </LinearGradient>
                </View>
              )}

              {/* District Info */}
              <View style={styles.districtInfo}>
                <Text style={styles.districtName}>{district.name}</Text>
                {district.unlocked && (
                  <Text style={styles.districtProgress}>{district.fogCleared}%</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Restaurant Pins (only in unlocked areas) */}
        {restaurants.map((restaurant, index) => (
          <TouchableOpacity
            key={restaurant.id}
            style={[
              styles.mapPin,
              { top: 100 + index * 80, left: 50 + index * 100 },
              !fogEnabled && styles.mapPinVisible,
            ]}
            onPress={() => setSelectedRestaurant(restaurant)}
          >
            <MapPin size={24} color="white" />
          </TouchableOpacity>
        ))}
      </View>

      {/* District Detail Card */}
      {selectedDistrict && (
        <Animated.View entering={FadeIn} style={styles.districtCard}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.districtCardGradient}
          >
            <TouchableOpacity
              style={styles.districtCardClose}
              onPress={() => setSelectedDistrict(null)}
            >
              <Text style={styles.districtCardCloseText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.districtCardHeader}>
              <View style={[styles.districtCardIcon, { backgroundColor: selectedDistrict.color + '30' }]}>
                {selectedDistrict.unlocked ? (
                  <MapPin size={24} color={selectedDistrict.color} />
                ) : (
                  <Lock size={24} color="#6B7280" />
                )}
              </View>
              <View style={styles.districtCardTitle}>
                <Text style={styles.districtCardName}>{selectedDistrict.name}</Text>
                <Text style={styles.districtCardStatus}>
                  {selectedDistrict.unlocked ? '🔓 Unlocked' : '🔒 Locked'}
                </Text>
              </View>
            </View>

            {selectedDistrict.unlocked ? (
              <>
                <View style={styles.districtCardProgress}>
                  <View style={styles.districtCardProgressHeader}>
                    <Text style={styles.districtCardProgressLabel}>Fog Cleared</Text>
                    <Text style={styles.districtCardProgressValue}>
                      {selectedDistrict.fogCleared}%
                    </Text>
                  </View>
                  <View style={styles.districtCardProgressBarBg}>
                    <LinearGradient
                      colors={[selectedDistrict.color, selectedDistrict.color + 'CC']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.districtCardProgressBarFill,
                        { width: `${selectedDistrict.fogCleared}%` }
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.districtCardHint}>
                  🍽️ Visit more restaurants in this area to clear more fog!
                </Text>

                <TouchableOpacity style={styles.districtCardExploreButton}>
                  <LinearGradient
                    colors={[selectedDistrict.color, selectedDistrict.color + 'DD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.districtCardExploreGradient}
                  >
                    <Text style={styles.districtCardExploreText}>Explore District</Text>
                    <Navigation size={16} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.districtCardLocked}>
                  🔒 This district is locked. Complete check-ins in nearby areas to unlock!
                </Text>
                <View style={styles.districtCardRequirements}>
                  <Text style={styles.districtCardRequirementTitle}>Requirements:</Text>
                  <Text style={styles.districtCardRequirement}>• Reach Level 5</Text>
                  <Text style={styles.districtCardRequirement}>• Clear 50% of adjacent districts</Text>
                  <Text style={styles.districtCardRequirement}>• Complete 10 check-ins</Text>
                </View>
              </>
            )}
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );

  const renderListView = () => (
    <ScrollView style={styles.listContainer}>
      <Text style={styles.listTitle}>Nearby Restaurants</Text>
      {restaurants.map((restaurant) => (
        <TouchableOpacity
          key={restaurant.id}
          style={styles.listItem}
          onPress={() => setSelectedRestaurant(restaurant)}
        >
          <Image
            source={{ uri: restaurant.image }}
            style={styles.listItemImage}
          />
          <View style={styles.listItemContent}>
            <Text style={styles.listItemName}>{restaurant.name}</Text>
            <Text style={styles.listItemCuisine}>{restaurant.cuisine}</Text>
            <View style={styles.listItemInfo}>
              <View style={styles.ratingContainer}>
                <Star size={14} color="#FFB800" fill="#FFB800" />
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
              <View style={styles.distanceContainer}>
                <Navigation size={14} color="#6B7280" />
                <Text style={styles.distanceText}>{restaurant.distance}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBottomSheet = () => {
    if (!selectedRestaurant) return null;

    return (
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />
        <View style={styles.bottomSheetContent}>
          <Image
            source={{ uri: selectedRestaurant.image }}
            style={styles.bottomSheetImage}
          />
          <View style={styles.bottomSheetInfo}>
            <Text style={styles.bottomSheetName}>
              {selectedRestaurant.name}
            </Text>
            <Text style={styles.bottomSheetCuisine}>
              {selectedRestaurant.cuisine}
            </Text>

            <View style={styles.bottomSheetMeta}>
              <View style={styles.metaItem}>
                <Star size={16} color="#FFB800" fill="#FFB800" />
                <Text style={styles.metaText}>{selectedRestaurant.rating}</Text>
              </View>
              <View style={styles.metaItem}>
                <Navigation size={16} color="#6B7280" />
                <Text style={styles.metaText}>
                  {selectedRestaurant.distance}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.metaText}>
                  {selectedRestaurant.deliveryTime}
                </Text>
              </View>
            </View>

            <View style={styles.bottomSheetActions}>
              <TouchableOpacity style={styles.directionsButton}>
                <Navigation size={16} color="white" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callButton}>
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'map' && styles.activeToggle,
            ]}
            onPress={() => setViewMode('map')}
          >
            <MapPin
              size={16}
              color={viewMode === 'map' ? 'white' : '#6B7280'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && styles.activeToggle,
            ]}
            onPress={() => setViewMode('list')}
          >
            <List size={16} color={viewMode === 'list' ? 'white' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {viewMode === 'map' ? renderMapView() : renderListView()}
      </View>

      {viewMode === 'map' && renderBottomSheet()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  mapLocationText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  mapPinsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  mapPin: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  listItemContent: {
    flex: 1,
    padding: 12,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  listItemCuisine: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 8,
    fontWeight: '600',
  },
  listItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  bottomSheetContent: {
    flexDirection: 'row',
    padding: 20,
  },
  bottomSheetImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  bottomSheetInfo: {
    flex: 1,
  },
  bottomSheetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  bottomSheetCuisine: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 12,
    fontWeight: '600',
  },
  bottomSheetMeta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  bottomSheetActions: {
    flexDirection: 'row',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  directionsButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  callButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  // Fog of War Styles
  fogStatsHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  fogStatsGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  fogStatsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fogStatsLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  fogStatsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  fogToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fogToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  districtArea: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  districtCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fogOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    overflow: 'hidden',
  },
  fogGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  districtInfo: {
    alignItems: 'center',
  },
  districtName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  districtProgress: {
    fontSize: 8,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
  },
  mapPinVisible: {
    opacity: 1,
  },
  districtCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  districtCardGradient: {
    padding: 20,
  },
  districtCardClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  districtCardCloseText: {
    fontSize: 18,
    color: '#FFF',
  },
  districtCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  districtCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  districtCardTitle: {
    flex: 1,
  },
  districtCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  districtCardStatus: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  districtCardProgress: {
    marginBottom: 16,
  },
  districtCardProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  districtCardProgressLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  districtCardProgressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  districtCardProgressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  districtCardProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  districtCardHint: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  districtCardExploreButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  districtCardExploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  districtCardExploreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  districtCardLocked: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  districtCardRequirements: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  districtCardRequirementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  districtCardRequirement: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
});
