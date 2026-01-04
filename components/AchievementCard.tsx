import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { Achievement } from '@/types/gamification';
import { CheckCircle2, Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
  index?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  explorer: '#4ECDC4',
  foodie: '#FF6B9D',
  social: '#FFA07A',
  collector: '#95E1D3',
  streak: '#FFB84D',
  cuisine: '#9B59B6',
  district: '#3498DB',
  special: '#E74C3C',
  budget: '#27AE60',
  health: '#16A085',
};

export default function AchievementCard({
  achievement,
  onPress,
  index = 0,
}: AchievementCardProps) {
  const categoryColor = CATEGORY_COLORS[achievement.category] || '#95A5A6';
  const progressPercentage =
    ((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100;

  return (
    <Animated.View entering={FadeInRight.delay(100 + index * 50)}>
      <TouchableOpacity
        style={[
          styles.container,
          !achievement.unlocked && styles.containerLocked,
        ]}
        onPress={onPress}
        disabled={!achievement.unlocked}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${categoryColor}20` },
          ]}
        >
          <Text style={styles.icon}>{achievement.icon}</Text>
          {achievement.unlocked && (
            <View style={[styles.badge, { backgroundColor: categoryColor }]}>
              <CheckCircle2 size={12} color={COLORS.white} />
            </View>
          )}
          {!achievement.unlocked && (
            <View style={styles.lockBadge}>
              <Lock size={12} color={COLORS.gray[400]} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                !achievement.unlocked && styles.titleLocked,
              ]}
            >
              {achievement.title}
            </Text>
            <View
              style={[
                styles.pointsBadge,
                { backgroundColor: `${categoryColor}15` },
              ]}
            >
              <Text style={[styles.pointsText, { color: categoryColor }]}>
                +{achievement.points}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.description,
              !achievement.unlocked && styles.descriptionLocked,
            ]}
          >
            {achievement.description}
          </Text>

          {!achievement.unlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: categoryColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
            </View>
          )}

          {achievement.unlocked && achievement.unlockedAt && (
            <Text style={styles.unlockedText}>
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    gap: SPACING.md,
  },
  containerLocked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: FONT_SIZES.xxxl,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  content: {
    flex: 1,
    gap: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  titleLocked: {
    color: COLORS.gray[600],
  },
  pointsBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  pointsText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  descriptionLocked: {
    color: COLORS.gray[500],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.gray[600],
    minWidth: 40,
    textAlign: 'right',
  },
  unlockedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
