import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { hapticLight, hapticSuccess } from '@/utils/helpers';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, DollarSign, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (category: string, amount: number) => void;
  existingBudgets?: { category: string; limit: number }[];
}

const BUDGET_CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍔', color: '#FF6B9D' },
  { key: 'restaurants', label: 'Restaurants', emoji: '🍽️', color: '#8B5CF6' },
  { key: 'drinks', label: 'Drinks', emoji: '🍹', color: '#06B6D4' },
  { key: 'groceries', label: 'Groceries', emoji: '🛒', color: '#10B981' },
  { key: 'takeout', label: 'Takeout', emoji: '🥡', color: '#F59E0B' },
  { key: 'other', label: 'Other', emoji: '💰', color: '#6B7280' },
];

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  visible,
  onClose,
  onSave,
  existingBudgets = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const handleCategorySelect = (category: string) => {
    hapticLight();
    setSelectedCategory(category);

    // Pre-fill with existing budget if available
    const existing = existingBudgets.find((b) => b.category === category);
    if (existing) {
      setAmount(existing.limit.toString());
    } else {
      setAmount('');
    }
  };

  const handleSave = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    hapticSuccess();
    onSave(selectedCategory, numAmount);
    handleClose();
  };

  const handleClose = () => {
    setSelectedCategory('');
    setAmount('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.duration(300)} style={styles.modal}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8FAE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.title}>Set Budget</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={COLORS.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Select Category</Text>
            <View style={styles.categoriesGrid}>
              {BUDGET_CATEGORIES.map((cat, index) => (
                <Animated.View
                  key={cat.key}
                  entering={FadeInDown.delay(index * 50)}
                >
                  <TouchableOpacity
                    style={[
                      styles.categoryCard,
                      selectedCategory === cat.key &&
                        styles.categoryCardSelected,
                      { borderColor: cat.color },
                    ]}
                    onPress={() => handleCategorySelect(cat.key)}
                    activeOpacity={0.7}
                  >
                    {selectedCategory === cat.key && (
                      <View
                        style={[
                          styles.checkBadge,
                          { backgroundColor: cat.color },
                        ]}
                      >
                        <Check size={16} color={COLORS.white} strokeWidth={3} />
                      </View>
                    )}
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    {existingBudgets.find((b) => b.category === cat.key) && (
                      <Text style={styles.existingBudgetText}>
                        R
                        {
                          existingBudgets.find((b) => b.category === cat.key)
                            ?.limit
                        }
                      </Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {selectedCategory && (
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={styles.amountSection}
              >
                <Text style={styles.sectionTitle}>Monthly Budget</Text>
                <View style={styles.inputContainer}>
                  <DollarSign
                    size={20}
                    color={COLORS.gray?.[400] || '#9CA3AF'}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.gray?.[400] || '#9CA3AF'}
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                  />
                  <Text style={styles.currency}>ZAR</Text>
                </View>

                <View style={styles.quickAmounts}>
                  <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
                  <View style={styles.quickAmountsRow}>
                    {[500, 1000, 2000, 5000].map((quick) => (
                      <TouchableOpacity
                        key={quick}
                        style={styles.quickAmountButton}
                        onPress={() => {
                          hapticLight();
                          setAmount(quick.toString());
                        }}
                      >
                        <Text style={styles.quickAmountText}>R{quick}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {selectedCategory && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <LinearGradient
                  colors={['#FF6B9D', '#FF8FAE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Budget</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xl + 8,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.8,
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
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  categoryCard: {
    width: 100,
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg + 4,
    borderWidth: 2,
    borderColor: COLORS.gray?.[200] || '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    position: 'relative',
  },
  categoryCardSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  categoryEmoji: {
    fontSize: FONT_SIZES.xxxl,
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  existingBudgetText: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xxs,
  },
  amountSection: {
    marginTop: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray?.[50] || '#F9FAFB',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gray?.[200] || '#E5E7EB',
    marginBottom: SPACING.lg,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: SPACING.sm,
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.gray?.[500] || '#6B7280',
  },
  quickAmounts: {
    marginBottom: SPACING.xl,
  },
  quickAmountsLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.gray?.[100] || '#F3F4F6',
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gray?.[200] || '#E5E7EB',
  },
  quickAmountText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray?.[100] || '#F3F4F6',
  },
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: COLORS.gray?.[100] || '#F3F4F6',
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
