# 🎨 Fresha Design System - Quick Reference

## Copy-Paste Ready Code Snippets

Use these code blocks when updating any component in your app to match the Fresha style.

---

## 1. Header Styles (Clean White)

```tsx
// FRESHA STYLE HEADER
header: {
  backgroundColor: '#FFFFFF',
  paddingTop: 60,
  paddingHorizontal: 20,
  paddingBottom: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6', // gray[100]
},
headerTitle: {
  fontSize: 28,
  fontWeight: '700',
  color: '#111827', // gray[900]
  marginBottom: 20,
  letterSpacing: -0.5,
},
```

**Replace:** Background images, gradients, heavy shadows
**With:** Clean white, minimal border

---

## 2. Stat Pills (Minimal)

```tsx
// FRESHA STYLE STAT PILLS
statsPillsRow: {
  flexDirection: 'row',
  gap: 10,
  marginBottom: 20,
},
statPill: {
  flex: 1,
  backgroundColor: '#F9FAFB', // gray[50]
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 12,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#F3F4F6', // gray[100]
},
statPillNumber: {
  fontSize: 20,
  fontWeight: '700',
  color: '#FF6B35', // primary
  marginBottom: 2,
},
statPillLabel: {
  fontSize: 11,
  fontWeight: '600',
  color: '#6B7280', // gray[500]
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
```

**Replace:** Floating glassmorphism boxes, heavy shadows
**With:** Bordered pills, subtle backgrounds

---

## 3. Horizontal Tabs (Underline Style)

```tsx
// FRESHA STYLE TABS
tabBar: {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6', // gray[100]
},
tab: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  paddingVertical: 14,
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
},
activeTab: {
  borderBottomColor: '#FF6B35', // primary
},
tabText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#6B7280', // gray[500]
},
activeTabText: {
  color: '#FF6B35', // primary
  fontWeight: '700',
},
```

**Replace:** Segmented controls, animated indicators
**With:** Simple underline tabs

---

## 4. Cards (Flat Design)

```tsx
// FRESHA STYLE CARD
card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  marginBottom: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: '#F3F4F6', // gray[100]
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    android: {
      elevation: 1,
    },
  }),
},
```

**Replace:** borderRadius: 20-24, elevation: 4-8, heavy shadows
**With:** borderRadius: 12, elevation: 1-2, subtle borders

---

## 5. Buttons (Pill Style)

```tsx
// FRESHA STYLE BUTTON
primaryButton: {
  backgroundColor: '#FF6B35', // primary
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 20,
  alignItems: 'center',
  justifyContent: 'center',
  ...Platform.select({
    ios: {
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
},
primaryButtonText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#FFFFFF',
  letterSpacing: 0.2,
},

// Secondary button
secondaryButton: {
  backgroundColor: '#F9FAFB', // gray[50]
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 20,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#E5E7EB', // gray[200]
},
secondaryButtonText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#111827', // gray[900]
},
```

**Replace:** Rounded buttons with heavy shadows
**With:** Flat buttons, subtle shadows

---

## 6. Tags/Chips (Muted)

```tsx
// FRESHA STYLE TAGS
tag: {
  backgroundColor: '#F9FAFB', // gray[50]
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB', // gray[200]
  marginRight: 6,
  marginBottom: 6,
},
tagText: {
  fontSize: 11,
  fontWeight: '600',
  color: '#4B5563', // gray[700]
},
```

**Replace:** Bright primary colored tags
**With:** Muted gray tags with borders

---

## 7. Badges (Pill Shape)

```tsx
// FRESHA STYLE BADGE
badge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#10B981', // success green
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 16, // Full pill
  gap: 4,
},
badgeText: {
  fontSize: 11,
  fontWeight: '700',
  color: '#FFFFFF',
  letterSpacing: 0.3,
  textTransform: 'uppercase',
},
```

**Replace:** Square or heavily rounded badges
**With:** Pill-shaped (borderRadius: 16-20)

---

## 8. Search Bar (Minimal)

```tsx
// FRESHA STYLE SEARCH
searchContainer: {
  backgroundColor: '#F9FAFB', // gray[50]
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  borderWidth: 1,
  borderColor: '#F3F4F6', // gray[100]
},
searchInput: {
  flex: 1,
  fontSize: 15,
  fontWeight: '500',
  color: '#111827', // gray[900]
},
searchPlaceholder: {
  color: '#9CA3AF', // gray[400]
},
```

**Replace:** White search bars with shadows
**With:** Gray background, minimal border

---

## 9. Empty States (Lighter)

```tsx
// FRESHA STYLE EMPTY STATE
emptyState: {
  alignItems: 'center',
  paddingVertical: 60,
  paddingHorizontal: 32,
},
emptyIcon: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#FF6B3520', // primary with opacity
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
  ...Platform.select({
    ios: {
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {
      elevation: 3,
    },
  }),
},
emptyStateTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#111827', // gray[900]
  marginBottom: 10,
  letterSpacing: -0.3,
},
emptyStateText: {
  fontSize: 14,
  color: '#6B7280', // gray[500]
  textAlign: 'center',
  lineHeight: 22,
  fontWeight: '500',
  maxWidth: 260,
},
```

**Replace:** Large icons (130px), heavy shadows
**With:** Smaller icons (100px), subtle shadows

---

## 10. Bottom Sheets (Flat)

```tsx
// FRESHA STYLE BOTTOM SHEET
bottomSheet: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingTop: 8,
  paddingHorizontal: 20,
  paddingBottom: 32,
  borderTopWidth: 1,
  borderTopColor: '#F3F4F6', // gray[100]
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
},
dragHandle: {
  width: 40,
  height: 4,
  backgroundColor: '#E5E7EB', // gray[200]
  borderRadius: 2,
  alignSelf: 'center',
  marginBottom: 20,
},
```

**Replace:** Heavy shadows, no borders
**With:** Subtle shadow, top border

---

## 11. Modals (Clean)

```tsx
// FRESHA STYLE MODAL
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // Lighter overlay
  justifyContent: 'flex-end',
},
modalContainer: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingTop: 24,
  paddingHorizontal: 20,
  paddingBottom: 32,
  maxHeight: '92%',
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  paddingBottom: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6', // gray[100]
},
modalTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#111827', // gray[900]
},
```

**Replace:** Gradient overlays, card-style modals
**With:** Simple white, subtle separator

---

## Color Palette Reference

```tsx
// FRESHA COLOR SYSTEM
const colors = {
  // Backgrounds
  white: '#FFFFFF',
  gray50: '#F9FAFB', // Surface
  gray100: '#F3F4F6', // Border light
  gray200: '#E5E7EB', // Border

  // Text
  gray900: '#111827', // Primary text
  gray700: '#374151', // Secondary text
  gray500: '#6B7280', // Tertiary text
  gray400: '#9CA3AF', // Placeholder

  // Accent (your brand)
  primary: '#FF6B35',
  primaryLight: '#FF6B3520',

  // States
  success: '#10B981', // Green
  warning: '#F59E0B', // Yellow
  error: '#EF4444', // Red
};
```

---

## Typography Scale

```tsx
// FRESHA TYPOGRAPHY SYSTEM
const typography = {
  // Titles
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Body
  body: {
    fontSize: 14,
    fontWeight: '600',
  },
  bodyLight: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Small
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
  },
};
```

---

## Spacing System

```tsx
// FRESHA SPACING SYSTEM
const spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Common use cases
  cardGap: 12,
  cardPadding: 16,
  sectionGap: 20,
  screenPadding: 20,
};
```

---

## Border Radius System

```tsx
// FRESHA BORDER RADIUS
const borderRadius = {
  sm: 8,
  md: 12, // Cards
  lg: 16, // Badges, pills
  xl: 20, // Modals
  full: 999, // Circular
};
```

---

## Shadow System

```tsx
// FRESHA SHADOW SYSTEM (MINIMAL)

// Shadow Level 1 (Most common)
const shadow1 = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  android: {
    elevation: 1,
  },
});

// Shadow Level 2 (Buttons, badges)
const shadow2 = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  android: {
    elevation: 2,
  },
});

// Shadow Level 3 (Modals, sheets)
const shadow3 = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
});
```

**Rule:** Never use elevation > 3 or shadowOpacity > 0.1

---

## Quick Conversion Checklist

When updating a component:

### ✅ Remove:

- [ ] Background images in headers
- [ ] Gradient overlays
- [ ] Heavy shadows (elevation > 3)
- [ ] Large border radius (> 16px for cards)
- [ ] Bright primary backgrounds on tags
- [ ] Excessive spacing (> 20px margins)

### ✅ Add:

- [ ] Clean white backgrounds
- [ ] 1px borders (gray[100/200])
- [ ] Minimal shadows (elevation 1-2)
- [ ] Smaller border radius (12px for cards)
- [ ] Muted gray backgrounds for tags
- [ ] Tighter spacing (12-16px)

### ✅ Update:

- [ ] Typography: 3 main sizes (28, 17, 14)
- [ ] Font weights: Only 600, 700
- [ ] Colors: Neutrals dominate, primary sparingly
- [ ] Tabs: Underline style, not segmented
- [ ] Buttons: Pill-shaped (borderRadius: 12-16)

---

## Before/After Template

```tsx
// ❌ BEFORE (Old Style)
const oldStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24, // Too round
    marginBottom: 20, // Too much space
    padding: 24, // Too much padding
    elevation: 6, // Too heavy
    shadowOpacity: 0.15, // Too dark
  },
});

// ✅ AFTER (Fresha Style)
const newStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12, // Flatter
    marginBottom: 12, // Tighter
    padding: 16, // Compact
    borderWidth: 1, // Add border
    borderColor: '#F3F4F6', // Gray[100]
    elevation: 1, // Minimal
    shadowOpacity: 0.04, // Subtle
  },
});
```

---

## Common Mistakes to Avoid

### ❌ Don't:

1. Mix multiple shadow styles on one screen
2. Use more than 4 font sizes per screen
3. Add gradients to backgrounds
4. Use elevation > 3
5. Make borders darker than gray[200]
6. Use bright colors for tags/chips
7. Add large gaps (>24px) between cards
8. Use fontWeight other than 600, 700

### ✅ Do:

1. Use consistent shadow levels (1-2)
2. Stick to 3 main font sizes
3. Keep backgrounds white or gray[50]
4. Use borders for separation
5. Make borders subtle (gray[100])
6. Use muted colors for secondary elements
7. Keep spacing tight (12-16px)
8. Use bold weights consistently

---

## Next Component to Update

Copy these patterns when updating:

1. **AddItemModal** - Use flat card style
2. **Home header** - Remove hero banner
3. **Search bar** - Use gray[50] background
4. **Filter chips** - Use pill style with borders
5. **Bottom sheets** - Add top border, reduce shadow
6. **Menu items** - Use underline, not segments
7. **Collection cards** - Borders instead of shadows

---

**Remember:** Fresha style is about **subtlety, consistency, and cleanliness**.
Less is more. Borders over shadows. White space is your friend.

💎 **You're building a premium app!**
