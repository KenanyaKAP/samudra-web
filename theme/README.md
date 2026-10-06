# Samudra React Theme

WordPress theme that serves the built React SPA (from `theme/dist`, produced by
`npm run build:wp` at the project root) and exposes the editable content over
the REST API at `/wp-json/samudra/v1/...`.

- `index.php` — HTML shell with the React root div.
- `functions.php` — asset enqueueing (Vite manifest), SPA rewrites, 404 status
  for unknown paths and unknown portfolio/news slugs, 301s for the old About
  sub-pages, static-file serving, cache policy, site data (seeded from
  `data/`), the REST endpoints and the one-off data upgrade.
- `inc/post-types.php` — Portfolio (+ Portfolio Categories) and Career post
  types, the "News" relabel of posts, permalinks that match the React routes,
  and the generic meta box (text, textarea, select, url, date, image and a
  reorderable gallery).
- `inc/forms.php` — Request a Proposal and Career Application: the
  `samudra/v1/forms/*` endpoints (validation, honeypot, rate limit), the
  private Proposal Requests / Applications post types with protected
  attachments, notification e-mails (optional SMTP constants) and Site
  Content → Form Settings.
- `inc/admin-sections.php` — the "Site Content" admin pages: one page per
  section, with a recursive field renderer that understands image pickers,
  dropdowns (live portfolio categories, social platforms, name side) and
  reorderable repeaters.
- `data/` — JSON seed files copied from `src/data` on every `build:wp`; used to
  seed the `samudra_data_*` options on first load.
- `dist/` — built React assets (not committed; run `npm run build:wp`).
