# Zomax migration status

## Current state

The production branch now runs Next.js App Router with React, TypeScript and Tailwind. The original vanilla application remains in the repository only as a parity/reference copy; it is no longer the primary app.

The legacy source is still concentrated in `index.html` (~53 KB) and `main.js` (~114 KB), with route-like HTML redirect files and old JSON fixtures. These should be archived or removed after the final parity audit.

## Migrated and hardened

- Real App Router routes for buyer, account and seller flows
- Home, shop, product detail, categories, deals, sellers, help, cart, checkout, confirmation, wishlist and orders
- Seller dashboard, analytics, store settings and listing creation
- Reusable product cards, quick view, mobile filter drawer and responsive navigation
- `next/image` optimization and lazy loading for server catalog images
- Route loading UI, route/global recovery and section-level client error boundaries
- Resilient catalog adapter with timeout, payload validation and seed fallback
- PWA manifest, service worker registration, offline page and offline state notice
- Service worker excludes `/api/*` and private mutation traffic
- Browser security headers
- Supabase-ready email/password, phone OTP, Google and Apple auth adapter
- Explicit frontend-preview auth mode while the backend is not connected
- Versioned per-user/guest browser storage namespaces
- Guest cart/wishlist merge only when moving from guest to a signed-in identity
- Account, orders and seller listings isolated between signed-in users on the same browser
- Reviews carry ownership IDs; edit/delete is restricted to the creator in the frontend
- Seller routes/listing creation require a signed-in frontend identity
- Orders snapshot product details at checkout instead of depending only on future catalog lookups
- CI typecheck + regression tests + production build on PRs and pushes to `main`

## Still required before handling real money/users

- Real Supabase/Postgres persistence for accounts, products, inventory, carts, wishlists, orders and reviews
- Server-side authorization / Supabase RLS; frontend ownership checks are UX protection, not a security boundary
- Production payment gateway integration and webhook verification
- Object storage/image upload pipeline for seller media
- Server-backed seller analytics
- Real order lifecycle/status events and seller fulfilment workflow
- Address book/payment-method persistence if those account flows remain required
- Dependency lockfile and broader automated browser tests
- SEO/discovery pass (`sitemap`, `robots`, structured data and richer social metadata)
- PWA cache-version/update UX hardening and production PNG icon set
- Final removal/archive of the legacy HTML/JS application

## Failure-isolation model

1. `lib/catalog.ts` catches upstream catalog failures and returns a validated fallback instead of taking down the page.
2. `Suspense` and route `loading.tsx` files let slow sections stream without blocking the full route.
3. `SectionErrorBoundary` isolates client-interactive sections.
4. `app/error.tsx` contains a route crash.
5. `app/global-error.tsx` is the final app-shell recovery boundary.
6. Checkout blocks unresolved legacy cart IDs rather than calculating a wrong total.
7. The service worker provides a public offline fallback without caching private APIs.
8. Private browser state is namespaced per identity so account switching does not expose another user's local orders/profile/seller inventory.
