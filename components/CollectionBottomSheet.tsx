// CollectionBottomSheet.tsx
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants';
import { Collection, Restaurant } from '@/types/restaurant';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import RestaurantCard from './RestaurantCard';

interface CollectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  collection: Collection | null;
  restaurants: Restaurant[];
  onRestaurantPress: (restaurant: Restaurant) => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const MIN_SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 4) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export default function CollectionBottomSheet({
  visible,
  onClose,
  collection,
  restaurants,
  onRestaurantPress,
}: CollectionBottomSheetProps) {
  const translateY = useSharedValue(MAX_SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const sheetHeight = useSharedValue(MIN_SHEET_HEIGHT);
  const context = useSharedValue({ y: 0 });

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 50,
        stiffness: 400,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(MAX_SHEET_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
      sheetHeight.value = MIN_SHEET_HEIGHT;
    }
  }, [visible]);

  const handleClose = () => {
    translateY.value = withTiming(MAX_SHEET_HEIGHT, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newTranslateY = context.value.y + event.translationY;

      if (newTranslateY < 0) {
        const newHeight = MIN_SHEET_HEIGHT + Math.abs(newTranslateY);
        if (newHeight <= MAX_SHEET_HEIGHT) {
          translateY.value = newTranslateY;
          sheetHeight.value = newHeight;
        }
      } else {
        translateY.value = newTranslateY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        runOnJS(handleClose)();
      } else if (translateY.value < -100) {
        translateY.value = withSpring(-(MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT));
        sheetHeight.value = withSpring(MAX_SHEET_HEIGHT);
      } else {
        translateY.value = withSpring(0);
        sheetHeight.value = withSpring(MIN_SHEET_HEIGHT);
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: sheetHeight.value,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => {
        onRestaurantPress(item);
        handleClose();
      }}
      activeOpacity={0.9}
    >
      <RestaurantCard
        restaurant={item}
        onPress={() => {
          onRestaurantPress(item);
          handleClose();
        }}
        variant="compact"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
      />
    </TouchableOpacity>
  );

  if (!visible || !collection) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.modalContainer}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, animatedSheetStyle]}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.headerIcon,
                    { backgroundColor: collection.color + '20' },
                  ]}
                >
                  <Text style={styles.headerIconText}>{collection.icon}</Text>
                </View>
                <View>
                  <Text style={styles.title}>{collection.name}</Text>
                  <Text style={styles.subtitle}>
                    {restaurants.length} restaurant
                    {restaurants.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={24} color={COLORS.gray[600]} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {restaurants.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No restaurants in this collection yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={restaurants}
                keyExtractor={(item) => item.id}
                renderItem={renderRestaurant}
                numColumns={3}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.columnWrapper}
              />
            )}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  handleContainer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray[300],
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerIconText: {
    fontSize: 28,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SPACING.lg,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  gridItem: {
    marginBottom: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
});
