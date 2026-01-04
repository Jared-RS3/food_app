/**
 * OneSignal Notification Helpers
 * Functions for sending push notifications to users
 */

import { captureException } from '@/lib/sentry/config';
import { oneSignalClient } from './client';

export interface NotificationData {
  title: string;
  message: string;
  data?: Record<string, any>;
  url?: string;
  icon?: string;
  image?: string;
}

/**
 * Send notification to a specific user
 */
export async function sendNotificationToUser(
  userId: string,
  notification: NotificationData
): Promise<boolean> {
  try {
    const response = await oneSignalClient.createNotification({
      contents: { en: notification.message },
      headings: { en: notification.title },
      include_external_user_ids: [userId],
      data: notification.data,
      url: notification.url,
      small_icon: notification.icon,
      large_icon: notification.icon,
      big_picture: notification.image,
    });

    return response.body.id !== undefined;
  } catch (error) {
    console.error('OneSignal send notification error:', error);
    captureException(error);
    return false;
  }
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  userIds: string[],
  notification: NotificationData
): Promise<boolean> {
  try {
    const response = await oneSignalClient.createNotification({
      contents: { en: notification.message },
      headings: { en: notification.title },
      include_external_user_ids: userIds,
      data: notification.data,
      url: notification.url,
      small_icon: notification.icon,
      large_icon: notification.icon,
      big_picture: notification.image,
    });

    return response.body.id !== undefined;
  } catch (error) {
    console.error('OneSignal send notifications error:', error);
    captureException(error);
    return false;
  }
}

/**
 * Send notification to users with specific tags
 */
export async function sendNotificationToSegment(
  tags: Array<{ key: string; relation: string; value: string }>,
  notification: NotificationData
): Promise<boolean> {
  try {
    const response = await oneSignalClient.createNotification({
      contents: { en: notification.message },
      headings: { en: notification.title },
      filters: tags,
      data: notification.data,
      url: notification.url,
      small_icon: notification.icon,
      large_icon: notification.icon,
      big_picture: notification.image,
    });

    return response.body.id !== undefined;
  } catch (error) {
    console.error('OneSignal send segment notification error:', error);
    captureException(error);
    return false;
  }
}

/**
 * Send order status update notification
 */
export async function sendOrderStatusNotification(
  userId: string,
  orderId: string,
  status: string,
  restaurantName: string
): Promise<boolean> {
  const messages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: 'Order Confirmed! 🎉',
      message: `Your order from ${restaurantName} has been confirmed and is being prepared.`,
    },
    preparing: {
      title: 'Order is Being Prepared 👨‍🍳',
      message: `${restaurantName} is preparing your delicious order!`,
    },
    ready: {
      title: 'Order Ready! 🍽️',
      message: `Your order from ${restaurantName} is ready for pickup or delivery.`,
    },
    out_for_delivery: {
      title: 'Order On The Way! 🚗',
      message: `Your order from ${restaurantName} is out for delivery!`,
    },
    delivered: {
      title: 'Order Delivered! ✅',
      message: `Your order from ${restaurantName} has been delivered. Enjoy your meal!`,
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order from ${restaurantName} has been cancelled.`,
    },
  };

  const content = messages[status] || {
    title: 'Order Update',
    message: `Your order status has been updated.`,
  };

  return sendNotificationToUser(userId, {
    ...content,
    data: { orderId, status },
    url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`,
  });
}

/**
 * Send promotional notification to all users
 */
export async function sendPromoNotification(
  notification: NotificationData
): Promise<boolean> {
  try {
    const response = await oneSignalClient.createNotification({
      contents: { en: notification.message },
      headings: { en: notification.title },
      included_segments: ['All'],
      data: notification.data,
      url: notification.url,
      small_icon: notification.icon,
      large_icon: notification.icon,
      big_picture: notification.image,
    });

    return response.body.id !== undefined;
  } catch (error) {
    console.error('OneSignal send promo notification error:', error);
    captureException(error);
    return false;
  }
}

/**
 * Register user device for push notifications
 * Called from client-side after OneSignal SDK initialization
 */
export async function registerUserDevice(
  userId: string,
  playerId: string
): Promise<boolean> {
  try {
    // Link OneSignal player ID to your user ID
    await oneSignalClient.editDevice(playerId, {
      external_user_id: userId,
    });
    return true;
  } catch (error) {
    console.error('OneSignal register device error:', error);
    captureException(error);
    return false;
  }
}
