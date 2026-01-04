import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { hapticLight } from '@/utils/helpers';

interface OnboardingCardProps {
  label: string;
  emoji?: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  index: number;
  color?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function OnboardingCard({
  label,
  emoji,
  description,
  selected,
  onPress,
  index,
  color,
}: OnboardingCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    hapticLight();
    scale.value = withSpring(0.92, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(selected ? 1.03 : 1, {
      damping: 15,
      stiffness: 400,
    });
  };

  React.useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.03, {
        damping: 15,
        stiffness: 400,
      });
    } else {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      });
    }
  }, [selected]);

  return (
    <AnimatedTouchable
      entering={FadeIn.delay(index * 50).springify()}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        selected && styles.cardSelected,
        animatedStyle,
        selected && color && { borderColor: color, backgroundColor: `${color}15` },
      ]}
      activeOpacity={0.9}
    >
      {emoji && (
        <View
          style={[
            styles.emojiContainer,
            selected && color && { backgroundColor: `${color}25` },
          ]}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      {selected && (
        <Animated.View
          entering={FadeIn.springify()}
          style={[styles.checkmark, color && { backgroundColor: color }]}
        >
          <Text style={styles.checkmarkText}>✓</Text>
        </Animated.View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg + 4,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  labelSelected: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  description: {
    fontSize: FONT_SIZES.sm - 1,
    fontWeight: '500',
    color: COLORS.gray[500],
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
