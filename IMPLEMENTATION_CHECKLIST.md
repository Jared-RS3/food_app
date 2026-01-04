# Implementation Checklist - Restaurant-Food Flow

## ✅ COMPLETED

### 1. Filter Search to Restaurants Only

**File:** `components/GooglePlacesSearch.tsx`

- ✅ Added "restaurant" to search query
- ✅ Added filtering logic to exclude non-restaurant places
- ✅ Verified: Search now only returns restaurants, cafes, and food places

---

## 🔄 TO IMPLEMENT

### Phase 1: Session Management (IMMEDIATE - 30 min)

**Goal:** Track the last added restaurant and create a 5-minute session

**File:** `app/(tabs)/index.tsx`

**Changes needed:**

1. **Add state variables** (after line 103):

```typescript
const [lastAddedRestaurant, setLastAddedRestaurant] =
  useState<Restaurant | null>(null);
const [restaurantSessionTime, setRestaurantSessionTime] = useState<
  number | null
>(null);
```

2. **Add helper function** (after line 233):

```typescript
const isSessionActive = () => {
  if (!lastAddedRestaurant || !restaurantSessionTime) return false;
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - restaurantSessionTime < fiveMinutes;
};

const getSessionTimeRemaining = () => {
  if (!restaurantSessionTime) return 0;
  const fiveMinutes = 5 * 60 * 1000;
  const elapsed = Date.now() - restaurantSessionTime;
  return Math.max(0, fiveMinutes - elapsed);
};
```

3. **Update handleSelectPlace** (around line 688):

Find this code:

```typescript
const handleSelectPlace = async (place: any) => {
  try {
    setShowPlacesSearch(false);

    const newRestaurant: Restaurant = {
      // ... existing restaurant creation ...
    };

    // Add to restaurants list
    setRestaurants((prev) => {
      const exists = prev.some((r) => r.id === newRestaurant.id);
      if (exists) return prev;
      return [newRestaurant, ...prev];
    });
```

Add after the `setRestaurants` call:

```typescript
// START SESSION - Track this restaurant
setLastAddedRestaurant(newRestaurant);
setRestaurantSessionTime(Date.now());
setLastFoodRestaurant(newRestaurant); // For clipboard
```

Then before `hapticLight()`, add:

```typescript
// Prompt user to add food items
setTimeout(() => {
  Alert.alert(
    '✅ Restaurant Added!',
    `Would you like to add menu items to ${newRestaurant.name}?`,
    [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'Add Menu Items',
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
```

---

### Phase 2: Smart FAB (1 hour)

**Goal:** Change FAB icon and color based on session state

**Changes needed:**

1. **Import UtensilsCrossed icon** (line 18):

```typescript
import {
  Bell,
  ChevronUp,
  Clipboard,
  Instagram,
  MapPin,
  Plus,
  Search,
  Star,
  UtensilsCrossed, // 🆕 ADD THIS
  X,
} from 'lucide-react-native';
```

2. **Update FAB render** (around line 1690):

Replace:

```typescript
{
  /* Floating Add Button */
}
{
  !showBottomSheet && (
    <Animated.View
      style={[
        styles.floatingAddButton,
        isSheetClosed && styles.floatingAddButtonClosed,
      ]}
    >
      <TouchableOpacity
        style={styles.floatingAddButtonInner}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.9}
      >
        <Plus size={29} color={COLORS.white} strokeWidth={2.5} />
      </TouchableOpacity>
    </Animated.View>
  );
}
```

With:

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
      ]}
    >
      <TouchableOpacity
        style={[
          styles.floatingAddButtonInner,
          isSessionActive() && styles.floatingAddButtonInnerActive,
        ]}
        onPress={() => setShowAddModal(true)}
        onLongPress={() => {
          if (isSessionActive()) {
            Alert.alert(
              '🍽️ Food Mode Active',
              `Adding items to: ${
                lastAddedRestaurant?.name
              }\n\nSession expires in ${Math.ceil(
                getSessionTimeRemaining() / 60000
              )} minutes`,
              [
                { text: 'OK' },
                {
                  text: 'End Session',
                  onPress: () => {
                    setLastAddedRestaurant(null);
                    setRestaurantSessionTime(null);
                  },
                  style: 'destructive',
                },
              ]
            );
          }
        }}
        activeOpacity={0.9}
      >
        {isSessionActive() ? (
          <UtensilsCrossed size={28} color={COLORS.white} strokeWidth={2.5} />
        ) : (
          <Plus size={29} color={COLORS.white} strokeWidth={2.5} />
        )}
      </TouchableOpacity>

      {/* Session indicator dot */}
      {isSessionActive() && <View style={styles.sessionIndicator} />}
    </Animated.View>
  );
}
```

3. **Add styles** (around line 2978):

```typescript
floatingAddButtonInnerActive: {
  backgroundColor: '#10B981', // Green for food mode
},
sessionIndicator: {
  position: 'absolute',
  top: 4,
  right: 4,
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#34D399',
  borderWidth: 2,
  borderColor: COLORS.white,
},
```

---

### Phase 3: Enhanced Clipboard (30 min)

**Goal:** Show badge with food count when session is active

**Changes needed:**

1. **Find clipboard button** in `renderMapHeader()` (around line 870):

Replace:

```typescript
<TouchableOpacity
  style={styles.filterButton}
  onPress={() => setIsMenuVisible(true)}
>
  <Clipboard size={20} color={COLORS.primary} strokeWidth={2.5} />
  {lastFoodRestaurant && <View style={styles.menuBadge} />}
</TouchableOpacity>
```

With:

```typescript
<TouchableOpacity
  style={styles.filterButton}
  onPress={() => {
    if (isSessionActive() && lastAddedRestaurant) {
      // Quick access to last restaurant menu
      setIsMenuVisible(true);
    } else {
      setIsMenuVisible(true);
    }
  }}
  onLongPress={() => {
    if (isSessionActive() && lastAddedRestaurant) {
      Alert.alert(
        '📋 Active Session',
        `Restaurant: ${lastAddedRestaurant.name}\nMenu Items: ${
          restaurantMenus[lastAddedRestaurant.id]?.length || 0
        }`,
        [{ text: 'OK' }]
      );
    }
  }}
>
  <Clipboard size={20} color={COLORS.primary} strokeWidth={2.5} />

  {/* Enhanced badge */}
  {isSessionActive() && lastAddedRestaurant && (
    <>
      <View style={styles.menuBadgeWithCount}>
        <Text style={styles.menuBadgeText}>
          {restaurantMenus[lastAddedRestaurant.id]?.length || 0}
        </Text>
      </View>
      <View style={styles.activeSessionDot} />
    </>
  )}

  {/* Fallback to old badge */}
  {!isSessionActive() && lastFoodRestaurant && (
    <View style={styles.menuBadge} />
  )}
</TouchableOpacity>
```

2. **Add styles** (around line 2200):

```typescript
menuBadgeWithCount: {
  position: 'absolute',
  top: -6,
  right: -6,
  backgroundColor: COLORS.error,
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: COLORS.white,
  paddingHorizontal: 4,
},
menuBadgeText: {
  color: COLORS.white,
  fontSize: 10,
  fontWeight: '700',
},
activeSessionDot: {
  position: 'absolute',
  bottom: -2,
  right: -2,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#10B981',
  borderWidth: 2,
  borderColor: COLORS.white,
},
```

---

### Phase 4: Modal Context (1 hour)

**Goal:** Make AddItemModal aware of restaurant context

**File:** `components/AddItemModal.tsx`

**Changes needed:**

1. **Update props interface**:

```typescript
interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  contextRestaurant?: Restaurant; // 🆕 ADD THIS
  onRestaurantAdded?: (restaurant: Restaurant) => void; // 🆕 ADD THIS
}
```

2. **Add context banner** at top of modal content:

```typescript
{
  contextRestaurant && (
    <View style={styles.contextBanner}>
      <View style={styles.contextLeft}>
        <Text style={styles.contextLabel}>Adding to:</Text>
        <Text style={styles.contextRestaurantName} numberOfLines={1}>
          {contextRestaurant.name}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.contextChangeButton}
        onPress={() => {
          // TODO: Show restaurant picker or clear context
          Alert.alert(
            'Change Restaurant',
            'This will let you select a different restaurant'
          );
        }}
      >
        <Text style={styles.contextChangeText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
}
```

3. **Add context styles**:

```typescript
contextBanner: {
  backgroundColor: '#F0F9FF',
  borderLeftWidth: 4,
  borderLeftColor: COLORS.primary,
  padding: SPACING.md,
  marginBottom: SPACING.lg,
  borderRadius: BORDER_RADIUS.md,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
contextLeft: {
  flex: 1,
},
contextLabel: {
  fontSize: FONT_SIZES.xs,
  color: COLORS.gray[600],
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
contextRestaurantName: {
  fontSize: FONT_SIZES.lg,
  fontWeight: '700',
  color: COLORS.text,
  marginTop: 2,
},
contextChangeButton: {
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.xs,
  backgroundColor: COLORS.white,
  borderRadius: BORDER_RADIUS.md,
  borderWidth: 1,
  borderColor: COLORS.gray[300],
},
contextChangeText: {
  fontSize: FONT_SIZES.sm,
  color: COLORS.primary,
  fontWeight: '600',
},
```

4. **Update modal call in home screen** (around line 1706):

```typescript
<AddItemModal
  visible={showAddModal}
  onClose={() => setShowAddModal(false)}
  onSave={handleAddItem}
  contextRestaurant={isSessionActive() ? lastAddedRestaurant : undefined} // 🆕 ADD THIS
  onRestaurantAdded={(restaurant) => {
    // Start new session
    setLastAddedRestaurant(restaurant);
    setRestaurantSessionTime(Date.now());
    setLastFoodRestaurant(restaurant);
  }}
/>
```

---

## 🎯 Testing Checklist

After implementing each phase:

### Phase 1 Tests:

- [ ] Search for restaurant
- [ ] Select restaurant from results
- [ ] Verify alert appears: "Would you like to add menu items?"
- [ ] Tap "Later" - session should still be active
- [ ] Tap "Add Menu Items" - modal should open

### Phase 2 Tests:

- [ ] After adding restaurant, FAB should show utensils icon
- [ ] FAB should have green background
- [ ] Long press FAB to see session info
- [ ] Wait 5+ minutes, FAB should return to plus icon
- [ ] FAB should return to pink background

### Phase 3 Tests:

- [ ] Clipboard should show count badge during session
- [ ] Badge should show number of food items
- [ ] Green dot should appear on clipboard
- [ ] Long press clipboard to see restaurant info
- [ ] After session expires, badge should disappear

### Phase 4 Tests:

- [ ] Open AddItemModal during active session
- [ ] Verify blue banner shows: "Adding to: [Restaurant Name]"
- [ ] Tap "Change" button - should show alert
- [ ] Add food item - should save to correct restaurant
- [ ] Close modal, reopen - context should persist

---

## 📊 Expected Behavior

### User Flow Example:

1. **Search** "Nando's" → Select restaurant
2. **Alert** appears: "Add menu items?"
3. **Tap** "Add Menu Items"
4. **Modal** opens with blue banner: "Adding to: Nando's"
5. **Add** "Peri-Peri Chicken"
6. **Close** modal
7. **Notice:**
   - FAB is green with utensils icon
   - Clipboard shows badge "1"
8. **Tap** FAB again → Modal opens still in Nando's context
9. **Add** "Spicy Rice"
10. **Notice:** Clipboard badge now shows "2"
11. **Wait** 5 minutes → FAB returns to pink/plus, badge disappears

### Visual State Changes:

| State           | FAB Icon | FAB Color | Clipboard Badge | Session        |
| --------------- | -------- | --------- | --------------- | -------------- |
| Default         | Plus (+) | Pink      | None            | Inactive       |
| Active Session  | Utensils | Green     | Count + Dot     | Active (5 min) |
| Session Expired | Plus (+) | Pink      | None            | Inactive       |

---

## 🚨 Important Notes

1. **Session Duration**: Currently set to 5 minutes. Adjust in `isSessionActive()` if needed.

2. **Persistence**: Session is NOT persisted across app restarts (intentional - fresh context each session).

3. **Multiple Restaurants**: Adding a new restaurant starts a new session (overwrites previous).

4. **Manual Clear**: Users can long-press FAB to manually end session.

---

## 📦 Files Modified Summary

- ✅ `components/GooglePlacesSearch.tsx` - Restaurants filter
- 🔄 `app/(tabs)/index.tsx` - Session management, smart FAB, clipboard badges
- 🔄 `components/AddItemModal.tsx` - Context-aware modal

**Total Changes:** ~200 lines of code across 3 files

**Time Estimate:** 2-3 hours total

**Impact:** Massive UX improvement for restaurant/food workflow
