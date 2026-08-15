Zomax Marketplace — Developer Guide

Purpose
- Quick onboarding notes for backend developers and maintainers.

Structure
- `index.html` — single page entry and UI markup.
- `main.js` — client-side application logic (state, rendering, persistence, adapters).
- `data/` — static sample JSON used as fallbacks for frontend-only mode.
- `BACKEND_CONNECT.md` — API contract and analytics spec.

Key conventions
- The app runs in "frontend-only" mode by default: persistence uses `localStorage` and `data/*.json`.
- The `backend` object in `main.js` provides `getJson`, `postJson`, and `deleteJson` helpers. Backend servers should mirror these endpoints under `/api`.
- IDs are numeric in sample data; keep IDs consistent between server and client.
- Time values: orders use localized date strings; analytics uses ISO `YYYY-MM-DD` labels.

Recommended endpoints (summary)
- GET /api/products
- POST /api/products
- GET /api/products/:id/reviews
- POST /api/products/:id/reviews
- DELETE /api/products/:id/reviews/:index
- GET/POST /api/cart
- GET/POST /api/wishlist
- GET/POST /api/orders
- GET/POST /api/account
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/current-user
- GET /api/analytics/revenue?start=&end=&granularity=&movingAverageWindow=

Local testing tips
- Serve static files on same origin to avoid CORS issues. Example (Python):

```bash
python -m http.server 8000
# open http://localhost:8000
```

- Seed data using `data/*.json` files. The frontend will write to `localStorage` when interacting with cart, wishlist, orders, reviews, and account.

Analytics notes
- The frontend expects a timeseries response aligned to `labels` and optional moving average series (SMA). See `BACKEND_CONNECT.md` for details.

Contact
- For questions about payload shapes, inspect `data/` JSON files and `main.js` helpers.
