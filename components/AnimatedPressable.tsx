import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleDown?: number;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass?: number;
  };
  enableScale?: boolean;
  enableOpacity?: boolean;
  opacityValue?: number;
}

/**
 * Airbnb-style animated pressable component
 * Provides smooth scale and opacity feedback on press
 */
export default function AnimatedPressable({
  children,
  style,
  scaleDown = 0.97,
  springConfig = theme.animation.spring.snappy,
  enableScale = true,
  enableOpacity = true,
  opacityValue = 0.9,
  ...pressableProps
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: enableScale ? [{ scale: scale.value }] : [],
      opacity: enableOpacity ? opacity.value : 1,
    };
  });

  const handlePressIn = () => {
    if (enableScale) {
      scale.value = withSpring(scaleDown, springConfig);
    }
    if (enableOpacity) {
      opacity.value = withTiming(opacityValue, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (enableScale) {
      scale.value = withSpring(1, springConfig);
    }
    if (enableOpacity) {
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  return (
    <Pressable
      {...pressableProps}
      onPressIn={(e) => {
        handlePressIn();
        pressableProps.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        handlePressOut();
        pressableProps.onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
