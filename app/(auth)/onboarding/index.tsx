import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONT_SIZES } from '@/constants';
import { onboardingService } from '@/services/onboardingService';
import Animated, { FadeIn } from 'react-native-reanimated';
import OnboardingButton from '@/components/onboarding/OnboardingButton';
import FloatingEmojis from '@/components/onboarding/FloatingEmojis';

export default function WelcomeScreen() {
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await onboardingService.hasCompletedOnboarding();
    if (completed) {
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient colors={['#FFF5F0', '#FFFBF7', '#FFFFFF']} style={styles.container}>
      <FloatingEmojis />
      
      <View style={styles.content}>
        <Animated.View entering={FadeIn} style={styles.header}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>Welcome to Your Food Journey!</Text>
          <Text style={styles.subtitle}>
            Let's personalize your experience in just a few steps
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200)} style={styles.buttonContainer}>
          <OnboardingButton
            text="Get Started"
            onPress={() => router.push('/(auth)/onboarding/eating-style')}
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.massive * 2,
  },
  emoji: {
    fontSize: 100,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md + 1,
    fontWeight: '500',
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 26,
  },
  buttonContainer: {
    width: '100%',
  },
});
