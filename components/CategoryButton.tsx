import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CategoryButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

export default function CategoryButton({
  title,
  isActive,
  onPress,
}: CategoryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
      onPress={onPress}
    >
      <Text
        style={[styles.categoryText, isActive && styles.activeCategoryText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryChip: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: -0.3,
  },
  activeCategoryText: {
    color: COLORS.white,
    fontWeight: '800',
  },
});
