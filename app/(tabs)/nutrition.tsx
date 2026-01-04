import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  Calendar,
  Minus,
  Plus,
  Settings,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalorieTracker } from '../../components/CalorieTracker';
import { MealLogCard } from '../../components/MealLogCard';
import {
  deleteMealLog,
  getDailyNutrition,
  getNutritionInsights,
  getWeeklySummary,
  updateWaterIntake,
} from '../../services/nutritionService';
import {
  DailyNutrition,
  NutritionInsight,
  WeeklyNutritionSummary,
} from '../../types/nutrition';

export default function NutritionScreen() {
  const [dailyData, setDailyData] = useState<DailyNutrition | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyNutritionSummary | null>(
    null
  );
  const [insights, setInsights] = useState<NutritionInsight[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'today' | 'week' | 'insights'>(
    'today'
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const daily = await getDailyNutrition();
      const weekly = await getWeeklySummary();
      const nutritionInsights = await getNutritionInsights(daily);

      setDailyData(daily);
      setWeeklyData(weekly);
      setInsights(nutritionInsights);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddWater = () => {
    if (!dailyData) return;
    const newAmount = dailyData.waterIntake + 250; // Add 250ml
    updateWaterIntake(newAmount);
    setDailyData({ ...dailyData, waterIntake: newAmount });
  };

  const handleDeleteMeal = (logId: string) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMealLog(logId);
            loadData();
          },
        },
      ]
    );
  };

  const getTrendIcon = () => {
    if (!weeklyData)
      return <Minus size={20} color="#6B7280" strokeWidth={2.5} />;
    if (weeklyData.caloriesTrend === 'increasing')
      return <TrendingUp size={20} color="#EF4444" strokeWidth={2.5} />;
    if (weeklyData.caloriesTrend === 'decreasing')
      return <TrendingDown size={20} color="#10B981" strokeWidth={2.5} />;
    return <Minus size={20} color="#6B7280" strokeWidth={2.5} />;
  };

  const getTrendColor = () => {
    if (!weeklyData) return '#6B7280';
    if (weeklyData.caloriesTrend === 'increasing') return '#EF4444';
    if (weeklyData.caloriesTrend === 'decreasing') return '#10B981';
    return '#6B7280';
  };

  const renderTodayTab = () => {
    if (!dailyData) return null;

    return (
      <View style={styles.tabContent}>
        <CalorieTracker dailyData={dailyData} onAddWater={handleAddWater} />

        {/* Meal Logs */}
        {dailyData.meals.length > 0 && (
          <View style={styles.mealsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Meals</Text>
              <Text style={styles.sectionSubtitle}>
                {dailyData.meals.length} logged
              </Text>
            </View>
            {dailyData.meals.map((meal) => (
              <MealLogCard
                key={meal.id}
                mealLog={meal}
                onDelete={handleDeleteMeal}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {dailyData.meals.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Plus size={32} color="#9CA3AF" strokeWidth={2.5} />
            </View>
            <Text style={styles.emptyTitle}>No meals logged yet</Text>
            <Text style={styles.emptyDescription}>
              Start tracking your nutrition by adding meals from restaurant
              menus
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderWeekTab = () => {
    if (!weeklyData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <View style={styles.weeklyHeaderLeft}>
              <Calendar size={24} color="#FF6B9D" strokeWidth={2.5} />
              <View>
                <Text style={styles.weeklyTitle}>Weekly Summary</Text>
                <Text style={styles.weeklySubtitle}>
                  {new Date(weeklyData.weekStart).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(weeklyData.weekEnd).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color="#6B7280" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.weeklyStatsGrid}>
            <View style={styles.weeklyStatCard}>
              <Text style={styles.weeklyStatLabel}>Avg Calories</Text>
              <Text style={styles.weeklyStatValue}>
                {weeklyData.averageCalories}
              </Text>
              <View style={styles.weeklyStatTrend}>
                {getTrendIcon()}
                <Text
                  style={[
                    styles.weeklyStatTrendText,
                    { color: getTrendColor() },
                  ]}
                >
                  {weeklyData.caloriesTrend}
                </Text>
              </View>
            </View>

            <View style={styles.weeklyStatCard}>
              <Text style={styles.weeklyStatLabel}>Days On Track</Text>
              <Text style={styles.weeklyStatValue}>
                {weeklyData.daysOnTrack}/7
              </Text>
              <View style={styles.weeklyStatProgress}>
                <View
                  style={[
                    styles.weeklyStatProgressFill,
                    { width: `${(weeklyData.daysOnTrack / 7) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.weeklyStatCard}>
              <Text style={styles.weeklyStatLabel}>Meals Logged</Text>
              <Text style={styles.weeklyStatValue}>
                {weeklyData.totalMealsLogged}
              </Text>
              <Text style={styles.weeklyStatExtra}>
                ~{Math.round(weeklyData.totalMealsLogged / 7)} per day
              </Text>
            </View>
          </View>

          {/* Macros Breakdown */}
          <View style={styles.weeklyMacros}>
            <Text style={styles.weeklyMacrosTitle}>Average Macros</Text>
            <View style={styles.weeklyMacrosList}>
              <View style={styles.weeklyMacroItem}>
                <View
                  style={[
                    styles.weeklyMacroDot,
                    { backgroundColor: '#EF4444' },
                  ]}
                />
                <Text style={styles.weeklyMacroLabel}>Protein</Text>
                <Text style={styles.weeklyMacroValue}>
                  {weeklyData.averageProtein}g
                </Text>
              </View>
              <View style={styles.weeklyMacroItem}>
                <View
                  style={[
                    styles.weeklyMacroDot,
                    { backgroundColor: '#F59E0B' },
                  ]}
                />
                <Text style={styles.weeklyMacroLabel}>Carbs</Text>
                <Text style={styles.weeklyMacroValue}>
                  {weeklyData.averageCarbs}g
                </Text>
              </View>
              <View style={styles.weeklyMacroItem}>
                <View
                  style={[
                    styles.weeklyMacroDot,
                    { backgroundColor: '#8B5CF6' },
                  ]}
                />
                <Text style={styles.weeklyMacroLabel}>Fat</Text>
                <Text style={styles.weeklyMacroValue}>
                  {weeklyData.averageFat}g
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderInsightsTab = () => {
    return (
      <View style={styles.tabContent}>
        {insights.length > 0 ? (
          insights.map((insight) => (
            <View
              key={insight.id}
              style={[
                styles.insightCard,
                insight.type === 'success' && styles.insightSuccess,
                insight.type === 'warning' && styles.insightWarning,
                insight.type === 'info' && styles.insightInfo,
                insight.type === 'tip' && styles.insightTip,
              ]}
            >
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>
                    {insight.description}
                  </Text>
                </View>
              </View>
              {insight.action && (
                <TouchableOpacity
                  style={styles.insightAction}
                  onPress={insight.action.onPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.insightActionText}>
                    {insight.action.label}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Sparkles size={32} color="#9CA3AF" strokeWidth={2.5} />
            </View>
            <Text style={styles.emptyTitle}>No insights yet</Text>
            <Text style={styles.emptyDescription}>
              Keep logging meals to get personalized nutrition insights
            </Text>
          </View>
        )}

        {/* Achievement Teaser */}
        <View style={styles.achievementTeaser}>
          <LinearGradient
            colors={['#FF6B9D20', '#FF6B9D05']}
            style={styles.achievementGradient}
          >
            <Award size={32} color="#FF6B9D" strokeWidth={2.5} />
            <Text style={styles.achievementTitle}>Nutrition Achievements</Text>
            <Text style={styles.achievementDescription}>
              Track 7 days in a row to unlock the "Consistency Champion" badge
            </Text>
            <TouchableOpacity
              style={styles.achievementButton}
              activeOpacity={0.8}
            >
              <Text style={styles.achievementButtonText}>
                View Achievements
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <Text style={styles.headerSubtitle}>Track your daily intake</Text>
        </View>
        <TouchableOpacity style={styles.goalButton} activeOpacity={0.8}>
          <Target size={20} color="#FF6B9D" strokeWidth={2.5} />
          <Text style={styles.goalButtonText}>Goals</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'today' && styles.tabActive]}
          onPress={() => setSelectedTab('today')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'today' && styles.tabTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'week' && styles.tabActive]}
          onPress={() => setSelectedTab('week')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'week' && styles.tabTextActive,
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'insights' && styles.tabActive]}
          onPress={() => setSelectedTab('insights')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'insights' && styles.tabTextActive,
            ]}
          >
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF6B9D"
          />
        }
      >
        {selectedTab === 'today' && renderTodayTab()}
        {selectedTab === 'week' && renderWeekTab()}
        {selectedTab === 'insights' && renderInsightsTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF6B9D',
  },
  goalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B9D',
    letterSpacing: -0.3,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
  },
  tabActive: {
    backgroundColor: '#FF6B9D',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: -0.3,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  tabContent: {
    gap: 20,
  },
  mealsSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: -0.4,
  },
  emptyDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  weeklyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    gap: 20,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  weeklySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  weeklyStatsGrid: {
    gap: 12,
  },
  weeklyStatCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    gap: 8,
  },
  weeklyStatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  weeklyStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -1,
  },
  weeklyStatTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weeklyStatTrendText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  weeklyStatProgress: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  weeklyStatProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  weeklyStatExtra: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },
  weeklyMacros: {
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    gap: 12,
  },
  weeklyMacrosTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  weeklyMacrosList: {
    gap: 12,
  },
  weeklyMacroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weeklyMacroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  weeklyMacroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
    flex: 1,
  },
  weeklyMacroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    gap: 16,
  },
  insightSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  insightWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  insightInfo: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  insightTip: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  insightHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  insightIcon: {
    fontSize: 32,
  },
  insightContent: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  insightDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  insightAction: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  insightActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B9D',
    letterSpacing: -0.3,
  },
  achievementTeaser: {
    marginTop: 20,
  },
  achievementGradient: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#FF6B9D20',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  achievementDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
    textAlign: 'center',
    lineHeight: 20,
  },
  achievementButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 8,
  },
  achievementButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
