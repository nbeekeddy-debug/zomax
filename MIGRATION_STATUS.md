# Zomax migration status

## Repository scan

The legacy application is concentrated in `index.html` (~53 KB) and `main.js` (~114 KB), with route-like HTML files redirecting into hash navigation. State is primarily stored in `localStorage`; the documented REST backend remains a compatibility contract rather than a production backend.

## Migrated now

- App Router shell and real routes
- Home, shop, product detail, cart, checkout, confirmation, wishlist, orders, account, login compatibility, seller dashboard and sell flow
- Local listing persistence compatible with the migration browser state
- Review create/edit/delete compatibility without the legacy duplicate-write bug
- Seller store settings fields migrated from the old dashboard
- Local order analytics foundation
- Account export/import/deactivation compatibility
- Reusable product cards and client-only cart/wishlist action islands
- `next/image` image optimization and lazy loading for server catalog images
- Route loading UI, route error recovery, global error recovery and section-level client error boundaries
- Resilient catalog adapter with timeout, validation and seed fallback
- PWA manifest, service worker registration, offline page and offline status UI
- Service worker intentionally excludes `/api/*` and does not offline-cache private account mutations
- Security headers for browser hardening
- CI typecheck + production build validation

## Production hardening still required before replacing the legacy app on main

- Real database-backed authentication/session handling; the migrated login route is explicitly a compatibility session, not secure auth
- Payment gateway integration; migrated checkout intentionally collects no card details and uses pay-on-delivery only
- Database-backed products, inventory, carts, wishlists, orders, reviews and accounts
- Object storage/image upload pipeline for seller product media
- Server-backed seller analytics using `/api/analytics/revenue` and moving-average series
- Authorization rules so users can only edit/delete their own reviews and seller resources
- Multi-address/payment-method UX parity if those legacy account subflows remain required

## Failure-isolation model

1. `lib/catalog.ts` catches upstream catalog failures and returns a validated fallback instead of taking down the page.
2. `Suspense` and route `loading.tsx` files let slow sections stream without blocking the full route.
3. `SectionErrorBoundary` isolates client-interactive sections.
4. `app/error.tsx` contains a route crash.
5. `app/global-error.tsx` is the final app-shell recovery boundary.
6. Checkout blocks unresolved legacy cart IDs rather than calculating a wrong total.
7. The service worker provides a public offline fallback without caching private APIs.
