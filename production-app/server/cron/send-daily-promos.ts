/**
 * Cron Job: Send Daily Promo Notifications
 * Runs daily to send promotional notifications to users
 */

import { sendPromoNotification } from '@/lib/onesignal/notification-helpers';
import { captureException, captureMessage } from '@/lib/sentry/config';
import { getFeaturedRestaurants } from '@/services/restaurantService';

export async function sendDailyPromos() {
  try {
    // Get featured restaurants
    const featuredRestaurants = await getFeaturedRestaurants(5);

    if (featuredRestaurants.length === 0) {
      console.log('No featured restaurants to promote');
      return { success: true, sent: false };
    }

    // Pick a random featured restaurant
    const restaurant =
      featuredRestaurants[
        Math.floor(Math.random() * featuredRestaurants.length)
      ];

    // Send notification
    const sent = await sendPromoNotification({
      title: '🍽️ Daily Special Alert!',
      message: `Check out ${restaurant.name} - ${restaurant.cuisine_type} cuisine with ${restaurant.rating}⭐ rating!`,
      data: {
        restaurantId: restaurant.id,
        type: 'daily_promo',
      },
      url: `${process.env.NEXT_PUBLIC_APP_URL}/restaurants/${restaurant.id}`,
      image: restaurant.image_url || undefined,
    });

    if (sent) {
      captureMessage(`Sent daily promo for ${restaurant.name}`, 'info');
    }

    console.log(`✅ Sent daily promo notification for ${restaurant.name}`);
    return { success: true, sent, restaurant: restaurant.name };
  } catch (error) {
    console.error('Send daily promos error:', error);
    captureException(error);
    return { success: false, error };
  }
}

// For Vercel Cron Job API route
export async function GET() {
  const result = await sendDailyPromos();
  return Response.json(result);
}
