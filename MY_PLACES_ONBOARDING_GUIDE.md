# My Places Onboarding Modal Integration Guide

## 🎯 What This Does

Shows a beautiful 3-step onboarding modal when users first:
- Add a restaurant to **Favorites** ⭐
- Mark a restaurant as **Must Try** 🔥  
- Add a restaurant to a **Collection** 📚

The modal explains:
1. ✅ Confirmation of action
2. 📍 Where to find saved places (My Places tab)
3. 🗂️ Three organization tabs: All, Must Try, Collections

**Only shows once per user!** Stored in database.

---

## 📦 Files Created

1. **`components/MyPlacesOnboardingModal.tsx`** - The modal component
2. **`hooks/useMyPlacesOnboarding.ts`** - Hook to manage modal state
3. **`services/onboardingService.ts`** - Database methods (updated)
4. **`add-myplaces-onboarding-field.sql`** - SQL migration

---

## 🚀 Setup Instructions

### Step 1: Run SQL Migration

Go to your Supabase Dashboard → SQL Editor → New Query:

```sql
-- Copy and paste content from add-myplaces-onboarding-field.sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS my_places_onboarding_shown BOOLEAN DEFAULT FALSE;
```

Click **Run** to add the field to your database.

---

### Step 2: Install AsyncStorage (if not already installed)

```bash
npx expo install @react-native-async-storage/async-storage
```

---

## 💻 How to Integrate

### Option A: In Restaurant Cards (RestaurantCard.tsx, AirbnbStyleCard.tsx)

```tsx
import { MyPlacesOnboardingModal } from '@/components/MyPlacesOnboardingModal';
import { useMyPlacesOnboarding } from '@/hooks/useMyPlacesOnboarding';

export const RestaurantCard = ({ restaurant }) => {
  const { 
    isVisible, 
    actionType, 
    collectionName, 
    showOnboarding, 
    closeOnboarding 
  } = useMyPlacesOnboarding();

  const handleFavorite = async () => {
    // Your existing favorite logic
    await restaurantService.toggleFavorite(restaurant.id);
    
    // Show onboarding modal (only shows once!)
    await showOnboarding('favorite');
  };

  const handleMustTry = async () => {
    // Your existing must-try logic
    await restaurantService.markAsMustTry(restaurant.id);
    
    // Show onboarding modal
    await showOnboarding('mustTry');
  };

  return (
    <>
      {/* Your card UI */}
      <TouchableOpacity onPress={handleFavorite}>
        <Heart />
      </TouchableOpacity>

      {/* Add the modal */}
      <MyPlacesOnboardingModal
        visible={isVisible}
        onClose={() => closeOnboarding(false)}
        actionType={actionType}
        collectionName={collectionName}
      />
    </>
  );
};
```

---

### Option B: In Collection Modals (CreateCollectionModal.tsx)

```tsx
import { MyPlacesOnboardingModal } from '@/components/MyPlacesOnboardingModal';
import { useMyPlacesOnboarding } from '@/hooks/useMyPlacesOnboarding';

export const CreateCollectionModal = () => {
  const { 
    isVisible, 
    actionType, 
    collectionName, 
    showOnboarding, 
    closeOnboarding 
  } = useMyPlacesOnboarding();

  const handleAddToCollection = async (collection: Collection) => {
    // Your existing add to collection logic
    await collectionService.addRestaurant(collection.id, restaurant.id);
    
    // Show onboarding modal with collection name
    await showOnboarding('collection', collection.name);
    
    // Close the create collection modal
    onClose();
  };

  return (
    <>
      {/* Your modal UI */}
      
      {/* Add the onboarding modal */}
      <MyPlacesOnboardingModal
        visible={isVisible}
        onClose={() => closeOnboarding(true)} // true = navigate to My Places
        actionType={actionType}
        collectionName={collectionName}
      />
    </>
  );
};
```

---

### Option C: In Bottom Sheets (RestaurantDetailsBottomSheet.tsx)

```tsx
import { MyPlacesOnboardingModal } from '@/components/MyPlacesOnboardingModal';
import { useMyPlacesOnboarding } from '@/hooks/useMyPlacesOnboarding';

export const RestaurantDetailsBottomSheet = ({ restaurant }) => {
  const onboarding = useMyPlacesOnboarding();

  const handleFavoritePress = async () => {
    await restaurantService.toggleFavorite(restaurant.id);
    await onboarding.showOnboarding('favorite');
  };

  const handleMustTryPress = async () => {
    await restaurantService.markAsMustTry(restaurant.id);
    await onboarding.showOnboarding('mustTry');
  };

  return (
    <>
      <BottomSheet>
        {/* Your bottom sheet content */}
      </BottomSheet>

      <MyPlacesOnboardingModal
        visible={onboarding.isVisible}
        onClose={() => onboarding.closeOnboarding(false)}
        actionType={onboarding.actionType}
        collectionName={onboarding.collectionName}
      />
    </>
  );
};
```

---

## 🎨 Modal Features

### Step 1: Confirmation
- ✅ Shows icon (heart/star/bookmark) with color
- ✅ Celebrates the action with "Great Choice!"
- ✅ Confirms what was saved

### Step 2: Navigation Hint
- 📍 Points to "My Places" tab at bottom
- 📍 Explains where to find saved items

### Step 3: Three Tabs Explanation
- 🗂️ Shows all three tabs: All, Must Try, Collections
- 🗂️ Highlights where their restaurant was saved
- 🗂️ Explains purpose of each tab
- 💡 Quick tip: How to navigate there

### Features:
- ✨ Smooth animations (FadeIn, Spring)
- ✨ Progress bar shows steps
- ✨ Skip button to dismiss
- ✨ "Go to My Places" button on last step
- ✨ Gradient action buttons
- ✨ Highlighted card for selected tab

---

## 🔧 Customization

### Change Colors:
```tsx
// In MyPlacesOnboardingModal.tsx
const steps = [
  {
    color: '#FF6B6B', // Change favorite color
  },
  {
    color: '#FFB800', // Change must-try color
  },
];
```

### Add More Steps:
```tsx
const steps = [
  // ... existing steps
  {
    title: 'New Feature!',
    description: 'Check out this cool thing...',
    icon: Sparkles,
    color: '#9333EA',
  },
];
```

### Skip Navigation:
```tsx
// Don't navigate to My Places on close
closeOnboarding(false)

// Navigate to My Places on close
closeOnboarding(true)
```

---

## 🧪 Testing

### Test the Modal:
```tsx
// Force show modal (bypass database check)
<MyPlacesOnboardingModal
  visible={true}
  onClose={() => {}}
  actionType="favorite"
/>
```

### Reset Onboarding (for testing):
```tsx
// In a debug screen
import { onboardingService } from '@/services/onboardingService';

const resetOnboarding = async () => {
  // This will reset the database flag
  await onboardingService.markMyPlacesOnboardingShown();
  
  // Then update to false in Supabase SQL editor:
  // UPDATE user_profiles SET my_places_onboarding_shown = false WHERE id = 'user-id';
};
```

---

## 📱 User Flow

```
User adds restaurant to favorites
         ↓
Hook checks: Has user seen onboarding?
         ↓
    NO → Show Modal
         ↓
User goes through 3 steps
         ↓
Clicks "Go to My Places"
         ↓
Navigate to My Places tab
         ↓
Mark as shown in database
         ↓
Never show again ✅
```

---

## 🎯 Integration Priority

**Add to these files FIRST:**

1. ✅ `components/RestaurantCard.tsx` - Most common interaction
2. ✅ `components/AirbnbStyleCard.tsx` - Premium card variant
3. ✅ `components/RestaurantDetailsBottomSheet.tsx` - Detail view actions
4. ✅ `components/CreateCollectionModal.tsx` - Collection creation
5. ✅ `app/(tabs)/explore.tsx` - Main explore screen

**Then add to:**
6. `components/MarketCard.tsx` - Food markets
7. `components/SearchResults.tsx` - Search results
8. `app/(tabs)/social.tsx` - Social feed interactions

---

## 🐛 Troubleshooting

### Modal not showing?
- Check database: Is `my_places_onboarding_shown` = false?
- Check auth: Is user logged in?
- Check console: Any errors in onboardingService?

### Modal shows every time?
- Database flag not being set
- Check Supabase RLS policies allow UPDATE on user_profiles
- Check `markMyPlacesOnboardingShown()` is being called

### Navigation not working?
- Make sure you're passing `true` to `closeOnboarding(true)`
- Check Expo Router is configured correctly
- Verify tab route is `/(tabs)/my-places`

---

## 📊 Analytics (Optional)

Track onboarding completion:

```tsx
import { analytics } from '@/lib/analytics'; // Your analytics service

const closeOnboarding = async (navigate: boolean) => {
  setIsVisible(false);
  await onboardingService.markMyPlacesOnboardingShown();
  
  // Track completion
  analytics.track('my_places_onboarding_completed', {
    action_type: actionType,
    navigated_to_my_places: navigate,
    collection_name: collectionName,
  });
  
  if (navigate) {
    router.push('/(tabs)/my-places');
  }
};
```

---

## 🎉 Done!

Your users will now understand exactly where their saved restaurants go!

**Key Benefits:**
✅ Reduces confusion about favorites/must-try/collections
✅ Increases engagement with My Places tab
✅ Only shows once (not annoying)
✅ Beautiful, professional UI
✅ Guides users to explore more features

---

## 📸 Preview

```
┌────────────────────────────┐
│   [X]          ━━━━━━━━    │ Progress bar
│                            │
│         ⭐                 │ Big icon
│       [  Icon  ]           │
│                            │
│    🎉 Great Choice!        │ Step title
│                            │
│  You've added this to      │ Description
│  your favorites!           │
│                            │
│  ┌──────────────────────┐  │
│  │  📍 Find It in       │  │ Highlighted info
│  │  My Places           │  │
│  └──────────────────────┘  │
│                            │
│  [Skip]     [Next →]       │ Actions
└────────────────────────────┘
```

Want me to integrate this into your RestaurantCard and other components now?
