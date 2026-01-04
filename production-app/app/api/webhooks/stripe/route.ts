/**
 * API Route: Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */

import { captureException, captureMessage } from '@/lib/sentry/config';
import { webhookSecret } from '@/lib/stripe/client';
import { verifyWebhookSignature } from '@/lib/stripe/payment-helpers';
import { createAdminClient } from '@/lib/supabase/server';
import { updateOrderStatus } from '@/services/orderService';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          // Update order payment status
          const adminClient = createAdminClient();
          await adminClient
            .from('orders')
            .update({
              payment_status: 'paid',
              payment_intent_id: session.payment_intent as string,
            })
            .eq('id', orderId);

          // Update order status to confirmed
          await updateOrderStatus(orderId, 'confirmed');

          captureMessage(`Payment successful for order ${orderId}`, 'info');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          // Update order payment status to failed
          const adminClient = createAdminClient();
          await adminClient
            .from('orders')
            .update({
              payment_status: 'failed',
            })
            .eq('id', orderId);

          captureMessage(`Payment failed for order ${orderId}`, 'warning');
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          // Update order payment status to refunded
          const adminClient = createAdminClient();
          await adminClient
            .from('orders')
            .update({
              payment_status: 'refunded',
            })
            .eq('payment_intent_id', paymentIntentId as string);

          captureMessage(
            `Payment refunded for payment intent ${paymentIntentId}`,
            'info'
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    captureException(error);

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
