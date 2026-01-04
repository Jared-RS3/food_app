// TypeScript types for onboarding flow

export interface OnboardingPreferences {
  userId: string;
  dietaryRestrictions: string[];
  foodMood: string;
  favoriteCategories: string[];
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  onboardingComplete: boolean;
  completedAt: Date;
}

export interface DietaryOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export interface FoodMood {
  id: string;
  label: string;
  emoji: string;
  description: string;
  gradient: string[];
}

export interface FoodCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export interface OnboardingStep {
  step: number;
  totalSteps: number;
  canSkip: boolean;
  canGoBack: boolean;
}
