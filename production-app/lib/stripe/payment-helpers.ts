/**
 * Stripe Payment Helpers
 * Functions for creating checkout sessions, processing payments, and handling webhooks
 */

import { captureException } from '@/lib/sentry/config';
import { stripe } from './client';

/**
 * Create a Stripe checkout session for an order
 */
export async function createCheckoutSession(order: {
  id: string;
  userId: string;
  restaurantId: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}): Promise<{ sessionId: string; url: string } | null> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?cancelled=true`,
      customer_email: undefined, // Set from user profile if needed
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        userId: order.userId,
        restaurantId: order.restaurantId,
      },
      line_items: order.items.map((item) => ({
        price_data: {
          currency: 'zar', // South African Rand
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Create a payment intent for custom checkout flow
 */
export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'zar',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Stripe retrieve payment intent error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Issue a refund for a payment
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<boolean> {
  try {
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    });
    return true;
  } catch (error) {
    console.error('Stripe refund error:', error);
    captureException(error);
    return false;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): any {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Stripe webhook verification error:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(session: any): Promise<void> {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error('No orderId in session metadata');
    return;
  }

  // Update order payment status in database
  // This will be called from the webhook handler
  console.log(`Payment successful for order ${orderId}`);
}

/**
 * Handle failed payment
 */
export async function handlePaymentFailed(session: any): Promise<void> {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error('No orderId in session metadata');
    return;
  }

  // Update order payment status in database
  console.log(`Payment failed for order ${orderId}`);
}
