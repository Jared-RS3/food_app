import { Droplet, Drumstick, Flame, Wheat } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  DIETARY_TAG_ICONS,
  DietaryTag,
  getDietaryTagColor,
  NutritionInfo,
} from '../types/nutrition';

interface NutritionCardProps {
  nutrition: NutritionInfo;
  dietaryTags?: DietaryTag[];
  showDetailed?: boolean;
  compact?: boolean;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  nutrition,
  dietaryTags = [],
  showDetailed = false,
  compact = false,
}) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactCalories}>
          <Flame size={14} color="#EF4444" strokeWidth={2.5} />
          <Text style={styles.compactCaloriesText}>
            {nutrition.calories} cal
          </Text>
        </View>
        {dietaryTags.length > 0 && (
          <View style={styles.compactTags}>
            {dietaryTags.slice(0, 2).map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.compactTag,
                  { backgroundColor: getDietaryTagColor(tag) + '20' },
                ]}
              >
                <Text style={styles.compactTagText}>
                  {DIETARY_TAG_ICONS[tag]}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Calorie Display */}
      <View style={styles.calorieHeader}>
        <View style={styles.calorieMain}>
          <Flame size={32} color="#EF4444" strokeWidth={2.5} />
          <View style={styles.calorieInfo}>
            <Text style={styles.calorieValue}>{nutrition.calories}</Text>
            <Text style={styles.calorieLabel}>Calories</Text>
          </View>
        </View>
        <Text style={styles.servingSize}>{nutrition.servingSize}</Text>
      </View>

      {/* Macros Grid */}
      <View style={styles.macrosGrid}>
        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: '#EF444420' }]}>
            <Drumstick size={20} color="#EF4444" strokeWidth={2.5} />
          </View>
          <Text style={styles.macroValue}>{nutrition.protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>

        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: '#F59E0B20' }]}>
            <Wheat size={20} color="#F59E0B" strokeWidth={2.5} />
          </View>
          <Text style={styles.macroValue}>{nutrition.carbohydrates}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>

        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: '#8B5CF620' }]}>
            <Droplet size={20} color="#8B5CF6" strokeWidth={2.5} />
          </View>
          <Text style={styles.macroValue}>{nutrition.fat}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>

      {/* Detailed Nutrition */}
      {showDetailed && (
        <View style={styles.detailedSection}>
          <View style={styles.detailedRow}>
            <Text style={styles.detailedLabel}>Fiber</Text>
            <Text style={styles.detailedValue}>{nutrition.fiber}g</Text>
          </View>
          <View style={styles.detailedRow}>
            <Text style={styles.detailedLabel}>Sugar</Text>
            <Text style={styles.detailedValue}>{nutrition.sugar}g</Text>
          </View>
          <View style={styles.detailedRow}>
            <Text style={styles.detailedLabel}>Sodium</Text>
            <Text style={styles.detailedValue}>{nutrition.sodium}mg</Text>
          </View>
          {nutrition.saturatedFat && (
            <View style={styles.detailedRow}>
              <Text style={styles.detailedLabel}>Saturated Fat</Text>
              <Text style={styles.detailedValue}>
                {nutrition.saturatedFat}g
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Dietary Tags */}
      {dietaryTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {dietaryTags.map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tag,
                {
                  backgroundColor: getDietaryTagColor(tag) + '20',
                  borderColor: getDietaryTagColor(tag),
                },
              ]}
            >
              <Text style={styles.tagIcon}>{DIETARY_TAG_ICONS[tag]}</Text>
              <Text
                style={[styles.tagText, { color: getDietaryTagColor(tag) }]}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact Styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactCalories: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactCaloriesText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: -0.3,
  },
  compactTags: {
    flexDirection: 'row',
    gap: 4,
  },
  compactTag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTagText: {
    fontSize: 12,
  },

  // Full Styles
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  calorieHeader: {
    marginBottom: 20,
  },
  calorieMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  calorieInfo: {
    flex: 1,
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -1,
  },
  calorieLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.3,
  },
  servingSize: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  macroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  detailedSection: {
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  detailedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  detailedValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  tagIcon: {
    fontSize: 14,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
