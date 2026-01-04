import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface FloatingEmoji {
  emoji: string;
  x: number;
  delay: number;
}

const EMOJIS: FloatingEmoji[] = [
  { emoji: '🍕', x: width * 0.15, delay: 0 },
  { emoji: '🍣', x: width * 0.75, delay: 200 },
  { emoji: '🍔', x: width * 0.25, delay: 400 },
  { emoji: '☕', x: width * 0.85, delay: 600 },
  { emoji: '🍰', x: width * 0.45, delay: 800 },
  { emoji: '🌮', x: width * 0.65, delay: 1000 },
  { emoji: '🍜', x: width * 0.35, delay: 1200 },
  { emoji: '🥗', x: width * 0.55, delay: 1400 },
];

function FloatingEmojiItem({ emoji, x, delay }: FloatingEmoji) {
  const translateY = useSharedValue(height * 1.2);
  const rotate = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    // Float up animation
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, {
          duration: 15000 + Math.random() * 5000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    // Rotation animation
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {
          duration: 8000 + Math.random() * 4000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    // Horizontal sway
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(20, {
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: translateY.value > height * 0.8 ? 0 : 0.3,
  }));

  return (
    <Animated.View style={[styles.emojiContainer, { left: x }, animatedStyle]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
}

export default function FloatingEmojis() {
  return (
    <View style={styles.container} pointerEvents="none">
      {EMOJIS.map((item, index) => (
        <FloatingEmojiItem key={index} {...item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  emojiContainer: {
    position: 'absolute',
    bottom: 0,
  },
  emoji: {
    fontSize: 48,
  },
});
