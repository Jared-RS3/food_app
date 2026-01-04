import { BORDER_RADIUS, COLORS, SPACING } from '@/constants';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Apple,
  Beef,
  Coffee,
  Fish,
  Heart,
  Leaf,
  Pizza,
  Salad,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export interface UserPreferences {
  dietary_restrictions: string[];
  food_mood: string;
  favorite_categories: string[];
  budget_preference: string;
}

interface PreferencesSurveyProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip?: () => void;
  initialPreferences?: Partial<UserPreferences>;
}

const DIETARY_OPTIONS = [
  { id: 'none', label: 'No Restrictions', icon: UtensilsCrossed },
  { id: 'vegetarian', label: 'Vegetarian', icon: Leaf },
  { id: 'vegan', label: 'Vegan', icon: Salad },
  { id: 'pescatarian', label: 'Pescatarian', icon: Fish },
  { id: 'gluten-free', label: 'Gluten-Free', icon: Apple },
  { id: 'halal', label: 'Halal', icon: Beef },
];

const FOOD_MOODS = [
  {
    id: 'adventurous',
    label: 'Adventurous',
    emoji: '🌶️',
    description: 'Love trying new cuisines',
  },
  {
    id: 'comfort',
    label: 'Comfort',
    emoji: '🍕',
    description: 'Classic favorites',
  },
  {
    id: 'healthy',
    label: 'Healthy',
    emoji: '🥗',
    description: 'Nutritious options',
  },
  {
    id: 'indulgent',
    label: 'Indulgent',
    emoji: '🍰',
    description: 'Treat yourself',
  },
];

const CUISINE_CATEGORIES = [
  { id: 'italian', label: 'Italian', icon: Pizza },
  { id: 'asian', label: 'Asian', icon: Coffee },
  { id: 'seafood', label: 'Seafood', icon: Fish },
  { id: 'american', label: 'American', icon: Beef },
  { id: 'healthy', label: 'Healthy', icon: Salad },
  { id: 'desserts', label: 'Desserts', icon: Heart },
];

const BUDGET_OPTIONS = [
  {
    id: 'budget',
    label: 'Budget Friendly',
    emoji: '💰',
    description: 'R50-150 per person',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    emoji: '💳',
    description: 'R150-300 per person',
  },
  {
    id: 'premium',
    label: 'Premium',
    emoji: '💎',
    description: 'R300+ per person',
  },
  {
    id: 'flexible',
    label: 'Flexible',
    emoji: '✨',
    description: 'Depends on the occasion',
  },
];

export default function PreferencesSurvey({
  onComplete,
  onSkip,
  initialPreferences,
}: PreferencesSurveyProps) {
  const [step, setStep] = useState(1);
  const [dietary, setDietary] = useState<string[]>(
    initialPreferences?.dietary_restrictions || []
  );
  const [foodMood, setFoodMood] = useState<string>(
    initialPreferences?.food_mood || ''
  );
  const [categories, setCategories] = useState<string[]>(
    initialPreferences?.favorite_categories || []
  );
  const [budget, setBudget] = useState<string>(
    initialPreferences?.budget_preference || ''
  );

  const totalSteps = 4;

  const toggleDietary = (id: string) => {
    if (id === 'none') {
      setDietary([]);
    } else {
      setDietary((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    const preferences: UserPreferences = {
      dietary_restrictions: dietary.length === 0 ? ['none'] : dietary,
      food_mood: foodMood || 'comfort',
      favorite_categories: categories.length === 0 ? ['italian'] : categories,
      budget_preference: budget || 'flexible',
    };

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            dietary_restrictions: preferences.dietary_restrictions,
            food_mood: preferences.food_mood,
            favorite_categories: preferences.favorite_categories,
            budget_preference: preferences.budget_preference,
            onboarding_complete: true,
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
      }

      onComplete(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Could not save preferences. Please try again.');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true; // dietary can be empty (none)
      case 2:
        return foodMood !== '';
      case 3:
        return categories.length > 0;
      case 4:
        return budget !== '';
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Any Dietary Restrictions?</Text>
            <Text style={styles.stepSubtitle}>
              Select all that apply (or skip if none)
            </Text>

            <View style={styles.optionsGrid}>
              {DIETARY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected =
                  dietary.includes(option.id) ||
                  (option.id === 'none' && dietary.length === 0);
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => toggleDietary(option.id)}
                  >
                    <Icon
                      size={32}
                      color={isSelected ? COLORS.white : COLORS.primary}
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's Your Food Mood?</Text>
            <Text style={styles.stepSubtitle}>
              How do you like to explore food?
            </Text>

            <View style={styles.moodGrid}>
              {FOOD_MOODS.map((mood) => {
                const isSelected = foodMood === mood.id;
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodCard,
                      isSelected && styles.moodCardSelected,
                    ]}
                    onPress={() => setFoodMood(mood.id)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        isSelected && styles.moodLabelSelected,
                      ]}
                    >
                      {mood.label}
                    </Text>
                    <Text style={styles.moodDescription}>
                      {mood.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Favorite Cuisines?</Text>
            <Text style={styles.stepSubtitle}>
              Pick at least one (you can change this later)
            </Text>

            <View style={styles.optionsGrid}>
              {CUISINE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = categories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Icon
                      size={32}
                      color={isSelected ? COLORS.white : COLORS.primary}
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's Your Budget?</Text>
            <Text style={styles.stepSubtitle}>
              Help us recommend places that fit
            </Text>

            <View style={styles.budgetGrid}>
              {BUDGET_OPTIONS.map((option) => {
                const isSelected = budget === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.budgetCard,
                      isSelected && styles.budgetCardSelected,
                    ]}
                    onPress={() => setBudget(option.id)}
                  >
                    <Text style={styles.budgetEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.budgetLabel,
                        isSelected && styles.budgetLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.budgetDescription}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8FAE', '#FFA6BE']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Sparkles size={32} color={COLORS.white} />
          <Text style={styles.headerTitle}>Your Food Preferences</Text>
          <Text style={styles.headerSubtitle}>
            Step {step} of {totalSteps}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(step / totalSteps) * 100}%` },
            ]}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {onSkip && step === 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
              step === 1 && onSkip && styles.nextButtonFull,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>
              {step === totalSteps ? 'Complete' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xl,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  optionCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: COLORS.white,
  },
  moodGrid: {
    gap: SPACING.md,
  },
  moodCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moodCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  moodLabelSelected: {
    color: COLORS.white,
  },
  moodDescription: {
    fontSize: 13,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  budgetGrid: {
    gap: SPACING.md,
  },
  budgetCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  budgetEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  budgetLabelSelected: {
    color: COLORS.white,
  },
  budgetDescription: {
    fontSize: 12,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    backgroundColor: COLORS.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  backButton: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[700],
  },
  skipButton: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[700],
  },
  nextButton: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  nextButtonFull: {
    flex: 2,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
