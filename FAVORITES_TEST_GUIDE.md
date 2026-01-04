# Quick Test Guide - Favorites Screen

## How to Test

### 1. **Navigate to Favorites**

- Open the app
- Go to **My Places** tab
- Click the **Favorites** button in the mode switcher

### 2. **What to Check**

#### Banner & Stats ✅

- [ ] Banner image displays correctly
- [ ] "Your Favourites" title visible in white
- [ ] Stats show in semi-transparent container
- [ ] Three stats visible: Saved | Must Try | Collections
- [ ] Stats dividers show between numbers

#### Layout ✅

- [ ] Content area has rounded top corners (24px)
- [ ] No duplication of any content
- [ ] Clean transition from banner to white content
- [ ] Tabs display properly below banner

#### Scrolling ✅

- [ ] Content scrolls smoothly
- [ ] Can scroll all the way to bottom with extra padding
- [ ] No scroll conflicts or stuttering
- [ ] Bounce effect works on iOS
- [ ] All items visible in list

#### Tabs ✅

- [ ] "Must Try" tab works
- [ ] "Favorites" tab works
- [ ] "Collections" tab works
- [ ] Active tab highlighted correctly
- [ ] Content changes when switching tabs

#### Content Display ✅

- [ ] Restaurant cards display properly
- [ ] "Must Try" badge shows on must-try items
- [ ] Collections display with icons
- [ ] "Create New Collection" button visible
- [ ] Empty states show when no items

### 3. **Expected Behavior**

**Banner Section (280px):**

```
┌─────────────────────────┐
│  Your Favourites        │
│                         │
│  [3] [2] [1]            │
│ Saved MustTry Collections│
└─────────────────────────┘
```

**Content Section (Scrollable):**

```
┌─────────────────────────┐ ← Rounded top
│ [Must Try][❤️][📁]      │ ← Tabs
├─────────────────────────┤
│                         │
│  Restaurant Card 1      │
│  Restaurant Card 2      │
│  Restaurant Card 3      │
│       ...               │
│  [Extra space]          │ ← 68px padding
└─────────────────────────┘
```

### 4. **Performance Check**

- [ ] Scrolling is 60fps (smooth)
- [ ] No lag when switching tabs
- [ ] Images load properly
- [ ] Transitions are smooth

### 5. **Edge Cases**

- [ ] Empty favorites show proper message
- [ ] Empty must try shows proper message
- [ ] Empty collections show create button only
- [ ] Long lists scroll properly
- [ ] Cards don't overlap

## Quick Issues Checklist

If you see:

- ❌ **Duplication** → Not fixed (should be fixed now!)
- ❌ **Can't scroll** → Check ScrollView implementation
- ❌ **Content cut off** → Check contentContainer padding
- ❌ **No rounded corners** → Check contentWrapper borderRadius
- ❌ **Stats not on banner** → Check headerContent structure

All should be ✅ now!

## Success Criteria

✅ **Perfect if:**

1. Banner shows with image and stats
2. Content has rounded top corners
3. NO duplication anywhere
4. Smooth, full scrolling
5. Plenty of space at bottom
6. All tabs work perfectly
7. Layout matches search page style

---

**Ready to test!** 🚀
