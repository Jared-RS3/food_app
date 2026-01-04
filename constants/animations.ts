import {
  Easing,
  SharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Airbnb-style spring configs
export const springs = {
  // Smooth, friendly bounce - Airbnb's signature feel
  smooth: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  // Snappy response for buttons
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  },
  // Bouncy for cards and modals
  bouncy: {
    damping: 12,
    stiffness: 200,
    mass: 0.6,
  },
  // Gentle for subtle movements
  gentle: {
    damping: 25,
    stiffness: 120,
    mass: 1,
  },
  // Playful for success states
  playful: {
    damping: 10,
    stiffness: 250,
    mass: 0.7,
  },
};

// Timing configs
export const timings = {
  fast: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
  },
  normal: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  slow: {
    duration: 500,
    easing: Easing.out(Easing.cubic),
  },
  elastic: {
    duration: 400,
    easing: Easing.elastic(1.2),
  },
};

// Card press animation - Airbnb style
export const cardPressAnimation = {
  scale: 0.97,
  opacity: 0.95,
  spring: springs.snappy,
};

// Modal animations
export const modalAnimations = {
  slideUp: {
    from: { translateY: 1000 },
    to: { translateY: 0 },
    spring: springs.bouncy,
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 250,
  },
  scaleIn: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    spring: springs.smooth,
  },
};

// Success animation (for favorites, saves, etc.)
export const successAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withSpring(1.3, springs.playful),
    withSpring(1, springs.smooth)
  );
};

// Subtle hover/press animation
export const pressAnimation = (
  scale: SharedValue<number>,
  isPressed: boolean
) => {
  'worklet';
  scale.value = withSpring(isPressed ? 0.97 : 1, springs.snappy);
};

// Shimmer loading animation
export const shimmerAnimation = (translateX: SharedValue<number>) => {
  'worklet';
  translateX.value = withRepeat(
    withTiming(1, { duration: 1500, easing: Easing.linear }),
    -1,
    false
  );
};

// Staggered list animations
export const staggerDelay = (index: number, baseDelay = 50) => {
  return index * baseDelay;
};

// Page transition animations
export const pageTransitions = {
  slideFromRight: {
    from: { translateX: 300, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
  },
  slideFromBottom: {
    from: { translateY: 100, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
  },
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};

// Button press feedback
export const buttonPressConfig = {
  scaleDown: 0.96,
  duration: 100,
};

// Heart animation (for favorites)
export const heartBeatAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withSpring(1.4, { damping: 8, stiffness: 400 }),
    withSpring(1, springs.smooth)
  );
};

// Bookmark animation
export const bookmarkSlideAnimation = (translateY: SharedValue<number>) => {
  'worklet';
  translateY.value = withSequence(
    withSpring(-8, springs.bouncy),
    withSpring(0, springs.smooth)
  );
};

// Toast/notification slide in
export const toastAnimation = {
  enter: {
    from: { translateY: -100, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    spring: springs.bouncy,
  },
  exit: {
    from: { translateY: 0, opacity: 1 },
    to: { translateY: -100, opacity: 0 },
    spring: springs.snappy,
  },
};

// Skeleton loading pulse
export const skeletonPulse = (opacity: SharedValue<number>) => {
  'worklet';
  opacity.value = withRepeat(
    withSequence(
      withTiming(0.3, { duration: 800 }),
      withTiming(1, { duration: 800 })
    ),
    -1,
    true
  );
};

// Confetti/celebration animation
export const celebrationAnimation = (
  scale: SharedValue<number>,
  rotate: SharedValue<number>
) => {
  'worklet';
  scale.value = withSequence(
    withSpring(1.5, springs.playful),
    withSpring(1, springs.smooth)
  );
  rotate.value = withSequence(
    withTiming(15, { duration: 150 }),
    withTiming(-15, { duration: 150 }),
    withTiming(0, { duration: 150 })
  );
};

// Smooth scroll indicator
export const scrollIndicatorAnimation = (
  opacity: SharedValue<number>,
  show: boolean
) => {
  'worklet';
  opacity.value = withTiming(show ? 1 : 0, { duration: 200 });
};

// Card expand animation (Airbnb-style)
export const cardExpandAnimation = {
  initial: {
    scale: 1,
    borderRadius: 16,
  },
  expanded: {
    scale: 1.02,
    borderRadius: 0,
  },
  spring: springs.smooth,
};

// Floating action button
export const fabAnimation = (scale: SharedValue<number>, show: boolean) => {
  'worklet';
  scale.value = withSpring(show ? 1 : 0, springs.bouncy);
};

// Pull to refresh
export const pullToRefreshAnimation = (
  translateY: SharedValue<number>,
  rotation: SharedValue<number>
) => {
  'worklet';
  translateY.value = withSpring(60, springs.gentle);
  rotation.value = withRepeat(
    withTiming(360, { duration: 1000, easing: Easing.linear }),
    -1,
    false
  );
};

// Haptic-style bounce (visual feedback)
export const hapticBounce = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withTiming(0.95, { duration: 50 }),
    withSpring(1, springs.snappy)
  );
};

// Ripple effect simulation
export const rippleAnimation = (
  scale: SharedValue<number>,
  opacity: SharedValue<number>
) => {
  'worklet';
  scale.value = withTiming(2, {
    duration: 600,
    easing: Easing.out(Easing.ease),
  });
  opacity.value = withTiming(0, {
    duration: 600,
    easing: Easing.out(Easing.ease),
  });
};

// Smooth entrance for images
export const imageLoadAnimation = {
  from: { opacity: 0, scale: 1.1 },
  to: { opacity: 1, scale: 1 },
  duration: 400,
};

// Microinteraction: checkbox check
export const checkAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withSpring(1.2, { damping: 10, stiffness: 500 }),
    withSpring(1, springs.smooth)
  );
};

// Smooth tab transition
export const tabTransition = {
  duration: 200,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

// Card shuffle animation
export const cardShuffleAnimation = (
  translateX: SharedValue<number>,
  index: number
) => {
  'worklet';
  const offset = index * 8;
  translateX.value = withDelay(index * 50, withSpring(offset, springs.gentle));
};

// Swipe gesture config
export const swipeConfig = {
  threshold: 50,
  velocityThreshold: 500,
  spring: springs.snappy,
};

// Loading spinner
export const spinnerAnimation = (rotation: SharedValue<number>) => {
  'worklet';
  rotation.value = withRepeat(
    withTiming(360, { duration: 1000, easing: Easing.linear }),
    -1,
    false
  );
};

// Parallax scroll effect
export const parallaxConfig = {
  scrollFactor: 0.5,
  spring: springs.gentle,
};

// Elastic bounce back
export const elasticBounce = (translateY: SharedValue<number>) => {
  'worklet';
  translateY.value = withSequence(
    withTiming(-10, { duration: 150 }),
    withSpring(0, { damping: 8, stiffness: 200 })
  );
};
