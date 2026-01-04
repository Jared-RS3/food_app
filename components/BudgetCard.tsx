import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface BudgetCardProps {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  onPress: () => void;
  index?: number;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  category,
  limit,
  spent,
  remaining,
  percentage,
  onPress,
  index = 0,
}) => {
  const isOverBudget = spent > limit;
  const isWarning = percentage >= 80 && percentage < 100;
  const isGood = percentage < 80;

  const getStatusColor = () => {
    if (isOverBudget) return COLORS.error || '#EF4444';
    if (isWarning) return COLORS.warning || '#F59E0B';
    return COLORS.success || '#10B981';
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertCircle size={20} color={COLORS.white} />;
    if (isWarning) return <TrendingUp size={20} color={COLORS.white} />;
    return <TrendingDown size={20} color={COLORS.white} />;
  };

  const getCategoryEmoji = (cat: string) => {
    const emojis: { [key: string]: string } = {
      food: '🍔',
      restaurants: '🍽️',
      drinks: '🍹',
      groceries: '🛒',
      takeout: '🥡',
      other: '💰',
    };
    return emojis[cat.toLowerCase()] || '💰';
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={
            isOverBudget ? ['#EF4444', '#DC2626'] : ['#FFFFFF', '#F9FAFB']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.categoryInfo}>
              <Text style={[styles.emoji, isOverBudget && styles.whiteText]}>
                {getCategoryEmoji(category)}
              </Text>
              <Text
                style={[styles.categoryName, isOverBudget && styles.whiteText]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              {getStatusIcon()}
            </View>
          </View>

          <View style={styles.amounts}>
            <View style={styles.amountRow}>
              <Text
                style={[styles.amountLabel, isOverBudget && styles.whiteText]}
              >
                Spent
              </Text>
              <Text
                style={[styles.amountValue, isOverBudget && styles.whiteText]}
              >
                R{spent.toFixed(2)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text
                style={[styles.amountLabel, isOverBudget && styles.whiteText]}
              >
                {isOverBudget ? 'Over by' : 'Remaining'}
              </Text>
              <Text
                style={[
                  styles.amountValue,
                  isOverBudget && styles.whiteText,
                  isOverBudget && styles.boldText,
                ]}
              >
                R{Math.abs(remaining).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                isOverBudget && styles.progressBarOverBudget,
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: getStatusColor(),
                  },
                ]}
              />
            </View>
            <Text
              style={[styles.percentageText, isOverBudget && styles.whiteText]}
            >
              {percentage.toFixed(0)}%
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.limitText, isOverBudget && styles.whiteText]}>
              Budget: R{limit.toFixed(2)}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  gradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray?.[100] || '#F3F4F6',
    borderRadius: BORDER_RADIUS.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emoji: {
    fontSize: FONT_SIZES.xxl,
  },
  categoryName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  amounts: {
    marginBottom: SPACING.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  amountLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray?.[200] || '#E5E7EB',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarOverBudget: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  percentageText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    width: 45,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  whiteText: {
    color: COLORS.white,
  },
  boldText: {
    fontWeight: '900',
  },
});
