# Social Features & Instagram Integration 🤝📱

## Overview

We've implemented comprehensive social features that allow you to:

1. **Import restaurants from Instagram** - Copy & paste IG links to add restaurants
2. **Share discoveries with friends** - Post restaurants and food to your social feed
3. **Engage with friends' content** - Like, comment, and bookmark posts
4. **Track friend activity** - See what your friends are discovering

---

## 🎯 Features Implemented

### 1. Instagram Link Import 📸

**Location:** Floating button on Home screen + Social tab

**How it works:**

1. Go to Instagram and find a restaurant profile
2. Tap "Share Profile" and copy the link
3. Return to the app - it auto-detects Instagram links in clipboard
4. Tap the Instagram button (purple floating button on map)
5. Paste the link and import the restaurant

**Supported URL formats:**

- `instagram.com/restaurantname`
- `instagram.com/p/POST_ID`
- `instagr.am/restaurantname`

**Code:**

- Component: `/components/InstagramImportModal.tsx`
- Service: `/services/socialService.ts`
- Home integration: `/app/(tabs)/index.tsx` (line 1635)

**Features:**

- ✅ Auto-detect clipboard content
- ✅ Parse Instagram usernames
- ✅ One-tap paste functionality
- ✅ Visual feedback with success alerts
- ✅ Adds restaurant to your search list

---

### 2. Social Feed Tab 👥

**Location:** New "Social" tab in bottom navigation (between Favorites and Nutrition)

**Features:**

#### Feed View:

- **Friend posts** - See what friends are discovering
- **Restaurant shares** - Friends sharing new places
- **Food photos** - Dishes friends are trying
- **Check-ins** - Real-time location sharing
- **Reviews & ratings** - Star ratings and comments

#### Post Actions:

- ❤️ **Like** - Double-tap or tap heart icon
- 💬 **Comment** - Engage in conversations
- 🔖 **Bookmark** - Save posts for later
- 📤 **Share** - Share with other friends

#### Post Types:

1. **Restaurant Discovery** - "Just discovered [Restaurant]!"
2. **Food Item** - "[Dish] @ [Restaurant]"
3. **Check-in** - "Currently at [Restaurant]"
4. **Review** - Rating + written review

**Code:**

- Screen: `/app/(tabs)/social.tsx`
- Card Component: `/components/SocialFeedCard.tsx`
- Service: `/services/socialService.ts`

---

### 3. Social Actions

#### Like Posts

```typescript
// Toggle like status
await socialService.likePost(postId);
await socialService.unlikePost(postId);
```

#### Bookmark Posts

```typescript
// Save for later
await socialService.bookmarkPost(postId);
await socialService.removeBookmark(postId);
```

#### Comment on Posts

```typescript
// Add comments
await socialService.addComment(postId, 'Looks amazing!');
const comments = await socialService.getComments(postId);
```

#### Share Content

```typescript
// Share restaurants
await socialService.shareRestaurant(
  restaurantId,
  restaurantName,
  restaurantImage,
  'Just discovered this gem!',
  5 // rating
);

// Share food items
await socialService.shareFoodItem(
  restaurantId,
  restaurantName,
  foodItemName,
  foodItemImage,
  'Best pasta ever!',
  5
);
```

---

## 📱 User Experience Flow

### Import from Instagram:

1. **Discover** - Find restaurant on Instagram
2. **Share** - Copy profile link
3. **Import** - Tap Instagram button in app
4. **Auto-paste** - App detects clipboard content
5. **Confirm** - Restaurant added to your list
6. **Explore** - See it on the map immediately

### Social Engagement:

1. **Browse Feed** - See friends' discoveries
2. **Engage** - Like, comment, or bookmark
3. **Share Your Own** - Post your discoveries
4. **Track Activity** - See friend notifications
5. **Build Network** - Connect with food lovers

---

## 🎨 UI Components

### Instagram Import Modal

**Design:**

- Clean, minimal interface
- Auto-detects clipboard content
- Step-by-step instructions
- Visual feedback on paste
- Success/error alerts

**Colors:**

- Instagram purple: `#E1306C`
- Accent: Primary theme color
- Success: Green badge
- Background: White with shadows

### Social Feed Card

**Layout:**

- User avatar & name (top left)
- Timestamp & location (top right)
- Post content (text)
- Star rating (if applicable)
- Large image (300px height)
- Restaurant tag overlay (bottom of image)
- Action buttons (like, comment, bookmark, share)

**Interactions:**

- Tap image → Navigate to restaurant
- Tap heart → Toggle like
- Tap comment → Show comments
- Tap bookmark → Save post
- Tap share → Share externally

**States:**

- Liked (red heart, filled)
- Bookmarked (purple bookmark, filled)
- Default (gray, outline)

---

## 🔧 Technical Implementation

### Service Layer (`socialService.ts`)

```typescript
class SocialService {
  // Instagram Import
  async parseInstagramLink(url: string)
  async importFromInstagram(instagramUrl: string)
  async getClipboardContent()
  async hasInstagramLinkInClipboard()

  // Social Feed
  async getSocialFeed(limit: number)
  async getFriendActivities(limit: number)

  // Interactions
  async likePost(postId: string)
  async unlikePost(postId: string)
  async bookmarkPost(postId: string)
  async removeBookmark(postId: string)
  async addComment(postId: string, content: string)
  async getComments(postId: string)

  // Sharing
  async shareRestaurant(...)
  async shareFoodItem(...)
}
```

### Data Structures

```typescript
interface SocialPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  type: 'restaurant' | 'food' | 'review' | 'checkin';
  restaurant_id?: string;
  restaurant_name?: string;
  restaurant_image?: string;
  food_item_id?: string;
  food_item_name?: string;
  food_item_image?: string;
  content?: string;
  rating?: number;
  images?: string[];
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  location?: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}
```

---

## 🗄️ Database Schema (Recommended)

### Tables to Create:

```sql
-- Social Posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'restaurant', 'food', 'review', 'checkin'
  restaurant_id UUID REFERENCES restaurants(id),
  restaurant_name TEXT,
  restaurant_image TEXT,
  food_item_id UUID,
  food_item_name TEXT,
  food_item_image TEXT,
  content TEXT,
  rating INTEGER,
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Post Likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post Bookmarks
CREATE TABLE post_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post Comments
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Friends/Followers
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES auth.users(id),
  following_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

---

## 🎯 Future Enhancements

### Phase 1 (Current) ✅

- [x] Instagram link parsing
- [x] Social feed display
- [x] Like/bookmark functionality
- [x] Post sharing
- [x] Friend activity tracking

### Phase 2 (Next)

- [ ] Instagram API integration (real profile data)
- [ ] Real-time notifications
- [ ] Friend search & discovery
- [ ] Direct messaging
- [ ] Story-style ephemeral posts

### Phase 3 (Advanced)

- [ ] Group dining plans
- [ ] Restaurant reservations through social
- [ ] Split bill calculator
- [ ] Food challenges with friends
- [ ] Leaderboards & achievements

---

## 📊 Mock Data

Currently using mock data for:

- Social feed posts (3 sample posts)
- User avatars (pravatar.cc)
- Comments (2 per post)
- Friend activities (3 recent activities)

**To connect real data:**

1. Update `socialService.ts` methods
2. Replace mock data with Supabase queries
3. Add proper authentication checks
4. Implement real-time subscriptions

---

## 🔐 Security Considerations

1. **Instagram Import:**

   - Validate URLs before parsing
   - Sanitize username input
   - Rate limit import requests
   - Handle API errors gracefully

2. **Social Features:**

   - Verify user authentication
   - Check post permissions
   - Validate comment content
   - Implement spam prevention
   - Add report/block functionality

3. **Data Privacy:**
   - Respect user privacy settings
   - Allow post visibility controls
   - Enable account privacy modes
   - GDPR compliance for EU users

---

## 🎨 Design System

**Colors:**

- Instagram Brand: `#E1306C` (gradient purple-pink)
- Like Red: `#FF3B5C`
- Bookmark Purple: `#8B5CF6`
- Primary: `#FF6B9D` (app theme)

**Typography:**

- Post Title: 18px, Bold (-0.3 tracking)
- Post Content: 16px, Regular (22px line-height)
- Username: 16px, Bold (-0.2 tracking)
- Timestamp: 14px, Regular (gray-600)
- Action Labels: 14px, Semibold

**Spacing:**

- Card Padding: 16px
- Content Gap: 12px
- Action Button Gap: 20px
- Image Height: 300px

**Shadows:**

- Cards: 0px 2px 8px rgba(0,0,0,0.08)
- Floating Button: 0px 4px 12px rgba(0,0,0,0.3)

---

## 📚 Usage Examples

### Import Restaurant from Instagram

```typescript
// User copies: https://instagram.com/the_test_kitchen
// App auto-detects and shows modal with paste option
<InstagramImportModal
  visible={showImportModal}
  onClose={() => setShowImportModal(false)}
  onImportSuccess={(restaurant) => {
    Alert.alert('Added!', `${restaurant.name} is now in your list`);
  }}
/>
```

### Display Social Feed

```typescript
const [feedPosts, setFeedPosts] = useState<SocialPost[]>([]);

useEffect(() => {
  loadFeed();
}, []);

const loadFeed = async () => {
  const posts = await socialService.getSocialFeed();
  setFeedPosts(posts);
};

return (
  <ScrollView>
    {feedPosts.map((post) => (
      <SocialFeedCard
        key={post.id}
        post={post}
        onLike={handleLike}
        onComment={handleComment}
        onBookmark={handleBookmark}
        onShare={handleShare}
      />
    ))}
  </ScrollView>
);
```

### Share a Restaurant

```typescript
const handleShare = async () => {
  await socialService.shareRestaurant(
    restaurant.id,
    restaurant.name,
    restaurant.image,
    'Just had the best meal here! 🍽️',
    5
  );
  Alert.alert('Shared!', 'Your friends can now see this restaurant');
};
```

---

## 🐛 Known Issues & Limitations

1. **Instagram Import:**

   - No official Instagram API integration yet
   - Profile data is basic (username only)
   - No image/bio fetching currently
   - Rate limiting not implemented

2. **Social Feed:**

   - Using mock data (needs real backend)
   - No real-time updates yet
   - Comments are placeholder only
   - No friend system yet

3. **Performance:**
   - Large feeds may cause scroll lag
   - Images not optimized/cached
   - No pagination yet

---

## ✅ Testing Checklist

- [ ] Instagram link parsing works with all URL formats
- [ ] Clipboard detection is accurate
- [ ] Import modal shows/hides correctly
- [ ] Restaurants appear on map after import
- [ ] Like button toggles correctly
- [ ] Bookmark button saves posts
- [ ] Share functionality works
- [ ] Feed loads on tab switch
- [ ] Pull-to-refresh updates feed
- [ ] Comments modal opens
- [ ] Error handling for failed imports
- [ ] Loading states display properly

---

## 📞 Support & Feedback

For issues or suggestions:

1. Check console logs for errors
2. Verify network connection
3. Test with valid Instagram URLs
4. Report bugs with screenshots
5. Suggest features in app feedback

---

**Created:** November 24, 2025
**Version:** 1.0.0
**Status:** ✅ Ready for Testing
