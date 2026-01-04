export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sodium: number; // mg
  sugar: number; // grams
  saturatedFat?: number; // grams
  cholesterol?: number; // mg
  servingSize: string; // e.g., "1 plate", "350g"
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'side';
  nutrition: NutritionInfo;
  dietaryTags: DietaryTag[];
  allergens?: string[];
  preparationTime?: number; // minutes
  spiceLevel?: 1 | 2 | 3 | 4 | 5;
  isPopular?: boolean;
  isNew?: boolean;
}

export type DietaryTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'low-carb'
  | 'high-protein'
  | 'low-calorie'
  | 'paleo'
  | 'halal'
  | 'kosher';

export interface MealLog {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: MenuItem[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
}

export interface DailyNutrition {
  date: Date;
  meals: MealLog[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number; // ml
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

export interface NutritionGoals {
  dailyCalories: number;
  proteinPercentage: number; // e.g., 30 for 30%
  carbsPercentage: number; // e.g., 40 for 40%
  fatPercentage: number; // e.g., 30 for 30%
  waterIntake: number; // ml per day
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  dietaryPreference?: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
  restrictions?: DietaryTag[];
}

export interface NutritionInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface WeeklyNutritionSummary {
  weekStart: Date;
  weekEnd: Date;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  daysOnTrack: number;
  totalMealsLogged: number;
  caloriesTrend: 'increasing' | 'decreasing' | 'stable';
}

// Nutrition calculation helpers
export const calculateMacroCalories = (
  protein: number,
  carbs: number,
  fat: number
): number => {
  return protein * 4 + carbs * 4 + fat * 9;
};

export const calculateMacroPercentages = (
  protein: number,
  carbs: number,
  fat: number
) => {
  const total = protein + carbs + fat;
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };

  return {
    protein: Math.round((protein / total) * 100),
    carbs: Math.round((carbs / total) * 100),
    fat: Math.round((fat / total) * 100),
  };
};

export const getCalorieRangeColor = (current: number, goal: number): string => {
  const percentage = (current / goal) * 100;

  if (percentage < 80) return '#10B981'; // Green - under goal
  if (percentage < 100) return '#F59E0B'; // Amber - near goal
  if (percentage < 110) return '#F97316'; // Orange - slightly over
  return '#EF4444'; // Red - significantly over
};

export const getDietaryTagColor = (tag: DietaryTag): string => {
  const colors: Record<DietaryTag, string> = {
    vegan: '#22C55E',
    vegetarian: '#84CC16',
    'gluten-free': '#F59E0B',
    'dairy-free': '#06B6D4',
    keto: '#8B5CF6',
    'low-carb': '#EC4899',
    'high-protein': '#EF4444',
    'low-calorie': '#10B981',
    paleo: '#F97316',
    halal: '#14B8A6',
    kosher: '#6366F1',
  };
  return colors[tag] || '#6B7280';
};

export const DIETARY_TAG_ICONS: Record<DietaryTag, string> = {
  vegan: '🌱',
  vegetarian: '🥬',
  'gluten-free': '🌾',
  'dairy-free': '🥛',
  keto: '🥑',
  'low-carb': '⚡',
  'high-protein': '💪',
  'low-calorie': '🍃',
  paleo: '🦴',
  halal: '☪️',
  kosher: '✡️',
};
