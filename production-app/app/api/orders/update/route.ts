/**
 * API Route: Update Order Status
 * PUT /api/orders/update
 */

import { captureException } from '@/lib/sentry/config';
import { requireAdmin } from '@/lib/supabase/auth-helpers';
import { updateOrderStatus } from '@/services/orderService';
import { getRestaurantById } from '@/services/restaurantService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateOrderSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]),
  restaurantId: z.string().uuid().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    // Require admin or restaurant owner authentication
    await requireAdmin();

    // Parse and validate request
    const body = await request.json();
    const { orderId, status, restaurantId } = updateOrderSchema.parse(body);

    // Get restaurant name for notification
    let restaurantName = 'Restaurant';
    if (restaurantId) {
      const restaurant = await getRestaurantById(restaurantId);
      restaurantName = restaurant?.name || restaurantName;
    }

    // Update order status
    const order = await updateOrderStatus(orderId, status, restaurantName);

    if (!order) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order API error:', error);
    captureException(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if ((error as Error).message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
