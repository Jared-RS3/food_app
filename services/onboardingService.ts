import { supabase } from '@/lib/supabase';
import { OnboardingPreferences } from '@/types/onboarding';
import { logger } from './logger';

class OnboardingService {
  /**
   * Save user's onboarding preferences to Supabase
   */
  async saveOnboardingPreferences(
    preferences: Omit<
      OnboardingPreferences,
      'userId' | 'completedAt' | 'onboardingComplete'
    >
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current session (more reliable than getUser after signup)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        // Retry with getUser as fallback
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          logger.error('User not authenticated', userError);
          return { success: false, error: 'User not authenticated' };
        }

        // Use user from getUser
        return this.savePreferencesForUser(
          user.id,
          user.email || '',
          preferences
        );
      }

      // Use session user
      return this.savePreferencesForUser(
        session.user.id,
        session.user.email || '',
        preferences
      );
    } catch (error) {
      logger.error('Unexpected error saving onboarding', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Internal method to save preferences for a specific user
   */
  private async savePreferencesForUser(
    userId: string,
    email: string,
    preferences: Omit<
      OnboardingPreferences,
      'userId' | 'completedAt' | 'onboardingComplete'
    >
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First, ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      // If profile doesn't exist, create it first
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: email,
            full_name: '',
            dietary_restrictions: preferences.dietaryRestrictions,
            food_mood: preferences.foodMood,
            favorite_categories: preferences.favoriteCategories,
            location_city: preferences.location?.city,
            location_country: preferences.location?.country,
            location_latitude: preferences.location?.latitude,
            location_longitude: preferences.location?.longitude,
            onboarding_complete: true,
            onboarding_completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        // If duplicate key error (23505), profile was created by trigger - that's ok, update instead
        if (insertError && insertError.code === '23505') {
          // Profile exists now, update it
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              dietary_restrictions: preferences.dietaryRestrictions,
              food_mood: preferences.foodMood,
              favorite_categories: preferences.favoriteCategories,
              location_city: preferences.location?.city,
              location_country: preferences.location?.country,
              location_latitude: preferences.location?.latitude,
              location_longitude: preferences.location?.longitude,
              onboarding_complete: true,
              onboarding_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (updateError) {
            logger.error(
              'Failed to update profile after duplicate',
              updateError
            );
            return { success: false, error: updateError.message };
          }
        } else if (insertError) {
          // Other errors are real problems
          logger.error('Failed to create profile with onboarding', insertError);
          return { success: false, error: insertError.message };
        }
      } else {
        // Profile exists, update it
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            dietary_restrictions: preferences.dietaryRestrictions,
            food_mood: preferences.foodMood,
            favorite_categories: preferences.favoriteCategories,
            location_city: preferences.location?.city,
            location_country: preferences.location?.country,
            location_latitude: preferences.location?.latitude,
            location_longitude: preferences.location?.longitude,
            onboarding_complete: true,
            onboarding_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          logger.error('Failed to update profile with onboarding', updateError);
          return { success: false, error: updateError.message };
        }
      }

      logger.info('Onboarding preferences saved successfully');
      return { success: true };
    } catch (error) {
      logger.error('Unexpected error in savePreferencesForUser', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_complete, created_at')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if no row

      // If profile doesn't exist, create it
      if (!data) {
        await this.createUserProfile(user.id, user.email || '');
        return false; // New user needs onboarding
      }

      if (error) {
        logger.warn('Failed to check onboarding status');
        return false;
      }

      // If user profile was created more than 1 day ago and has onboarding_complete = null/false,
      // assume they're an existing user and mark as completed
      if (!data.onboarding_complete && data.created_at) {
        const createdDate = new Date(data.created_at);
        const daysSinceCreation =
          (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceCreation > 1) {
          // Auto-complete onboarding for existing users
          await this.skipOnboarding();
          return true;
        }
      }

      return data?.onboarding_complete ?? false;
    } catch (error) {
      logger.warn('Error checking onboarding status');
      return false;
    }
  }

  /**
   * Create user profile if it doesn't exist
   */
  private async createUserProfile(
    userId: string,
    email: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from('user_profiles').insert({
        id: userId,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        onboarding_complete: false,
      });

      if (error && error.code !== '23505') {
        // Ignore duplicate key errors
        logger.warn('Failed to create user profile');
      }
    } catch (error) {
      logger.warn('Error creating user profile');
    }
  }

  /**
   * Get user's onboarding preferences
   */
  async getOnboardingPreferences(): Promise<OnboardingPreferences | null> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(
          `
          id,
          dietary_restrictions,
          food_mood,
          favorite_categories,
          location_city,
          location_country,
          location_latitude,
          location_longitude,
          onboarding_complete,
          onboarding_completed_at
        `
        )
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('Failed to get onboarding preferences', error);
        return null;
      }

      return {
        userId: user.id,
        dietaryRestrictions: data.dietary_restrictions || [],
        foodMood: data.food_mood || '',
        favoriteCategories: data.favorite_categories || [],
        location: {
          city: data.location_city || '',
          country: data.location_country || '',
          latitude: data.location_latitude || 0,
          longitude: data.location_longitude || 0,
        },
        onboardingComplete: data.onboarding_complete || false,
        completedAt: data.onboarding_completed_at
          ? new Date(data.onboarding_completed_at)
          : new Date(),
      };
    } catch (error) {
      logger.error('Error getting onboarding preferences', error);
      return null;
    }
  }

  /**
   * Skip onboarding (mark as complete with minimal data)
   */
  async skipOnboarding(): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_complete: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('Failed to skip onboarding', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error skipping onboarding', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if feature tour has been completed
   */
  async hasCompletedFeatureTour(): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('feature_tour_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('Error checking feature tour status', error);
        return false;
      }

      return data?.feature_tour_complete || false;
    } catch (error) {
      logger.error('Error checking feature tour', error);
      return false;
    }
  }

  /**
   * Mark feature tour as complete
   */
  async completeFeatureTour(): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          feature_tour_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('Failed to complete feature tour', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error completing feature tour', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if My Places onboarding has been shown
   */
  async hasShownMyPlacesOnboarding(): Promise<boolean> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('my_places_onboarding_shown')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return false;
      }

      return data.my_places_onboarding_shown === true;
    } catch (error) {
      logger.error('Error checking My Places onboarding status', error);
      return false;
    }
  }

  /**
   * Mark My Places onboarding as shown
   */
  async markMyPlacesOnboardingShown(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          my_places_onboarding_shown: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error(
          'Failed to mark My Places onboarding as shown',
          updateError
        );
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error marking My Places onboarding as shown', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const onboardingService = new OnboardingService();
