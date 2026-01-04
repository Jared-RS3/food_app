# 🎯 Home Page Redesign Plan

## Current Structure (Map-based):

```
Home Page:
├─ Gradient hero header (300px)
├─ Map view with markers
├─ Floating bottom sheet with featured restaurants
└─ Complex map interactions
```

## New Structure (Card-based with Search):

```
Home Page:
├─ Clean white header (120px)
│  ├─ Location + Icons
│  └─ Search bar with filter button
├─ Type switcher (Restaurants | Food | Markets)
├─ Filter chips (horizontal scroll)
└─ Card list view
   ├─ Restaurant cards
   ├─ Food items (when Food selected)
   └─ Market cards (when Markets selected)
```

## Features to Integrate from My Places:

✅ Search bar with real-time filtering
✅ Type switcher (Restaurants/Food/Markets)
✅ Filter button + FilterBottomSheet
✅ Card-based layout
✅ Category filters

## What Stays in My Places:

✅ Must Try / Saved / Lists tabs
✅ Favorites view component
✅ Collections management

## Implementation:

1. Replace map view with ScrollView
2. Add search bar to header
3. Add type switcher below search
4. Add horizontal filter pills
5. Show restaurant/food/market cards
6. Keep all existing data loading logic
