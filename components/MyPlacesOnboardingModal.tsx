import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { X, Star, Heart, Bookmark, ArrowRight, ChevronRight } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface MyPlacesOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  actionType: 'favorite' | 'mustTry' | 'collection';
  collectionName?: string;
}

export const MyPlacesOnboardingModal: React.FC<MyPlacesOnboardingModalProps> = ({
  visible,
  onClose,
  actionType,
  collectionName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const progressWidth = useSharedValue(0);

  const steps = [
    {
      title: '🎉 Great Choice!',
      description: actionType === 'favorite' 
        ? "You've added this restaurant to your favorites!"
        : actionType === 'mustTry'
        ? "You've marked this as a must-try restaurant!"
        : `You've added this to "${collectionName}" collection!`,
      icon: actionType === 'favorite' ? Heart : actionType === 'mustTry' ? Star : Bookmark,
      color: actionType === 'favorite' ? '#FF6B6B' : actionType === 'mustTry' ? '#FFB800' : theme.colors.primary,
    },
    {
      title: '📍 Find It in My Places',
      description: 'All your saved restaurants live in the "My Places" tab at the bottom of your screen.',
      icon: Bookmark,
      color: theme.colors.primary,
    },
    {
      title: '🗂️ Three Ways to Organize',
      description: 'In My Places, tap "Favourites" to see your saved restaurants organized in three tabs:',
      icon: null,
      color: theme.colors.primary,
      showTabs: true,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      progressWidth.value = withSpring(((currentStep + 1) / steps.length) * 100);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeInUp.duration(400)}
          style={styles.modalContainer}
        >
          {/* Close Button */}
          <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { backgroundColor: currentStepData.color },
                  progressStyle,
                ]}
              />
            </View>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Icon */}
            {IconComponent && (
              <Animated.View 
                entering={FadeInDown.delay(200)}
                style={[
                  styles.iconCircle,
                  { backgroundColor: `${currentStepData.color}15` }
                ]}
              >
                <IconComponent 
                  size={48} 
                  color={currentStepData.color}
                  strokeWidth={2}
                />
              </Animated.View>
            )}

            {/* Title */}
            <Animated.Text 
              entering={FadeInDown.delay(300)}
              style={styles.title}
            >
              {currentStepData.title}
            </Animated.Text>

            {/* Description */}
            <Animated.Text 
              entering={FadeInDown.delay(400)}
              style={styles.description}
            >
              {currentStepData.description}
            </Animated.Text>

            {/* Three Tabs Explanation */}
            {currentStepData.showTabs && (
              <Animated.View 
                entering={FadeInDown.delay(500)}
                style={styles.tabsContainer}
              >
                {/* All Tab */}
                <View style={styles.tabCard}>
                  <View style={[styles.tabIcon, { backgroundColor: '#F0F9FF' }]}>
                    <Bookmark size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.tabTitle}>All</Text>
                  <Text style={styles.tabDescription}>
                    See all your saved restaurants in one place
                  </Text>
                </View>

                {/* Must Try Tab */}
                <View style={[styles.tabCard, actionType === 'mustTry' && styles.tabCardHighlight]}>
                  <View style={[styles.tabIcon, { backgroundColor: '#FFF4E6' }]}>
                    <Star size={24} color="#FFB800" fill={actionType === 'mustTry' ? '#FFB800' : 'transparent'} />
                  </View>
                  <Text style={styles.tabTitle}>Must Try</Text>
                  <Text style={styles.tabDescription}>
                    High-priority places you want to visit soon
                  </Text>
                  {actionType === 'mustTry' && (
                    <View style={styles.youAreHereBadge}>
                      <Text style={styles.youAreHereText}>Your restaurant is here! 👆</Text>
                    </View>
                  )}
                </View>

                {/* Collections Tab */}
                <View style={[styles.tabCard, actionType === 'collection' && styles.tabCardHighlight]}>
                  <View style={[styles.tabIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Bookmark size={24} color="#10B981" fill={actionType === 'collection' ? '#10B981' : 'transparent'} />
                  </View>
                  <Text style={styles.tabTitle}>Collections</Text>
                  <Text style={styles.tabDescription}>
                    Organize by themes: Date Night, Italian, etc.
                  </Text>
                  {actionType === 'collection' && (
                    <View style={styles.youAreHereBadge}>
                      <Text style={styles.youAreHereText}>In "{collectionName}" 👆</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            )}

            {/* Navigation Hint */}
            {currentStep === steps.length - 1 && (
              <Animated.View 
                entering={FadeInDown.delay(600)}
                style={styles.navigationHint}
              >
                <View style={styles.hintCard}>
                  <Text style={styles.hintTitle}>💡 Quick Tip</Text>
                  <Text style={styles.hintText}>
                    Look for the <Text style={styles.hintBold}>"My Places"</Text> tab at the bottom of your screen.
                  </Text>
                  <Text style={styles.hintText}>
                    Then tap <Text style={styles.hintBold}>"Favourites"</Text> at the top to see your saved restaurants!
                  </Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>
                {currentStep === steps.length - 1 ? 'Got it!' : 'Skip'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextText}>
                  {currentStep === steps.length - 1 ? 'Go to My Places' : 'Next'}
                </Text>
                {currentStep === steps.length - 1 ? (
                  <ChevronRight size={20} color="#fff" />
                ) : (
                  <ArrowRight size={20} color="#fff" />
                )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    maxHeight: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  tabsContainer: {
    gap: 16,
  },
  tabCard: {
    padding: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  tabCardHighlight: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F9FF',
    ...theme.shadows.sm,
  },
  tabIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  tabDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  youAreHereBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  youAreHereText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  navigationHint: {
    marginTop: 24,
  },
  hintCard: {
    padding: 20,
    backgroundColor: '#FFF4E6',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  hintBold: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  nextButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
