/**
 * Order Service
 * Business logic for order management
 */

import { sendOrderStatusNotification } from '@/lib/onesignal/notification-helpers';
import { captureException } from '@/lib/sentry/config';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface CreateOrderData {
  userId: string;
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };
  deliveryInstructions?: string;
  paymentMethod: string;
}

/**
 * Create a new order with items
 */
export async function createOrder(
  orderData: CreateOrderData
): Promise<Order | null> {
  try {
    const supabase = await createClient();

    // Calculate totals
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const deliveryFee = 25.0; // Could be dynamic based on distance
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + deliveryFee + tax;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.userId,
        restaurant_id: orderData.restaurantId,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        delivery_address: orderData.deliveryAddress,
        delivery_instructions: orderData.deliveryInstructions,
        payment_method: orderData.paymentMethod,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      special_instructions: item.specialInstructions,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  } catch (error) {
    console.error('Create order error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Get order by ID with items
 */
export async function getOrderById(orderId: string): Promise<{
  order: Order | null;
  items: OrderItem[];
}> {
  try {
    const supabase = await createClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return { order, items: items || [] };
  } catch (error) {
    console.error('Get order error:', error);
    captureException(error);
    return { order: null, items: [] };
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(
  userId: string,
  limit: number = 50
): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user orders error:', error);
    captureException(error);
    return [];
  }
}

/**
 * Update order status
 * Also sends push notification to user
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  restaurantName?: string
): Promise<Order | null> {
  try {
    const adminClient = createAdminClient();

    const { data: order, error } = await adminClient
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Send push notification
    if (restaurantName) {
      await sendOrderStatusNotification(
        order.user_id,
        orderId,
        status,
        restaurantName
      );
    }

    return order;
  } catch (error) {
    console.error('Update order status error:', error);
    captureException(error);
    return null;
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Cancel order error:', error);
    captureException(error);
    return false;
  }
}

/**
 * Get restaurant's orders
 */
export async function getRestaurantOrders(
  restaurantId: string,
  status?: Order['status']
): Promise<Order[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get restaurant orders error:', error);
    captureException(error);
    return [];
  }
}
