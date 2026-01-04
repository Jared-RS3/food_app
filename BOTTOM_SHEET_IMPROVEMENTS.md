# Bottom Sheet Improvements - Home Screen

## Overview

Improved the home screen's bottom sheet to take less real estate, position it lower on the screen, and made the gesture handling much smoother - especially when pulling down from the expanded position.

## Changes Made

### 1. **Reduced Bottom Sheet Height** ⬇️

**Collapsed Height:**

- **Before:** 280px
- **After:** 180px
- **Impact:** Map now takes ~100px more vertical space

**Expanded Height:**

- **Before:** 550px
- **After:** 600px
- **Impact:** More room for content when expanded

### 2. **Improved Gesture Smoothness** ✨

#### Key Fixes:

1. **Added `isDragging` ref** - Tracks drag state to prevent conflicts
2. **Better threshold detection** - Increased from 5px to 8px for more intentional gestures
3. **Improved velocity handling:**

   - Strong downward: velocity > 0.8 or movement > 50px
   - Strong upward: velocity < -0.8 or movement < -50px
   - Weak gestures snap to nearest position (midpoint at 390px)

4. **Smoother spring animation:**

   ```typescript
   {
     damping: 30,      // Reduced from 35 (smoother)
     stiffness: 300,   // Reduced from 400 (less bouncy)
     mass: 0.5,        // Reduced from 0.8 (lighter feel)
     overshootClamping: false // Allows slight overshoot for natural feel
   }
   ```

5. **No more glitches** - Removed animation cancellation that caused jitter

### 3. **More Compact UI** 📦

#### Drag Handle:

- **Width:** 45px → 40px
- **Height:** 5px → 4px
- **Color:** Gray[400] → Gray[300] (lighter)
- **Padding:** Reduced vertical padding

#### Section Headers:

- **Font size:** lg (18px) → md (16px)
- **Margin bottom:** md → sm
- **Padding:** lg → md/sm

#### Compact Cards ("Close By"):

- **Width:** 160px → 140px
- **Image height:** 100px → 85px
- **Content padding:** sm → xs
- **Font size:** sm → xs

#### Trending Items:

- **Padding:** md → sm
- **Gap:** md → sm
- **Rank badge:** 32x32 → 28x28
- **Image:** 56x56 → 48x48
- **Font sizes:** md → sm, sm → xs

#### AI Picks:

- **Image height:** 140px → 120px
- **Content padding:** md → sm
- **Font sizes:** All reduced by one step

### 4. **Adjusted Instagram Button** 📸

- **Position bottom:** 320px → 220px
- Now properly positioned above the lower bottom sheet

## Technical Details

### State Management:

```typescript
const featuresSheetHeight = useSharedValue(180); // Collapsed
const startHeight = useRef(180);
const isDragging = useRef(false); // NEW - prevents conflicts
```

### Gesture Detection:

```typescript
onMoveShouldSetPanResponder: (_, gestureState) => {
  const isVerticalSwipe = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
  const threshold = 8; // Increased for better detection

  if (isVerticalSwipe && Math.abs(gestureState.dy) > threshold) {
    if (featuresSheetHeight.value <= 200) {
      return true; // Collapsed - always allow
    }
    return gestureState.dy > 0 && isScrollAtTop; // Expanded - only down when at top
  }
  return false;
};
```

### Animation Config:

```typescript
withSpring(targetHeight, {
  damping: 30, // Controls oscillation (lower = more bounce)
  stiffness: 300, // Controls speed (lower = slower)
  mass: 0.5, // Controls inertia (lower = lighter)
  overshootClamping: false, // Allows natural overshoot
});
```

## Visual Comparison

### Before:

```
┌─────────────┐
│   Header    │
├─────────────┤
│             │
│     Map     │ ← 65% of screen
│             │
├─────────────┤
│             │
│   Bottom    │ ← 35% of screen
│   Sheet     │
│  (280px)    │
└─────────────┘
```

### After:

```
┌─────────────┐
│   Header    │
├─────────────┤
│             │
│             │
│     Map     │ ← 75% of screen
│             │
│             │
├─────────────┤
│  Bottom     │ ← 25% of screen
│  Sheet      │
│  (180px)    │
└─────────────┘
```

## User Experience Improvements

### ✅ Benefits:

1. **More map visibility** - See more restaurants and context
2. **Smoother gestures** - No more jittery/glitchy movements
3. **Better performance** - Lighter mass and optimized spring
4. **Natural feel** - Slight overshoot makes it feel more responsive
5. **Clearer intent** - 8px threshold prevents accidental drags
6. **Compact content** - More restaurants visible in less space

### 🎯 Gesture Behavior:

- **Swipe up hard** → Expands to 600px
- **Swipe down hard** → Collapses to 180px
- **Swipe gently** → Snaps to nearest position
- **Drag and hold** → Follows your finger smoothly
- **Release mid-drag** → Animates to nearest state

## Testing Checklist

- [x] Collapsed state shows at 180px (compact)
- [x] Expanded state shows at 600px (full content)
- [x] Drag handle visible and responsive
- [x] Swipe up expands smoothly
- [x] Swipe down collapses smoothly
- [x] No glitching when pulling from expanded position
- [x] ScrollView only scrolls when sheet is expanded
- [x] Sheet gesture respects scroll position
- [x] Spring animation feels natural
- [x] No jitter or stuttering
- [x] Instagram button positioned correctly
- [x] All content scales properly
- [x] Restaurant cards are compact but readable

## Performance Notes

### Animation Config Rationale:

- **damping: 30** - Gentle bounce without excessive oscillation
- **stiffness: 300** - Moderate speed (not too fast, not too slow)
- **mass: 0.5** - Light feel (responds quickly to input)
- **overshootClamping: false** - Natural physics (slight overshoot)

### Why It's Smoother:

1. **No animation cancellation** - Removed conflicting cancel call
2. **Better state tracking** - `isDragging` ref prevents race conditions
3. **Optimized thresholds** - 8px threshold reduces false positives
4. **Direct value assignment** - No intermediate animations during drag
5. **Smart velocity detection** - Considers both velocity and movement distance

## Future Enhancements (Optional)

### Potential Improvements:

1. **Haptic feedback** on snap positions
2. **Multiple snap points** (180px, 390px, 600px)
3. **Dynamic height** based on content
4. **Blur effect** on drag handle
5. **Animated blur** on map when expanded
6. **Momentum scrolling** between sections

## Troubleshooting

### If gestures feel off:

1. Adjust `threshold` (line 143): Higher = more intentional
2. Adjust `velocity` thresholds (lines 186-191): Higher = harder swipes needed
3. Adjust spring `damping`: Lower = more bounce, Higher = more stiff
4. Adjust spring `stiffness`: Lower = slower, Higher = faster

### If sheet position is wrong:

1. Check `featuresSheetHeight.value` initial value (line 18)
2. Check `startHeight.current` initial value (line 22)
3. Verify clamp values in `onPanResponderMove` (line 169)

---

**Status:** ✅ Complete and Tested  
**Date:** November 29, 2025  
**Impact:** Better UX, more map visibility, smoother interactions
