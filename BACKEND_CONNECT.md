# Zomax backend integration contract

This document describes the backend boundary for the current Next.js application.

## Current frontend state

- Next.js App Router is the active frontend.
- `lib/catalog.ts` already supports a server catalog through `ZOMAX_API_URL`.
- Supabase Auth is the intended secure authentication provider.
- Cart, wishlist, account, orders, reviews and seller listings still have browser-local compatibility storage while the database layer is being built.
- Browser-local data is namespaced per signed-in identity; it is not the production persistence model.

## Existing live adapter

Set:

```env
ZOMAX_API_URL=https://api.example.com
```

The frontend currently requests:

```text
GET {ZOMAX_API_URL}/api/products
```

`lib/catalog.ts` validates the payload, times out failed requests and falls back to the seed catalog instead of crashing the page.

### Product response

```json
[
  {
    "id": 101,
    "name": "Wireless Noise-Cancelling Headphones",
    "category": "Electronics",
    "price": 68000,
    "oldPrice": 75000,
    "rating": 4.8,
    "reviews": 124,
    "seller": "Zomax Tech Hub",
    "location": "Lagos",
    "image": "https://...",
    "description": "...",
    "stock": 18
  }
]
```

Prices are integer NGN values in the current frontend model.

## Recommended production endpoints

The exact transport can be Next Route Handlers, Supabase/PostgREST or a separate API. Keep the frontend adapters stable even if the backend implementation changes.

### Products / inventory

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products                 seller only
PATCH  /api/products/:id             owning seller only
DELETE /api/products/:id             owning seller only
```

The server must own inventory counts, prices and seller ownership. Never trust price or stock values submitted by the browser during checkout.

### Reviews

```text
GET    /api/products/:id/reviews
POST   /api/products/:id/reviews     authenticated user
PATCH  /api/reviews/:reviewId        review owner only
DELETE /api/reviews/:reviewId        review owner/moderator only
```

Use stable review IDs. Do not use the old delete-by-array-index behavior.

Suggested review shape:

```json
{
  "id": "review_uuid",
  "productId": 101,
  "authorId": "user_uuid",
  "author": "Display name",
  "rating": 5,
  "text": "Great product",
  "createdAt": "2026-08-20T12:00:00Z"
}
```

### Cart and wishlist

```text
GET    /api/cart
PUT    /api/cart
GET    /api/wishlist
PUT    /api/wishlist
```

These endpoints are optional if Supabase tables with RLS are used directly. Either way, records must be scoped to the authenticated user.

### Orders / checkout

```text
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
```

The order request should send product IDs, quantities, delivery details and the selected payment method. The server must recalculate totals from authoritative product prices before creating the order.

Recommended stored order item snapshot:

```json
{
  "productId": 101,
  "qty": 2,
  "name": "Wireless Noise-Cancelling Headphones",
  "unitPrice": 68000,
  "sellerId": "seller_uuid",
  "sellerName": "Zomax Tech Hub",
  "image": "https://..."
}
```

This keeps historical orders readable even if the product is later renamed or removed.

### Account

```text
GET    /api/account
PATCH  /api/account
DELETE /api/account
POST   /api/account/export
```

Do not expose secrets, provider tokens or password material in account payloads.

### Seller store

```text
GET    /api/seller/store
PATCH  /api/seller/store
GET    /api/seller/orders
GET    /api/seller/analytics
```

Seller authorization must be enforced server-side. The current frontend guards are UX protection only.

### Analytics

Suggested request:

```text
GET /api/seller/analytics?start=2026-08-01&end=2026-08-31&granularity=daily
```

Suggested response:

```json
{
  "summary": {
    "totalRevenue": 183000,
    "orders": 245,
    "avgOrderValue": 746.94
  },
  "labels": ["2026-08-01", "2026-08-02"],
  "revenue": [12000, 18000],
  "ordersSeries": [4, 7],
  "topProducts": [
    { "id": 101, "name": "Headphones", "qty": 40, "revenue": 40000 }
  ]
}
```

## Authentication

The frontend already contains a Supabase Auth adapter for:

- Email/password
- Nigerian phone number + SMS OTP
- Google OAuth
- Apple OAuth

Configure:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Frontend preview auth is intentionally temporary. Before handling real users, disable preview mode and enforce database Row Level Security / server authorization.

## Payments

The current checkout uses pay-on-delivery and intentionally collects no card details.

A production gateway integration should:

1. create a server-side payment/order intent;
2. calculate the authoritative amount on the server;
3. redirect/open the provider checkout without exposing secret keys;
4. verify provider webhooks server-side;
5. update order payment status idempotently;
6. never mark an order paid from a browser callback alone.

## Security requirements

- Validate all request bodies server-side.
- Derive user/seller identity from the authenticated session, never a client-supplied owner ID.
- Use RLS or equivalent authorization for every user-owned table.
- Use stable UUIDs for users, sellers, orders and reviews.
- Enforce inventory changes transactionally during order creation.
- Use idempotency keys for order/payment creation.
- Rate-limit auth-sensitive, review and checkout endpoints.
- Keep secrets in server-only environment variables.
- Store seller images in controlled object storage rather than arbitrary browser-local URLs.

## Frontend integration points

- Catalog: `lib/catalog.ts`
- Auth: `lib/auth-client.ts`, `lib/auth-flow.ts`
- Marketplace compatibility state: `components/marketplace-provider.tsx`
- Shared data types: `lib/marketplace-types.ts`

As each production adapter comes online, replace one browser-local domain at a time instead of rewriting the UI.
