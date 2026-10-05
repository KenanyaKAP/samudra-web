# Samudra React Theme

WordPress theme that serves the built React SPA (from `theme/dist`, produced by
`npm run build:wp` at the project root) and exposes the editable content over
the REST API at `/wp-json/samudra/v1/...`.

- `index.php` — HTML shell with the React root div.
- `functions.php` — asset enqueueing (Vite manifest), SPA rewrites, 404 status
  for unknown paths and unknown portfolio/news slugs, static-file serving,
  cache policy, site data (seeded from `data/`) and the REST endpoints.
- `inc/post-types.php` — Portfolio (+ Portfolio Categories) and Career post
  types, the "News" relabel of posts, permalinks that match the React routes,
  and the generic meta box (text, textarea, select, url, image and a
  reorderable gallery).
- `inc/admin-sections.php` — the "Site Content" admin pages: one page per
  section, with a recursive field renderer that understands image pickers,
  dropdowns (live portfolio categories, social platforms) and reorderable
  repeaters.
- `data/` — JSON seed files copied from `src/data` on every `build:wp`; used to
  seed the `samudra_data_*` options on first load.
- `dist/` — built React assets (not committed; run `npm run build:wp`).
