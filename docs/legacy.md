# Legacy Zomax frontend

Zomax originally shipped as a vanilla HTML/CSS/JavaScript single-page prototype centered on `index.html` and `main.js`, with small `.html` redirect files and JSON fixtures under `data/`.

Those runtime files were removed from the active tree after the Next.js migration reached feature parity and the Next.js build/test pipeline became the production source of truth.

The complete legacy implementation remains available in Git history. The last production tree that still contained the legacy files can be inspected at commit `4b136ab8dfdf08310032c01c91384e630d103d75` and earlier migration commits.

Backward compatibility for old URLs such as `/shop.html`, `/login.html`, `/dashboard.html`, and `/profile.html` is maintained through permanent redirects in `next.config.ts`.

`BACKEND_CONNECT.md` is retained because its REST contract remains useful as historical/API integration context, although the active frontend now uses the adapters in `lib/` and the Next.js App Router.
