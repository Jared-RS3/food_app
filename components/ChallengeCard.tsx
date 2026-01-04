import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { Challenge } from '@/types/gamification';
import { Clock, Trophy } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress?: () => void;
  index?: number;
}

export default function ChallengeCard({
  challenge,
  onPress,
  index = 0,
}: ChallengeCardProps) {
  const progressPercentage = (challenge.progress / challenge.maxProgress) * 100;
  const timeLeft = new Date(challenge.expiresAt).getTime() - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  return (
    <Animated.View entering={FadeInRight.delay(100 + index * 50)}>
      <TouchableOpacity
        style={[
          styles.container,
          challenge.completed && styles.containerCompleted,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={challenge.completed}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{challenge.icon}</Text>
          </View>

          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                challenge.completed && styles.titleCompleted,
              ]}
            >
              {challenge.title}
            </Text>
            <Text
              style={[
                styles.description,
                challenge.completed && styles.descriptionCompleted,
              ]}
            >
              {challenge.description}
            </Text>
          </View>

          {challenge.completed ? (
            <View style={styles.completedBadge}>
              <Trophy size={20} color={COLORS.white} fill={COLORS.white} />
            </View>
          ) : (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+{challenge.points}</Text>
            </View>
          )}
        </View>

        {!challenge.completed && (
          <>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {challenge.progress}/{challenge.maxProgress}
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.timeContainer}>
                <Clock size={14} color={COLORS.gray[500]} />
                <Text style={styles.timeText}>
                  {hoursLeft > 24
                    ? `${Math.floor(hoursLeft / 24)}d left`
                    : `${hoursLeft}h left`}
                </Text>
              </View>
              <View
                style={[
                  styles.typeBadge,
                  challenge.type === 'daily' && styles.dailyBadge,
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    challenge.type === 'daily' && styles.dailyText,
                  ]}
                >
                  {challenge.type.toUpperCase()}
                </Text>
              </View>
            </View>
          </>
        )}

        {challenge.completed && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>
              ✓ Completed! +{challenge.points} points earned
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
    gap: SPACING.md,
  },
  containerCompleted: {
    borderColor: COLORS.success + '40',
    backgroundColor: COLORS.success + '05',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: FONT_SIZES.xxl,
  },
  titleContainer: {
    flex: 1,
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  titleCompleted: {
    color: COLORS.gray[600],
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  descriptionCompleted: {
    color: COLORS.gray[500],
  },
  pointsBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  pointsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  completedBadge: {
    backgroundColor: COLORS.success,
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.gray[600],
    minWidth: 45,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray[100],
  },
  dailyBadge: {
    backgroundColor: COLORS.warning + '20',
  },
  typeText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '800',
    color: COLORS.gray[600],
    letterSpacing: 0.5,
  },
  dailyText: {
    color: COLORS.warning,
  },
  completedBanner: {
    backgroundColor: COLORS.success + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  completedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.success,
    letterSpacing: -0.2,
  },
});
