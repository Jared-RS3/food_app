import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { UserProfile } from '@/types/gamification';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Star, TrendingUp, Zap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface UserProfileHeaderProps {
  profile: UserProfile;
  compact?: boolean;
}

const TIER_COLORS = {
  Bronze: ['#CD7F32', '#B87333'],
  Silver: ['#C0C0C0', '#A8A8A8'],
  Gold: ['#FFD700', '#FFA500'],
  Platinum: ['#E5E4E2', '#BCC6CC'],
  Diamond: ['#B9F2FF', '#7FDBFF'],
};

export default function UserProfileHeader({
  profile,
  compact = false,
}: UserProfileHeaderProps) {
  const tierColors = TIER_COLORS[profile.tier] as [string, string];
  const progressToNextLevel = (profile.points % 100) / 100;

  if (compact) {
    return (
      <Animated.View
        entering={FadeInDown.delay(100)}
        style={styles.compactContainer}
      >
        <LinearGradient
          colors={tierColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <View style={styles.compactContent}>
            <View style={styles.compactAvatar}>
              <Text style={styles.compactAvatarText}>
                {profile.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.compactInfo}>
              <Text style={styles.compactUsername} numberOfLines={1}>
                {profile.username}
              </Text>
              <View style={styles.compactMeta}>
                <View style={styles.compactMetaItem}>
                  <Star size={12} color={COLORS.white} fill={COLORS.white} />
                  <Text style={styles.compactMetaText}>
                    Lvl {profile.level}
                  </Text>
                </View>
                <View style={styles.compactMetaItem}>
                  <Zap size={12} color={COLORS.white} fill={COLORS.white} />
                  <Text style={styles.compactMetaText}>{profile.points}</Text>
                </View>
              </View>
            </View>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{profile.tier}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.container}>
      <LinearGradient
        colors={tierColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.tierBadgeLarge}>
                <Award size={16} color={COLORS.white} />
                <Text style={styles.tierBadgeLargeText}>{profile.tier}</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>Level {profile.level}</Text>
                <Text style={styles.statLabel}>Current Level</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.points}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <View style={styles.streakIcon}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={styles.statValue}>{profile.streak}</Text>
                </View>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>

          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{profile.username}</Text>
            <TrendingUp size={18} color={COLORS.white} />
          </View>

          {/* Progress to next level */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Level {profile.level + 1}
              </Text>
              <Text style={styles.progressText}>
                {profile.points % 100}/100 XP
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressToNextLevel * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    padding: SPACING.xl,
  },
  content: {
    gap: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  tierBadgeLarge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tierBadgeLargeText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  streakEmoji: {
    fontSize: FONT_SIZES.lg,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  username: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  progressContainer: {
    gap: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
  },
  // Compact styles
  compactContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  compactGradient: {
    padding: SPACING.md,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  compactAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  compactAvatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
  },
  compactInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  compactUsername: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  compactMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  compactMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  compactMetaText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  tierBadge: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tierBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
});
