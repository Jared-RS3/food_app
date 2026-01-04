# 🚀 Quick Start: Apply Airbnb Animations to Your App

## Instant Upgrades - Copy & Paste Ready!

---

## 1. ✨ Make Any Button Feel Amazing

### Replace This:

```typescript
<TouchableOpacity onPress={handlePress}>
  <View style={styles.button}>
    <Text>Press Me</Text>
  </View>
</TouchableOpacity>
```

### With This:

```typescript
import AnimatedPressable from '../components/AnimatedPressable';

<AnimatedPressable onPress={handlePress}>
  <View style={styles.button}>
    <Text>Press Me</Text>
  </View>
</AnimatedPressable>;
```

**Result**: Smooth 0.97 scale animation on press! 🎯

---

## 2. 💓 Animate Heart/Favorite Buttons

### Add to Component:

```typescript
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

// Inside your component:
const heartScale = useSharedValue(1);

const heartAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: heartScale.value }],
}));

const handleFavorite = () => {
  setFavorite(!favorite);

  // Heart beat animation
  heartScale.value = withSpring(1.4, { damping: 8, stiffness: 400 });
  setTimeout(() => {
    heartScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, 100);
};
```

### Update Render:

```typescript
<AnimatedPressable onPress={handleFavorite}>
  <Animated.View style={heartAnimatedStyle}>
    <Heart
      size={24}
      color={favorite ? '#FF385C' : '#717171'}
      fill={favorite ? '#FF385C' : 'none'}
    />
  </Animated.View>
</AnimatedPressable>
```

**Result**: Heart beats and bounces when favorited! 💓

---

## 3. 🎴 Upgrade Your Cards

### Replace Your Card Component With:

```typescript
import AirbnbStyleCard from '../components/AirbnbStyleCard';

<AirbnbStyleCard
  id={restaurant.id}
  image={restaurant.image}
  title={restaurant.name}
  subtitle={`${restaurant.cuisine} • ${restaurant.area}`}
  rating={restaurant.rating}
  reviewCount={restaurant.review_count}
  distance={restaurant.distance}
  priceRange={restaurant.price_range}
  badge={restaurant.is_new ? 'New' : undefined}
  isFavorite={restaurant.is_favorite}
  onPress={() => navigateToDetails(restaurant.id)}
  onFavoritePress={() => toggleFavorite(restaurant.id)}
/>;
```

**Result**: Professional Airbnb-style card with all animations! 🎴

---

## 4. 🎨 Use the New Theme Colors

### Update Your StyleSheet:

```typescript
import { theme } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background, // Pure white
    padding: theme.spacing.md, // 16px
  },
  title: {
    fontSize: theme.typography.sizes.xl, // 22px
    fontWeight: theme.typography.weights.semibold, // 600
    color: theme.colors.text, // #222222
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm, // 14px
    color: theme.colors.textSecondary, // #717171
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md, // 16px
    ...theme.shadows.md, // Soft shadow
  },
  primaryButton: {
    backgroundColor: theme.colors.primary, // #FF385C
    borderRadius: theme.borderRadius.lg, // 20px
    padding: theme.spacing.md,
  },
});
```

**Result**: Consistent Airbnb colors throughout! 🎨

---

## 5. 📱 Add Stagger Animations to Lists

### For FlatList:

```typescript
import Animated, { FadeInDown } from 'react-native-reanimated';

<FlatList
  data={items}
  renderItem={({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <YourItemComponent item={item} />
    </Animated.View>
  )}
/>;
```

### For .map():

```typescript
{
  items.map((item, index) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <YourItemComponent item={item} />
    </Animated.View>
  ));
}
```

**Result**: Items animate in smoothly, one after another! 📱

---

## 6. ⭐ Animate Star Ratings

```typescript
const starScale = useSharedValue(1);

const starAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: starScale.value }],
}));

const handleRating = () => {
  starScale.value = withSpring(1.3, { damping: 10, stiffness: 500 });
  setTimeout(() => {
    starScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, 100);
};

// Render:
<AnimatedPressable onPress={handleRating}>
  <Animated.View style={starAnimatedStyle}>
    <Star size={24} color="#FFB84D" fill="#FFB84D" />
  </Animated.View>
</AnimatedPressable>;
```

**Result**: Stars pop when rated! ⭐

---

## 7. 🎯 Add Press Feedback to Images

```typescript
import AnimatedPressable from '../components/AnimatedPressable';

<AnimatedPressable onPress={() => openImageModal(image)} scaleDown={0.98}>
  <Image source={{ uri: image }} style={styles.image} />
</AnimatedPressable>;
```

**Result**: Images respond to touch! 🎯

---

## 8. 🔖 Animate Bookmarks

```typescript
const bookmarkScale = useSharedValue(1);

const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: bookmarkScale.value }],
}));

const handleBookmark = () => {
  setSaved(!saved);
  bookmarkScale.value = withSpring(1.3, { damping: 12, stiffness: 300 });
  setTimeout(() => {
    bookmarkScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, 100);
};

// Render:
<AnimatedPressable onPress={handleBookmark}>
  <Animated.View style={bookmarkAnimatedStyle}>
    <Bookmark
      size={24}
      color={saved ? '#FF385C' : '#717171'}
      fill={saved ? '#FF385C' : 'none'}
    />
  </Animated.View>
</AnimatedPressable>;
```

**Result**: Bookmarks slide and pop! 🔖

---

## 9. 🎉 Success Animations

```typescript
import { celebrationAnimation } from '../constants/animations';

const scale = useSharedValue(1);
const rotate = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
}));

const handleSuccess = () => {
  celebrationAnimation(scale, rotate);
};

// Render:
<Animated.View style={animatedStyle}>
  <SuccessIcon />
</Animated.View>;
```

**Result**: Celebratory wiggle and scale on success! 🎉

---

## 10. 📊 Smooth Tab Transitions

```typescript
import { tabTransition } from '../constants/animations';
import { withTiming } from 'react-native-reanimated';

const translateX = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));

const changeTab = (index: number) => {
  translateX.value = withTiming(index * width, {
    duration: tabTransition.duration,
    easing: tabTransition.easing,
  });
};
```

**Result**: Smooth tab sliding! 📊

---

## 🎯 Priority Upgrades (Do These First!)

### 1. **All Cards** → Use `AnimatedPressable` or `AirbnbStyleCard`

- Social feed cards
- For You recommendations
- Restaurant cards
- Event cards

### 2. **All Buttons** → Wrap in `AnimatedPressable`

- Primary action buttons
- Secondary buttons
- Icon buttons
- Tab buttons

### 3. **Favorite/Save Icons** → Add heart beat/bookmark animations

- Heart icons
- Star icons
- Bookmark icons
- Plus icons

### 4. **Lists** → Add stagger animations

- FlatList items
- ScrollView children
- Grid items

### 5. **Bottom Sheets** → Already done! ✅

- RestaurantDetailsBottomSheet has all animations

---

## 🎨 Color Quick Reference

```typescript
import { theme } from '../constants/theme';

// Primary actions (CTAs, links, important buttons)
color: theme.colors.primary; // #FF385C (Airbnb red-pink)

// Text hierarchy
color: theme.colors.text; // #222222 (primary text)
color: theme.colors.textSecondary; // #717171 (secondary text)
color: theme.colors.textTertiary; // #B0B0B0 (tertiary text)

// Backgrounds
backgroundColor: theme.colors.background; // #FFFFFF (pure white)
backgroundColor: theme.colors.surface; // #FFFFFF (cards)
backgroundColor: theme.colors.surfaceLight; // #F7F7F7 (subtle bg)

// Borders
borderColor: theme.colors.border; // #EBEBEB (subtle)

// Success/Warning/Error
color: theme.colors.success; // #00A699 (teal)
color: theme.colors.warning; // #FFBB00 (gold)
color: theme.colors.error; // #FF385C (red)
```

---

## ⚡ Performance Tips

### 1. **Use Worklets**

```typescript
const handlePress = () => {
  'worklet'; // Runs on UI thread!
  scale.value = withSpring(0.97);
};
```

### 2. **Avoid Re-renders**

```typescript
// ❌ Creates new function on every render
onPress={() => withSpring(scale.value, 0.97)}

// ✅ Stable function reference
const handlePress = useCallback(() => {
  scale.value = withSpring(0.97);
}, []);
```

### 3. **Cleanup Animations**

```typescript
useEffect(() => {
  return () => {
    // Cancel running animations
    cancelAnimation(scale);
  };
}, []);
```

---

## 🐛 Common Issues & Fixes

### Issue: Animation not working

**Fix**: Make sure component is `Animated.View`:

```typescript
// ❌ Won't animate
<View style={animatedStyle}>

// ✅ Will animate
<Animated.View style={animatedStyle}>
```

### Issue: Lag on press

**Fix**: Use `useCallback` and `worklet`:

```typescript
const handlePress = useCallback(() => {
  'worklet';
  scale.value = withSpring(0.97);
}, []);
```

### Issue: Animation too fast/slow

**Fix**: Adjust spring config:

```typescript
// Slower
withSpring(value, { damping: 25, stiffness: 120 });

// Faster
withSpring(value, { damping: 15, stiffness: 300 });
```

---

## ✅ Implementation Checklist

### Phase 1: Core Components

- [ ] Replace `TouchableOpacity` with `AnimatedPressable` on cards
- [ ] Add heart beat animation to favorites
- [ ] Add bookmark animation to saves
- [ ] Update theme colors in main screens

### Phase 2: Lists & Feeds

- [ ] Add stagger animations to FlatLists
- [ ] Add stagger animations to map() lists
- [ ] Update card shadows to soft theme shadows
- [ ] Update border radius to theme values

### Phase 3: Polish

- [ ] Add star pop animation to ratings
- [ ] Add success celebrations
- [ ] Add tab transitions
- [ ] Add loading states with shimmer

### Phase 4: Fine-tuning

- [ ] Test all animations on device
- [ ] Adjust spring configs if needed
- [ ] Add haptic feedback (optional)
- [ ] Performance audit

---

## 🎉 Expected Results

After implementing these changes:

- ✅ **Every tap feels responsive** (instant visual feedback)
- ✅ **Favorites feel rewarding** (heart beats)
- ✅ **Cards feel alive** (smooth scale)
- ✅ **Lists feel fluid** (stagger entrance)
- ✅ **Colors feel premium** (Airbnb palette)
- ✅ **Shadows feel elegant** (soft, not harsh)
- ✅ **App feels professional** (polished micro-interactions)

**Your users will immediately notice the difference!** 🌟

---

## 📚 Files You Need

All ready to use:

- ✅ `constants/theme.ts` - Airbnb color system
- ✅ `constants/animations.ts` - 35+ animation utilities
- ✅ `components/AnimatedPressable.tsx` - Universal animated button
- ✅ `components/AirbnbStyleCard.tsx` - Showcase card
- ✅ `components/RestaurantDetailsBottomSheet.tsx` - Animated sheet

---

**Start with AnimatedPressable on your main cards - you'll see the magic immediately!** ✨
