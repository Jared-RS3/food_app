import { COLORS, SPACING } from '@/constants';
import { theme } from '@/constants/theme';
import { X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'removable';
}

export default function FilterChip({
  label,
  active = false,
  onPress,
  onRemove,
  variant = 'default',
}: FilterChipProps) {
  // Use new props if provided, fallback to old props for compatibility
  const displayText = label;
  const isActive = active;

  return (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.activeChip]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterText, isActive && styles.activeText]}>
        {displayText}
      </Text>
      {variant === 'removable' && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <X size={14} color={COLORS.gray[500]} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  activeText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: SPACING.xs,
    padding: 2,
  },
});
