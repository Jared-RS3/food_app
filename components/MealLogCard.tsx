import { Clock, Edit, MapPin, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MealLog } from '../types/nutrition';
import { NutritionCard } from './NutritionCard';

interface MealLogCardProps {
  mealLog: MealLog;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const MealLogCard: React.FC<MealLogCardProps> = ({
  mealLog,
  onDelete,
  onEdit,
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMealTypeColor = (type: string) => {
    const colors = {
      breakfast: '#F59E0B',
      lunch: '#EF4444',
      dinner: '#8B5CF6',
      snack: '#3B82F6',
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const getMealTypeEmoji = (type: string) => {
    const emojis = {
      breakfast: '☀️',
      lunch: '🍎',
      dinner: '🌙',
      snack: '☕',
    };
    return emojis[type as keyof typeof emojis] || '🍽️';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.mealTypeBadge,
              { backgroundColor: getMealTypeColor(mealLog.mealType) + '20' },
            ]}
          >
            <Text style={styles.mealTypeEmoji}>
              {getMealTypeEmoji(mealLog.mealType)}
            </Text>
            <Text
              style={[
                styles.mealTypeText,
                { color: getMealTypeColor(mealLog.mealType) },
              ]}
            >
              {mealLog.mealType.charAt(0).toUpperCase() +
                mealLog.mealType.slice(1)}
            </Text>
          </View>
          <View style={styles.timeInfo}>
            <Clock size={14} color="#6B7280" strokeWidth={2.5} />
            <Text style={styles.timeText}>{formatTime(mealLog.timestamp)}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(mealLog.id)}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Edit size={18} color="#6B7280" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(mealLog.id)}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color="#EF4444" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Restaurant */}
      <View style={styles.restaurantInfo}>
        <MapPin size={16} color="#FF6B9D" strokeWidth={2.5} />
        <Text style={styles.restaurantName}>{mealLog.restaurantName}</Text>
      </View>

      {/* Items */}
      <View style={styles.itemsContainer}>
        {mealLog.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <NutritionCard
              nutrition={item.nutrition}
              dietaryTags={item.dietaryTags}
              compact
            />
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total</Text>
        <View style={styles.totalMacros}>
          <View style={styles.totalMacroItem}>
            <Text style={styles.totalMacroValue}>{mealLog.totalCalories}</Text>
            <Text style={styles.totalMacroLabel}>cal</Text>
          </View>
          <View style={styles.totalMacroDivider} />
          <View style={styles.totalMacroItem}>
            <Text style={styles.totalMacroValue}>{mealLog.totalProtein}g</Text>
            <Text style={styles.totalMacroLabel}>protein</Text>
          </View>
          <View style={styles.totalMacroDivider} />
          <View style={styles.totalMacroItem}>
            <Text style={styles.totalMacroValue}>{mealLog.totalCarbs}g</Text>
            <Text style={styles.totalMacroLabel}>carbs</Text>
          </View>
          <View style={styles.totalMacroDivider} />
          <View style={styles.totalMacroItem}>
            <Text style={styles.totalMacroValue}>{mealLog.totalFat}g</Text>
            <Text style={styles.totalMacroLabel}>fat</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      {mealLog.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesText}>{mealLog.notes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  mealTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mealTypeEmoji: {
    fontSize: 16,
  },
  mealTypeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: -0.2,
    flex: 1,
  },
  totalSection: {
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    gap: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  totalMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalMacroItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalMacroValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  totalMacroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },
  totalMacroDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  notesSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  notesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
});
