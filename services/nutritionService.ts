import {
  DailyNutrition,
  MealLog,
  MenuItem,
  NutritionGoals,
  NutritionInsight,
  WeeklyNutritionSummary,
  calculateMacroPercentages,
} from '../types/nutrition';
import { logger } from './logger';

// Mock user nutrition goals
const DEFAULT_GOALS: NutritionGoals = {
  dailyCalories: 2000,
  proteinPercentage: 30,
  carbsPercentage: 40,
  fatPercentage: 30,
  waterIntake: 2000,
  activityLevel: 'moderate',
  dietaryPreference: 'standard',
  restrictions: [],
};

// Calculate macro goals based on calorie target
export const calculateMacroGoals = (goals: NutritionGoals) => {
  const { dailyCalories, proteinPercentage, carbsPercentage, fatPercentage } =
    goals;

  const proteinCalories = dailyCalories * (proteinPercentage / 100);
  const carbCalories = dailyCalories * (carbsPercentage / 100);
  const fatCalories = dailyCalories * (fatPercentage / 100);

  return {
    protein: Math.round(proteinCalories / 4), // 4 cal per gram
    carbs: Math.round(carbCalories / 4), // 4 cal per gram
    fat: Math.round(fatCalories / 9), // 9 cal per gram
  };
};

// Mock today's meal logs
const mockMealLogs: MealLog[] = [
  {
    id: '1',
    userId: 'user1',
    restaurantId: '1',
    restaurantName: 'The Grillhouse',
    items: [
      {
        id: 'm1',
        name: 'Grilled Chicken Breast',
        description: 'Herb-marinated chicken with vegetables',
        price: 125,
        category: 'main',
        nutrition: {
          calories: 350,
          protein: 45,
          carbohydrates: 12,
          fat: 14,
          fiber: 4,
          sodium: 580,
          sugar: 3,
          servingSize: '250g',
        },
        dietaryTags: ['high-protein', 'gluten-free', 'low-carb'],
        preparationTime: 20,
      },
    ],
    mealType: 'lunch',
    timestamp: new Date(2025, 10, 20, 13, 30),
    totalCalories: 350,
    totalProtein: 45,
    totalCarbs: 12,
    totalFat: 14,
  },
  {
    id: '2',
    userId: 'user1',
    restaurantId: '2',
    restaurantName: 'Sushi Bar',
    items: [
      {
        id: 'm2',
        name: 'Salmon Poke Bowl',
        description: 'Fresh salmon with edamame, avocado, brown rice',
        price: 95,
        category: 'main',
        nutrition: {
          calories: 520,
          protein: 32,
          carbohydrates: 58,
          fat: 16,
          fiber: 8,
          sodium: 720,
          sugar: 6,
          servingSize: '400g',
        },
        dietaryTags: ['high-protein', 'dairy-free'],
        preparationTime: 15,
      },
    ],
    mealType: 'dinner',
    timestamp: new Date(2025, 10, 20, 19, 0),
    totalCalories: 520,
    totalProtein: 32,
    totalCarbs: 58,
    totalFat: 16,
  },
];

// Get user's nutrition goals
export const getNutritionGoals = async (): Promise<NutritionGoals> => {
  // TODO: Replace with actual Supabase call
  return DEFAULT_GOALS;
};

// Get today's nutrition summary
export const getDailyNutrition = async (
  date: Date = new Date()
): Promise<DailyNutrition> => {
  // TODO: Replace with actual Supabase call
  const goals = await getNutritionGoals();
  const macroGoals = calculateMacroGoals(goals);

  const totalCalories = mockMealLogs.reduce(
    (sum, log) => sum + log.totalCalories,
    0
  );
  const totalProtein = mockMealLogs.reduce(
    (sum, log) => sum + log.totalProtein,
    0
  );
  const totalCarbs = mockMealLogs.reduce((sum, log) => sum + log.totalCarbs, 0);
  const totalFat = mockMealLogs.reduce((sum, log) => sum + log.totalFat, 0);

  return {
    date,
    meals: mockMealLogs,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    waterIntake: 1200, // Mock water intake
    calorieGoal: goals.dailyCalories,
    proteinGoal: macroGoals.protein,
    carbGoal: macroGoals.carbs,
    fatGoal: macroGoals.fat,
  };
};

// Get meal logs for a date
export const getMealLogs = async (
  date: Date = new Date()
): Promise<MealLog[]> => {
  // TODO: Replace with actual Supabase call
  return mockMealLogs;
};

// Log a new meal
export const logMeal = async (
  restaurantId: string,
  restaurantName: string,
  items: MenuItem[],
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  notes?: string
): Promise<MealLog> => {
  // TODO: Replace with actual Supabase call
  const totalCalories = items.reduce(
    (sum, item) => sum + item.nutrition.calories,
    0
  );
  const totalProtein = items.reduce(
    (sum, item) => sum + item.nutrition.protein,
    0
  );
  const totalCarbs = items.reduce(
    (sum, item) => sum + item.nutrition.carbohydrates,
    0
  );
  const totalFat = items.reduce((sum, item) => sum + item.nutrition.fat, 0);

  const newLog: MealLog = {
    id: `${Date.now()}`,
    userId: 'user1',
    restaurantId,
    restaurantName,
    items,
    mealType,
    timestamp: new Date(),
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    notes,
  };

  mockMealLogs.push(newLog);
  return newLog;
};

// Delete a meal log
export const deleteMealLog = async (logId: string): Promise<void> => {
  // TODO: Replace with actual Supabase call
  const index = mockMealLogs.findIndex((log) => log.id === logId);
  if (index > -1) {
    mockMealLogs.splice(index, 1);
  }
};

// Get nutrition insights based on daily data
export const getNutritionInsights = async (
  dailyData: DailyNutrition
): Promise<NutritionInsight[]> => {
  const insights: NutritionInsight[] = [];

  const caloriePercentage =
    (dailyData.totalCalories / dailyData.calorieGoal) * 100;
  const proteinPercentage =
    (dailyData.totalProtein / dailyData.proteinGoal) * 100;
  const waterPercentage = (dailyData.waterIntake / 2000) * 100;

  // Calorie insights
  if (caloriePercentage < 80) {
    insights.push({
      id: 'low-calories',
      type: 'warning',
      title: 'Below Calorie Target',
      description: `You're ${Math.round(
        dailyData.calorieGoal - dailyData.totalCalories
      )} calories below your goal. Consider adding a healthy snack.`,
      icon: '⚡',
    });
  } else if (caloriePercentage > 110) {
    insights.push({
      id: 'high-calories',
      type: 'warning',
      title: 'Over Calorie Target',
      description: `You're ${Math.round(
        dailyData.totalCalories - dailyData.calorieGoal
      )} calories over your goal today.`,
      icon: '⚠️',
    });
  } else {
    insights.push({
      id: 'on-track-calories',
      type: 'success',
      title: 'On Track!',
      description: `You're ${Math.round(
        caloriePercentage
      )}% of your daily calorie goal. Great job!`,
      icon: '🎯',
    });
  }

  // Protein insights
  if (proteinPercentage >= 100) {
    insights.push({
      id: 'protein-goal',
      type: 'success',
      title: 'Protein Goal Reached',
      description: `You've hit your protein target of ${dailyData.proteinGoal}g. Excellent for muscle recovery!`,
      icon: '💪',
    });
  } else if (proteinPercentage < 70) {
    insights.push({
      id: 'low-protein',
      type: 'tip',
      title: 'Low Protein Intake',
      description: `Try adding more protein-rich foods. You need ${Math.round(
        dailyData.proteinGoal - dailyData.totalProtein
      )}g more.`,
      icon: '🥩',
    });
  }

  // Water insights
  if (waterPercentage < 50) {
    insights.push({
      id: 'hydration',
      type: 'info',
      title: 'Stay Hydrated',
      description: `Drink more water! You've only had ${dailyData.waterIntake}ml today.`,
      icon: '💧',
    });
  } else if (waterPercentage >= 100) {
    insights.push({
      id: 'hydration-goal',
      type: 'success',
      title: 'Hydration Goal Achieved',
      description: `You've reached your daily water intake goal of 2000ml!`,
      icon: '💧',
    });
  }

  // Macro balance insights
  const macroPercentages = calculateMacroPercentages(
    dailyData.totalProtein,
    dailyData.totalCarbs,
    dailyData.totalFat
  );

  if (Math.abs(macroPercentages.protein - 30) > 10) {
    insights.push({
      id: 'macro-balance',
      type: 'tip',
      title: 'Balance Your Macros',
      description: `Your protein is at ${macroPercentages.protein}%. Aim for 30% for optimal balance.`,
      icon: '⚖️',
    });
  }

  return insights;
};

// Get weekly summary
export const getWeeklySummary = async (): Promise<WeeklyNutritionSummary> => {
  // TODO: Replace with actual Supabase call
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);

  return {
    weekStart,
    weekEnd: today,
    averageCalories: 1850,
    averageProtein: 95,
    averageCarbs: 180,
    averageFat: 65,
    daysOnTrack: 5,
    totalMealsLogged: 18,
    caloriesTrend: 'stable',
  };
};

// Update nutrition goals
export const updateNutritionGoals = async (
  goals: Partial<NutritionGoals>
): Promise<NutritionGoals> => {
  // TODO: Replace with actual Supabase call
  return { ...DEFAULT_GOALS, ...goals };
};

// Update water intake
export const updateWaterIntake = async (amount: number): Promise<void> => {
  // TODO: Replace with actual Supabase call
  logger.info('Water intake updated', { metadata: { amount } });
};

// Get recommended meals based on remaining macros
export const getRecommendedMeals = async (remainingMacros: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}): Promise<MenuItem[]> => {
  // TODO: Replace with actual recommendation algorithm
  return [];
};
