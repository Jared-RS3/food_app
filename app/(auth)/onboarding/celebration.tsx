import { FONT_SIZES, SPACING } from '@/constants';
import { ONBOARDING_CONTENT } from '@/constants/onboardingContent';
import { onboardingService } from '@/services/onboardingService';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function CelebrationScreen() {
  const params = useLocalSearchParams();
  const [saving, setSaving] = useState(true);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate confetti
    scale.value = withSequence(
      withTiming(1.2, { duration: 600 }),
      withTiming(1, { duration: 300 })
    );
    opacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    // Save preferences and navigate
    saveAndNavigate();
  }, []);

  const saveAndNavigate = async () => {
    try {
      const dietaryRestrictions = params.dietaryRestrictions
        ? JSON.parse(params.dietaryRestrictions as string)
        : [];
      const favoriteCategories = params.favoriteCategories
        ? JSON.parse(params.favoriteCategories as string)
        : [];
      const location = params.location
        ? JSON.parse(params.location as string)
        : { latitude: 0, longitude: 0, city: '', country: '' };

      const result = await onboardingService.saveOnboardingPreferences({
        dietaryRestrictions,
        foodMood: (params.foodMood as string) || '',
        favoriteCategories,
        location,
      });

      if (!result.success) {
        console.error('Failed to save preferences:', result.error);
        // Still navigate - user can update preferences later
      }

      // Wait 2.5 seconds for celebration, then navigate to feature tour
      setTimeout(() => {
        router.replace('/(auth)/feature-tour');
      }, 2500);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Navigate to feature tour anyway after delay
      setTimeout(() => {
        router.replace('/(auth)/feature-tour');
      }, 2500);
    } finally {
      setSaving(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <LinearGradient
      colors={['#FFF5F0', '#FFFBF7', '#FFFFFF']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Confetti/Celebration */}
        <Animated.View
          entering={FadeIn.delay(100)}
          style={styles.confettiContainer}
        >
          <Text style={styles.confetti}>✨</Text>
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.confetti}>🎊</Text>
          <Text style={styles.confetti}>✨</Text>
        </Animated.View>

        {/* Main Message */}
        <Animated.View style={[styles.messageContainer, animatedStyle]}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>
            {ONBOARDING_CONTENT.celebration.title}
          </Text>
          <Text style={styles.subtitle}>
            {ONBOARDING_CONTENT.celebration.subtitle}
          </Text>
        </Animated.View>

        {/* Loading Dots */}
        <Animated.View
          entering={FadeIn.delay(600)}
          style={styles.loadingContainer}
        >
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
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
  confettiContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.massive,
  },
  confetti: {
    fontSize: 48,
  },
  messageContainer: {
    alignItems: 'center',
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
  loadingContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.massive,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
});
