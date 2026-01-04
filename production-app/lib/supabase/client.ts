/**
 * Supabase Client - Browser/Client-side
 * Used in Client Components and browser contexts
 */

import type { Database } from '@/types/database';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser/client-side usage
 * Automatically handles cookie management for authentication
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Singleton instance for client-side usage
 * Import this for client components
 */
export const supabase = createClient();
