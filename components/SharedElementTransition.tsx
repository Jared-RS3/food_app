import React, { useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';
import AnimatedPressable from './AnimatedPressable';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SharedElementTransitionProps {
  children: React.ReactNode;
  onPress: () => void;
  destinationRoute?: string;
  style?: any;
  enabled?: boolean;
}

/**
 * Airbnb-style shared element transition
 * Card expands from its position to full screen
 */
export default function SharedElementTransition({
  children,
  onPress,
  destinationRoute,
  style,
  enabled = true,
}: SharedElementTransitionProps) {
  const cardRef = useRef<View>(null);

  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const borderRadius = useSharedValue(theme.borderRadius.md);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      borderRadius: borderRadius.value,
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    if (!enabled) {
      onPress();
      return;
    }

    // Measure card position
    cardRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // Calculate scale to fill screen
      const scaleX = SCREEN_WIDTH / width;
      const scaleY = SCREEN_HEIGHT / height;
      const finalScale = Math.max(scaleX, scaleY);

      // Calculate translation to center
      const centerX = SCREEN_WIDTH / 2 - (pageX + width / 2);
      const centerY = SCREEN_HEIGHT / 2 - (pageY + height / 2);

      // Start animation
      // Phase 1: Scale up slightly and fade
      scale.value = withSpring(1.02, {
        damping: 20,
        stiffness: 300,
      });

      // Phase 2: Expand to full screen
      setTimeout(() => {
        'worklet';
        scale.value = withTiming(finalScale, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        translateX.value = withTiming(centerX, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        translateY.value = withTiming(centerY, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        borderRadius.value = withTiming(0, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        // Navigate after animation starts
        setTimeout(() => {
          runOnJS(onPress)();
        }, 150);
      }, 100);
    });
  };

  return (
    <View ref={cardRef} style={style}>
      <AnimatedPressable
        onPress={handlePress}
        scaleDown={0.98}
        enableOpacity={false}
      >
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Add any custom styles here
});
