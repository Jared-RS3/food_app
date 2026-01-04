/**
 * Stripe Client
 * Payment processing integration
 */

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Stripe webhook configuration
 */
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
