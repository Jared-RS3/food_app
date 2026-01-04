import { LinearGradient } from 'expo-linear-gradient';
import { Apple, Coffee, Droplets, Flame, Moon, Sun } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DailyNutrition, getCalorieRangeColor } from '../types/nutrition';

interface CalorieTrackerProps {
  dailyData: DailyNutrition;
  onAddWater?: () => void;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({
  dailyData,
  onAddWater,
}) => {
  const [calorieProgress] = useState(new Animated.Value(0));
  const [proteinProgress] = useState(new Animated.Value(0));
  const [carbsProgress] = useState(new Animated.Value(0));
  const [fatProgress] = useState(new Animated.Value(0));
  const [waterProgress] = useState(new Animated.Value(0));

  const caloriePercentage = Math.min(
    (dailyData.totalCalories / dailyData.calorieGoal) * 100,
    100
  );
  const proteinPercentage = Math.min(
    (dailyData.totalProtein / dailyData.proteinGoal) * 100,
    100
  );
  const carbsPercentage = Math.min(
    (dailyData.totalCarbs / dailyData.carbGoal) * 100,
    100
  );
  const fatPercentage = Math.min(
    (dailyData.totalFat / dailyData.fatGoal) * 100,
    100
  );
  const waterPercentage = Math.min((dailyData.waterIntake / 2000) * 100, 100);

  const calorieColor = getCalorieRangeColor(
    dailyData.totalCalories,
    dailyData.calorieGoal
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(calorieProgress, {
        toValue: caloriePercentage,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(proteinProgress, {
        toValue: proteinPercentage,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(carbsProgress, {
        toValue: carbsPercentage,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(fatProgress, {
        toValue: fatPercentage,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(waterProgress, {
        toValue: waterPercentage,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [dailyData]);

  // Calculate meal breakdown
  const mealBreakdown = {
    breakfast: dailyData.meals
      .filter((m) => m.mealType === 'breakfast')
      .reduce((sum, m) => sum + m.totalCalories, 0),
    lunch: dailyData.meals
      .filter((m) => m.mealType === 'lunch')
      .reduce((sum, m) => sum + m.totalCalories, 0),
    dinner: dailyData.meals
      .filter((m) => m.mealType === 'dinner')
      .reduce((sum, m) => sum + m.totalCalories, 0),
    snack: dailyData.meals
      .filter((m) => m.mealType === 'snack')
      .reduce((sum, m) => sum + m.totalCalories, 0),
  };

  const remaining = dailyData.calorieGoal - dailyData.totalCalories;

  return (
    <View style={styles.container}>
      {/* Main Calorie Circle */}
      <View style={styles.calorieCircleContainer}>
        <View style={styles.progressRingOuter}>
          <View
            style={[
              styles.progressRingFill,
              {
                transform: [
                  { rotate: `${(caloriePercentage / 100) * 360}deg` },
                ],
                backgroundColor: calorieColor,
              },
            ]}
          />
        </View>
        <LinearGradient
          colors={[calorieColor + '20', calorieColor + '05']}
          style={styles.calorieCircle}
        >
          <View style={styles.calorieCircleInner}>
            <Flame size={32} color={calorieColor} strokeWidth={2.5} />
            <Text style={[styles.calorieMainValue, { color: calorieColor }]}>
              {dailyData.totalCalories}
            </Text>
            <Text style={styles.calorieMainLabel}>
              of {dailyData.calorieGoal}
            </Text>
            <Text
              style={[
                styles.calorieRemaining,
                { color: remaining >= 0 ? '#10B981' : '#EF4444' },
              ]}
            >
              {remaining >= 0
                ? `${remaining} left`
                : `${Math.abs(remaining)} over`}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Meal Breakdown */}
      <View style={styles.mealBreakdown}>
        <Text style={styles.sectionTitle}>Meal Breakdown</Text>
        <View style={styles.mealGrid}>
          <View style={styles.mealCard}>
            <View style={[styles.mealIcon, { backgroundColor: '#FEF3C7' }]}>
              <Sun size={20} color="#F59E0B" strokeWidth={2.5} />
            </View>
            <Text style={styles.mealLabel}>Breakfast</Text>
            <Text style={styles.mealValue}>{mealBreakdown.breakfast}</Text>
            <Text style={styles.mealUnit}>cal</Text>
          </View>

          <View style={styles.mealCard}>
            <View style={[styles.mealIcon, { backgroundColor: '#FEF2F2' }]}>
              <Apple size={20} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text style={styles.mealLabel}>Lunch</Text>
            <Text style={styles.mealValue}>{mealBreakdown.lunch}</Text>
            <Text style={styles.mealUnit}>cal</Text>
          </View>

          <View style={styles.mealCard}>
            <View style={[styles.mealIcon, { backgroundColor: '#EDE9FE' }]}>
              <Moon size={20} color="#8B5CF6" strokeWidth={2.5} />
            </View>
            <Text style={styles.mealLabel}>Dinner</Text>
            <Text style={styles.mealValue}>{mealBreakdown.dinner}</Text>
            <Text style={styles.mealUnit}>cal</Text>
          </View>

          <View style={styles.mealCard}>
            <View style={[styles.mealIcon, { backgroundColor: '#DBEAFE' }]}>
              <Coffee size={20} color="#3B82F6" strokeWidth={2.5} />
            </View>
            <Text style={styles.mealLabel}>Snacks</Text>
            <Text style={styles.mealValue}>{mealBreakdown.snack}</Text>
            <Text style={styles.mealUnit}>cal</Text>
          </View>
        </View>
      </View>

      {/* Macros Progress */}
      <View style={styles.macrosSection}>
        <Text style={styles.sectionTitle}>Macronutrients</Text>

        {/* Protein */}
        <View style={styles.macroRow}>
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>
              {dailyData.totalProtein}g / {dailyData.proteinGoal}g
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: proteinProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: '#EF4444',
                },
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(proteinPercentage)}%
          </Text>
        </View>

        {/* Carbs */}
        <View style={styles.macroRow}>
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>
              {dailyData.totalCarbs}g / {dailyData.carbGoal}g
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: carbsProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: '#F59E0B',
                },
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(carbsPercentage)}%
          </Text>
        </View>

        {/* Fat */}
        <View style={styles.macroRow}>
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>
              {dailyData.totalFat}g / {dailyData.fatGoal}g
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: fatProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: '#8B5CF6',
                },
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(fatPercentage)}%
          </Text>
        </View>
      </View>

      {/* Water Intake */}
      <TouchableOpacity
        style={styles.waterCard}
        onPress={onAddWater}
        activeOpacity={0.7}
      >
        <View style={styles.waterHeader}>
          <View style={styles.waterIcon}>
            <Droplets size={24} color="#3B82F6" strokeWidth={2.5} />
          </View>
          <View style={styles.waterInfo}>
            <Text style={styles.waterLabel}>Water Intake</Text>
            <Text style={styles.waterValue}>
              {dailyData.waterIntake}ml / 2000ml
            </Text>
          </View>
          <Text style={styles.waterAdd}>+ Add</Text>
        </View>
        <View style={styles.waterProgressBar}>
          <Animated.View
            style={[
              styles.waterProgressFill,
              {
                width: waterProgress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  calorieCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  calorieCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieCircleInner: {
    alignItems: 'center',
    gap: 4,
  },
  calorieMainValue: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
  },
  calorieMainLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.3,
  },
  calorieRemaining: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  progressRingOuter: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 12,
    borderColor: '#F3F4F6',
  },
  progressRingFill: {
    width: '50%',
    height: '100%',
    position: 'absolute',
    right: 0,
    borderTopRightRadius: 120,
    borderBottomRightRadius: 120,
  },
  mealBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mealLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  mealValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.8,
  },
  mealUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },
  macrosSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    gap: 16,
  },
  macroRow: {
    gap: 8,
  },
  macroInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: -0.2,
    textAlign: 'right',
  },
  waterCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  waterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterInfo: {
    flex: 1,
  },
  waterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  waterValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
    letterSpacing: -0.2,
  },
  waterAdd: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: -0.3,
  },
  waterProgressBar: {
    height: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
});
