# 🗺️ Unified Map + Bottom Sheet Implementation

## Design Overview

### Main Structure:

```
┌─────────────────────────────────────┐
│  Clean Header (80px)                │
│  - Location                         │
│  - Search button (opens modal)     │
│  - Icons (notifications, menu)     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│                                     │
│         MAP VIEW                    │
│      (Full screen)                  │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [Draggable Bottom Sheet]            │
│                                     │
│  Recommended | My Places            │ ← Main mode tabs
│  ══════════                         │
│                                     │
│  [MODE 1: Recommended]              │
│  - All nearby restaurants           │
│  - Horizontal card carousel         │
│  - Filter by category               │
│                                     │
│  [MODE 2: My Places]                │
│  Must Try | Saved | Lists           │ ← Sub-tabs
│  ═════════                          │
│  - Must Try restaurants             │
│  - Saved favorites                  │
│  - Custom collections               │
│                                     │
└─────────────────────────────────────┘
```

## Implementation Steps:

1. **Simplify Header** - Remove gradient hero, make 80px
2. **Keep Map** - Keep existing map view
3. **Update Bottom Sheet** - Add tab switcher
4. **Integrate FavouritesView** - Use existing component
5. **Add Recommended View** - New carousel component

## Features:

✅ Map stays as primary view
✅ Two modes in one bottom sheet
✅ Fresha-style clean design
✅ All existing features preserved
✅ Easy switching between discovery and saved
