# ⚡ Quick Reference - Cheat Sheet

## Common Commands

### Development

```bash
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Lint code
npm run type-check      # Check TypeScript
```

### Supabase

```bash
supabase init                    # Initialize project
supabase start                   # Start local instance
supabase db push                 # Push migrations
supabase gen types typescript    # Generate types
supabase db reset                # Reset database
supabase functions deploy        # Deploy edge functions
```

### Deployment

```bash
vercel                  # Deploy to preview
vercel --prod          # Deploy to production
vercel env add         # Add environment variable
vercel logs            # View logs
```

---

## Code Snippets

### Authentication

```typescript
// Sign up
import { signUp } from '@/lib/supabase/auth-helpers';
const { user, error } = await signUp(email, password, { full_name });

// Login
import { signIn } from '@/lib/supabase/auth-helpers';
const { user, error } = await signIn(email, password);

// Get current user (server)
import { getUser } from '@/lib/supabase/auth-helpers';
const { user } = await getUser();

// Require auth
import { requireAuth } from '@/lib/supabase/auth-helpers';
const user = await requireAuth(); // Throws if not authenticated
```

### Database Queries

```typescript
// Client-side
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
const { data } = await supabase.from('restaurants').select('*');

// Server-side
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
const { data } = await supabase.from('restaurants').select('*');

// Admin (bypass RLS)
import { createAdminClient } from '@/lib/supabase/server';
const admin = createAdminClient();
const { data } = await admin.from('restaurants').update({...});
```

### Caching

```typescript
// Get from cache
import { getCache } from '@/lib/redis/cache-helpers';
const data = await getCache<Restaurant[]>('restaurants:list');

// Set cache
import { setCache, CACHE_TTL } from '@/lib/redis/cache-helpers';
await setCache('key', data, CACHE_TTL.MEDIUM);

// Cache-aside pattern
import { cacheAside } from '@/lib/redis/cache-helpers';
const data = await cacheAside({
  key: 'restaurants:featured',
  ttl: 3600,
  fetchData: async () => await getFeaturedRestaurants(),
});

// Invalidate
import { invalidateRestaurantCache } from '@/lib/redis/cache-helpers';
await invalidateRestaurantCache(restaurantId);
```

### Image Upload

```typescript
// Upload restaurant image
import { uploadRestaurantImage } from '@/lib/cloudinary/upload-helpers';
const result = await uploadRestaurantImage(fileBuffer);
// Returns: { url, publicId, width, height, format }

// Get optimized URL
import { getOptimizedUrl } from '@/lib/cloudinary/upload-helpers';
const url = getOptimizedUrl(publicId, { width: 800, height: 600 });

// Responsive URLs
import { getResponsiveUrls } from '@/lib/cloudinary/upload-helpers';
const { thumbnail, small, medium, large } = getResponsiveUrls(publicId);
```

### Payments

```typescript
// Create checkout session
import { createCheckoutSession } from '@/lib/stripe/payment-helpers';
const session = await createCheckoutSession({
  id: orderId,
  userId,
  restaurantId,
  total: 99.99,
  items: [{ name: 'Burger', quantity: 2, price: 49.99 }],
});
// Returns: { sessionId, url }

// Refund payment
import { refundPayment } from '@/lib/stripe/payment-helpers';
await refundPayment(paymentIntentId, amount, 'requested_by_customer');
```

### Notifications

```typescript
// Send to one user
import { sendNotificationToUser } from '@/lib/onesignal/notification-helpers';
await sendNotificationToUser(userId, {
  title: 'Order Update',
  message: 'Your order is ready!',
  data: { orderId },
  url: '/orders/123',
});

// Send order status notification
import { sendOrderStatusNotification } from '@/lib/onesignal/notification-helpers';
await sendOrderStatusNotification(userId, orderId, 'confirmed', restaurantName);

// Send promo to all users
import { sendPromoNotification } from '@/lib/onesignal/notification-helpers';
await sendPromoNotification({
  title: 'Daily Special!',
  message: 'Check out our featured restaurants',
  image: imageUrl,
});
```

### Error Handling

```typescript
// Capture exception
import { captureException } from '@/lib/sentry/config';
try {
  // ... code
} catch (error) {
  captureException(error, { orderId, userId });
  throw error;
}

// Add breadcrumb
import { addBreadcrumb } from '@/lib/sentry/config';
addBreadcrumb({
  message: 'User clicked checkout',
  category: 'user-action',
  data: { items: cartItems.length },
});

// Set user context
import { setUser } from '@/lib/sentry/config';
setUser({ id: user.id, email: user.email });
```

---

## SQL Snippets

### Common Queries

```sql
-- Get restaurants with menu count
SELECT r.*, COUNT(m.id) as menu_items_count
FROM restaurants r
LEFT JOIN menu_items m ON m.restaurant_id = r.id
WHERE r.is_active = true
GROUP BY r.id;

-- Get orders with items
SELECT o.*,
  json_agg(oi.*) as items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.user_id = '...'
GROUP BY o.id;

-- Get restaurant rating breakdown
SELECT
  rating,
  COUNT(*) as count
FROM reviews
WHERE restaurant_id = '...'
GROUP BY rating
ORDER BY rating DESC;
```

### Useful Functions

```sql
-- Update restaurant rating (trigger does this automatically)
UPDATE restaurants
SET rating = (
  SELECT AVG(rating) FROM reviews WHERE restaurant_id = restaurants.id
),
reviews_count = (
  SELECT COUNT(*) FROM reviews WHERE restaurant_id = restaurants.id
)
WHERE id = '...';

-- Clean old carts
DELETE FROM carts
WHERE expires_at < NOW() - INTERVAL '1 hour';

-- Get top restaurants
SELECT * FROM restaurants
WHERE is_active = true
ORDER BY rating DESC, reviews_count DESC
LIMIT 10;
```

---

## Environment Variables

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# OneSignal
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
NEXT_PUBLIC_ONESIGNAL_APP_ID=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

---

## Testing

### Test Cards (Stripe)

```
Success:     4242 4242 4242 4242
Decline:     4000 0000 0000 0002
3D Secure:   4000 0027 6000 3184
Insufficient: 4000 0000 0000 9995

Expiry: Any future date
CVV: Any 3 digits
ZIP: Any 5 digits
```

### Test Order Flow

```bash
# 1. Create user
curl -X POST https://your-app/auth/signup \
  -d '{"email":"test@test.com","password":"password123"}'

# 2. Get restaurants
curl https://your-app/api/restaurants

# 3. Create order
curl -X POST https://your-app/api/orders/create \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "restaurantId":"...",
    "items":[{"menuItemId":"...","quantity":2,"unitPrice":99.99}],
    "deliveryAddress":{...},
    "paymentMethod":"card"
  }'

# 4. Check webhook received
curl https://your-app/api/webhooks/stripe -X POST \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```

---

## Debugging

### Check Logs

```bash
# Vercel logs
vercel logs --follow

# Supabase logs
supabase logs

# Stripe logs
stripe logs tail

# Redis check
curl $UPSTASH_REDIS_REST_URL/get/test \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
```

### Common Errors

**RLS blocking query**

```sql
-- Check current user
SELECT auth.uid();

-- Check policy
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Temporary disable (dev only!)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

**Cache not working**

```typescript
// Check Redis connection
const result = await redis.ping();
console.log(result); // Should be "PONG"

// Clear all cache
await redis.flushall();
```

**Webhook failing**

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check signature
echo $STRIPE_WEBHOOK_SECRET
```

---

## Performance

### Optimization Checklist

- [ ] Add database indexes
- [ ] Enable Redis caching
- [ ] Use Cloudinary transformations
- [ ] Enable Vercel caching headers
- [ ] Optimize images (WebP/AVIF)
- [ ] Minimize database queries
- [ ] Use server components where possible
- [ ] Lazy load components
- [ ] Enable compression
- [ ] Monitor with Sentry

### Quick Wins

```typescript
// 1. Cache expensive queries
const data = await cacheAside({
  key: 'expensive-query',
  ttl: 3600,
  fetchData: async () => await expensiveQuery(),
});

// 2. Use select to limit fields
const { data } = await supabase
  .from('restaurants')
  .select('id, name, image_url') // Only needed fields
  .limit(10);

// 3. Batch operations
const promises = ids.map(id => getRestaurant(id));
const results = await Promise.all(promises);

// 4. Use indexes
-- SQL
CREATE INDEX idx_restaurants_city_rating
ON restaurants(city, rating DESC);
```

---

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Upstash Console**: https://console.upstash.com
- **Cloudinary Console**: https://cloudinary.com/console
- **OneSignal Dashboard**: https://onesignal.com/apps
- **Sentry Dashboard**: https://sentry.io

---

## Support

**Documentation**

- `README.md` - Overview
- `ARCHITECTURE.md` - Deep dive
- `DEPLOYMENT.md` - Setup guide
- `SUMMARY.md` - What's included

**Get Help**

- Check error logs in Sentry
- Review Vercel function logs
- Check Supabase database logs
- Test webhooks with Stripe CLI

---

**Keep this handy! Bookmark this page for quick reference. 🔖**
