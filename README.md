# Zomax Marketplace

Zomax is a Next.js marketplace frontend migrated from the original vanilla HTML/JavaScript prototype.

## Development

```bash
npm install
npm run dev
```

Validation:

```bash
npm run typecheck
npm run test
npm run build
```

Or run all three with:

```bash
npm run check
```

## Architecture

- `app/` — Next.js App Router routes, loading states and error boundaries.
- `components/` — reusable server/client marketplace components.
- `lib/catalog.ts` — resilient catalog adapter with API timeout, validation and seed fallback.
- `lib/marketplace-storage.ts` — versioned guest/user browser-state isolation helpers.
- `lib/auth-flow.ts` — Supabase-ready auth adapter with explicit frontend-preview mode.
- `public/sw.js` + `app/manifest.ts` — PWA install/offline foundation.
- `tests/` — regression tests for critical frontend state behavior.

Private prototype data such as account details, orders and seller listings is namespaced per signed-in identity on the device. Guest cart/wishlist data can intentionally merge into an account on login; switching between signed-in users does not merge private state.

Set `ZOMAX_API_URL` to a full backend origin when the product API is ready. If it is unavailable, catalog reads fail safely to the seed dataset.

The current Vercel deployment explicitly uses frontend auth preview mode while the secure backend is not connected. Before production launch, remove preview mode and configure Supabase Auth/provider credentials.

Legacy `index.html`, `main.js` and redirect HTML files remain temporarily for parity/reference and should be archived or removed after the final parity audit.
