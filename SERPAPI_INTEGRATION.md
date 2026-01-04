# SerpAPI Integration Guide

## Overview

The restaurant search functionality now uses SerpAPI's Google Maps Search API to fetch real restaurant data with accurate information including ratings, reviews, contact details, and service options.

## Setup Instructions

### 1. Get Your Free SerpAPI Key

1. Go to [https://serpapi.com/](https://serpapi.com/)
2. Click "Sign Up" and create a free account
3. Navigate to your dashboard at [https://serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)
4. Copy your API key

**Free Tier Benefits:**

- 100 searches per month (free forever)
- No credit card required
- Access to all search engines including Google Maps

### 2. Add API Key to Your Project

Open `/components/GooglePlacesSearch.tsx` and replace the placeholder:

```typescript
// Line ~82
const SERPAPI_KEY = 'YOUR_SERPAPI_KEY'; // Replace with your actual API key
```

**For Production:** Store the API key in environment variables:

1. Create a `.env` file in your project root:

```bash
EXPO_PUBLIC_SERPAPI_KEY=your_api_key_here
```

2. Update the code to use the environment variable:

```typescript
const SERPAPI_KEY = process.env.EXPO_PUBLIC_SERPAPI_KEY || 'YOUR_SERPAPI_KEY';
```

3. Add `.env` to your `.gitignore` to keep your key secure

## API Response Data

### What Data We Get From SerpAPI

Each restaurant result includes:

#### **Basic Information**

- `title` - Restaurant name
- `address` - Full street address
- `place_id` - Unique Google Place ID

#### **Location**

- `gps_coordinates` - Latitude and longitude
  - `latitude`
  - `longitude`

#### **Ratings & Reviews**

- `rating` - Average rating (1-5 stars)
- `reviews` - Total number of reviews

#### **Availability**

- `open_state` - Current status ("Open", "Closed", "Opens soon")
- `hours` - Opening hours information

#### **Visuals**

- `thumbnail` - Restaurant photo URL

#### **Pricing**

- `price` - Price level (e.g., "$", "$$", "$$$")

#### **Contact & Web**

- `phone` - Phone number
- `website` - Official website URL

#### **Service Options**

- `service_options` - Object containing:
  - `dine_in` - Boolean
  - `takeout` - Boolean
  - `delivery` - Boolean

#### **Additional**

- `type` - Category (e.g., "Restaurant", "Cafe")
- `description` - Brief description

## Updated Card Design

### Card Features

The new design displays comprehensive restaurant information:

1. **Hero Image** (200px height)

   - Restaurant photo from SerpAPI
   - Fallback to placeholder with store icon
   - Overlay badges for status and price

2. **Top Badges (Overlay)**

   - 🟢 "Open Now" badge (green) - Shows if restaurant is currently open
   - 💰 Price badge (e.g., "$$") - Shows price level

3. **Rating Badge (Bottom Right)**

   - Floating dark badge with star icon and rating number
   - High visibility against any image

4. **Information Rows**

   - 📍 Address with MapPin icon
   - ⭐ Rating with star count and review total
   - 📞 Phone number (if available)
   - 🕒 Hours information (if available)

5. **Service Options Tags**

   - 🍽️ Dine-in
   - 🥡 Takeout
   - 🚚 Delivery
   - Yellow badges with emoji icons

6. **Description Text**

   - 2-line truncated description
   - Helps users understand restaurant type/style

7. **Category Tags**

   - Restaurant type/cuisine categories
   - Up to 3 tags shown

8. **Website Button**
   - Purple button linking to restaurant website
   - Opens in external browser

## Search Behavior

### Query Parameters

- `engine`: 'google_maps' - Uses Google Maps data
- `q`: Search query (e.g., "pizza near me", "sushi")
- `ll`: Location coordinates (`@lat,lng,zoom`)
- `type`: 'search' - Returns search results

### Search Radius

- Searches within ~5-10km of the provided location
- Returns up to 15 results (can be adjusted)

### Debouncing

- 500ms delay after typing stops before searching
- Prevents excessive API calls
- Minimum 3 characters required to trigger search

## Visual Design System

### Colors

- **Primary Pink:** `#FF6B9D` - Selection border, gradients
- **Success Green:** `#10B981` - Open badge, price badge
- **Warning Yellow:** `#FEF3C7` - Service option tags
- **Rating Orange:** `#F59E0B` - Star icons
- **Dark:** `rgba(0, 0, 0, 0.75)` - Rating badge background

### Typography

- **Restaurant Name:** 18px, weight 800
- **Info Text:** 13px, weight 600
- **Badge Text:** 11-13px, weight 700-800

### Spacing

- Card padding: 16px
- Card gap: 10px between sections
- Border radius: 24px (cards), 12-20px (badges)

## Usage Example

```typescript
import { GooglePlacesSearch } from '@/components/GooglePlacesSearch';

// In your component
<GooglePlacesSearch
  onSelectPlace={(place) => {
    console.log('Selected:', place.name);
    console.log('Rating:', place.rating);
    console.log('Address:', place.formatted_address);
    console.log('Phone:', place.phone);
    // Handle the selected place
  }}
  onClose={() => {
    // Handle modal close
  }}
  initialLocation={{
    latitude: -33.918,
    longitude: 18.423,
  }}
/>;
```

## API Rate Limits

### Free Tier

- 100 searches per month
- No rate limiting (requests per second)
- Perfect for development and small apps

### If You Need More

- **Paid Plans** start at $75/month for 5,000 searches
- **Enterprise** plans available for high-volume apps

## Error Handling

The component handles these scenarios:

- ❌ Invalid API key → Empty results with console error
- ❌ Network failure → Empty results with error message
- ❌ No results found → Shows "No restaurants found" message
- ❌ API rate limit exceeded → Returns error in response

## Testing Checklist

- [ ] API key is properly set in code
- [ ] Search returns real restaurant data
- [ ] All info rows display correctly (address, phone, rating)
- [ ] Service option badges appear for applicable restaurants
- [ ] Website button opens correct URL
- [ ] Images load properly with fallback
- [ ] "Open Now" badge shows accurate status
- [ ] Selection state works (pink border on selected card)
- [ ] Confirm button appears when restaurant selected

## Troubleshooting

### "No restaurants found" but query is valid

- Check API key is correct
- Verify location coordinates are accurate
- Ensure you haven't exceeded free tier limit (100 searches/month)

### Images not loading

- SerpAPI returns Google thumbnail URLs
- Check network connectivity
- Fallback to placeholder icon if URL invalid

### Service options not showing

- Not all restaurants have this data in Google Maps
- Check raw API response for `service_options` field

### API Error Messages

```javascript
// Check console for these:
"SerpAPI error: [status code]" → API key issue or rate limit
"Error fetching places from SerpAPI" → Network/parsing error
```

## Next Steps

1. **Replace API key** with your actual SerpAPI key
2. **Test search** with various queries (e.g., "pizza", "coffee", "sushi")
3. **Verify all features** work (badges, buttons, selection)
4. **Move to environment variables** for production
5. **Monitor usage** at [SerpAPI Dashboard](https://serpapi.com/dashboard)

## Resources

- [SerpAPI Documentation](https://serpapi.com/google-maps-api)
- [SerpAPI Playground](https://serpapi.com/playground?engine=google_maps) - Test queries
- [API Dashboard](https://serpapi.com/dashboard) - Monitor usage
- [Pricing](https://serpapi.com/pricing) - Upgrade options

---

**Status:** ✅ Integration Complete  
**Last Updated:** November 29, 2025  
**API Version:** Google Maps Search via SerpAPI
