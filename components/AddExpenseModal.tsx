import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { hapticLight, hapticSuccess } from '@/utils/helpers';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DollarSign, FileText, X } from 'lucide-react-native';
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

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    category: string,
    amount: number,
    description: string,
    date: string
  ) => void;
}

const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food', emoji: '🍔', color: '#FF6B9D' },
  { key: 'restaurants', label: 'Restaurants', emoji: '🍽️', color: '#8B5CF6' },
  { key: 'drinks', label: 'Drinks', emoji: '🍹', color: '#06B6D4' },
  { key: 'groceries', label: 'Groceries', emoji: '🛒', color: '#10B981' },
  { key: 'takeout', label: 'Takeout', emoji: '🥡', color: '#F59E0B' },
  { key: 'other', label: 'Other', emoji: '💰', color: '#6B7280' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

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

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    hapticSuccess();
    onSave(selectedCategory, numAmount, description.trim(), date);
    handleClose();
  };

  const handleClose = () => {
    setSelectedCategory('');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
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
            colors={['#8B5CF6', '#A78BFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.title}>Add Expense</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={COLORS.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoriesGrid}>
              {EXPENSE_CATEGORIES.map((cat, index) => (
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
                      selectedCategory === cat.key && {
                        backgroundColor: `${cat.color}15`,
                      },
                    ]}
                    onPress={() => {
                      hapticLight();
                      setSelectedCategory(cat.key);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <Animated.View entering={FadeInDown.delay(300)}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={COLORS.gray?.[400] || '#9CA3AF'} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.gray?.[400] || '#9CA3AF'}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <Text style={styles.currency}>ZAR</Text>
              </View>

              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.inputContainer}>
                <FileText size={20} color={COLORS.gray?.[400] || '#9CA3AF'} />
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="What did you buy?"
                  placeholderTextColor={COLORS.gray?.[400] || '#9CA3AF'}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <Text style={styles.sectionTitle}>Date</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color={COLORS.gray?.[400] || '#9CA3AF'} />
                <Text style={styles.dateText}>{date}</Text>
              </View>
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                !selectedCategory && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={!selectedCategory}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Add Expense</Text>
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
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    letterSpacing: -0.3,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryCard: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray?.[200] || '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardSelected: {
    borderWidth: 2.5,
    transform: [{ scale: 1.05 }],
  },
  categoryEmoji: {
    fontSize: FONT_SIZES.xl + 4,
    marginBottom: SPACING.xxs,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.xxs,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray?.[50] || '#F9FAFB',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.gray?.[200] || '#E5E7EB',
    marginBottom: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  descriptionInput: {
    minHeight: 44,
    textAlignVertical: 'top',
  },
  currency: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.gray?.[500] || '#6B7280',
  },
  dateText: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
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
  buttonDisabled: {
    opacity: 0.5,
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
