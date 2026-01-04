/**
 * Authentication Helpers
 * Centralized auth functions for signup, login, logout, and session management
 */

import type { AuthError, Session, User } from '@supabase/supabase-js';
import { createClient } from './client';
import { createClient as createServerClient } from './server';

/**
 * Response type for auth operations
 */
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 * Creates a user profile automatically via database trigger
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: {
    full_name?: string;
    phone?: string;
  }
): Promise<AuthResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign in user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign in with OAuth provider (Google, Facebook, etc.)
 */
export async function signInWithProvider(
  provider: 'google' | 'facebook' | 'apple'
) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  return { data, error };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current session (client-side)
 */
export async function getSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Get the current user (server-side)
 * Use this in Server Components and Route Handlers
 */
export async function getUser(): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

/**
 * Reset password - sends reset email
 */
export async function resetPassword(email: string): Promise<{
  error: AuthError | null;
}> {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  return { error };
}

/**
 * Update password (after reset or in settings)
 */
export async function updatePassword(newPassword: string): Promise<{
  error: AuthError | null;
}> {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error };
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(metadata: {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  });

  return { user: data.user, error };
}

/**
 * Check if user is authenticated (server-side)
 * Returns user or throws redirect to login
 */
export async function requireAuth(): Promise<User> {
  const { user, error } = await getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Check if user is admin (server-side)
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  const supabase = await createServerClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden - Admin access required');
  }

  return user;
}
