# Zomax migration status

## Repository scan

The legacy application is concentrated in `index.html` (~53 KB) and `main.js` (~114 KB), with route-like HTML files redirecting into hash navigation. State is primarily stored in `localStorage`; the documented REST backend remains a compatibility contract rather than a production backend.

## Migrated now

- App Router shell and real routes
- Home, shop, product detail, cart, wishlist, orders, account, seller dashboard and sell flow foundations
- Reusable product cards and client-only cart/wishlist action islands
- `next/image` image optimization and lazy loading
- Route loading UI, route error recovery, global error recovery and section-level client error boundaries
- Resilient catalog adapter with timeout, validation and seed fallback
- PWA manifest, service worker registration, offline page and offline status UI
- Service worker intentionally excludes `/api/*` and does not offline-cache private account mutations
- Security headers for browser hardening
- CI typecheck + production build validation

## Legacy feature parity still to migrate

- Production authentication/session handling
- Checkout/payment integration and order confirmation persistence
- Full review create/edit/delete flow
- Seller store settings and business profile fields
- Revenue/order analytics and moving-average charts backed by real data
- Account export/import/deactivation against a real backend
- Product image upload/storage instead of URL-only listing images
- Database-backed inventory, carts, wishlists, orders and accounts

## Failure-isolation model

1. `lib/catalog.ts` catches upstream catalog failures and returns a validated fallback instead of taking down the page.
2. `Suspense` and route `loading.tsx` files let slow sections stream without blocking the full route.
3. `SectionErrorBoundary` isolates client-interactive sections.
4. `app/error.tsx` contains a route crash.
5. `app/global-error.tsx` is the final app-shell recovery boundary.
6. The service worker provides a public offline fallback without caching private APIs.
