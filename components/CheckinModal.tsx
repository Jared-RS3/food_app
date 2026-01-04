import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { checkinService } from '@/services/checkinService';
import type { CheckinData } from '@/types/gamification';

const { width, height } = Dimensions.get('window');

interface CheckinModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
  userId: string;
  userLocation: {
    latitude: number;
    longitude: number;
  };
  onSuccess?: (xpEarned: number, levelUp?: boolean, newLevel?: number) => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({
  visible,
  onClose,
  restaurantId,
  restaurantName,
  userId,
  userLocation,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [calories, setCalories] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);
  const xpPreviewScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      xpPreviewScale.value = withSpring(1, { damping: 12 });
    }
  }, [visible]);

  const estimatedXP = () => {
    // Base XP calculation
    let xp = 10; // Base XP
    if (rating >= 4) xp += 10; // Bonus for good ratings
    return xp;
  };

  const handleCheckin = async () => {
    setLoading(true);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    try {
      const checkinData: CheckinData = {
        restaurant_id: restaurantId,
        location_lat: userLocation.latitude,
        location_lng: userLocation.longitude,
        rating: rating > 0 ? rating : undefined,
        calories_consumed: calories ? parseInt(calories) : undefined,
        amount_spent: amountSpent ? parseFloat(amountSpent) : undefined,
        user_notes: notes || undefined,
      };

      const result = await checkinService.checkin(userId, checkinData);

      if (result.success && result.xpReward) {
        // Success animation
        runOnJS(handleSuccess)(
          result.xpReward.total_xp,
          result.levelUp,
          result.newLevel
        );
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (xpEarned: number, levelUp?: boolean, newLevel?: number) => {
    onSuccess?.(xpEarned, levelUp, newLevel);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setRating(0);
    setCalories('');
    setAmountSpent('');
    setNotes('');
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const xpPreviewAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpPreviewScale.value }],
    opacity: xpPreviewScale.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handleBar} />
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Check In</Text>
                <Text style={styles.restaurantName}>{restaurantName}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* XP Preview Card */}
              <Animated.View style={[styles.xpPreviewCard, xpPreviewAnimatedStyle]}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.xpPreviewGradient}
                >
                  <Ionicons name="star" size={32} color="#FFF" />
                  <View style={styles.xpPreviewText}>
                    <Text style={styles.xpPreviewLabel}>Estimated XP</Text>
                    <Text style={styles.xpPreviewValue}>+{estimatedXP()}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Rating Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How was your experience?</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={40}
                        color={star <= rating ? '#FBBF24' : '#475569'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Calories Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Calories Consumed 🍽️</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="fitness-outline" size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter calories (optional)"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    value={calories}
                    onChangeText={setCalories}
                  />
                </View>
              </View>

              {/* Amount Spent Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Amount Spent 💰</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount (optional)"
                    placeholderTextColor="#475569"
                    keyboardType="decimal-pad"
                    value={amountSpent}
                    onChangeText={setAmountSpent}
                  />
                </View>
              </View>

              {/* Notes Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add Notes 📝</Text>
                <View style={[styles.inputContainer, styles.notesInput]}>
                  <TextInput
                    style={[styles.input, styles.notesTextInput]}
                    placeholder="What did you try? Any recommendations?"
                    placeholderTextColor="#475569"
                    multiline
                    numberOfLines={4}
                    value={notes}
                    onChangeText={setNotes}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Info Cards */}
              <View style={styles.infoCards}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoIcon}>🔥</Text>
                  <Text style={styles.infoText}>Keep your streak alive!</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoIcon}>🗺️</Text>
                  <Text style={styles.infoText}>Clear fog of war</Text>
                </View>
              </View>
            </ScrollView>

            {/* Check In Button */}
            <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
              <TouchableOpacity
                onPress={handleCheckin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.checkinButton}
                >
                  {loading ? (
                    <Text style={styles.checkinButtonText}>Checking in...</Text>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                      <Text style={styles.checkinButtonText}>
                        Check In & Earn +{estimatedXP()} XP
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: height * 0.9,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  xpPreviewCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  xpPreviewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  xpPreviewText: {
    flex: 1,
  },
  xpPreviewLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  xpPreviewValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  starButton: {
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  notesTextInput: {
    minHeight: 80,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  checkinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkinButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
