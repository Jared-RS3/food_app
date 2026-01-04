import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  onPress?: () => void;
}

/**
 * Animated XP Progress Bar Component
 * 
 * Shows current level, XP progress to next level, and percentage
 * Animates smoothly when XP increases
 * Tap to show detailed breakdown
 * 
 * Usage:
 * <XPProgressBar
 *   currentXP={3450}
 *   level={12}
 *   onPress={() => navigation.navigate('Profile')}
 * />
 */
export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  level,
  onPress,
}) => {
  // Calculate XP for current and next level
  const calculateXPForLevel = (lvl: number): number => lvl * lvl * 100;

  const currentLevelXP = calculateXPForLevel(level);
  const nextLevelXP = calculateXPForLevel(level + 1);
  const xpIntoCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min((xpIntoCurrentLevel / xpNeededForNextLevel) * 100, 100);

  // Animated values
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  // Update progress when XP changes
  useEffect(() => {
    progress.value = withSpring(progressPercentage / 100, {
      damping: 15,
      stiffness: 100,
    });

    // Pulse effect on XP gain
    scale.value = withSequence(
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );

    // Glow effect
    glow.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );
  }, [currentXP]);

  // Animated styles
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.3,
  }));

  // Determine tier color based on level
  const getTierColor = (lvl: number): string => {
    if (lvl >= 50) return '#FBBF24'; // Diamond/Gold
    if (lvl >= 30) return '#A78BFA'; // Platinum/Purple
    if (lvl >= 15) return '#60A5FA'; // Gold/Blue
    if (lvl >= 5) return '#34D399'; // Silver/Green
    return '#9CA3AF'; // Bronze/Gray
  };

  const tierColor = getTierColor(level);

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            { backgroundColor: tierColor },
          ]}
        />

        {/* Header: Level and XP */}
        <View style={styles.header}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LVL {level}</Text>
          </View>
          <Text style={styles.xpText}>
            {xpIntoCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP
          </Text>
        </View>

        {/* Progress Bar Background */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            {/* Animated Fill */}
            <Animated.View
              style={[
                styles.progressBarFill,
                progressBarStyle,
                { backgroundColor: tierColor },
              ]}
            />

            {/* Shimmer Effect (optional) */}
            <View style={styles.shimmer} />
          </View>

          {/* Percentage Label */}
          <Text style={styles.percentageText}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>

        {/* Optional: XP to next level */}
        <Text style={styles.remainingText}>
          {(xpNeededForNextLevel - xpIntoCurrentLevel).toLocaleString()} XP to level {level + 1}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 6,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    minWidth: 40,
  },
  remainingText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
