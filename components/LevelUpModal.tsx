import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface LevelUpModalProps {
  visible: boolean;
  onClose: () => void;
  level: number;
  xpEarned: number;
  rewards?: string[];
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  onClose,
  level,
  xpEarned,
  rewards = ['New achievements unlocked', 'Exclusive restaurant access', 'Bonus XP multiplier'],
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Animate level badge
      scale.value = withSpring(1, {
        damping: 8,
        stiffness: 100,
      });

      rotation.value = withSequence(
        withDelay(200, withSpring(10, { damping: 2 })),
        withSpring(-10, { damping: 2 }),
        withSpring(0, { damping: 2 })
      );

      // Animate rewards badges
      badgeScale.value = withDelay(
        600,
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    } else {
      scale.value = 0;
      badgeScale.value = 0;
    }
  }, [visible]);

  const levelBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const rewardBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
        <BlurView intensity={40} style={StyleSheet.absoluteFill} />

        <View style={styles.modalContainer}>
          {/* Level Badge */}
          <Animated.View entering={ZoomIn.delay(100).springify()} style={levelBadgeStyle}>
            <LinearGradient
              colors={['#FBBF24', '#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.levelBadge}
            >
              <Text style={styles.levelBadgeTitle}>LEVEL UP!</Text>
              <Text style={styles.levelBadgeNumber}>{level}</Text>
              <View style={styles.levelBadgeGlow} />
            </LinearGradient>
          </Animated.View>

          {/* Congratulations Text */}
          <Animated.View entering={FadeIn.delay(400)}>
            <Text style={styles.congratsText}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.xpText}>+{xpEarned} XP Earned</Text>
          </Animated.View>

          {/* Rewards Section */}
          <Animated.View style={[styles.rewardsContainer, rewardBadgeStyle]}>
            <Text style={styles.rewardsTitle}>New Unlocks</Text>
            {rewards.map((reward, index) => (
              <Animated.View
                key={index}
                entering={FadeIn.delay(700 + index * 100).springify()}
                style={styles.rewardItem}
              >
                <LinearGradient
                  colors={['#1E293B', '#334155']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.rewardItemGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.rewardText}>{reward}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeIn.delay(1000)}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>Continue Exploring</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: '#0F172A',
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  levelBadge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  levelBadgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2,
  },
  levelBadgeNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: -8,
  },
  levelBadgeGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FBBF24',
    opacity: 0.5,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
    zIndex: -1,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 32,
  },
  rewardsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  rewardItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rewardText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
