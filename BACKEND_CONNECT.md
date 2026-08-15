# Backend Integration Guide — Connect to Zomax Frontend

Purpose
- Provide a minimal, actionable guide for backend dev to connect a server to the existing frontend.

Overview
- The frontend is a static single-page app that expects REST endpoints under the `/api` namespace.
- For local development the frontend falls back to `data/*.json` and `localStorage`.

Where to look in the repo
- Frontend entry: [index.html](index.html)
- Client logic: [main.js](main.js)
- Static sample data: `data/` (e.g., `data/products.json`, `data/reviews.json`)

Required endpoints (HTTP JSON)
- GET /api/products -> Array of product objects
- POST /api/products -> Create a product; returns created product
- GET /api/products/:id/reviews -> Array of reviews
- POST /api/products/:id/reviews -> Add a review; returns review
- DELETE /api/products/:id/reviews/:index -> Delete review by index
- POST /api/reviews -> Replace all reviews (object mapping productId -> reviews[])
- GET /api/cart, POST /api/cart -> Cart array of { id, qty }
- GET /api/wishlist, POST /api/wishlist -> Wishlist array
- GET /api/orders, POST /api/orders -> Orders array
- GET /api/account, POST /api/account -> Account object
- GET /api/auth/current-user -> current user or null
- POST /api/auth/login -> Accepts user object, returns same
- POST /api/auth/logout -> Clears session, returns { success: true }
 - POST /api/account/export -> Trigger account export (optional)
 - DELETE /api/account -> Delete/deactivate account (optional)
 - GET /api/analytics/revenue -> Returns revenue/orders timeseries and moving averages

Data shapes (summary)
- Product:
  - id, name, category, price, oldPrice?, rating?, reviews?, seller?, location?, image?, images?, description?, stock?, createdAt?
- Review:
  - author, rating, text, createdAt (number or ISO string)
- Order (minimal): id, items:[{id,qty}], total, customer:{name,email}, status, date
- Account: see default empty object used in `main.js`

Implementation notes
- CORS: enable CORS for the frontend origin or allow `*` for local dev.
- Content-Type: all endpoints accept and return `application/json`.
- IDs: frontend often treats `id` as a number; keep types consistent.
- Reviews: frontend addresses reviews by product `id` and a numeric index — the server may return arrays and support delete-by-index.
- Auth: frontend uses a lightweight flow. `POST /api/auth/login` should return the user object (no token required for current UI). For production, implement secure auth and update the frontend accordingly.

Suggested dev workflow
1. Implement the endpoints on `http://localhost:3000` (or same origin as static files).
2. Start the backend and serve the frontend using a static server (or configure reverse proxy).
3. Use the existing `data/*.json` as sample payloads for quick seeding.

Testing examples (curl)
- List products:
  curl -sS http://localhost:3000/api/products
- Add review:
  curl -X POST -H "Content-Type: application/json" -d '{"author":"You","rating":5,"text":"Nice"}' http://localhost:3000/api/products/123/reviews

Tips for compatibility
- Keep response shapes lenient: include missing optional fields with sensible defaults.
- If you change endpoint paths, update `main.js` accordingly.
- When in doubt, mirror the shapes found in `data/`.

Analytics: Revenue & order trend
- The frontend displays a summary and chart data for revenue and orders. The backend should provide aggregated timeseries and optional moving averages to smooth short-term variation.
- Support query parameters: `?start=YYYY-MM-DD&end=YYYY-MM-DD&granularity=daily|weekly|monthly&movingAverageWindow=3` where `movingAverageWindow` is optional (days).
- Response should include labels, raw series and computed moving averages. Example response for daily granularity:

```json
{
  "summary": {
    "totalRevenue": 183000,
    "orders": 245,
    "avgOrderValue": 746.94,
    "refunds": 1200,
    "repeatCustomers": 42,
    "conversionRate": 2.7
  },
  "labels": ["2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07"],
  "revenue": [12000,18000,24000,30000,41000,35000,58000],
  "orders": [4,7,9,11,14,12,18],
  "revenueMovingAvg": [null,15000,18000,23000,31666.67,31666.67,41000],
  "ordersMovingAvg": [null,5.5,6.6667,7.75,10.25,12.3333,14.6667],
  "topProducts": [{ "id":123, "name":"X", "qty":40, "revenue":40000 }]
}
```

- Notes on moving averages:
  - Use `null` (or omit) for positions where the window cannot be computed.
  - The server should compute simple moving averages over the requested window (e.g., 3-day SMA) and return them as numeric arrays aligned with `labels`.
  - For large ranges, allow the client to request summarised buckets (weekly/monthly) to reduce payload size.

Example analytics request
```
GET /api/analytics/revenue?start=2026-08-01&end=2026-08-07&granularity=daily&movingAverageWindow=3
```

Example response (explained)
```json
{
  "summary": { "totalRevenue": 183000, "orders": 245, "avgOrderValue": 746.94 },
  "labels": ["2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07"],
  "revenue": [12000,18000,24000,30000,41000,35000,58000],
  "orders": [4,7,9,11,14,12,18],
  "revenueMovingAvg": [null,15000,18000,23000,31666.67,31666.67,41000],
  "ordersMovingAvg": [null,5.5,6.6667,7.75,10.25,12.3333,14.6667]
}
```

Server implementation notes
- Compute SMA using a simple sliding window. Return `null` for indices before the window is full.
- Keep labels in ISO `YYYY-MM-DD` and align all arrays to labels length.
- Consider caching aggregated results for performance on large datasets.

Contact
- If you need exact sample responses or fixtures, open `data/` files or ask the frontend maintainer.

-- End of guide
yoo