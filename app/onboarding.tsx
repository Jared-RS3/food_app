import OnboardingCarousel from '@/components/OnboardingCarousel';
import PreferencesSurvey, {
  UserPreferences,
} from '@/components/PreferencesSurvey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

export default function OnboardingScreen() {
  const [showSurvey, setShowSurvey] = useState(false);

  const handleCarouselComplete = () => {
    setShowSurvey(true);
  };

  const handleSurveyComplete = async (preferences: UserPreferences) => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      await AsyncStorage.setItem(
        'user_preferences',
        JSON.stringify(preferences)
      );

      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(tabs)');
    }
  };

  const handleSkipSurvey = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(tabs)');
    }
  };

  if (showSurvey) {
    return (
      <View style={{ flex: 1 }}>
        <PreferencesSurvey
          onComplete={handleSurveyComplete}
          onSkip={handleSkipSurvey}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <OnboardingCarousel onComplete={handleCarouselComplete} />
    </View>
  );
}
