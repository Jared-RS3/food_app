import OnboardingCarousel from '@/components/OnboardingCarousel';
import { onboardingService } from '@/services/onboardingService';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function FeatureTourScreen() {
  const handleComplete = async () => {
    try {
      // Mark feature tour as completed
      await onboardingService.completeFeatureTour();
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing feature tour:', error);
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <OnboardingCarousel onComplete={handleComplete} />
    </View>
  );
}
