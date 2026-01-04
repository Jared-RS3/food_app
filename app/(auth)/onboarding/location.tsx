import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OnboardingButton from '@/components/onboarding/OnboardingButton';
import { ONBOARDING_CONTENT } from '@/constants/onboardingContent';
import { SPACING, FONT_SIZES, BORDER_RADIUS, COLORS } from '@/constants';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MapPin } from 'lucide-react-native';

export default function LocationScreen() {
  const params = useLocalSearchParams();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'We need your location to find restaurants near you'
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          city: place.city || 'Unknown',
          country: place.country || 'Unknown',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/onboarding/celebration',
      params: {
        dietaryRestrictions: params.dietaryRestrictions,
        foodMood: params.foodMood,
        favoriteCategories: params.favoriteCategories,
        location: JSON.stringify(location),
      },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/(auth)/onboarding/celebration',
      params: {
        dietaryRestrictions: params.dietaryRestrictions,
        foodMood: params.foodMood,
        favoriteCategories: params.favoriteCategories,
        location: JSON.stringify({
          latitude: 0,
          longitude: 0,
          city: 'Not set',
          country: '',
        }),
      },
    });
  };

  return (
    <OnboardingScreen
      title={ONBOARDING_CONTENT.location.title}
      subtitle={ONBOARDING_CONTENT.location.subtitle}
      step={4}
      totalSteps={5}
      showBack
      showSkip
      onSkip={handleSkip}
    >
      <View style={styles.content}>
        {!location ? (
          <Animated.View entering={FadeIn} style={styles.locationPrompt}>
            <View style={styles.iconContainer}>
              <MapPin size={80} color={COLORS.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.promptText}>
              Enable location to discover restaurants near you
            </Text>
            <TouchableOpacity
              style={[
                styles.locationButton,
                loading && styles.locationButtonDisabled,
              ]}
              onPress={requestLocation}
              disabled={loading}
            >
              <MapPin size={20} color={COLORS.white} strokeWidth={2} />
              <Text style={styles.locationButtonText}>
                {loading ? 'Getting Location...' : 'Enable Location'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.locationInfo}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>📍</Text>
            </View>
            <Text style={styles.locationText}>
              {location.city}, {location.country}
            </Text>
            <Text style={styles.coordsText}>
              Lat: {location.latitude.toFixed(4)}, Lng:{' '}
              {location.longitude.toFixed(4)}
            </Text>
          </Animated.View>
        )}
      </View>

      {location && (
        <Animated.View
          entering={FadeIn.delay(200)}
          style={styles.buttonContainer}
        >
          <OnboardingButton text="Continue" onPress={handleContinue} />
        </Animated.View>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPrompt: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  promptText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.gray[700],
    marginBottom: SPACING.xl,
    lineHeight: 28,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.xl,
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  locationButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  locationInfo: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successEmoji: {
    fontSize: 80,
  },
  locationText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  coordsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
});
