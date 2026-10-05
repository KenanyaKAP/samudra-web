# TODO / Known gaps

Ordered by how much they affect the delivered site.

## 1. Content still to be written

All editable in wp-admin without touching code.

- [ ] **Vision & Mission, Core Values, Awards** — seeded with `[TODO]`
      placeholder copy. → *Site Content → About › …*
- [ ] **About brand cards** — all six descriptions are lorem ipsum (as in OLD).
      → *Site Content → About Page → Items*
- [ ] **Testimonials** — two of the three are lorem ipsum (as in OLD).
      → *Site Content → Home Page → Testimonials*
- [ ] **Services "All" intro** — currently the Special Projects paragraph,
      because that is what OLD always showed. Each category now has its own
      text, so "All" deserves a general intro. → *Site Content → Services Page*
- [ ] **Social links** — generic `https://facebook.com` etc. (as in OLD).
      → *Site Content → Global → Footer → Socials*
- [ ] **Typos carried over verbatim from OLD**: "company’scope", "can provider
      special design of membrant structure" (*About › About Samudra*),
      "Vision & Mision" (*About Page* card title).
- [ ] **Demo content** — portfolios, news and the three `[DEMO]` careers come
      from `npm run wp:seed-demo`. Remove them with
      `npm run wp:seed-demo -- --clean` before adding real content.

## 2. Decisions for you

- [ ] **`npm audit`** reports 6 vulnerabilities in production dependencies
      (axios, react-router, follow-redirects, form-data, …). They come from
      OLD's lockfile, kept on purpose so the rebuild renders with exactly the
      same library versions. `npm audit fix` would update them within their
      semver ranges.
- [ ] **Fonnte token** — `fonnte.txt` / `fonnte_config.php` (WhatsApp API token
      and phone numbers) are committed in OLD's git history. They were not
      carried over. Rotate the token if that repository is or was public.
- [ ] **Old Docker volumes** — `samudra-web_db_data` and
      `samudra-web_wordpress_data` (created 2026-02-26) are still on this
      machine, unused. Delete them if they are no longer needed.

## 3. Inherited from OLD (kept for visual parity)

- [ ] **WordPress admin bar covers the fixed navbar** for logged-in users on
      the front end (visitors are unaffected). On mobile this hides the menu
      button. Fix: hide the admin bar on the front end, or offset the AppBar.
- [ ] **Mobile menu close icon** is clipped at the top edge of the header.
- [ ] Page titles: only Home, About Samudra, the three About article pages and
      the 404 page set `document.title`. Per-route SEO metadata was out of
      scope.

## 4. Nice to have

- [ ] The JS bundle is ~700 kB (~228 kB gzipped) in one chunk. Route-level
      `React.lazy()` splitting would cut first-load noticeably.
- [ ] Images are copied as-is from OLD (57 MB) — no optimisation pass yet.
- [ ] No automated tests. Lint, build, PHP syntax, REST, admin round-trips and
      the OLD-vs-NEW pixel comparison were verified manually (see `PLAN.md`).
