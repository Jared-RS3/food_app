# Map Pin Color System

## Overview

The map uses a color-coded pin system to help you quickly identify restaurant status at a glance.

## Pin Colors

### 🟡 Yellow Pins - Must Try Places

- **Color**: `#FFC107` (Bright Yellow)
- **Meaning**: Restaurants on your must-try list
- **Criteria**:
  - Restaurant has `mustTry: true` property
  - OR restaurant is in your Must Try items list
- **Use Case**: Places you want to visit but haven't been to yet

### 🩷 Pink Pins - Visited Places

- **Color**: `#FF6B9D` (Pink)
- **Meaning**: Restaurants you've already visited
- **Criteria**:
  - Restaurant has a `lastVisited` date set
  - Indicates you've checked in at this location
- **Use Case**: Keep track of where you've been

### 🔴 Primary Color Pins - Default

- **Color**: `COLORS.primary` (App's primary color)
- **Meaning**: Standard restaurants
- **Criteria**:
  - Not on must-try list
  - Not yet visited
- **Use Case**: New discoveries, recommendations, or places you added

## Selected State

When you tap on any pin, it:

- **Grows larger** (18px → 22px)
- **Keeps its color** (yellow, pink, or primary)
- **Enhanced shadow** for better visibility
- **Thicker border** (2px → 2.5px)

## Legend

A compact legend appears in the top filter bar showing:

- Yellow dot + "Must Try"
- Pink dot + "Visited"

## Implementation Details

### How Colors Are Determined

```typescript
// 1. Check if restaurant is on must-try list
const isMustTry =
  restaurant.mustTry ||
  mustTryItems.some((item) => (item as any).restaurantId === restaurant.id);

// 2. Check if restaurant has been visited
const hasVisited = restaurant.lastVisited;

// 3. Apply color logic
let markerColor = COLORS.primary; // Default
if (isMustTry) {
  markerColor = '#FFC107'; // Yellow for must-try
} else if (hasVisited) {
  markerColor = '#FF6B9D'; // Pink for visited
}
```

### Priority Order

1. **Must Try** (Yellow) - Highest priority
2. **Visited** (Pink) - Second priority
3. **Default** (Primary) - Fallback

**Note**: If a restaurant is both on must-try list AND visited, it will show as **yellow** (must-try takes precedence). However, in practice, checking in at a must-try restaurant should remove it from the must-try list, so this scenario should be rare.

## Future Enhancements

Potential additions to the color system:

- 🟢 Green: Favorited restaurants
- 🟣 Purple: Hidden gems (high rating, low reviews)
- 🟠 Orange: Friend recommendations
- ⭐ Star badge: Premium/featured restaurants

## User Benefits

1. **Quick Visual Scanning**: Instantly see which places you need to try vs. where you've been
2. **Goal Tracking**: Yellow pins motivate you to visit must-try places
3. **Memory Aid**: Pink pins remind you of past experiences
4. **Map Clarity**: Even with many restaurants in one area, colors help differentiate them

## Accessibility

- Pins use both **color** and **position** cues
- High contrast with white borders
- Legend provides text labels for color-blind users
- Pins are large enough to tap easily (18px minimum)
