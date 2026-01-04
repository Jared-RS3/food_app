# Quick Implementation Guide - Restaurant-Food Flow

## ✅ Completed: Filter Restaurants Only

The search now:

- Appends "restaurant" to all queries
- Filters results to only show restaurants, cafes, food places
- Excludes hotels, stores, and other non-food businesses

## 🚀 Next Steps (Priority Order)

### Phase 1: Add Session Management (30 minutes)

**File: `app/(tabs)/index.tsx`**

```typescript
// Add to state declarations (around line 104)
const [lastAddedRestaurant, setLastAddedRestaurant] =
  useState<Restaurant | null>(null);
const [restaurantSessionTime, setRestaurantSessionTime] = useState<
  number | null
>(null);

// Add helper function
const isSessionActive = () => {
  if (!lastAddedRestaurant || !restaurantSessionTime) return false;
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - restaurantSessionTime < fiveMinutes;
};

// Update handleSelectPlace function (around line 688)
const handleSelectPlace = async (place: any) => {
  try {
    setShowPlacesSearch(false);

    const newRestaurant: Restaurant = {
      // ... existing code ...
    };

    // Add to restaurants list
    setRestaurants((prev) => {
      const exists = prev.some((r) => r.id === newRestaurant.id);
      if (exists) return prev;
      return [newRestaurant, ...prev];
    });

    // 🆕 START SESSION
    setLastAddedRestaurant(newRestaurant);
    setRestaurantSessionTime(Date.now());

    // Select and show the new restaurant
    setSelectedRestaurant(newRestaurant);
    setShowBottomSheet(true);

    // 🆕 ASK ABOUT ADDING FOOD
    setTimeout(() => {
      Alert.alert(
        'Restaurant Added! 🎉',
        `Would you like to add menu items to ${newRestaurant.name}?`,
        [
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => {
              // Session still active for 5 minutes
            },
          },
          {
            text: 'Add Items',
            onPress: () => {
              setShowBottomSheet(false);
              setTimeout(() => {
                setShowAddModal(true);
              }, 300);
            },
          },
        ]
      );
    }, 500);

    // Animate map
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: newRestaurant.latitude!,
          longitude: newRestaurant.longitude!,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }

    hapticLight();
  } catch (error) {
    console.error('Error selecting place:', error);
    Alert.alert('Error', 'Failed to add restaurant');
  }
};
```

### Phase 2: Update AddItemModal to be Context-Aware (1 hour)

**File: `components/AddItemModal.tsx`**

Add these props:

```typescript
interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  contextRestaurant?: Restaurant; // 🆕 Pre-selected restaurant
  mode?: 'restaurant' | 'food' | 'both'; // 🆕 Modal mode
}
```

Add context banner at top of modal:

```typescript
{
  contextRestaurant && (
    <View style={styles.contextBanner}>
      <View style={styles.contextInfo}>
        <Text style={styles.contextLabel}>Adding to:</Text>
        <Text style={styles.contextRestaurant}>{contextRestaurant.name}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          // Clear context and switch to restaurant mode
        }}
        style={styles.changeButton}
      >
        <Text style={styles.changeButtonText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Phase 3: Smart FAB Button (30 minutes)

**File: `app/(tabs)/index.tsx`**

Update the Plus FAB button to be context-aware:

```typescript
{
  /* Floating Add Button - Context Aware */
}
{
  !showBottomSheet && (
    <Animated.View
      style={[
        styles.floatingAddButton,
        isSheetClosed && styles.floatingAddButtonClosed,
        // 🆕 Change color when session active
        isSessionActive() && styles.floatingAddButtonActive,
      ]}
    >
      <TouchableOpacity
        style={styles.floatingAddButtonInner}
        onPress={() => {
          if (isSessionActive()) {
            // Quick food mode
            setShowAddModal(true);
            // Pass context to modal
          } else {
            // Normal mode
            setShowAddModal(true);
          }
        }}
        activeOpacity={0.9}
      >
        {isSessionActive() ? (
          // Show utensils icon when in food mode
          <UtensilsCrossed size={29} color={COLORS.white} strokeWidth={2.5} />
        ) : (
          // Show plus icon for restaurant mode
          <Plus size={29} color={COLORS.white} strokeWidth={2.5} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
```

Add styles:

```typescript
floatingAddButtonActive: {
  backgroundColor: COLORS.success, // Green when in food mode
},
```

### Phase 4: Enhanced Clipboard Badge (30 minutes)

**File: `app/(tabs)/index.tsx`**

Update clipboard button to show restaurant info:

```typescript
<TouchableOpacity
  style={styles.clipboardButton}
  onPress={() => {
    if (lastAddedRestaurant && isSessionActive()) {
      // Open menu for last restaurant
      setIsMenuVisible(true);
    } else {
      setIsMenuVisible(true);
    }
  }}
>
  <Clipboard size={20} color={COLORS.white} />

  {/* 🆕 Show badge when session active */}
  {lastAddedRestaurant && isSessionActive() && (
    <>
      <View style={styles.clipboardBadge}>
        <Text style={styles.clipboardBadgeText}>
          {restaurantMenus[lastAddedRestaurant.id]?.length || 0}
        </Text>
      </View>
      <View style={styles.clipboardDot} />
    </>
  )}
</TouchableOpacity>
```

Add styles:

```typescript
clipboardBadge: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: COLORS.error,
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: COLORS.white,
},
clipboardBadgeText: {
  color: COLORS.white,
  fontSize: 10,
  fontWeight: '700',
},
clipboardDot: {
  position: 'absolute',
  bottom: -2,
  right: -2,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: COLORS.success,
},
```

## 🎨 Optional: Add Session Timer Display

Show "Added 2m ago" in clipboard tooltip:

```typescript
{
  lastAddedRestaurant && isSessionActive() && (
    <View style={styles.sessionTimer}>
      <Text style={styles.sessionTimerText}>
        {getTimeSinceAdded(restaurantSessionTime)}
      </Text>
    </View>
  );
}

// Helper function
const getTimeSinceAdded = (timestamp: number | null) => {
  if (!timestamp) return '';
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes === 0) return 'Just now';
  return `${minutes}m ago`;
};
```

## 🔄 Update Flow Diagram

```
User Journey:

1. Tap Search → Find Restaurant → Select
   ↓
2. Alert: "Add menu items?"
   → Later: Session active for 5 min
   → Add Items: Open modal in food mode
   ↓
3. FAB turns green (food mode icon)
   Clipboard shows badge with count
   ↓
4. User can:
   - Tap FAB → Quick add food
   - Tap Clipboard → View menu
   - Continue browsing (session expires in 5 min)
   ↓
5. After 5 minutes:
   - FAB returns to pink/plus icon
   - Clipboard badge disappears
   - Normal flow resumes
```

## 📦 Required Imports

Add to `app/(tabs)/index.tsx`:

```typescript
import { UtensilsCrossed } from 'lucide-react-native';
```

## ✅ Testing Checklist

- [ ] Search for restaurant → Verify alert appears
- [ ] Tap "Add Items" → Verify modal opens
- [ ] Add food item → Verify it saves to correct restaurant
- [ ] Check clipboard badge → Verify count updates
- [ ] Wait 5+ minutes → Verify session expires
- [ ] FAB icon changes → Green (food mode) / Pink (restaurant mode)
- [ ] Clipboard button → Shows restaurant context

## 🎯 Expected Results

**Before:**

- User adds restaurant via search
- User manually opens add modal
- User manually selects restaurant from dropdown
- User adds food items one by one

**After:**

- User adds restaurant via search
- Prompted immediately to add food
- Restaurant pre-selected
- Can quickly add multiple items
- Visual indicators show active session
- FAB and clipboard provide quick access

**Time Saved:** ~40-50% reduction in steps (from 6 steps to 3-4 steps)

## 🚨 Edge Cases to Handle

1. **User adds restaurant manually (not via search)**

   - Still trigger session
   - Show same prompt

2. **User adds multiple restaurants quickly**

   - Session switches to most recent
   - Old session expires

3. **App closed and reopened**

   - Persist session to AsyncStorage
   - Restore if < 5 minutes

4. **User wants to add food to different restaurant**
   - "Change Restaurant" button in modal
   - Clear session and show restaurant picker

## 📱 UI States

### FAB Icon States:

- **Pink + Plus** = Restaurant mode (default)
- **Green + Utensils** = Food mode (session active)

### Clipboard Badge:

- **No badge** = No active session
- **Number badge** = Active session with N food items
- **Green dot** = Recent activity

### Modal Header:

- **No context** = "Add Item" (show both options)
- **With context** = "Adding to [Restaurant]" (food-focused)

---

**Implementation Time: ~2-3 hours for all phases**

**Impact: Significant UX improvement with minimal code changes**
