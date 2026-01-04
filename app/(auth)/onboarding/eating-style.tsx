import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OnboardingCard from '@/components/onboarding/OnboardingCard';
import OnboardingButton from '@/components/onboarding/OnboardingButton';
import {
  ONBOARDING_CONTENT,
  DIETARY_OPTIONS,
} from '@/constants/onboardingContent';
import { SPACING } from '@/constants';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function EatingStyleScreen() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (id: string) => {
    if (selectedOptions.includes(id)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== id));
    } else {
      setSelectedOptions([...selectedOptions, id]);
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/onboarding/food-mood',
      params: { dietaryRestrictions: JSON.stringify(selectedOptions) },
    });
  };

  return (
    <OnboardingScreen
      title={ONBOARDING_CONTENT.eatingStyle.title}
      subtitle={ONBOARDING_CONTENT.eatingStyle.subtitle}
      step={1}
      totalSteps={5}
      showBack
      showSkip
      onSkip={() => router.replace('/(tabs)')}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DIETARY_OPTIONS.map((option, index) => (
          <OnboardingCard
            key={option.id}
            label={option.label}
            emoji={option.emoji}
            selected={selectedOptions.includes(option.id)}
            onPress={() => toggleOption(option.id)}
            index={index}
          />
        ))}
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.buttonContainer}>
        <OnboardingButton
          text="Continue"
          onPress={handleContinue}
          disabled={selectedOptions.length === 0}
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
