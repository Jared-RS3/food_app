import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';

const COLORS = theme.colors;
const SPACING = theme.spacing;
const BORDER_RADIUS = theme.borderRadius;

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.xs,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonRestaurantCard = () => (
  <View style={styles.cardSkeleton}>
    <SkeletonLoader height={220} borderRadius={BORDER_RADIUS.md} />
    <View style={styles.cardContent}>
      <SkeletonLoader height={18} width="70%" />
      <SkeletonLoader
        height={14}
        width="50%"
        style={{ marginTop: SPACING.xs }}
      />
      <View style={styles.cardFooter}>
        <SkeletonLoader height={12} width={80} />
        <SkeletonLoader height={12} width={60} />
      </View>
    </View>
  </View>
);

export const SkeletonListItem = () => (
  <View style={styles.listItemSkeleton}>
    <SkeletonLoader height={56} width={56} borderRadius={BORDER_RADIUS.full} />
    <View style={styles.listItemContent}>
      <SkeletonLoader height={16} width="60%" />
      <SkeletonLoader height={12} width="40%" style={{ marginTop: 4 }} />
    </View>
  </View>
);

export const SkeletonFeedCard = () => (
  <View style={styles.feedCardSkeleton}>
    {/* Header */}
    <View style={styles.feedHeader}>
      <SkeletonLoader
        height={44}
        width={44}
        borderRadius={BORDER_RADIUS.full}
      />
      <View style={styles.feedHeaderContent}>
        <SkeletonLoader height={14} width={120} />
        <SkeletonLoader height={12} width={80} style={{ marginTop: 4 }} />
      </View>
    </View>

    {/* Image */}
    <SkeletonLoader
      height={320}
      borderRadius={0}
      style={{ marginVertical: SPACING.sm }}
    />

    {/* Actions */}
    <View style={styles.feedActions}>
      <SkeletonLoader height={32} width={80} borderRadius={BORDER_RADIUS.lg} />
      <SkeletonLoader height={32} width={80} borderRadius={BORDER_RADIUS.lg} />
    </View>
  </View>
);

export const SkeletonGridItem = () => (
  <View style={styles.gridItemSkeleton}>
    <SkeletonLoader height={140} borderRadius={BORDER_RADIUS.md} />
    <View style={{ padding: SPACING.sm }}>
      <SkeletonLoader height={14} width="80%" />
      <SkeletonLoader
        height={12}
        width="50%"
        style={{ marginTop: SPACING.xxs }}
      />
    </View>
  </View>
);

export const SkeletonProfileHeader = () => (
  <View style={styles.headerSkeleton}>
    <SkeletonLoader height={80} width={80} borderRadius={40} />
    <View style={styles.headerInfo}>
      <SkeletonLoader height={28} width="60%" />
      <SkeletonLoader height={20} width="40%" style={{ marginTop: 8 }} />
    </View>
  </View>
);

export const SkeletonMealCard = () => (
  <View style={styles.mealSkeleton}>
    <View style={styles.mealHeader}>
      <SkeletonLoader height={32} width={120} />
      <SkeletonLoader height={32} width={32} borderRadius={16} />
    </View>
    <SkeletonLoader height={20} width="80%" style={{ marginTop: 12 }} />
    <SkeletonLoader height={60} borderRadius={16} style={{ marginTop: 12 }} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.gray[200],
  },
  cardSkeleton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
    marginBottom: SPACING.md,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...theme.shadows.sm,
  },
  listItemContent: {
    flex: 1,
  },
  feedCardSkeleton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...theme.shadows.sm,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  feedHeaderContent: {
    flex: 1,
  },
  feedActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  gridItemSkeleton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    ...theme.shadows.sm,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    ...theme.shadows.sm,
  },
  headerInfo: {
    flex: 1,
  },
  mealSkeleton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    ...theme.shadows.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
