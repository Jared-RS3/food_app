# 🚀 Quick Start - Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Vercel account (or Cloudflare/Railway)
- Stripe account
- Upstash Redis account
- Cloudinary account
- OneSignal account
- Sentry account

---

## Step 1: Clone & Install (5 minutes)

```bash
# Navigate to the project
cd production-app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

---

## Step 2: Configure Services (15 minutes)

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy credentials:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Keep secret!
   ```

3. Run migrations:

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link project
   supabase link --project-ref your-project-ref

   # Push schema
   supabase db push

   # Generate types
   npm run supabase:gen-types
   ```

### Upstash Redis Setup

1. Create database at [upstash.com](https://upstash.com)
2. Copy credentials:
   ```bash
   UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXXXXx...
   ```

### Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy from dashboard:
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=xxxxx...
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```

### Stripe Setup

1. Sign up at [stripe.com](https://stripe.com)
2. Get test keys from dashboard:

   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

3. Install Stripe CLI for webhooks:

   ```bash
   # Install
   brew install stripe/stripe-cli/stripe

   # Login
   stripe login

   # Forward webhooks (development)
   stripe listen --forward-to localhost:3000/api/webhooks/stripe

   # Copy webhook secret
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### OneSignal Setup

1. Create app at [onesignal.com](https://onesignal.com)
2. Configure Web Push
3. Copy credentials:
   ```bash
   ONESIGNAL_APP_ID=xxxxx-xxxxx-xxxxx
   ONESIGNAL_REST_API_KEY=xxxxx...
   NEXT_PUBLIC_ONESIGNAL_APP_ID=xxxxx-xxxxx-xxxxx
   ```

### Sentry Setup

1. Create project at [sentry.io](https://sentry.io)
2. Copy DSN:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   SENTRY_AUTH_TOKEN=xxxxx... # For source maps
   ```

### App Config

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 3: Test Locally (10 minutes)

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000

# Test authentication
# 1. Sign up with email
# 2. Check Supabase auth users
# 3. Verify user_profiles row created

# Test order creation
# 1. Browse restaurants
# 2. Add items to cart
# 3. Checkout (use Stripe test card: 4242 4242 4242 4242)
# 4. Check webhook received

# Test caching
# 1. Browse restaurants (should cache)
# 2. Check Redis in Upstash console
# 3. Refresh page (should be faster)
```

---

## Step 4: Deploy to Vercel (10 minutes)

### Option A: Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... repeat for all env vars

# Redeploy with env vars
vercel --prod
```

### Option B: Via Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect GitHub repository
4. Add environment variables
5. Click "Deploy"

### Configure Production Webhook

```bash
# Add webhook endpoint in Stripe dashboard
https://your-app.vercel.app/api/webhooks/stripe

# Copy production webhook secret
# Add to Vercel environment variables:
STRIPE_WEBHOOK_SECRET=whsec_xxxxx_production
```

---

## Step 5: Set Up Cron Jobs (5 minutes)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/clean-carts",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/send-promos",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/refresh-cache",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Create API route handlers:

```typescript
// app/api/cron/clean-carts/route.ts
export { GET } from '@/server/cron/clean-expired-carts';

// app/api/cron/send-promos/route.ts
export { GET } from '@/server/cron/send-daily-promos';

// app/api/cron/refresh-cache/route.ts
export { GET } from '@/server/cron/refresh-cache';
```

Redeploy:

```bash
vercel --prod
```

---

## Step 6: Verify Production (10 minutes)

### Checklist

- [ ] App loads at production URL
- [ ] Sign up creates user in Supabase
- [ ] Restaurant list loads (check Redis cache)
- [ ] Images load from Cloudinary CDN
- [ ] Order creation works
- [ ] Payment processes (Stripe test mode)
- [ ] Webhook received and order status updated
- [ ] Push notification sent (check OneSignal dashboard)
- [ ] Errors tracked in Sentry
- [ ] Cron jobs run (check Vercel logs)

### Test Commands

```bash
# Test API endpoint
curl https://your-app.vercel.app/api/restaurants

# Test webhook
curl -X POST https://your-app.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test cron job manually
curl https://your-app.vercel.app/api/cron/clean-carts
```

---

## Step 7: Go Live (5 minutes)

### Switch to Production Mode

1. **Stripe**: Switch to live mode, get production keys
2. **Environment**: Update `NODE_ENV=production`
3. **Monitoring**: Set up Sentry alerts
4. **Analytics**: Add Google Analytics / Mixpanel
5. **Domain**: Add custom domain in Vercel

### Production Checklist

- [ ] All environment variables set to production values
- [ ] Stripe in live mode (real payments)
- [ ] Webhook endpoints verified
- [ ] SSL certificate active (automatic with Vercel)
- [ ] RLS policies tested and enabled
- [ ] Rate limiting configured (optional)
- [ ] Backup strategy in place (Supabase auto-backups)
- [ ] Monitoring dashboard set up

---

## Troubleshooting

### Common Issues

**"Module not found" errors**

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Supabase RLS blocking queries**

```sql
-- Check auth context
SELECT auth.uid(); -- Should return user ID

-- Temporarily disable RLS (testing only!)
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
```

**Redis connection failed**

```bash
# Test Redis connection
curl https://your-redis.upstash.io/get/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Stripe webhook not working**

```bash
# Check Stripe logs
stripe logs tail

# Verify webhook secret matches
echo $STRIPE_WEBHOOK_SECRET
```

**Images not loading**

```bash
# Check Cloudinary config
curl https://res.cloudinary.com/your-cloud/image/upload/v1/test.jpg
```

---

## Performance Tuning

### Vercel Configuration

```json
// next.config.js additions
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### Database Optimization

```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_orders_created
ON orders(created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM restaurants
WHERE city = 'Cape Town' AND is_active = true;
```

### Redis Optimization

```typescript
// Increase cache TTL for static data
export const CACHE_TTL = {
  SHORT: 60 * 5, // 5 min
  MEDIUM: 60 * 30, // 30 min (increased from 15)
  LONG: 60 * 60 * 2, // 2 hours (increased from 1)
};
```

---

## Monitoring Setup

### Sentry Alerts

1. Go to Sentry project settings
2. Add alerts for:
   - Error rate > 1%
   - Response time > 1s
   - Failed webhook > 5

### Uptime Monitoring

Use services like:

- [Better Uptime](https://betteruptime.com)
- [Pingdom](https://pingdom.com)
- [UptimeRobot](https://uptimerobot.com)

### Analytics

```typescript
// Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />;
```

---

## Scaling Considerations

### When to Scale

- **> 10,000 daily users**: Upgrade Supabase plan
- **> 1M API requests/day**: Implement rate limiting
- **> 100 concurrent orders**: Consider queue system (Bull/BullMQ)
- **> 10GB images**: Upgrade Cloudinary plan

### Cost Optimization

- Use Vercel Pro only if needed (Hobby is generous)
- Optimize Supabase queries to stay in free tier
- Set Redis expiration on all keys
- Use Cloudinary's free tier optimization

---

## Next Steps

1. **Add Analytics**: Track user behavior
2. **Implement Search**: Algolia or Meilisearch
3. **Add Reviews**: User-generated content
4. **Mobile App**: React Native + shared API
5. **Admin Dashboard**: Manage restaurants, orders, users
6. **Email Notifications**: Resend or SendGrid
7. **SMS Notifications**: Twilio
8. **Loyalty Program**: Points and rewards
9. **Multi-language**: i18n support
10. **Dark Mode**: User preference

---

## Support

- **Documentation**: See `ARCHITECTURE.md` and `README.md`
- **Issues**: Check GitHub issues or create new one
- **Community**: Join Discord/Slack community
- **Commercial Support**: Available for enterprise clients

---

**Total Time: ~60 minutes from zero to production! 🚀**
