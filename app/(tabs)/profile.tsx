import AchievementCard from '@/components/AchievementCard';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import ChallengeCard from '@/components/ChallengeCard';
import { UserPreferences } from '@/components/PreferencesSurvey';
import { SetBudgetLimitModal } from '@/components/SetBudgetLimitModal';
import UserProfileHeader from '@/components/UserProfileHeader';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { supabase } from '@/lib/supabase';
import type { BudgetSummary, Expense } from '@/services/budgetService';
import { budgetService } from '@/services/budgetService';
import { gamificationService } from '@/services/gamificationService';
import { Achievement, Challenge, UserProfile } from '@/types/gamification';
import { router, useFocusEffect } from 'expo-router';
import {
  Apple,
  Bell,
  ChevronRight,
  CreditCard,
  DollarSign,
  Edit,
  Gift,
  HelpCircle,
  Leaf,
  LogOut,
  MapPin,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  UtensilsCrossed,
  Wallet,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type TabType =
  | 'overview'
  | 'achievements'
  | 'challenges'
  | 'budget'
  | 'nutrition';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(
    null
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSetBudgetLimits, setShowSetBudgetLimits] = useState(false);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);
  const [showEditPreferences, setShowEditPreferences] = useState(false);
  const [editingPreferences, setEditingPreferences] =
    useState<UserPreferences | null>(null);

  useEffect(() => {
    loadProfileData();
    loadBudgets();
    loadUserPreferences();
  }, []);

  // Refresh profile data when screen comes into focus (after adding restaurant/food)
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, achievementsData, dailyChallenges, weeklyChallenges] =
        await Promise.all([
          gamificationService.getUserProfile(),
          gamificationService.getAchievements(),
          gamificationService.getDailyChallenges(),
          gamificationService.getWeeklyChallenges(),
        ]);

      setProfile(profileData);
      setAchievements(achievementsData);
      setChallenges([...dailyChallenges, ...weeklyChallenges]);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async () => {
    try {
      setBudgetsLoading(true);
      // TODO: Replace 'user-id' with actual user ID from auth context
      const [summary, expensesList] = await Promise.all([
        budgetService.getBudgetSummary('user-id'),
        budgetService.getExpensesForMonth('user-id'),
      ]);
      setBudgetSummary(summary);
      setExpenses(expensesList);
    } catch (error) {
      console.error('Error loading budgets:', error);
      Alert.alert('Error', 'Failed to load budget data');
    } finally {
      setBudgetsLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select(
          'dietary_restrictions, food_mood, favorite_categories, budget_preference'
        )
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setUserPreferences({
          dietary_restrictions: data.dietary_restrictions || [],
          food_mood: data.food_mood || '',
          favorite_categories: data.favorite_categories || [],
          budget_preference: data.budget_preference || '',
        });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const handleSavePreferences = async (preferences: UserPreferences) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Check if profile exists (user_profiles.id is the auth user id)
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            dietary_restrictions: preferences.dietary_restrictions,
            food_mood: preferences.food_mood,
            favorite_categories: preferences.favorite_categories,
            budget_preference: preferences.budget_preference,
          })
          .eq('id', user.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        // Insert new profile
        const { error } = await supabase.from('user_profiles').insert({
          id: user.id,
          dietary_restrictions: preferences.dietary_restrictions,
          food_mood: preferences.food_mood,
          favorite_categories: preferences.favorite_categories,
          budget_preference: preferences.budget_preference,
        });

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }

      setUserPreferences(preferences);
      setShowEditPreferences(false);
      Alert.alert('Success', 'Preferences updated successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert(
        'Error',
        'Failed to save preferences. Please check console for details.'
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            // Auth listener in root layout will handle navigation
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleAddExpense = async (
    category: string,
    amount: number,
    description: string,
    date: string
  ) => {
    try {
      // TODO: Replace 'user-id' with actual user ID from auth context
      const result = await budgetService.addExpense(
        'user-id',
        category as any, // Category type from modal
        amount,
        description,
        undefined,
        undefined,
        date
      );

      if (result) {
        await loadBudgets();
        setShowAddExpense(false);
        Alert.alert('Success', 'Expense added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const handleSetBudgetLimits = async (
    budgets: { category: string; limit: number }[]
  ) => {
    try {
      // TODO: Replace 'user-id' with actual user ID from auth context
      for (const budget of budgets) {
        await budgetService.setBudget(
          'user-id',
          budget.category as any,
          budget.limit
        );
      }
      await loadBudgets();
      Alert.alert('Success', 'Budget limits updated!');
    } catch (error) {
      console.error('Error setting budgets:', error);
      Alert.alert('Error', 'Failed to update budget limits');
    }
  };

  const renderTabs = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.tabs}>
      {[
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'budget', label: 'Budget', icon: Wallet },
        { id: 'nutrition', label: 'Nutrition', icon: Apple },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
        { id: 'challenges', label: 'Challenges', icon: Target },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Icon
              size={18}
              color={isActive ? COLORS.white : COLORS.gray[600]}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );

  const renderQuickStats = () => (
    <Animated.View
      entering={FadeInDown.delay(300)}
      style={styles.quickStatsContainer}
    >
      <View style={styles.quickStatsGrid}>
        <View style={styles.quickStat}>
          <View
            style={[
              styles.quickStatIcon,
              { backgroundColor: COLORS.primary + '15' },
            ]}
          >
            <Trophy size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.quickStatValue}>
            {achievements.filter((a) => a.unlocked).length}/
            {achievements.length}
          </Text>
          <Text style={styles.quickStatLabel}>Achievements</Text>
        </View>
        <View style={styles.quickStat}>
          <View
            style={[
              styles.quickStatIcon,
              { backgroundColor: COLORS.warning + '15' },
            ]}
          >
            <Target size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.quickStatValue}>
            {challenges.filter((c) => c.completed).length}/{challenges.length}
          </Text>
          <Text style={styles.quickStatLabel}>Challenges</Text>
        </View>
        <View style={styles.quickStat}>
          <View
            style={[
              styles.quickStatIcon,
              { backgroundColor: COLORS.success + '15' },
            ]}
          >
            <Zap size={24} color={COLORS.success} />
          </View>
          <Text style={styles.quickStatValue}>{profile?.streak || 0}</Text>
          <Text style={styles.quickStatLabel}>Day Streak</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderOverview = () => (
    <View style={styles.content}>
      {renderQuickStats()}

      {/* Preferences Section */}
      {userPreferences ? (
        <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Preferences</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingPreferences(userPreferences);
                setShowEditPreferences(true);
              }}
              style={styles.editButton}
            >
              <Edit size={18} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Dietary Restrictions */}
          {userPreferences.dietary_restrictions.length > 0 && (
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceIcon}>
                <Leaf size={20} color={COLORS.success} />
              </View>
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceLabel}>Dietary</Text>
                <View style={styles.preferenceTags}>
                  {userPreferences.dietary_restrictions.map((item, index) => (
                    <View key={index} style={styles.preferenceTag}>
                      <Text style={styles.preferenceTagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Food Mood */}
          {userPreferences.food_mood && (
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceIcon}>
                <Sparkles size={20} color={COLORS.warning} />
              </View>
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceLabel}>Food Mood</Text>
                <Text style={styles.preferenceValue}>
                  {userPreferences.food_mood}
                </Text>
              </View>
            </View>
          )}

          {/* Favorite Cuisines */}
          {userPreferences.favorite_categories.length > 0 && (
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceIcon}>
                <UtensilsCrossed size={20} color={COLORS.primary} />
              </View>
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceLabel}>Favorite Cuisines</Text>
                <View style={styles.preferenceTags}>
                  {userPreferences.favorite_categories.map((item, index) => (
                    <View key={index} style={styles.preferenceTag}>
                      <Text style={styles.preferenceTagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Budget Preference */}
          {userPreferences.budget_preference && (
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceIcon}>
                <DollarSign size={20} color={COLORS.success} />
              </View>
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceLabel}>Budget</Text>
                <Text style={styles.preferenceValue}>
                  {userPreferences.budget_preference}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Preferences</Text>
          </View>

          <View style={styles.completeSurveyCard}>
            <View style={styles.completeSurveyIconContainer}>
              <Sparkles size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.completeSurveyTitle}>
              Complete Your Food Preferences
            </Text>
            <Text style={styles.completeSurveyDescription}>
              Tell us about your dietary needs, favorite cuisines, and budget to
              get personalized restaurant recommendations!
            </Text>
            <TouchableOpacity
              style={styles.completeSurveyButton}
              onPress={() => {
                setEditingPreferences({
                  dietary_restrictions: [],
                  food_mood: '',
                  favorite_categories: [],
                  budget_preference: '',
                });
                setShowEditPreferences(true);
              }}
            >
              <Text style={styles.completeSurveyButtonText}>
                Complete Survey
              </Text>
              <ChevronRight size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <TouchableOpacity onPress={() => setActiveTab('achievements')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {achievements
          .filter((a) => a.unlocked)
          .slice(0, 3)
          .map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          <TouchableOpacity onPress={() => setActiveTab('challenges')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {challenges
          .filter((c) => !c.completed)
          .slice(0, 2)
          .map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              index={index}
            />
          ))}
      </Animated.View>

      {/* Rewards Section - Integrated into Overview */}
      <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
        <Text style={styles.sectionTitle}>Your Rewards</Text>

        <Animated.View
          entering={FadeInDown.delay(650)}
          style={styles.pointsCard}
        >
          <View style={styles.pointsHeader}>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsLabel}>Available Points</Text>
              <Text style={styles.pointsValue}>{profile?.points || 0}</Text>
            </View>
            <View style={styles.pointsIcon}>
              <Zap size={32} color={COLORS.warning} fill={COLORS.warning} />
            </View>
          </View>
          <Text style={styles.pointsText}>
            Redeem points for exclusive rewards!
          </Text>
        </Animated.View>

        <Text style={styles.sectionSubtitle}>Available Rewards</Text>
        <View style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <Gift size={32} color={COLORS.primary} />
          </View>
          <View style={styles.rewardContent}>
            <Text style={styles.rewardTitle}>10% Off Coupon</Text>
            <Text style={styles.rewardDescription}>
              Get 10% off at partner restaurants
            </Text>
            <View style={styles.rewardFooter}>
              <View style={styles.rewardCost}>
                <Zap size={16} color={COLORS.warning} />
                <Text style={styles.rewardCostText}>500 points</Text>
              </View>
              <TouchableOpacity style={styles.redeemButton}>
                <Text style={styles.redeemButtonText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <Zap size={32} color={COLORS.warning} />
          </View>
          <View style={styles.rewardContent}>
            <Text style={styles.rewardTitle}>2x Points Boost</Text>
            <Text style={styles.rewardDescription}>
              Double points for 7 days
            </Text>
            <View style={styles.rewardFooter}>
              <View style={styles.rewardCost}>
                <Zap size={16} color={COLORS.warning} />
                <Text style={styles.rewardCostText}>300 points</Text>
              </View>
              <TouchableOpacity style={styles.redeemButton}>
                <Text style={styles.redeemButtonText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {renderSettings()}
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.content}>
      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>All Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          {achievements.filter((a) => a.unlocked).length} of{' '}
          {achievements.length} unlocked
        </Text>
        {achievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            index={index}
          />
        ))}
      </Animated.View>
    </View>
  );

  const renderChallenges = () => {
    const dailyChallenges = challenges.filter((c) => c.type === 'daily');
    const weeklyChallenges = challenges.filter((c) => c.type === 'weekly');

    return (
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          <Text style={styles.sectionSubtitle}>Reset in 12 hours</Text>
          {dailyChallenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              index={index}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Challenges</Text>
          <Text style={styles.sectionSubtitle}>Reset in 5 days</Text>
          {weeklyChallenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              index={index}
            />
          ))}
        </Animated.View>
      </View>
    );
  };

  const renderBudget = () => (
    <View style={styles.content}>
      {budgetsLoading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: SPACING.xl }}
        />
      ) : (
        <>
          {/* Budget Summary Card */}
          {budgetSummary && (
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.budgetSummaryCard}
            >
              <View style={styles.budgetSummaryHeader}>
                <View>
                  <Text style={styles.budgetSummaryTitle}>Monthly Budget</Text>
                  <Text style={styles.budgetSummarySubtitle}>
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addExpenseButtonLarge}
                  onPress={() => setShowAddExpense(true)}
                >
                  <Plus size={20} color={COLORS.white} strokeWidth={3} />
                  <Text style={styles.addExpenseButtonText}>Add Expense</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.budgetTotalRow}>
                <View style={styles.budgetTotalItem}>
                  <Text style={styles.budgetTotalLabel}>Total Budget</Text>
                  <Text style={styles.budgetTotalValue}>
                    R {budgetSummary.totalBudget.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.budgetTotalItem}>
                  <Text style={styles.budgetTotalLabel}>Spent</Text>
                  <Text
                    style={[styles.budgetTotalValue, { color: COLORS.error }]}
                  >
                    R {budgetSummary.totalSpent.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.budgetTotalItem}>
                  <Text style={styles.budgetTotalLabel}>Remaining</Text>
                  <Text
                    style={[styles.budgetTotalValue, { color: COLORS.success }]}
                  >
                    R {budgetSummary.remaining.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Overall Progress Bar */}
              <View style={styles.overallProgressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(budgetSummary.percentage, 100)}%`,
                        backgroundColor:
                          budgetSummary.percentage >= 90
                            ? COLORS.error
                            : budgetSummary.percentage >= 70
                            ? COLORS.warning
                            : COLORS.success,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercentage}>
                  {budgetSummary.percentage.toFixed(0)}%
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Category Breakdown */}
          <Animated.View
            entering={FadeInDown.delay(400)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => setShowSetBudgetLimits(true)}>
                <Text style={styles.seeAllText}>Set Limits</Text>
              </TouchableOpacity>
            </View>
            {budgetSummary && budgetSummary.categories.length > 0 ? (
              budgetSummary.categories.map((cat, index) => (
                <Animated.View
                  key={cat.category}
                  entering={FadeInDown.delay(450 + index * 50)}
                  style={styles.categoryCard}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryIcon}>
                        {cat.category === 'food' && '🍔'}
                        {cat.category === 'restaurants' && '🍽️'}
                        {cat.category === 'drinks' && '🍹'}
                        {cat.category === 'groceries' && '🛒'}
                        {cat.category === 'takeout' && '🥡'}
                        {cat.category === 'other' && '💰'}
                      </Text>
                      <View>
                        <Text style={styles.categoryName}>
                          {cat.category.charAt(0).toUpperCase() +
                            cat.category.slice(1)}
                        </Text>
                        <Text style={styles.categoryBudget}>
                          R {cat.spent.toLocaleString()} / R{' '}
                          {cat.limit.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.categoryPercentage,
                        {
                          color:
                            cat.percentage >= 90
                              ? COLORS.error
                              : cat.percentage >= 70
                              ? COLORS.warning
                              : COLORS.success,
                        },
                      ]}
                    >
                      {cat.percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.categoryProgressBar}>
                    <View
                      style={[
                        styles.categoryProgressFill,
                        {
                          width: `${Math.min(cat.percentage, 100)}%`,
                          backgroundColor:
                            cat.percentage >= 90
                              ? COLORS.error
                              : cat.percentage >= 70
                              ? COLORS.warning
                              : COLORS.success,
                        },
                      ]}
                    />
                  </View>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Wallet size={64} color={COLORS.gray[300]} />
                <Text style={styles.emptyStateTitle}>No budgets set</Text>
                <Text style={styles.emptyStateText}>
                  Start tracking your spending by adding expenses
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Recent Expenses */}
          {expenses.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
              {expenses.slice(0, 5).map((expense, index) => (
                <Animated.View
                  key={expense.id}
                  entering={FadeInRight.delay(550 + index * 50)}
                  style={styles.expenseCard}
                >
                  <View style={styles.expenseLeft}>
                    <View style={styles.expenseIcon}>
                      <Text style={styles.expenseEmoji}>
                        {expense.category === 'food' && '🍔'}
                        {expense.category === 'restaurants' && '🍽️'}
                        {expense.category === 'drinks' && '🍹'}
                        {expense.category === 'groceries' && '🛒'}
                        {expense.category === 'takeout' && '🥡'}
                        {expense.category === 'other' && '💰'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.expenseDescription}>
                        {expense.description}
                      </Text>
                      <Text style={styles.expenseDate}>
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.expenseAmount}>
                    R {expense.amount.toLocaleString()}
                  </Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}
        </>
      )}
    </View>
  );

  const renderSettings = () => (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsList}>
        {[
          { id: 'edit', label: 'Edit Profile', icon: User, hasChevron: true },
          {
            id: 'addresses',
            label: 'My Addresses',
            icon: MapPin,
            hasChevron: true,
          },
          {
            id: 'payment',
            label: 'Payment Methods',
            icon: CreditCard,
            hasChevron: true,
          },
          {
            id: 'notifications',
            label: 'Push Notifications',
            icon: Bell,
            hasSwitch: true,
            switchValue: notificationsEnabled,
          },
          {
            id: 'settings',
            label: 'App Settings',
            icon: Settings,
            hasChevron: true,
          },
          {
            id: 'privacy',
            label: 'Privacy & Security',
            icon: Shield,
            hasChevron: true,
          },
          {
            id: 'help',
            label: 'Help & Support',
            icon: HelpCircle,
            hasChevron: true,
          },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(700 + index * 50)}
            >
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => {
                  if (item.hasSwitch) {
                    setNotificationsEnabled(!notificationsEnabled);
                  }
                }}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <Icon size={20} color={COLORS.gray[600]} />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                {item.hasSwitch && (
                  <Switch
                    value={item.switchValue}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{
                      false: COLORS.gray[300],
                      true: COLORS.primary,
                    }}
                    thumbColor={COLORS.white}
                  />
                )}
                {item.hasChevron && (
                  <ChevronRight size={20} color={COLORS.gray[400]} />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderNutrition = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Apple size={24} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Nutrition Tracking</Text>
      </View>

      <TouchableOpacity
        style={styles.nutritionCard}
        onPress={() => router.push('/nutrition')}
        activeOpacity={0.7}
      >
        <View style={styles.nutritionContent}>
          <Text style={styles.nutritionTitle}>Track Your Meals</Text>
          <Text style={styles.nutritionDescription}>
            Log your meals, track calories, and monitor your nutrition goals
          </Text>
          <View style={styles.nutritionStats}>
            <View style={styles.nutritionStat}>
              <Text style={styles.nutritionStatValue}>2,450</Text>
              <Text style={styles.nutritionStatLabel}>Daily Calories</Text>
            </View>
            <View style={styles.nutritionStat}>
              <Text style={styles.nutritionStatValue}>45</Text>
              <Text style={styles.nutritionStatLabel}>Meals Logged</Text>
            </View>
            <View style={styles.nutritionStat}>
              <Text style={styles.nutritionStatValue}>12</Text>
              <Text style={styles.nutritionStatLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
        <ChevronRight size={24} color={COLORS.gray[400]} />
      </TouchableOpacity>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push('/nutrition')}
        >
          <View style={styles.quickActionIcon}>
            <Plus size={20} color={COLORS.white} />
          </View>
          <Text style={styles.quickActionText}>Log Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push('/nutrition')}
        >
          <View style={styles.quickActionIcon}>
            <Target size={20} color={COLORS.white} />
          </View>
          <Text style={styles.quickActionText}>View Goals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push('/nutrition')}
        >
          <View style={styles.quickActionIcon}>
            <Trophy size={20} color={COLORS.white} />
          </View>
          <Text style={styles.quickActionText}>Progress</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <UserProfileHeader profile={profile} />
        {renderTabs()}

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'budget' && renderBudget()}
        {activeTab === 'nutrition' && renderNutrition()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'challenges' && renderChallenges()}

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSave={handleAddExpense}
      />

      {/* Set Budget Limits Modal */}
      <SetBudgetLimitModal
        visible={showSetBudgetLimits}
        onClose={() => setShowSetBudgetLimits(false)}
        onSave={async (budgets) => {
          await handleSetBudgetLimits(budgets);
          setShowSetBudgetLimits(false);
        }}
      />

      {/* Edit Preferences Modal */}
      <Modal
        visible={showEditPreferences}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditPreferences(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Preferences</Text>
              <TouchableOpacity onPress={() => setShowEditPreferences(false)}>
                <Text style={{ fontSize: 24, color: COLORS.textSecondary }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Dietary Restrictions */}
              <View style={styles.editPreferenceSection}>
                <Text style={styles.editPreferenceSectionTitle}>
                  Dietary Restrictions
                </Text>
                <View style={styles.editOptionGrid}>
                  {[
                    'No Restrictions',
                    'Vegetarian',
                    'Vegan',
                    'Pescatarian',
                    'Gluten-Free',
                    'Halal',
                  ].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.editOption,
                        editingPreferences?.dietary_restrictions.includes(
                          option
                        ) && styles.editOptionSelected,
                      ]}
                      onPress={() => {
                        if (!editingPreferences) return;
                        const newRestrictions =
                          editingPreferences.dietary_restrictions.includes(
                            option
                          )
                            ? editingPreferences.dietary_restrictions.filter(
                                (r) => r !== option
                              )
                            : [
                                ...editingPreferences.dietary_restrictions,
                                option,
                              ];
                        setEditingPreferences({
                          ...editingPreferences,
                          dietary_restrictions: newRestrictions,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.editOptionText,
                          editingPreferences?.dietary_restrictions.includes(
                            option
                          ) && styles.editOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Food Mood */}
              <View style={styles.editPreferenceSection}>
                <Text style={styles.editPreferenceSectionTitle}>Food Mood</Text>
                <View style={styles.editOptionGrid}>
                  {['Adventurous', 'Comfort', 'Healthy', 'Indulgent'].map(
                    (mood) => (
                      <TouchableOpacity
                        key={mood}
                        style={[
                          styles.editOption,
                          editingPreferences?.food_mood === mood &&
                            styles.editOptionSelected,
                        ]}
                        onPress={() => {
                          if (!editingPreferences) return;
                          setEditingPreferences({
                            ...editingPreferences,
                            food_mood: mood,
                          });
                        }}
                      >
                        <Text
                          style={[
                            styles.editOptionText,
                            editingPreferences?.food_mood === mood &&
                              styles.editOptionTextSelected,
                          ]}
                        >
                          {mood}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              {/* Favorite Cuisines */}
              <View style={styles.editPreferenceSection}>
                <Text style={styles.editPreferenceSectionTitle}>
                  Favorite Cuisines
                </Text>
                <View style={styles.editOptionGrid}>
                  {[
                    'Italian',
                    'Asian',
                    'Seafood',
                    'American',
                    'Healthy',
                    'Desserts',
                  ].map((cuisine) => (
                    <TouchableOpacity
                      key={cuisine}
                      style={[
                        styles.editOption,
                        editingPreferences?.favorite_categories.includes(
                          cuisine
                        ) && styles.editOptionSelected,
                      ]}
                      onPress={() => {
                        if (!editingPreferences) return;
                        const newCategories =
                          editingPreferences.favorite_categories.includes(
                            cuisine
                          )
                            ? editingPreferences.favorite_categories.filter(
                                (c) => c !== cuisine
                              )
                            : [
                                ...editingPreferences.favorite_categories,
                                cuisine,
                              ];
                        setEditingPreferences({
                          ...editingPreferences,
                          favorite_categories: newCategories,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.editOptionText,
                          editingPreferences?.favorite_categories.includes(
                            cuisine
                          ) && styles.editOptionTextSelected,
                        ]}
                      >
                        {cuisine}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Budget Preference */}
              <View style={styles.editPreferenceSection}>
                <Text style={styles.editPreferenceSectionTitle}>
                  Budget Preference
                </Text>
                <View style={styles.editOptionGrid}>
                  {[
                    'Budget (R50-150)',
                    'Moderate (R150-300)',
                    'Premium (R300+)',
                    'Flexible',
                  ].map((budget) => (
                    <TouchableOpacity
                      key={budget}
                      style={[
                        styles.editOption,
                        editingPreferences?.budget_preference === budget &&
                          styles.editOptionSelected,
                      ]}
                      onPress={() => {
                        if (!editingPreferences) return;
                        setEditingPreferences({
                          ...editingPreferences,
                          budget_preference: budget,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.editOptionText,
                          editingPreferences?.budget_preference === budget &&
                            styles.editOptionTextSelected,
                        ]}
                      >
                        {budget}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (editingPreferences) {
                  handleSavePreferences(editingPreferences);
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping to prevent overlap
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    justifyContent: 'center', // Center align tabs
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm + 2, // Reduced vertical padding
    paddingHorizontal: SPACING.sm + 4, // Added horizontal padding
    minWidth: 90, // Minimum width to prevent squashing
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 11, // Slightly smaller font
    fontWeight: '700',
    color: COLORS.gray[600],
    letterSpacing: -0.2,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  quickStatsContainer: {
    marginBottom: SPACING.lg,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickStat: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  quickStatIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  quickStatLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pointsCard: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.warning + '30',
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  pointsValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.warning,
    letterSpacing: -1,
  },
  pointsIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    fontWeight: '500',
  },
  rewardCard: {
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
    gap: SPACING.md,
  },
  rewardIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  rewardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  rewardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  rewardCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rewardCostText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.gray[700],
  },
  redeemButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  redeemButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  settingsList: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.error + '30',
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.error,
    letterSpacing: -0.3,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
  },
  // Budget styles
  budgetSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  budgetSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  budgetSummaryTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  budgetSummarySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: SPACING.xxs,
  },
  addExpenseButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addExpenseButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  budgetTotalRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  budgetTotalItem: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  budgetTotalLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  budgetTotalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  overallProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressPercentage: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  categoryBudget: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: SPACING.xxs,
  },
  categoryPercentage: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  categoryProgressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseEmoji: {
    fontSize: 24,
  },
  expenseDescription: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xxs,
  },
  expenseDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.error,
    letterSpacing: -0.3,
  },
  // Nutrition Styles
  nutritionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  nutritionContent: {
    flex: 1,
  },
  nutritionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  nutritionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  nutritionStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  nutritionStat: {
    alignItems: 'flex-start',
  },
  nutritionStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  nutritionStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  // Preferences Styles
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '10',
  },
  editButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  preferenceValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  preferenceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  preferenceTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
  },
  preferenceTagText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '80%',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  editModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  editModalBody: {
    padding: SPACING.lg,
  },
  editPreferenceSection: {
    marginBottom: SPACING.xl,
  },
  editPreferenceSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  editOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  editOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
  },
  editOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  editOptionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  editOptionTextSelected: {
    color: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    margin: SPACING.lg,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Complete Survey Card Styles
  completeSurveyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
    borderStyle: 'dashed',
  },
  completeSurveyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  completeSurveyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  completeSurveyDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  completeSurveyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  completeSurveyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
