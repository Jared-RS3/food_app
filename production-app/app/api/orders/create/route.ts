/**
 * API Route: Create Order
 * POST /api/orders/create
 */

import { captureException } from '@/lib/sentry/config';
import { createPaymentIntent } from '@/lib/stripe/payment-helpers';
import { requireAuth } from '@/lib/supabase/auth-helpers';
import { createOrder } from '@/services/orderService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const createOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
        specialInstructions: z.string().optional(),
      })
    )
    .min(1),
  deliveryAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(['card', 'cash', 'wallet']),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Create order in database
    const order = await createOrder({
      userId: user.id,
      ...validatedData,
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create payment intent for card payments
    let paymentIntent = null;
    if (validatedData.paymentMethod === 'card') {
      paymentIntent = await createPaymentIntent(order.total, {
        orderId: order.id,
        userId: user.id,
        restaurantId: validatedData.restaurantId,
      });

      if (!paymentIntent) {
        return NextResponse.json(
          { error: 'Failed to create payment intent' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        order,
        paymentIntent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order API error:', error);
    captureException(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
