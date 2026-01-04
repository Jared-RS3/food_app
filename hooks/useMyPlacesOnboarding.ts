import { useState, useEffect, useCallback } from 'react';
import { onboardingService } from '@/services/onboardingService';
import { useRouter } from 'expo-router';

type ActionType = 'favorite' | 'mustTry' | 'collection';

export const useMyPlacesOnboarding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('favorite');
  const [collectionName, setCollectionName] = useState<string>('');
  const router = useRouter();

  // Check if onboarding has been shown
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const hasShown = await onboardingService.hasShownMyPlacesOnboarding();
    // Onboarding modal will only show if hasShown is false
  };

  // Show onboarding modal
  const showOnboarding = useCallback(async (
    type: ActionType,
    collection?: string
  ) => {
    // Check if already shown
    const hasShown = await onboardingService.hasShownMyPlacesOnboarding();
    
    if (!hasShown) {
      setActionType(type);
      if (collection) {
        setCollectionName(collection);
      }
      setIsVisible(true);
    }
  }, []);

  // Close modal and mark as shown
  const closeOnboarding = useCallback(async (navigateToMyPlaces: boolean = false) => {
    setIsVisible(false);
    await onboardingService.markMyPlacesOnboardingShown();
    
    // Navigate to My Places if requested
    if (navigateToMyPlaces) {
      // Small delay for smooth transition
      setTimeout(() => {
        router.push('/(tabs)/my-places');
      }, 300);
    }
  }, [router]);

  return {
    isVisible,
    actionType,
    collectionName,
    showOnboarding,
    closeOnboarding,
  };
};
