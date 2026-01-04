/**
 * Cron Job: Clean Expired Carts
 * Runs daily to remove carts older than 24 hours
 * Deploy this as a Vercel Cron Job or use Supabase pg_cron
 */

import { captureException, captureMessage } from '@/lib/sentry/config';
import { createAdminClient } from '@/lib/supabase/server';

export async function cleanExpiredCarts() {
  try {
    const adminClient = createAdminClient();

    // Delete carts that expired more than 1 hour ago
    const { data, error } = await adminClient
      .from('carts')
      .delete()
      .lt('expires_at', new Date(Date.now() - 3600000).toISOString())
      .select('id');

    if (error) throw error;

    const deletedCount = data?.length || 0;
    captureMessage(`Cleaned ${deletedCount} expired carts`, 'info');

    console.log(`✅ Cleaned ${deletedCount} expired carts`);
    return { success: true, deletedCount };
  } catch (error) {
    console.error('Clean expired carts error:', error);
    captureException(error);
    return { success: false, error };
  }
}

// For Vercel Cron Job API route
// Create: app/api/cron/clean-carts/route.ts
export async function GET() {
  const result = await cleanExpiredCarts();
  return Response.json(result);
}
