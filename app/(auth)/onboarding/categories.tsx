import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import OnboardingCard from '@/components/onboarding/OnboardingCard';
import OnboardingButton from '@/components/onboarding/OnboardingButton';
import { ONBOARDING_CONTENT, FOOD_CATEGORIES } from '@/constants/onboardingContent';
import { SPACING } from '@/constants';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CategoriesScreen() {
  const params = useLocalSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== id));
    } else {
      if (selectedCategories.length >= 5) {
        Alert.alert('Maximum Reached', 'Please select up to 5 categories');
        return;
      }
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/onboarding/location',
      params: {
        dietaryRestrictions: params.dietaryRestrictions,
        foodMood: params.foodMood,
        favoriteCategories: JSON.stringify(selectedCategories),
      },
    });
  };

  return (
    <OnboardingScreen
      title={ONBOARDING_CONTENT.categories.title}
      subtitle={ONBOARDING_CONTENT.categories.subtitle}
      step={3}
      totalSteps={5}
      showBack
      showSkip
      onSkip={() => router.replace('/(tabs)')}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FOOD_CATEGORIES.map((category, index) => (
          <OnboardingCard
            key={category.id}
            label={category.label}
            emoji={category.emoji}
            selected={selectedCategories.includes(category.id)}
            onPress={() => toggleCategory(category.id)}
            index={index}
          />
        ))}
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.buttonContainer}>
        <OnboardingButton
          text={`Continue (${selectedCategories.length}/5)`}
          onPress={handleContinue}
          disabled={selectedCategories.length === 0}
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
