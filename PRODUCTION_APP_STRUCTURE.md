# Production Restaurant App - Complete Architecture

## 📁 Folder Structure

```
restaurant-app/
├── .env.local
├── .env.example
├── next.config.js
├── tsconfig.json
├── package.json
├── middleware.ts
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── restaurants/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── menu/
│   │   │   └── [restaurantId]/
│   │   │       └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── restaurants/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   └── api/
│       ├── orders/
│       │   ├── create/
│       │   │   └── route.ts
│       │   ├── update/
│       │   │   └── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── payments/
│       │   ├── checkout/
│       │   │   └── route.ts
│       │   └── webhook/
│       │       └── route.ts
│       ├── notifications/
│       │   └── send/
│       │       └── route.ts
│       └── webhooks/
│           └── stripe/
│               └── route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Input.tsx
│   ├── restaurant/
│   │   ├── RestaurantCard.tsx
│   │   ├── RestaurantList.tsx
│   │   └── RestaurantDetails.tsx
│   ├── menu/
│   │   ├── MenuItem.tsx
│   │   ├── MenuList.tsx
│   │   └── MenuCategory.tsx
│   ├── order/
│   │   ├── OrderCard.tsx
│   │   ├── OrderStatus.tsx
│   │   └── OrderTracking.tsx
│   └── cart/
│       ├── CartItem.tsx
│       └── CartSummary.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── auth-helpers.ts
│   ├── redis/
│   │   ├── client.ts
│   │   └── cache-helpers.ts
│   ├── cloudinary/
│   │   ├── client.ts
│   │   └── upload-helpers.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── payment-helpers.ts
│   ├── onesignal/
│   │   ├── client.ts
│   │   └── notification-helpers.ts
│   ├── sentry/
│   │   └── config.ts
│   └── utils/
│       ├── error-handler.ts
│       ├── validation.ts
│       └── helpers.ts
├── services/
│   ├── restaurantService.ts
│   ├── menuService.ts
│   ├── orderService.ts
│   ├── paymentService.ts
│   ├── notificationService.ts
│   └── userService.ts
├── types/
│   ├── database.ts
│   ├── restaurant.ts
│   ├── menu.ts
│   ├── order.ts
│   ├── payment.ts
│   └── user.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useRestaurants.ts
│   ├── useMenu.ts
│   ├── useOrders.ts
│   └── useCart.ts
├── context/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── NotificationContext.tsx
├── server/
│   ├── supabase/
│   │   └── functions/
│   │       ├── create-order/
│   │       │   └── index.ts
│   │       ├── update-order-status/
│   │       │   └── index.ts
│   │       ├── send-notification/
│   │       │   └── index.ts
│   │       └── process-payment/
│   │           └── index.ts
│   └── cron/
│       ├── clean-expired-carts.ts
│       ├── send-daily-promos.ts
│       └── refresh-cache.ts
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── config.toml
```

## 🚀 Technology Stack Versions

- Next.js 14.2.0 (App Router)
- TypeScript 5.3.0
- Supabase JS 2.39.0
- Upstash Redis 1.28.0
- Cloudinary 2.0.0
- Stripe 14.15.0
- OneSignal Node 3.4.0
- Sentry/Next.js 7.99.0

## 📦 Dependencies

See package.json file generated next.
