// Supabase client configuration
import { logger } from '@/services/logger';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error(
    'EXPO_PUBLIC_SUPABASE_URL:',
    supabaseUrl ? '✅ Set' : '❌ Missing'
  );
  console.error(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY:',
    supabaseAnonKey ? '✅ Set' : '❌ Missing'
  );
  logger.error('Missing Supabase environment variables');
} else {
  console.log('✅ Supabase environment variables loaded');
  console.log('Supabase URL:', supabaseUrl.substring(0, 30) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/**
 * Get current authenticated user ID
 * @throws Error if user is not authenticated (in production)
 */
export const getCurrentUserId = async (): Promise<string> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If we have a user, return their ID
    if (user) {
      return user.id;
    }

    // No user found or error occurred
    if (__DEV__) {
      // In development, use default user ID for testing
      logger.warn(
        'No authenticated user, using default user ID for development'
      );
      return '10606b48-de66-4322-886b-ed13230a264e';
    }

    // In production, throw error
    if (error) {
      logger.error('Error getting current user', error instanceof Error ? error : undefined);
      throw new Error('Failed to get current user');
    }

    throw new Error('User not authenticated');
  } catch (error) {
    // Catch any errors and fall back to dev user if in development
    if (__DEV__) {
      logger.warn(
        'Error in getCurrentUserId, using default user ID for development',
        { metadata: { error } }
      );
      return '10606b48-de66-4322-886b-ed13230a264e';
    }
    throw error;
  }
};

/**
 * Get current authenticated user ID synchronously (for legacy code)
 * Note: This may return null if auth state hasn't loaded yet
 * Prefer using getCurrentUserId() async version
 */
export const getCurrentUserIdSync = (): string | null => {
  // This will be properly implemented via AuthContext
  // For now, return null to indicate sync access is not recommended
  return null;
};
