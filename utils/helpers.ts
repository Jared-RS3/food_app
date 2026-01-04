import * as Haptics from 'expo-haptics';

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

export const formatDeliveryTime = (
  minTime: number,
  maxTime: number
): string => {
  return `${minTime}-${maxTime} min`;
};

export const formatPrice = (price: number, currency: string = 'R'): string => {
  return `${currency}${price.toFixed(2)}`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInHours = Math.floor(
    (now.getTime() - past.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

// Haptic Feedback helpers for premium feel
export const hapticLight = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Haptics not available on all devices
  }
};

export const hapticMedium = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Haptics not available on all devices
  }
};

export const hapticHeavy = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Haptics not available on all devices
  }
};

export const hapticSuccess = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Haptics not available on all devices
  }
};

export const hapticWarning = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    // Haptics not available on all devices
  }
};

export const hapticError = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // Haptics not available on all devices
  }
};

export const hapticSelection = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // Haptics not available on all devices
  }
};
