# Zomax migration status

## Current state

The active application is Next.js App Router with React, TypeScript and Tailwind. The original vanilla HTML/CSS/JavaScript runtime has been removed from the active tree after parity/hardening work; it remains recoverable through Git history. Old `.html` URLs are preserved with permanent redirects in `next.config.ts`.

## Migrated and hardened

- Real App Router routes for buyer, account and seller flows
- Home, shop, product detail, categories, deals, sellers, help, cart, checkout, confirmation, wishlist and orders
- Seller dashboard, analytics, store settings and listing creation
- Reusable product cards, quick view, mobile filter drawer and responsive navigation
- `next/image` optimization and lazy loading for server catalog images
- Route loading UI, route/global recovery and section-level client error boundaries
- Resilient catalog adapter with timeout, payload validation and seed fallback
- PWA manifest, versioned service worker, offline page, offline state notice and update prompt
- Service worker excludes `/api/*` and private mutation traffic
- Browser security headers plus noindex headers for private/account/seller routes
- Sitemap, robots policy, canonical site URL helper and richer social metadata
- Product canonical metadata and Product/Offer JSON-LD
- Supabase-ready email/password, phone OTP, Google and Apple auth adapter
- Explicit frontend-preview auth mode while the backend is not connected
- Versioned per-user/guest browser storage namespaces
- Guest cart/wishlist merge only when moving from guest to a signed-in identity
- Account, orders and seller listings isolated between signed-in users on the same browser
- Reviews carry ownership IDs; edit/delete is restricted to the creator in the frontend
- Seller routes/listing creation require a signed-in frontend identity
- Orders snapshot product details at checkout instead of depending only on future catalog lookups
- CI typecheck + regression tests + production build on PRs and pushes to `main`
- Semantic Zomax color/UI tokens that avoid global text-color overrides
- Legacy HTML/JS/assets/JSON fixtures removed from the active repository tree

## Still required before handling real money/users

- Real Supabase/Postgres persistence for accounts, products, inventory, carts, wishlists, orders and reviews
- Server-side authorization / Supabase RLS; frontend ownership checks are UX protection, not a security boundary
- Production payment gateway integration and webhook verification
- Object storage/image upload pipeline for seller media
- Server-backed seller analytics
- Real order lifecycle/status events and seller fulfilment workflow
- Address book/payment-method persistence if those account flows remain required
- Dependency lockfile and broader automated browser tests
- Production PNG PWA icon set and final device-level install testing
- Larger component/design-system refactor, especially the auth screen and seller forms

## Failure-isolation model

1. `lib/catalog.ts` catches upstream catalog failures and returns a validated fallback instead of taking down the page.
2. `Suspense` and route `loading.tsx` files let slow sections stream without blocking the full route.
3. `SectionErrorBoundary` isolates client-interactive sections.
4. `app/error.tsx` contains a route crash.
5. `app/global-error.tsx` is the final app-shell recovery boundary.
6. Checkout blocks unresolved legacy cart IDs rather than calculating a wrong total.
7. The service worker provides a public offline fallback without caching private APIs.
8. Private browser state is namespaced per identity so account switching does not expose another user's local orders/profile/seller inventory.
