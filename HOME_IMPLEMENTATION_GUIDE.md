# 🎯 Home Page Transformation - Implementation Guide

## Overview

Transform the map-based home page into a clean, card-based Fresha-style explore page with integrated search from My Places.

---

## ✨ What Changes

### BEFORE (Current Home):

```tsx
┌──────────────────────────────────────┐
│  [Gradient Hero - 300px]            │
│  Great Places Near You              │
│  [Search button]                    │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│                                      │
│        [MAP VIEW]                    │
│     with restaurant markers          │
│                                      │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ [Floating Bottom Sheet]              │
│  Featured Restaurants Carousel       │
└──────────────────────────────────────┘
```

### AFTER (New Card-Based Home):

```tsx
┌──────────────────────────────────────┐
│  Discover                      🔔 📋 │ ← Clean white header
│  Kuils River                         │    120px (was 300px)
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 🔍 Search restaurants...    🎚️│ │ ← Search with filter
│  └────────────────────────────────┘ │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Restaurants | Food | Markets       │ ← Type switcher
│  ══════════                          │    (like My Places)
│                                      │
│  [All] [Italian] [Asian] [Fast Food]│ ← Filter chips
│                                      │
│  ┌────────────────────────────────┐ │
│  │ [Restaurant Card]              │ │ ← Cards (not map)
│  ├────────────────────────────────┤ │    Fresha flat style
│  │ [Restaurant Card]              │ │
│  ├────────────────────────────────┤ │
│  │ [Restaurant Card]              │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 🎨 Key Features Added

### 1. **Clean Header** (Fresha Style)

```tsx
✓ White background (no gradient)
✓ Simple location display
✓ Icon buttons (notifications, menu)
✓ 120px height (60% smaller)
```

### 2. **Integrated Search Bar**

```tsx
✓ Real-time search input
✓ Filter button (opens FilterBottomSheet)
✓ Clear button when typing
✓ Gray[50] background
✓ Minimal design
```

### 3. **Type Switcher** (From My Places)

```tsx
✓ Restaurants | Food | Markets tabs
✓ Underline indicator
✓ Icon + text
✓ Fresha horizontal style
```

### 4. **Filter Pills**

```tsx
✓ Horizontal scroll
✓ Category chips (All, Italian, Asian, etc.)
✓ Active state with primary color
✓ Gray[50] background
```

### 5. **Card-Based List**

```tsx
✓ ScrollView with restaurant cards
✓ Flat Fresha design
✓ Filtered by search + category
✓ Same cards as My Places
```

---

## 📁 Files to Modify

### 1. `/app/(tabs)/index.tsx`

**Changes:**

- Remove map view and map-related code
- Add search state and logic
- Add type switcher state (restaurants/food/markets)
- Replace `renderMapHeader()` with `renderCleanHeader()`
- Replace map view with `ScrollView` + cards
- Add `FilterBottomSheet` integration
- Keep all existing data fetching

**Estimated Lines Changed:** ~800 lines

---

## 🔧 Implementation Steps

### Step 1: Add New State Variables

```tsx
// Search functionality
const [searchQuery, setSearchQuery] = useState('');
const [searchType, setSearchType] = useState<
  'restaurants' | 'food' | 'markets'
>('restaurants');
const [isFilterVisible, setIsFilterVisible] = useState(false);
const [activeFilters, setActiveFilters] = useState<string[]>([]);

// Keep existing states for data
```

### Step 2: Create Clean Header Component

```tsx
const renderCleanHeader = () => (
  <View style={styles.cleanHeader}>
    {/* Location + Icons Row */}
    <View style={styles.headerTop}>
      <View style={styles.locationContainer}>
        <MapPin size={16} color={COLORS.gray[600]} />
        <Text style={styles.locationText}>Kuils River</Text>
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={20} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Clipboard size={20} color={COLORS.gray[700]} />
        </TouchableOpacity>
      </View>
    </View>

    {/* Title */}
    <Text style={styles.pageTitle}>Discover</Text>

    {/* Search Bar */}
    <View style={styles.searchBarContainer}>
      <Search size={20} color={COLORS.gray[400]} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants, food, markets..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={COLORS.gray[400]}
      />
      {searchQuery && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <X size={18} color={COLORS.gray[400]} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.filterIconButton}
        onPress={() => setIsFilterVisible(true)}
      >
        <SlidersHorizontal size={18} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  </View>
);
```

### Step 3: Create Type Switcher

```tsx
const renderTypeSwitcher = () => (
  <View style={styles.typeSwitcherContainer}>
    <TouchableOpacity
      style={[
        styles.typeTab,
        searchType === 'restaurants' && styles.activeTypeTab,
      ]}
      onPress={() => setSearchType('restaurants')}
    >
      <UtensilsCrossed
        size={18}
        color={searchType === 'restaurants' ? COLORS.primary : COLORS.gray[500]}
      />
      <Text
        style={[
          styles.typeTabText,
          searchType === 'restaurants' && styles.activeTypeTabText,
        ]}
      >
        Restaurants
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.typeTab, searchType === 'food' && styles.activeTypeTab]}
      onPress={() => setSearchType('food')}
    >
      <Coffee
        size={18}
        color={searchType === 'food' ? COLORS.primary : COLORS.gray[500]}
      />
      <Text
        style={[
          styles.typeTabText,
          searchType === 'food' && styles.activeTypeTabText,
        ]}
      >
        Food
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.typeTab, searchType === 'markets' && styles.activeTypeTab]}
      onPress={() => setSearchType('markets')}
    >
      <Store
        size={18}
        color={searchType === 'markets' ? COLORS.primary : COLORS.gray[500]}
      />
      <Text
        style={[
          styles.typeTabText,
          searchType === 'markets' && styles.activeTypeTabText,
        ]}
      >
        Markets
      </Text>
    </TouchableOpacity>
  </View>
);
```

### Step 4: Create Filter Pills

```tsx
const renderFilterPills = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.filterPillsContainer}
    contentContainerStyle={styles.filterPillsContent}
  >
    {['All', ...CATEGORIES].map((category) => (
      <TouchableOpacity
        key={category}
        style={[
          styles.filterPill,
          selectedCategory === category && styles.activeFilterPill,
        ]}
        onPress={() => setSelectedCategory(category)}
      >
        <Text
          style={[
            styles.filterPillText,
            selectedCategory === category && styles.activeFilterPillText,
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);
```

### Step 5: Create Card List View

```tsx
const renderCardList = () => {
  // Filter logic
  const filteredData = restaurants.filter((restaurant) => {
    const matchesSearch =
      !searchQuery ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || restaurant.cuisine === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView
      style={styles.cardListContainer}
      contentContainerStyle={styles.cardListContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filteredData.length} restaurant{filteredData.length !== 1 ? 's' : ''}
      </Text>

      {/* Cards */}
      {filteredData.map((restaurant) => (
        <View key={restaurant.id} style={styles.cardWrapper}>
          <RestaurantCard
            restaurant={restaurant}
            variant="horizontal"
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
          />
        </View>
      ))}

      {/* Empty state */}
      {filteredData.length === 0 && (
        <View style={styles.emptyState}>
          <Search size={48} color={COLORS.gray[300]} />
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
```

### Step 6: Update Main Return

```tsx
return (
  <View style={styles.container}>
    {/* Clean Header */}
    {renderCleanHeader()}

    {/* Type Switcher */}
    {renderTypeSwitcher()}

    {/* Filter Pills */}
    {renderFilterPills()}

    {/* Card List */}
    {renderCardList()}

    {/* Modals */}
    <AddItemModal
      visible={showAddModal}
      onClose={() => setShowAddModal(false)}
      onAddRestaurant={handleAddRestaurant}
      onAddFood={handleAddFood}
    />

    <FilterBottomSheet
      visible={isFilterVisible}
      onClose={() => setIsFilterVisible(false)}
      activeFilters={activeFilters}
      onApplyFilters={(filters) => {
        setActiveFilters(filters);
        setIsFilterVisible(false);
      }}
    />

    <MenuBottomSheet
      visible={isMenuVisible}
      onClose={() => setIsMenuVisible(false)}
      restaurant={lastFoodRestaurant}
      foodItems={restaurantMenus[lastFoodRestaurant?.id] || []}
    />
  </View>
);
```

---

## 🎨 Fresha Styles to Add

```tsx
// Clean Header
cleanHeader: {
  backgroundColor: COLORS.white,
  paddingTop: 60,
  paddingHorizontal: 20,
  paddingBottom: 16,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.gray[100],
},
headerTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
locationContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
locationText: {
  fontSize: 14,
  fontWeight: '600',
  color: COLORS.gray[600],
},
headerIcons: {
  flexDirection: 'row',
  gap: 12,
},
iconButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: COLORS.gray[50],
  alignItems: 'center',
  justifyContent: 'center',
},
pageTitle: {
  fontSize: 28,
  fontWeight: '700',
  color: COLORS.gray[900],
  marginBottom: 16,
  letterSpacing: -0.5,
},

// Search Bar
searchBarContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.gray[50],
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  gap: 10,
  borderWidth: 1,
  borderColor: COLORS.gray[100],
},
searchInput: {
  flex: 1,
  fontSize: 15,
  fontWeight: '500',
  color: COLORS.gray[900],
},
filterIconButton: {
  padding: 4,
},

// Type Switcher
typeSwitcherContainer: {
  flexDirection: 'row',
  backgroundColor: COLORS.white,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.gray[100],
},
typeTab: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  paddingVertical: 14,
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
},
activeTypeTab: {
  borderBottomColor: COLORS.primary,
},
typeTabText: {
  fontSize: 14,
  fontWeight: '600',
  color: COLORS.gray[500],
},
activeTypeTabText: {
  color: COLORS.primary,
  fontWeight: '700',
},

// Filter Pills
filterPillsContainer: {
  backgroundColor: COLORS.white,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.gray[100],
},
filterPillsContent: {
  paddingHorizontal: 20,
  paddingVertical: 12,
  gap: 8,
},
filterPill: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: COLORS.gray[50],
  borderWidth: 1,
  borderColor: COLORS.gray[200],
  marginRight: 8,
},
activeFilterPill: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.primary,
},
filterPillText: {
  fontSize: 13,
  fontWeight: '600',
  color: COLORS.gray[700],
},
activeFilterPillText: {
  color: COLORS.white,
},

// Card List
cardListContainer: {
  flex: 1,
  backgroundColor: COLORS.white,
},
cardListContent: {
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 100,
},
resultsCount: {
  fontSize: 12,
  fontWeight: '600',
  color: COLORS.gray[500],
  letterSpacing: 0.3,
  textTransform: 'uppercase',
  marginBottom: 16,
},
cardWrapper: {
  marginBottom: 12,
},

// Empty State
emptyState: {
  alignItems: 'center',
  paddingVertical: 60,
},
emptyStateTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: COLORS.gray[900],
  marginTop: 16,
  marginBottom: 8,
},
emptyStateText: {
  fontSize: 14,
  color: COLORS.gray[500],
  textAlign: 'center',
},
```

---

## ✅ What Gets Removed

### Code to Delete:

- ❌ Map view component and all MapView imports
- ❌ Map markers and marker press handlers
- ❌ Gradient hero header
- ❌ Floating bottom sheet with drag handle
- ❌ Pan responder logic
- ❌ Map animation logic
- ❌ Featured carousel in bottom sheet
- ❌ Complex map state management

**Result: ~1000 lines of code removed, ~400 lines added**
**Net: 600 lines cleaner, simpler codebase**

---

## 📊 Benefits

### User Experience:

✅ **Faster to use** - No map loading, instant results
✅ **Easier to browse** - Scroll through cards
✅ **Better search** - Real-time filtering
✅ **Consistent UI** - Matches My Places design
✅ **More content visible** - 60% more screen space

### Performance:

✅ **Faster load time** - No map initialization
✅ **Less memory** - No map tiles
✅ **Smoother scrolling** - Simple list vs complex map
✅ **Better battery** - No location tracking

### Design:

✅ **Cleaner look** - Fresha minimal style
✅ **More modern** - 2025 design trends
✅ **Consistent** - Same patterns throughout app
✅ **Professional** - $1M app aesthetic

---

## 🎯 My Places Stays Unchanged

**No changes needed to My Places tab!**

- ✅ Still has Must Try / Saved / Lists tabs
- ✅ Still has FavouritesView component
- ✅ Still has Collections
- ✅ All existing functionality preserved

---

## 🚀 Ready to Implement?

This transformation will:

1. Remove map complexity
2. Add integrated search from My Places
3. Create consistent Fresha design
4. Improve performance
5. Make your app feel premium

**Estimated time:** 2-3 hours
**Impact:** 🔥 **HUGE** - Core UX transformation
**Risk:** ✅ **LOW** - All features retained

**Want me to implement this now?** 💎🚀
