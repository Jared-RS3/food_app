# 🎯 Production Restaurant App - Complete Architecture Guide

## Overview

A **production-grade, serverless restaurant discovery and ordering platform** built with:

- **Next.js 14** (App Router + Server Actions)
- **Supabase** (PostgreSQL + Auth + Real-time + Storage)
- **Upstash Redis** (Caching layer)
- **Cloudinary** (Image optimization)
- **Stripe** (Payments)
- **OneSignal** (Push notifications)
- **Sentry** (Error monitoring)

---

## 🏗️ Architecture

### High-Level Flow

```
User Request
    ↓
Next.js Middleware (Auth check)
    ↓
API Route / Server Component
    ↓
Service Layer (Business Logic)
    ↓
    ├─→ Redis Cache (Check)
    ├─→ Supabase Database (Query)
    ├─→ Cloudinary (Images)
    ├─→ Stripe (Payments)
    └─→ OneSignal (Notifications)
    ↓
Response (Cached for next request)
```

### Data Flow Examples

#### 1. Restaurant List Request

```
GET /api/restaurants?city=Cape Town&cuisine=Italian
    ↓
Check Redis cache (key: "restaurants:list:city:Cape Town:cuisine:Italian")
    ├─ Cache HIT → Return cached data (< 50ms)
    └─ Cache MISS ↓
Query Supabase with filters + RLS
    ↓
Cache result for 15 minutes
    ↓
Return data to client
```

#### 2. Order Creation Flow

```
POST /api/orders/create
    ↓
Validate user authentication
    ↓
Validate request data (Zod schema)
    ↓
Create order in Supabase
    ↓
Create order items (transaction)
    ↓
Create Stripe payment intent
    ↓
Return order + payment info
    ↓
[Webhook] Payment success
    ↓
Update order status → "confirmed"
    ↓
Send OneSignal push notification
```

---

## 📊 Database Schema

### Tables

#### `user_profiles`

```sql
- id (UUID, PK, FK → auth.users)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- phone (TEXT)
- avatar_url (TEXT)
- role (customer|admin|restaurant_owner)
- created_at, updated_at (TIMESTAMPTZ)
```

#### `restaurants`

```sql
- id (UUID, PK)
- name, slug (TEXT, UNIQUE)
- description, cuisine_type, address, city
- latitude, longitude (DECIMAL)
- rating (DECIMAL 0.00-5.00)
- reviews_count, price_range (1-4)
- delivery_time, minimum_order, delivery_fee
- is_active, is_featured (BOOLEAN)
- owner_id (FK → user_profiles)
- created_at, updated_at
```

#### `menu_items`

```sql
- id (UUID, PK)
- restaurant_id (FK)
- name, description, category
- price (DECIMAL)
- image_url
- is_available, is_vegetarian, is_vegan, is_gluten_free
- calories, preparation_time
- created_at, updated_at
```

#### `orders`

```sql
- id (UUID, PK)
- user_id, restaurant_id (FK)
- status (pending|confirmed|preparing|ready|out_for_delivery|delivered|cancelled)
- subtotal, delivery_fee, tax, total
- delivery_address (JSONB)
- payment_method, payment_status, payment_intent_id
- estimated_delivery_time, delivered_at, cancelled_at
- created_at, updated_at
```

#### `order_items`

```sql
- id (UUID, PK)
- order_id, menu_item_id (FK)
- quantity, unit_price, total_price
- special_instructions
- created_at
```

### RLS Policies

**Key Security Rules:**

- Users can only view/edit their own data
- Restaurant owners can manage their own restaurants/menus/orders
- Admins have full access
- All queries automatically filtered by RLS

Example:

```sql
-- Users can only see their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

---

## 🔄 Caching Strategy

### Cache Layers

1. **Application Cache (Redis)**

   - Restaurant lists (15 min TTL)
   - Restaurant details (1 hour TTL)
   - Menu items (15 min TTL)
   - Search results (5 min TTL)

2. **CDN Cache (Cloudinary)**

   - Optimized images
   - Auto-format (WebP, AVIF)
   - Responsive URLs

3. **Browser Cache**
   - Static assets (Next.js automatic)
   - API responses (stale-while-revalidate)

### Cache Invalidation

```typescript
// When restaurant is updated
await invalidateRestaurantCache(restaurantId);
// Clears:
// - restaurant:{id}
// - menu:{id}
// - restaurants:list:*
// - search:*
```

---

## 💳 Payment Flow

### Checkout Process

1. **Client**: User clicks "Place Order"
2. **API**: `POST /api/orders/create`
   - Create order (status: pending)
   - Create Stripe payment intent
   - Return `clientSecret`
3. **Client**: Stripe.js confirms payment
4. **Stripe**: Sends webhook to `/api/webhooks/stripe`
5. **API**: Verify signature → Update order status → Send notification

### Webhook Events Handled

- `checkout.session.completed` → Mark as paid, confirm order
- `payment_intent.payment_failed` → Mark as failed
- `charge.refunded` → Mark as refunded

---

## 🔔 Push Notifications

### Notification Triggers

1. **Order Status Changes**

   ```typescript
   sendOrderStatusNotification(userId, orderId, 'confirmed', restaurantName);
   ```

   - confirmed → "Order Confirmed! 🎉"
   - preparing → "Order is Being Prepared 👨‍🍳"
   - ready → "Order Ready! 🍽️"
   - out_for_delivery → "Order On The Way! 🚗"
   - delivered → "Order Delivered! ✅"

2. **Promotional**
   - Daily specials (cron job at 10 AM)
   - Featured restaurants
   - Personalized offers

### Implementation

```typescript
// Server-side (OneSignal)
await sendNotificationToUser(userId, {
  title: 'Order Update',
  message: 'Your order is ready!',
  data: { orderId, status },
  url: '/orders/123',
});

// Client-side (Web SDK)
OneSignal.init({ appId: 'your-app-id' });
OneSignal.setExternalUserId(userId);
```

---

## 🖼️ Image Optimization

### Upload Flow

```typescript
// Upload restaurant image
const result = await uploadRestaurantImage(fileBuffer);
// Returns: {
//   url: 'https://res.cloudinary.com/.../optimized.webp',
//   publicId: 'restaurants/abc123',
//   width: 1200,
//   height: 800
// }
```

### Automatic Optimizations

- **Format**: Auto-converts to WebP/AVIF
- **Quality**: `auto:good` (smart compression)
- **Cropping**: `fill` with gravity `auto` (AI-powered)
- **Responsive**: Multiple sizes generated

### Usage in Components

```tsx
<Image
  src={getOptimizedUrl(publicId, { width: 800, height: 600 })}
  alt="Restaurant"
  width={800}
  height={600}
/>
```

---

## 🔐 Security Best Practices

### 1. Authentication

```typescript
// Require auth in API routes
const user = await requireAuth();
// Throws error if not authenticated

// Require admin
const admin = await requireAdmin();
// Throws error if not admin role
```

### 2. Input Validation

```typescript
const schema = z.object({
  email: z.string().email(),
  quantity: z.number().min(1).max(100),
});

const data = schema.parse(requestBody); // Throws if invalid
```

### 3. RLS Policies

```sql
-- Automatically applied to all queries
CREATE POLICY "policy_name" ON table_name
FOR SELECT USING (auth.uid() = user_id);
```

### 4. Environment Variables

```bash
# Never commit these!
SUPABASE_SERVICE_ROLE_KEY=   # Server-only
STRIPE_SECRET_KEY=            # Server-only
STRIPE_WEBHOOK_SECRET=        # Server-only
```

---

## 📈 Performance Optimization

### Database Indexes

```sql
-- Fast lookups
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);

-- Full-text search
CREATE INDEX idx_restaurants_search ON restaurants
USING GIN(to_tsvector('english', name || ' ' || description));
```

### Query Optimization

```typescript
// ❌ Bad: N+1 query problem
const orders = await getOrders();
for (const order of orders) {
  const items = await getOrderItems(order.id); // Multiple queries
}

// ✅ Good: Single query with join
const { data } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .eq('user_id', userId);
```

### Caching Pattern

```typescript
// Cache-aside pattern
const data = await cacheAside({
  key: 'restaurants:featured',
  ttl: 3600,
  fetchData: async () => getFeaturedRestaurants(),
});
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

```typescript
describe('createOrder', () => {
  it('should create order with correct totals', async () => {
    const order = await createOrder(mockData);
    expect(order.total).toBe(124.99);
  });
});
```

### Integration Tests (Playwright)

```typescript
test('complete order flow', async ({ page }) => {
  await page.goto('/restaurants/123');
  await page.click('[data-test="add-to-cart"]');
  await page.click('[data-test="checkout"]');
  // ... complete flow
});
```

### Load Tests (Artillery)

```yaml
config:
  target: 'https://your-app.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 100 # 100 users/second
scenarios:
  - name: 'Browse restaurants'
    flow:
      - get:
          url: '/api/restaurants'
```

---

## 📊 Monitoring & Observability

### Sentry Setup

```typescript
// Automatic error tracking
Sentry.captureException(error);

// Custom context
Sentry.setContext('order', { orderId, userId });

// Performance monitoring
const transaction = Sentry.startTransaction({
  name: 'Create Order',
  op: 'api.order.create',
});
// ... do work
transaction.finish();
```

### Key Metrics to Track

1. **API Performance**

   - P50, P95, P99 latencies
   - Error rate
   - Cache hit rate

2. **Business Metrics**

   - Orders per day
   - Average order value
   - Conversion rate
   - Restaurant signup rate

3. **User Metrics**
   - Active users
   - Retention rate
   - Session duration

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Git Repository**

   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**

   - Via Vercel dashboard
   - Or CLI: `vercel env add VARIABLE_NAME`

3. **Configure Cron Jobs** (`vercel.json`)
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/clean-carts",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```

### Supabase

1. **Create Project**

   ```bash
   supabase init
   supabase db push
   ```

2. **Run Migrations**

   ```bash
   supabase migration up
   ```

3. **Generate Types**
   ```bash
   supabase gen types typescript --local > types/database.ts
   ```

---

## 🐛 Troubleshooting

### Common Issues

**1. RLS Blocking Queries**

```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Temporarily disable for testing (dev only!)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

**2. Cache Not Invalidating**

```typescript
// Force clear all caches
await redis.flushall(); // Nuclear option!

// Or clear specific pattern
await deleteCachePattern('restaurants:*');
```

**3. Webhook Signature Verification Failing**

```typescript
// Check raw body is passed (not parsed JSON)
export const config = {
  api: { bodyParser: false },
};
```

**4. Slow Queries**

```sql
-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM restaurants WHERE city = 'Cape Town';

-- Add missing index
CREATE INDEX idx_restaurants_city ON restaurants(city);
```

---

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Upstash Redis Docs](https://upstash.com/docs/redis)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [OneSignal Docs](https://documentation.onesignal.com)
- [Sentry Docs](https://docs.sentry.io)

---

## 🤝 Contributing

This architecture supports:

- ✅ Horizontal scaling (serverless)
- ✅ Multi-region deployment
- ✅ A/B testing
- ✅ Feature flags
- ✅ Blue-green deployments

**Built for scale. Ready for production. Ship with confidence! 🚀**
