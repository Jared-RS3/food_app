# Restaurant & Food Addition Workflow - Optimization Guide

## Current Setup Analysis

### Three Entry Points:

1. **Search Bar (Top)** - Search and add restaurants from Google Maps
2. **Plus Button (FAB)** - Opens AddItemModal for manual restaurant/food entry
3. **Clipboard Button (Top)** - Shows last added restaurant's menu for quick food additions

## 🎯 Optimized Workflow Strategy

### **Recommended Flow: "Restaurant-First, Then Food"**

This is the most efficient approach because:

- ✅ You always know which restaurant you're adding food to
- ✅ Reduces cognitive load (one task at a time)
- ✅ Minimizes errors (no orphaned food items)
- ✅ Natural user flow (find place → add dishes)

---

## 📋 Optimized Implementation Plan

### **Option 1: Smart Context-Aware Modal (RECOMMENDED)**

The AddItemModal becomes intelligent and adapts based on context:

```typescript
// Enhanced state management
const [lastAddedRestaurant, setLastAddedRestaurant] =
  useState<Restaurant | null>(null);
const [addModalMode, setAddModalMode] = useState<
  'restaurant' | 'food' | 'both'
>('both');
```

#### **Behavior:**

1. **If NO restaurant selected:**

   - Plus button opens modal in "Restaurant Mode"
   - Shows: "Add Restaurant" → Search or manual entry
   - After saving → Auto-switches to "Food Mode" for that restaurant

2. **If restaurant JUST added (within last 5 minutes):**

   - Plus button opens modal in "Food Mode"
   - Pre-filled with that restaurant
   - Quick add multiple dishes
   - Show banner: "Adding to [Restaurant Name] • Change Restaurant"

3. **If clipboard has restaurant:**
   - Clipboard button shows restaurant badge with count
   - Tap → Opens quick food entry drawer
   - Swipe up → Full menu view

#### **Implementation:**

```typescript
// In home screen
const handleFABPress = () => {
  if (lastAddedRestaurant && isRecentlyAdded(lastAddedRestaurant)) {
    // Quick food mode
    setAddModalMode('food');
    setShowAddModal(true);
  } else {
    // Smart mode - ask user
    setAddModalMode('both');
    setShowAddModal(true);
  }
};

// Check if restaurant was recently added (5 minutes)
const isRecentlyAdded = (restaurant: Restaurant) => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return restaurant.addedAt && restaurant.addedAt > fiveMinutesAgo;
};
```

---

### **Option 2: Two-Step Sequential Flow**

Simplest and clearest UX:

#### **Step 1: Add Restaurant**

- Plus button → "Add Restaurant" screen
- Options:
  1. Search Google Maps (SerpAPI)
  2. Manual entry (name, address, cuisine)
  3. Import from Instagram

#### **Step 2: Add Food Items**

- After restaurant saved → Auto-navigate to "Add Food" screen
- Context persisted: "Adding to [Restaurant Name]"
- Quick multi-add interface:
  - Food name input
  - Category dropdown (Appetizer, Main, Dessert, etc.)
  - Price (optional)
  - Notes (optional)
  - "Add Another" button
  - "Done" button

#### **UI Flow:**

```
[Plus FAB]
    ↓
[Add Restaurant Screen]
    ↓ Save
[Success + "Add Dishes?" prompt]
    ↓ Yes
[Quick Food Entry Screen]
    ↓ Add items
[Restaurant Detail Page with new items]
```

---

### **Option 3: Tabbed Modal (Most Flexible)**

Single modal with two tabs:

```
┌─────────────────────────────────────┐
│  Add Restaurant  |  Add Food Items  │
├─────────────────────────────────────┤
│                                     │
│  [Content based on active tab]      │
│                                     │
└─────────────────────────────────────┘
```

**Tab 1: Add Restaurant**

- Search or manual entry
- Save button stores to clipboard

**Tab 2: Add Food Items**

- Dropdown: Select restaurant (shows recent + clipboard)
- If none selected: "Add a restaurant first" message
- Quick food entry form
- "Add Another Food" button

**Advantage:** User can switch between adding restaurant and food without closing modal

---

## 🎨 UI/UX Enhancements

### 1. **Visual Restaurant Context**

When adding food, always show which restaurant:

```
┌─────────────────────────────────────┐
│ 🍽️ Adding to: The Test Kitchen     │
│    [Change Restaurant ×]            │
├─────────────────────────────────────┤
│ Food Name: ___________________      │
│ Category:  [Dropdown]              │
│ Price:     R_______                │
│                                     │
│ [+ Add Another]  [Done]            │
└─────────────────────────────────────┘
```

### 2. **Clipboard Badge Enhancement**

Current clipboard button should show:

- Restaurant name (truncated)
- Food item count
- Recent indicator (dot/badge)

```typescript
<TouchableOpacity style={styles.clipboardButton}>
  <Clipboard size={20} />
  {lastAddedRestaurant && (
    <>
      <View style={styles.clipboardBadge}>
        <Text>{foodItemCount}</Text>
      </View>
      <View style={styles.recentDot} />
    </>
  )}
</TouchableOpacity>
```

### 3. **Quick Action After Search**

When user selects restaurant from search:

```
┌─────────────────────────────────────┐
│ ✅ Restaurant Added Successfully!   │
│                                     │
│ What would you like to do next?     │
│                                     │
│ [Add Menu Items]  [View on Map]    │
│                                     │
│ [Done]                              │
└─────────────────────────────────────┘
```

---

## 🔄 State Management Strategy

### **Context/Hook for Restaurant-Food Flow**

```typescript
// hooks/useRestaurantFoodFlow.ts
export const useRestaurantFoodFlow = () => {
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(
    null
  );
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  const startRestaurantSession = (restaurant: Restaurant) => {
    setActiveRestaurant(restaurant);
    setSessionStartTime(Date.now());
    // Store in clipboard
    AsyncStorage.setItem('lastRestaurant', JSON.stringify(restaurant));
  };

  const isSessionActive = () => {
    const fiveMinutes = 5 * 60 * 1000;
    return activeRestaurant && Date.now() - sessionStartTime < fiveMinutes;
  };

  const addFoodToActiveRestaurant = async (food: FoodItem) => {
    if (!activeRestaurant) throw new Error('No active restaurant');
    return await foodService.addFood(activeRestaurant.id, food);
  };

  const endSession = () => {
    setActiveRestaurant(null);
  };

  return {
    activeRestaurant,
    startRestaurantSession,
    isSessionActive,
    addFoodToActiveRestaurant,
    endSession,
  };
};
```

### **Usage in Home Screen**

```typescript
const { activeRestaurant, startRestaurantSession, isSessionActive } =
  useRestaurantFoodFlow();

// After restaurant added via search
const handleSelectPlace = async (place: GooglePlace) => {
  const restaurant = await createRestaurantFromPlace(place);
  startRestaurantSession(restaurant);

  // Show success + ask about food
  Alert.alert('Restaurant Added!', 'Would you like to add menu items now?', [
    { text: 'Later', style: 'cancel' },
    {
      text: 'Add Items',
      onPress: () => {
        setAddModalMode('food');
        setShowAddModal(true);
      },
    },
  ]);
};
```

---

## 🚀 Quick Win Improvements (Implement First)

### 1. **Filter Search to Restaurants Only** ✅ DONE

```typescript
q: `${query} restaurant`; // in SerpAPI params
```

### 2. **Add Session Timer to Clipboard**

Show time elapsed: "Added 2m ago"

### 3. **Quick Food Entry Bottom Sheet**

Instead of full modal, use bottom sheet for faster food entry:

- Swipe up from clipboard button
- Shows last restaurant + quick form
- "Add Another" button visible
- Dismiss by swiping down

### 4. **Smart FAB States**

```typescript
// FAB shows different icons based on context
const getFABIcon = () => {
  if (isSessionActive()) return <UtensilsCrossed />; // Food mode
  return <Plus />; // Restaurant mode
};

const getFABColor = () => {
  if (isSessionActive()) return COLORS.success; // Green = food mode
  return COLORS.primary; // Pink = restaurant mode
};
```

### 5. **Recent Restaurant Dropdown**

When adding food, show last 5 restaurants in dropdown:

```
Select Restaurant:
- The Test Kitchen (2 items) [Just Added]
- Nando's (5 items) [Today]
- La Colombe (3 items) [Yesterday]
---
+ Add New Restaurant
```

---

## 📊 Metrics to Track

To validate optimization:

1. **Time to Complete Flow**

   - Measure: Restaurant search → Food added → Confirm
   - Target: < 60 seconds

2. **Completion Rate**

   - % of users who add food after adding restaurant
   - Target: > 70%

3. **Error Rate**

   - Food items added without restaurant
   - Target: < 5%

4. **Session Success**
   - Users who add 3+ food items per restaurant
   - Target: > 50%

---

## 🎯 Recommended Implementation: **Option 1 (Smart Context-Aware Modal)**

**Why?**

- ✅ Least disruptive to current UI
- ✅ Automatically guides users through flow
- ✅ No new screens to design
- ✅ Leverages existing components
- ✅ Progressive enhancement (works now, better over time)

**Priority Implementation Order:**

1. **Phase 1 (30 minutes):**

   - Add `lastAddedRestaurant` state to home screen
   - Filter search to restaurants only ✅ DONE
   - Store timestamp when restaurant added

2. **Phase 2 (1 hour):**

   - Modify `AddItemModal` to accept `mode` prop
   - Add restaurant context banner when in food mode
   - Pre-fill restaurant field when context exists

3. **Phase 3 (1 hour):**

   - Update clipboard button to show restaurant badge
   - Add "Change Restaurant" option in food mode
   - Implement session timeout (5 minutes)

4. **Phase 4 (30 minutes):**
   - Add success prompt after restaurant added
   - Implement quick food entry bottom sheet
   - Add "Add Another" button in food mode

**Total Time: ~3 hours**

---

## 📝 Code Snippets

### Enhanced AddItemModal Props

```typescript
interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  mode?: 'restaurant' | 'food' | 'both'; // New prop
  contextRestaurant?: Restaurant; // Pre-selected restaurant
  onRestaurantAdded?: (restaurant: Restaurant) => void; // Callback
}
```

### Smart Modal Header

```typescript
const renderModalHeader = () => {
  if (mode === 'food' && contextRestaurant) {
    return (
      <View style={styles.contextBanner}>
        <Text style={styles.contextLabel}>Adding to:</Text>
        <Text style={styles.contextRestaurant}>{contextRestaurant.name}</Text>
        <TouchableOpacity onPress={clearContext}>
          <Text style={styles.changeButton}>Change</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Text style={styles.modalTitle}>
      {mode === 'restaurant' ? 'Add Restaurant' : 'Add Item'}
    </Text>
  );
};
```

### Session Management

```typescript
// Store in AsyncStorage for persistence
const RESTAURANT_SESSION_KEY = 'active_restaurant_session';

const saveSession = async (restaurant: Restaurant) => {
  await AsyncStorage.setItem(
    RESTAURANT_SESSION_KEY,
    JSON.stringify({
      restaurant,
      timestamp: Date.now(),
    })
  );
};

const loadSession = async () => {
  const data = await AsyncStorage.getItem(RESTAURANT_SESSION_KEY);
  if (!data) return null;

  const { restaurant, timestamp } = JSON.parse(data);
  const fiveMinutes = 5 * 60 * 1000;

  if (Date.now() - timestamp > fiveMinutes) {
    await AsyncStorage.removeItem(RESTAURANT_SESSION_KEY);
    return null;
  }

  return restaurant;
};
```

---

## 🎉 Expected Outcomes

After implementing this optimization:

1. **User adds restaurant** → Search/Manual → Save
2. **Prompt appears** → "Add menu items?" → Yes
3. **Food entry mode** → Context shown → Quick multi-add
4. **Session persists** → FAB changes color → Clipboard shows count
5. **Within 5 minutes** → Any FAB tap = food mode
6. **After 5 minutes** → Reset to normal flow

**Result:** Smooth, intuitive flow that guides users without being intrusive.

---

## 🔧 Alternative: Bottom Sheet Workflow

If you want even faster entry:

```typescript
// Replace AddItemModal with BottomSheet for food entry
import BottomSheet from '@gorhom/bottom-sheet';

const QuickFoodEntrySheet = ({ restaurant }) => {
  const snapPoints = ['25%', '50%', '80%'];

  return (
    <BottomSheet snapPoints={snapPoints}>
      <View style={styles.header}>
        <Text>Adding to {restaurant.name}</Text>
      </View>

      <ScrollView>
        {foodItems.map((item) => (
          <FoodItemCard key={item.id} item={item} />
        ))}

        <QuickFoodForm onAdd={handleAddFood} />
      </ScrollView>

      <Button title="Add Another" />
      <Button title="Done" />
    </BottomSheet>
  );
};
```

This allows users to:

- See existing food items while adding new ones
- Quickly add multiple items without closing modal
- Swipe to dismiss when done

---

## Summary

**Best Practice:** Always add restaurant first, then immediately offer to add food items while context is fresh.

**Key Features:**

- Context-aware modal behavior
- Visual indicators (badges, colors, banners)
- Session management (5-minute window)
- Quick multi-add capability
- Progressive disclosure (don't overwhelm)

**Implementation:** Start with Phase 1-2 for immediate impact, then iterate based on user behavior.
