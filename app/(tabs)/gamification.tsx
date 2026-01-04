import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Mock user data - replace with real Supabase data
const mockUserProfile = {
  id: '1',
  username: 'FoodExplorer',
  level: 12,
  total_xp: 3450,
  xp_for_next_level: 2500,
  current_streak: 7,
  longest_streak: 15,
  total_checkins: 45,
  total_restaurants_visited: 32,
  total_districts_unlocked: 5,
  fog_cleared_percentage: 35,
  total_achievements: 8,
  achievements_unlocked: 8,
  tier: 'Gold',
  avatar_url: null,
};

const mockRecentAchievements = [
  { id: '1', title: 'Week Warrior', icon: '🔥', color: '#F59E0B', progress: 100 },
  { id: '2', title: 'Italian Explorer', icon: '🍝', color: '#EF4444', progress: 100 },
  { id: '3', title: 'Food Connoisseur', icon: '🍽️', color: '#8B5CF6', progress: 80 },
  { id: '4', title: 'District Pioneer', icon: '🗺️', color: '#10B981', progress: 60 },
];

const mockLeaderboardPosition = 23;

export default function GamificationScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
  const glowScale = useSharedValue(1);

  useEffect(() => {
    // Pulsing glow effect for level badge
    glowScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 2 }),
        withSpring(1, { damping: 2 })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#D946EF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>Keep exploring! 🚀</Text>
              <Text style={styles.headerName}>{mockUserProfile.username}</Text>
            </View>
            
            {/* Leaderboard Quick View */}
            <TouchableOpacity style={styles.leaderboardBadge}>
              <Ionicons name="trophy" size={16} color="#FBBF24" />
              <Text style={styles.leaderboardRank}>#{mockLeaderboardPosition}</Text>
            </TouchableOpacity>
          </View>

          {/* Level Badge with Glow */}
          <Animated.View style={[styles.levelBadgeContainer, glowStyle]}>
            <LinearGradient
              colors={['#FBBF24', '#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.levelBadge}
            >
              <Text style={styles.levelBadgeTitle}>LEVEL</Text>
              <Text style={styles.levelBadgeNumber}>{mockUserProfile.level}</Text>
              <Text style={styles.levelBadgeTier}>{mockUserProfile.tier} Tier</Text>
            </LinearGradient>
            <View style={styles.levelBadgeGlow} />
          </Animated.View>

          {/* XP Progress */}
          <View style={styles.xpContainer}>
            <XPProgressBar
              currentXP={mockUserProfile.total_xp}
              level={mockUserProfile.level}
              onPress={() => {}}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Streak Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={['#1E293B', '#334155']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <View style={styles.streakCardContent}>
              <StreakCounter
                currentStreak={mockUserProfile.current_streak}
                longestStreak={mockUserProfile.longest_streak}
              />
            </View>
            <TouchableOpacity style={styles.streakInfoButton}>
              <Ionicons name="information-circle-outline" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="restaurant"
              label="Check-ins"
              value={mockUserProfile.total_checkins.toString()}
              color="#8B5CF6"
              delay={250}
            />
            <StatCard
              icon="location"
              label="Restaurants"
              value={mockUserProfile.total_restaurants_visited.toString()}
              color="#EC4899"
              delay={300}
            />
            <StatCard
              icon="map"
              label="Districts"
              value={mockUserProfile.total_districts_unlocked.toString()}
              color="#10B981"
              delay={350}
            />
            <StatCard
              icon="trophy"
              label="Achievements"
              value={`${mockUserProfile.achievements_unlocked}/${mockUserProfile.total_achievements}`}
              color="#F59E0B"
              delay={400}
            />
          </View>
        </Animated.View>

        {/* Map Exploration Progress */}
        <Animated.View entering={FadeInDown.delay(450).springify()}>
          <View style={styles.mapProgressContainer}>
            <View style={styles.mapProgressHeader}>
              <Text style={styles.sectionTitle}>Map Exploration</Text>
              <Text style={styles.mapProgressPercentage}>
                {mockUserProfile.fog_cleared_percentage}%
              </Text>
            </View>
            
            <View style={styles.mapProgressBarContainer}>
              <View style={styles.mapProgressBarBg}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.mapProgressBarFill,
                    { width: `${mockUserProfile.fog_cleared_percentage}%` },
                  ]}
                >
                  <View style={styles.mapProgressBarShine} />
                </LinearGradient>
              </View>
            </View>

            <Text style={styles.mapProgressHint}>
              🗺️ Visit more restaurants to clear the fog of war!
            </Text>
          </View>
        </Animated.View>

        {/* Recent Achievements */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllButton}>View All →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {mockRecentAchievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                delay={550 + index * 50}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(750).springify()}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="trophy-outline"
              label="Leaderboard"
              gradient={['#F59E0B', '#D97706']}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="ribbon-outline"
              label="Achievements"
              gradient={['#8B5CF6', '#7C3AED']}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="map-outline"
              label="Explore Map"
              gradient={['#10B981', '#059669']}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="sparkles-outline"
              label="Challenges"
              gradient={['#EC4899', '#DB2777']}
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// Premium Stat Card Component
const StatCard = ({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  delay: number;
}) => (
  <Animated.View entering={FadeInUp.delay(delay).springify()}>
    <LinearGradient
      colors={['#1E293B', '#334155']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statCard}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  </Animated.View>
);

// Achievement Card Component
const AchievementCard = ({
  achievement,
  delay,
}: {
  achievement: any;
  delay: number;
}) => (
  <Animated.View entering={FadeInRight.delay(delay).springify()}>
    <LinearGradient
      colors={['#1E293B', '#334155']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.achievementCard}
    >
      <View
        style={[
          styles.achievementIconContainer,
          { backgroundColor: achievement.color + '20' },
        ]}
      >
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      </View>
      <Text style={styles.achievementTitle} numberOfLines={1}>
        {achievement.title}
      </Text>
      
      {/* Progress Bar */}
      <View style={styles.achievementProgressBg}>
        <View
          style={[
            styles.achievementProgressFill,
            {
              width: `${achievement.progress}%`,
              backgroundColor: achievement.color,
            },
          ]}
        />
      </View>
      <Text style={styles.achievementProgress}>{achievement.progress}%</Text>
    </LinearGradient>
  </Animated.View>
);

// Quick Action Card Component
const QuickActionCard = ({
  icon,
  label,
  gradient,
  onPress,
}: {
  icon: string;
  label: string;
  gradient: readonly [string, string];
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.quickActionGradient}
    >
      <Ionicons name={icon as any} size={28} color="#FFF" />
      <Text style={styles.quickActionLabel}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  leaderboardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  leaderboardRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  levelBadgeContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelBadgeGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FBBF24',
    opacity: 0.3,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  levelBadgeTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  levelBadgeNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: -5,
  },
  levelBadgeTier: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  xpContainer: {
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  streakCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakCardContent: {
    flex: 1,
  },
  streakInfoButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  mapProgressContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  mapProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapProgressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  mapProgressBarContainer: {
    marginBottom: 12,
  },
  mapProgressBarBg: {
    height: 12,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    overflow: 'hidden',
  },
  mapProgressBarFill: {
    height: '100%',
    borderRadius: 6,
    position: 'relative',
  },
  mapProgressBarShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mapProgressHint: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  achievementsScroll: {
    gap: 12,
    paddingBottom: 4,
    marginBottom: 24,
  },
  achievementCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementProgressBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementProgress: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
