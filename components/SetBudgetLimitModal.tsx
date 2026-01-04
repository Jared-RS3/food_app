import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SetBudgetLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budgets: { category: string; limit: number }[]) => void;
  existingLimits?: { category: string; limit: number }[];
}

const CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍔' },
  { key: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
  { key: 'drinks', label: 'Drinks', emoji: '🍹' },
  { key: 'groceries', label: 'Groceries', emoji: '🛒' },
  { key: 'takeout', label: 'Takeout', emoji: '🥡' },
  { key: 'other', label: 'Other', emoji: '💰' },
];

export const SetBudgetLimitModal: React.FC<SetBudgetLimitModalProps> = ({
  visible,
  onClose,
  onSave,
  existingLimits = [],
}) => {
  const [limits, setLimits] = useState<{ [key: string]: string }>(() => {
    const initial: { [key: string]: string } = {};
    CATEGORIES.forEach((cat) => {
      const existing = existingLimits.find((l) => l.category === cat.key);
      initial[cat.key] = existing ? existing.limit.toString() : '0';
    });
    return initial;
  });

  const handleSave = () => {
    const budgetsToSave: { category: string; limit: number }[] = [];
    CATEGORIES.forEach((cat) => {
      const limit = parseFloat(limits[cat.key] || '0');
      if (limit > 0) {
        budgetsToSave.push({ category: cat.key, limit });
      }
    });
    onSave(budgetsToSave);
    onClose();
  };

  const updateLimit = (category: string, value: string) => {
    setLimits((prev) => ({ ...prev, [category]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.modal}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Wallet size={28} color={COLORS.white} strokeWidth={2.5} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Set Budget Limits</Text>
                <Text style={styles.subtitle}>
                  Monthly spending limits per category
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {CATEGORIES.map((cat, index) => (
              <Animated.View
                key={cat.key}
                entering={FadeInDown.delay(300 + index * 50)}
                style={styles.categoryRow}
              >
                <View style={styles.categoryLeft}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>R</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.gray?.[400] || '#9CA3AF'}
                    keyboardType="decimal-pad"
                    value={limits[cat.key]}
                    onChangeText={(text) => updateLimit(cat.key, text)}
                  />
                </View>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Limits</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl + 8,
    borderTopRightRadius: BORDER_RADIUS.xxl + 8,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xl + 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
    marginTop: SPACING.xxs,
    opacity: 0.9,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.xl,
    maxHeight: 500,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray?.[50] || '#F9FAFB',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.gray?.[200] || '#E5E7EB',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  categoryEmoji: {
    fontSize: FONT_SIZES.xl + 4,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.gray?.[300] || '#D1D5DB',
    minWidth: 120,
  },
  currencySymbol: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.success,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray?.[100] || '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.gray?.[100] || '#F3F4F6',
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  saveButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
});
