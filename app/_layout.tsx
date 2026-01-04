import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/lib/supabase';
import { onboardingService } from '@/services/onboardingService';
import type { Session } from '@supabase/supabase-js';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const segments = useSegments();
  useFrameworkReady();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // Only check onboarding on SIGNED_IN event (new login)
      if (event === 'SIGNED_IN') {
        setHasCheckedOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // User not logged in, redirect to login
      router.replace('/(auth)/login');
    } else if (
      session &&
      inAuthGroup &&
      segments[1] !== 'onboarding' &&
      !hasCheckedOnboarding
    ) {
      // User just logged in and we haven't checked onboarding yet
      checkOnboardingAndNavigate();
    } else if (session && !inAuthGroup && !hasCheckedOnboarding) {
      // User has existing session, assume they've completed onboarding
      setHasCheckedOnboarding(true);
    }
  }, [session, segments, isReady, hasCheckedOnboarding]);

  const checkOnboardingAndNavigate = async () => {
    try {
      setHasCheckedOnboarding(true);
      const hasCompleted = await onboardingService.hasCompletedOnboarding();

      if (!hasCompleted) {
        router.replace('/(auth)/onboarding');
        return;
      }

      // Check if feature tour is completed
      const hasCompletedTour =
        await onboardingService.hasCompletedFeatureTour();

      if (!hasCompletedTour) {
        router.replace('/(auth)/feature-tour');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Onboarding check error:', error);
      router.replace('/(tabs)');
    }
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#FF6B6B" />
    </>
  );
}
