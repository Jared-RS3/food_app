import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OnboardingCard from '@/components/onboarding/OnboardingCard';
import OnboardingButton from '@/components/onboarding/OnboardingButton';
import { ONBOARDING_CONTENT, FOOD_MOODS } from '@/constants/onboardingContent';
import { SPACING } from '@/constants';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function FoodMoodScreen() {
  const params = useLocalSearchParams();
  const [selectedMood, setSelectedMood] = useState<string>('');

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/onboarding/categories',
      params: {
        dietaryRestrictions: params.dietaryRestrictions,
        foodMood: selectedMood,
      },
    });
  };

  return (
    <OnboardingScreen
      title={ONBOARDING_CONTENT.foodMood.title}
      subtitle={ONBOARDING_CONTENT.foodMood.subtitle}
      step={2}
      totalSteps={5}
      showBack
      showSkip
      onSkip={() => router.replace('/(tabs)')}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FOOD_MOODS.map((mood, index) => (
          <OnboardingCard
            key={mood.id}
            label={mood.label}
            emoji={mood.emoji}
            selected={selectedMood === mood.id}
            onPress={() => setSelectedMood(mood.id)}
            index={index}
          />
        ))}
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.buttonContainer}>
        <OnboardingButton
          text="Continue"
          onPress={handleContinue}
          disabled={!selectedMood}
        />
      </Animated.View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
});
