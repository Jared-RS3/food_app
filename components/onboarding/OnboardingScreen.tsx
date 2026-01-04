import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface OnboardingScreenProps {
  children: ReactNode;
  step?: number;
  totalSteps?: number;
  showBack?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  title?: string;
  subtitle?: string;
}

export default function OnboardingScreen({
  children,
  step,
  totalSteps,
  showBack = false,
  showSkip = false,
  onSkip,
  title,
  subtitle,
}: OnboardingScreenProps) {
  return (
    <LinearGradient
      colors={['#FFF5F0', '#FFFBF7', '#FFFFFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}

          {step && totalSteps && (
            <Animated.View entering={FadeInDown.delay(100)}>
              <Text style={styles.stepIndicator}>
                {step}/{totalSteps}
              </Text>
            </Animated.View>
          )}

          {showSkip ? (
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipButton} />
          )}
        </View>

        {/* Progress Bar */}
        {step && totalSteps && (
          <Animated.View
            entering={FadeInDown.delay(150)}
            style={styles.progressBarContainer}
          >
            <View style={styles.progressBarTrack}>
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={[
                  styles.progressBarFill,
                  { width: `${(step / totalSteps) * 100}%` },
                ]}
              />
            </View>
          </Animated.View>
        )}

        {/* Title */}
        {title && (
          <Animated.View
            entering={FadeInUp.delay(250).springify()}
            style={styles.titleContainer}
          >
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </Animated.View>
        )}

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  skipButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  progressBarContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: BORDER_RADIUS.full,
  },
  titleContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
});
