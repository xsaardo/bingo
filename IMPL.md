# SEO Improvements — Implementation Log

## Goal

Improve SEO so gobingoals.app surfaces in search results and shares well on social platforms.

## Tasks

- [x] Generate OG social card (1200×630 PNG) — `static/og-image.png`
- [x] Add SEO helper module — `src/lib/seo.ts`
- [x] Add reusable SeoHead component — `src/lib/components/SeoHead.svelte`
- [x] Add baseline meta defaults in `app.html`
- [x] Update landing page (`/`) — fix duplicate h1, full meta + JSON-LD, expanded content
- [x] Update about/privacy/terms pages — fix duplicate h1, add canonical + OG image
- [x] SSR `/share/[id]` so crawlers see board name + goals
- [x] Add `/how-it-works` content page
- [x] Generate dynamic sitemap.xml
- [x] Update `robots.txt` to reference sitemap and exclude private routes
- [x] Add `noindex` to dashboard and authenticated board pages
- [x] Verify `npm run build` and `npm run check`
- [x] Commit and push

## Notes

- Canonical base URL: `https://gobingoals.app` — hardcoded constant in `src/lib/seo.ts`.
- OG image is a static PNG generated once via a Node script that uses `sharp` (sharp added
  to devDeps only temporarily during generation, then removed; the SVG source and script
  remain in the repo so the image can be regenerated).
- SSR of `/share/[id]` uses a server-side Supabase client with the public anon key. RLS
  already restricts the row to `is_public = true`, so the client-side check stays as a
  belt-and-suspenders.
- `noindex` is applied to `/dashboard`, `/boards/[id]`, `/auth/*` — these are private/
  user-specific surfaces and shouldn't be in search results.
