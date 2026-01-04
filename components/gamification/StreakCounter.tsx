import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  compact?: boolean; // Compact mode for headers
}

/**
 * Animated Streak Counter Component
 * 
 * Shows current streak with fire emoji
 * Color changes based on milestone
 * Animates flame on increment
 * 
 * Milestones:
 * - 1-6 days: Orange 🔥
 * - 7-13 days: Blue 🔥 (1 week)
 * - 14-29 days: Purple 🔥 (2 weeks)
 * - 30+ days: Gold 🔥 (1 month+)
 * 
 * Usage:
 * <StreakCounter currentStreak={7} longestStreak={15} />
 * <StreakCounter currentStreak={3} longestStreak={10} compact />
 */
export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  compact = false,
}) => {
  // Animated values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);

  // Animate on streak change
  useEffect(() => {
    // Bounce effect
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    // Shake effect
    rotation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    // Glow pulse
    glow.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 300 })
    );
  }, [currentStreak]);

  // Determine color based on milestone
  const getStreakColor = (streak: number): {
    color: string;
    label: string;
    emoji: string;
  } => {
    if (streak >= 30) {
      return { color: '#FBBF24', label: 'Legendary', emoji: '🔥' }; // Gold
    } else if (streak >= 14) {
      return { color: '#A78BFA', label: 'Epic', emoji: '🔥' }; // Purple
    } else if (streak >= 7) {
      return { color: '#60A5FA', label: 'Great', emoji: '🔥' }; // Blue
    } else if (streak >= 1) {
      return { color: '#FB923C', label: 'Building', emoji: '🔥' }; // Orange
    } else {
      return { color: '#9CA3AF', label: 'Start', emoji: '💨' }; // Gray (broken)
    }
  };

  const streakInfo = getStreakColor(currentStreak);
  
  // Days until next milestone
  const getNextMilestone = (streak: number): number => {
    if (streak < 7) return 7 - streak;
    if (streak < 14) return 14 - streak;
    if (streak < 30) return 30 - streak;
    return 0; // Already at highest milestone
  };

  const daysUntilMilestone = getNextMilestone(currentStreak);

  // Animated styles
  const flameStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      scale.value,
      [1, 1.3],
      [1, 1.3],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: scaleValue },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.6,
  }));

  // Compact mode (for headers/cards)
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Animated.Text style={[styles.compactEmoji, flameStyle]}>
          {streakInfo.emoji}
        </Animated.Text>
        <Text style={[styles.compactText, { color: streakInfo.color }]}>
          {currentStreak}
        </Text>
      </View>
    );
  }

  // Full mode (for dashboard)
  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          { backgroundColor: streakInfo.color },
        ]}
      />

      {/* Main content */}
      <View style={styles.content}>
        {/* Fire emoji with animation */}
        <Animated.Text style={[styles.emoji, flameStyle]}>
          {streakInfo.emoji}
        </Animated.Text>

        {/* Streak number */}
        <View style={styles.textContainer}>
          <Text style={[styles.streakNumber, { color: streakInfo.color }]}>
            {currentStreak}
          </Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom info */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Status</Text>
          <Text style={[styles.footerValue, { color: streakInfo.color }]}>
            {streakInfo.label}
          </Text>
        </View>

        {daysUntilMilestone > 0 && (
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Next Milestone</Text>
            <Text style={styles.footerValue}>
              {daysUntilMilestone} {daysUntilMilestone === 1 ? 'day' : 'days'}
            </Text>
          </View>
        )}

        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Best</Text>
          <Text style={styles.footerValue}>{longestStreak}</Text>
        </View>
      </View>

      {/* Progress to next milestone */}
      {daysUntilMilestone > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((7 - daysUntilMilestone) / 7) * 100}%`,
                  backgroundColor: streakInfo.color,
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact mode
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  compactEmoji: {
    fontSize: 18,
  },
  compactText: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Full mode
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 56,
  },
  textContainer: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  streakLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
