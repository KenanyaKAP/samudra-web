# Samudra Website — Rebuild Plan

Status: **built** (2026-10-05). See §9 for where the result differs from this
plan and what was verified.

> **Superseded for the UI by the redesign (§10).** The rebuild below matched
> OLD pixel for pixel; the site was then redesigned from `New Design.pdf`.
> The architecture (§1–§3) is unchanged. Routes, sections and the look are
> described in §10.

Rebuild `samudra-web-OLD/` at the repo root (`./`) on the hybrid
**WordPress + React** architecture of the reference projects: the
`EXAMPLE-READ-ONLY-4` (Infinium) skeleton and admin editor, plus the
`EXAMPLE-READ-ONLY-2` (Penglipuran) pattern for custom post types. The rendered
site must look **identical to OLD**. Only the architecture, the folder structure
and where the content comes from change.

`samudra-web-OLD/` and every `EXAMPLE-READ-ONLY*/` folder stay untouched (read
only). They are excluded from lint, Docker and git.

---

## 0. Decisions (locked)

| # | Topic | Decision |
|---|---|---|
| 1 | Reference | Ex4 skeleton, `functions.php` and Site Content editor. Portfolio and Career use Ex2's generic CPT field-definition pattern, because Ex4 has no CPTs. |
| 2 | Language | **English only.** Plain-string seeds, no i18next. The bilingual `{en,id}` rendering is removed from the admin editor. |
| 3 | UI | **Pixel-identical to OLD.** Markup and `sx` are ported verbatim; only the data props change. |
| 4 | Scope | Only the 14 routes active in OLD (§4.1). Leftovers from another project (BSSA/spa) are dropped: Courses, Local/International Program, Gallery, Works, PlaceholderPage, RegistrationForm, Fonnte WhatsApp, GoogleMap/leaflet, and every component only they import. |
| 5 | About subpages | Vision & Mission, Core Values and Awards become one editable article template, seeded with `[TODO]` placeholder copy. About Samudra (Company) gets OLD's hard-coded `AboutDetail` content. |
| 6 | Existing data | **Start clean.** There is no live database to stay compatible with. |
| 7 | Ports | WordPress `http://localhost:4600`, MySQL host port `3310`. `WP_HOME`/`WP_SITEURL` are derived from `HTTP_HOST` (Ex4), not hard-coded to `100.64.1.2` as in OLD. |
| 8 | Extras | `npm run wp:reseed` (Ex4), a real 404 page with a 404 status (Ex4), and self-hosted Montserrat via `@fontsource` (Ex4). Ex1's per-route SEO/sitemap is **not** included. |
| 9 | Dead features | Dropped: the "Highlighted Project" checkbox, `/samudra/v1/highlighted-portfolios` and the Home fetch (the section itself was removed in OLD commit `9218a3a`), plus the "Featured News Post" setting, `/samudra/v1/featured-post` and the News fetch (never rendered). No visual change. |
| 10 | Services | Each portfolio category gets an editable description, shown when that category is active ("All" shows a general intro). Home service cards deep-link to `/services?category=<slug>` with that category preselected. |
| 11 | Demo data | `npm run wp:seed-demo` turns OLD's mock data into real WordPress content. The frontend no longer bundles mock fallbacks; it shows OLD's existing empty/not-found states when WordPress is empty or unreachable. |

---

## 1. Repository layout

```
./
├── compose.yml                 # MySQL 8.0 (:3310) + WordPress 6.4-apache (:4600)
├── compose.react.yml           # optional static nginx deploy (service renamed bssa-web → samudra-web)
├── Dockerfile  nginx.conf  .env.example  .dockerignore  .gitignore
├── eslint.config.js            # ignores dist, theme/dist, EXAMPLE-READ-ONLY*, samudra-web-OLD
├── index.html                  # Vite shell; Google Fonts <link> removed
├── package.json
├── vite.config.js              # WP_BUILD → theme/dist + manifest; proxy → :4600; OLD allowedHosts kept
├── PLAN.md  TODO.md  README.md
├── scripts/
│   ├── copy-data.js            # src/data/*.json → theme/data            (Ex4, verbatim)
│   ├── reseed-wp.js            # npm run wp:reseed [keys…]               (Ex4)
│   ├── wp-reseed.php           # piped into the container's php over stdin (Ex4)
│   ├── seed-demo.js            # npm run wp:seed-demo [--clean]          (new, same delivery)
│   └── wp-seed-demo.php        # demo categories/portfolios/news/careers + media
├── public/
│   ├── Logo.png
│   └── images/…                # copied 1:1 from OLD (57 MB)
├── src/                        # see §4
└── theme/                      # WordPress theme "samudra-react"
    ├── style.css               # theme header only
    ├── index.php               # HTML shell; Google Fonts <link> removed
    ├── functions.php           # enqueue, rewrites, 404 status, static files, cache, site data, REST
    ├── inc/
    │   ├── post-types.php      # portfolio + portfolio_category, career; generic meta box
    │   └── admin-sections.php  # "Site Content" pages (Ex4 renderer, English-only)
    ├── data/                   # synced from src/data by build:wp
    └── dist/                   # build output (gitignored)
```

**Naming** (same names OLD already used): PHP prefix `samudra_`, options
`samudra_data_<key>`, REST namespace `samudra/v1`, theme slug `samudra-react`,
text domain `samudra-web`, theme name "Samudra Website".

The demo seeder ships like Ex4's reseed (piped over stdin into the container),
not like Ex2's `theme/inc/seed-demo.php`, so it can never be deployed or reached
over HTTP.

---

## 2. Runtime architecture (Ex4, unchanged in mechanism)

| Concern | Mechanism |
|---|---|
| Dev stack | `docker compose up -d` → WordPress `:4600`, MySQL `:3310`. `WORDPRESS_DEBUG: 1` instead of defining `WP_DEBUG` in `WORDPRESS_CONFIG_EXTRA` (the fix Ex4's `wp-reseed.php` recommends). No fixed `container_name`. |
| Theme mount | `./theme` bind-mounted to `wp-content/themes/samudra-react` |
| Build | `npm run build:wp` = `copy-data.js` → `cross-env WP_BUILD=true vite build` → `theme/dist` + `.vite/manifest.json` |
| Enqueue | `functions.php` reads the manifest, enqueues the hashed JS as `type="module"` plus CSS, and exposes `window.wpData` |
| SPA routing | catch-all rewrite to `index.php`; `redirect_canonical` disabled on the front end |
| 404 status | static route whitelist (§4.1), plus `/services/<slug>` and `/events/<slug>` return 200 only if a published portfolio or post has that slug; everything else gets `status_header(404)` while the SPA renders its NotFound page |
| Static files | `/images/`, `/assets/`, `/Logo.png` served from `theme/dist` with Ex4's `realpath` guard and a 1-hour cache |
| Cache | `nocache_headers()` on the shell and on REST (+ LiteSpeed opt-out) |
| HMR dev | `npm run dev` (Vite :5173) proxies `/wp-json` and `/wp-content` to `:4600` |
| Fallback | Site Content renders from the bundled `src/data/*.json` seeds if WordPress is unreachable |

---

## 3. WordPress content model

### 3.1 Site Content sections (JSON options, one admin page each)

Rule: page headings, paragraphs, images and lists are editable. Generic UI
controls stay in code: `Read More ->`, `Loading...`, empty/not-found messages,
the "All" chip and the back link.

| Key | Admin page | Fields | Ported from |
|---|---|---|---|
| `global` | Global (Header & Footer) | `logo`; `nav[]` {label, path, children[]}; `offices.headquarter` {city, company, address[], phones[], fax[], email}; `offices.branches[]` {city, address[], phones[], fax[], email}; `footer` {headquarterLabel, branchLabel, connectLabel, copyright, socials[] {platform ▾, url}} | `pageItems.js`, `Footer.jsx`, `contactData.js` |
| `home` | Home Page | `hero` {slides[] {image, heading, subtitle}, buttonLabel, buttonLink}; `about` {heading, body, buttonLabel, buttonLink, backgroundImage}; `services` {heading, backgroundImage, items[] {title, image, description, category ▾}}; `testimonials` {heading, items[] {image, title, location, text}}; `news` {heading, backgroundImage}; `partner` {heading, mapImage} | `homeData.js`, `Home.jsx` |
| `about` | About Page | heading; `items[]` {title, description, image, link} | `aboutData.aboutBrandItems` |
| `aboutHistory` | About › History | heading; `items[]` {period, description} | `aboutData.sdpHistory` |
| `aboutCompany` | About › About Samudra | heroImage; `intro` {title, highlight, body}; `certifications[]` {image, title, body}; `alliance` {heading, body, image}; `partner` {heading, image, stats[] {value, suffix, label}, body} | `AboutDetail.jsx` |
| `aboutVision`, `aboutValues`, `aboutAwards` | About › Vision & Mission / Core Values / Awards | heroImage, title, highlight, `paragraphs[]`, seeded `[TODO]` | new template (§4.3) |
| `aboutManagement` | About › Board of Management | heroImage; `directors`, `managers`, `sales`, each {heading, items[] {name, role, image}} | `aboutData` |
| `services` | Services Page | heading; `intro` (shown for "All"); `brands` {heading, body, logos[]} | `Services.jsx`, `servicesData.js` |
| `news` | News Page | heading; moreHeading ("More Release") | `Events.jsx`, `EventDetail.jsx` |
| `contact` | Contact Page | heading; mapImage; headquarterLabel; headquarterMapImage; branchLabel | `Contact.jsx` |
| `career` | Career Page | heading; intro | `Career.jsx` |
| `notFound` | 404 Page | heading; body; buttonLabel | new |

- **One source for offices.** HQ and branch details live once in
  `global.offices` and feed both the Footer and the Contact page. OLD
  duplicated them (≈300 hard-coded lines in `Footer.jsx` plus
  `contactData.js`). Phones, fax and email stay links in the Footer and plain
  text on Contact, exactly as OLD renders them.
- **Per-category Services description** uses the category's native WordPress
  *Description* field (Portfolios → Categories), exposed by
  `/wp/v2/portfolio_category`. It is seeded from OLD's unused
  `servicesDataStatic` copy, so the four categories start with real text.
- **Brand logos** are seeded as the 12 unique files. OLD listed them twice for
  the Embla loop; the component now repeats the list itself, so the output is
  the same 24 slides.
- `aboutSectionOffsets` and other layout numbers stay in code; they are not
  content.

### 3.2 Custom post types (`inc/post-types.php`, Ex2 pattern)

One field-definition array drives meta registration (`show_in_rest`), a
generic meta box, saving, and a `featured_image_url` REST field. The meta keys
keep OLD's names. They already follow Ex2's `<cpt>_<field>` convention, and
keeping them lets OLD's frontend run against the new backend for the
side-by-side visual check (§7).

**Portfolio**: `portfolio`, taxonomy `portfolio_category` (hierarchical, in REST)

| Meta | Type | Notes |
|---|---|---|
| featured image | — | card cover |
| `portfolio_description` | textarea | |
| `portfolio_hero_image` | image | Media Library picker (OLD: paste a URL) |
| `portfolio_gallery_images` | gallery | thumbnails with ✕ remove and ◀ ▶ reorder (OLD: raw JSON textarea; Ex2: add/clear only) |

Default categories (Exhibition Construction, Interior Design & Build, Special
Projects, Tent Service) are created on theme activation and by the demo seeder.
OLD re-checked them on every `init`. Filtering uses the term id/slug instead of
OLD's fragile name search.

**Career**: `career`

| Meta | Type |
|---|---|
| `career_type` | select: Full Time / Part Time / Contract / Internship |
| `career_location` | text |
| `career_description` | textarea |
| `career_apply_url` | url |

**News**: native `post`, with the admin menu relabelled "News" (as in Ex2).

The generic meta box supports Ex2's `text`, `textarea`, `list`, `checkbox`,
`image` and `gallery`, plus the new `select` and `url`. The raw "Custom Fields"
box is hidden.

### 3.3 Site Content editor (`inc/admin-sections.php`)

Ex4's renderer, adapted:

- **Kept:** one page per section, recursive scalar/group/repeater rendering,
  add/remove rows, ▲▼ reorder, Media Library picker, Reset to Default.
- **Removed:** bilingual `{en,id}` pair rendering.
- **Extended:**
  - Image detection also matches keys ending in `Image` (`heroImage`,
    `backgroundImage`, `mapImage`, …).
  - String lists of images (`logos`) render each row as a picker.
  - Dropdowns: `category` lists the live `portfolio_category` terms, and
    `platform` lists Facebook / Instagram / YouTube / LinkedIn (mapped to the
    MUI icons OLD uses).

### 3.4 REST surface

```
GET /wp-json/samudra/v1/data              all Site Content sections
GET /wp-json/samudra/v1/data/<key>        one section
GET /wp-json/wp/v2/portfolio?_embed       list / ?slug= / ?portfolio_category=<id>
GET /wp-json/wp/v2/portfolio_category     filter chips + descriptions
GET /wp-json/wp/v2/posts?_embed           news list / detail / latest / more
GET /wp-json/wp/v2/career                 open positions
```

---

## 4. React app

### 4.1 Routes (URLs unchanged from OLD)

`/` · `/about` · `/about/history` · `/about/company` · `/about/vision` ·
`/about/values` · `/about/management` · `/about/awards` · `/services`
(`?category=<slug>`) · `/services/:slug` · `/events` · `/events/:slug` ·
`/contact` · `/career` · `*` → **NotFound** (OLD redirected to `/`).

### 4.2 Data flow

- `SiteDataProvider` (Ex4, minus i18n) renders the `src/data/*.json` seeds
  instantly, fetches `/samudra/v1/data` once, and deep-merges the response
  over the seeds. Pages read their content with `useSection(key)`.
- `services/wpApi.js` holds axios clients and mappers for portfolio, category,
  news and career. OLD's mock fallbacks and the two dead endpoints are removed.
- Lists keep OLD's `Loading...` state, then OLD's empty states ("No portfolios
  found.", "No events found.", "No open positions at the moment", "… not
  found").

### 4.3 Structure (Ex4-style folders)

```
src/
├── main.jsx  App.jsx  theme.js  fonts.css  index.css  App.css
├── data/       global, home, about, aboutHistory, aboutCompany, aboutVision,
│               aboutValues, aboutAwards, aboutManagement, services, news,
│               contact, career, notFound   (.json)
├── hooks/      useSiteData.jsx   useNavigation.jsx (OLD's, keeps navigateWithFade)
├── services/   wpApi.js
├── components/
│   ├── layout/    Navbar.jsx  Footer.jsx
│   ├── ui/        SectionHeading  FadeScroll  ImageCarousel  InfiniteImageScroll  OfficeBlock
│   ├── home/      NewsCard  TestimonialCarousel  TestimonialCard
│   ├── about/     SDPHistory  PersonGrid  StatCounter  AboutArticle
│   ├── services/  CategoryFilter  ServicesCard  PortfolioGalleryViewer  HighlightedProjects
│   ├── news/      EventCard  MoreReleaseCard
│   └── career/    CareerCard
└── pages/      Home  About  about/{History,Company,Vision,Values,Awards,Management}
                Services  PortfolioDetail  Events  EventDetail  Contact  Career  NotFound
```

- **Visual parity:** each component's markup and `sx` is copied from OLD.
  Where OLD repeated identical markup, one component renders it:
  `PersonGrid` covers the three grids on Management, and `OfficeBlock` covers
  the six office blocks in the Footer and on Contact. OLD's quirks stay as they
  are: the offices block hidden on `/contact`, the `logo`/`navLinkMobile`
  variants that are not defined in the theme, the 300 ms `navigateWithFade`.
- **`AboutArticle`** (Vision/Values/Awards) reuses OLD's own visual language:
  the 500 px hero image plus the two-column title | highlight + body block from
  `AboutDetail`, with no new styling.
- **NotFound** uses the same building blocks (`SectionHeading`, body text, the
  red square `contained` button).
- `useNavigation` keeps OLD's version, because `navigateWithFade` is part of
  the current look. Ex4's version only exposes `isFading`.
- Dropped as unused: `useBaliTime`, `cacheBuster`, `imageUtils`,
  `smooth_scroll`, and the components only used by the dropped pages.

### 4.4 Theme and fonts

- `theme.js` is ported verbatim: palette `#EA1F25`, breakpoints including
  `xxl: 1728`, custom typography variants, Button and Container overrides.
- `@fontsource/montserrat` weights 400/500/600/700, the only weights the active
  code uses. Google Fonts links are removed from `index.html` and
  `theme/index.php`.
- **Metropolis** comes first in OLD's heading font stacks, but its files never
  existed (the `fonts.css` import is commented out and `/fonts/metropolis` is
  missing), so OLD actually renders Montserrat. It is removed from the stacks,
  which leaves the rendering identical.

### 4.5 Dependencies

- **Keep:** react 19, react-dom, react-router-dom 7, @mui/material 7 +
  icons-material + emotion, axios, framer-motion, embla-carousel-react +
  auto-scroll, babel-plugin-react-compiler.
- **Add:** `@fontsource/montserrat`, `cross-env` (dev).
- **Remove:** `lenis` (commented out in OLD), `leaflet`, `react-leaflet` (BSSA
  only).

---

## 5. Demo content: `npm run wp:seed-demo`

- Same delivery as `wp:reseed`: a node wrapper checks that the container is up,
  then pipes `wp-seed-demo.php` into `docker compose exec -T wordpress php`.
- Idempotent by slug. Every demo object is tagged `_samudra_demo = 1`, and
  `npm run wp:seed-demo -- --clean` deletes them.
- Creates:
  - the 4 portfolio categories with their descriptions;
  - the **12 portfolios** from OLD's `portfolioItems.jsx` (cover, hero and
    gallery imported into the Media Library from `theme/dist/images`);
  - the **9 news posts** from `eventItems.jsx`;
  - **3 placeholder careers** marked `[DEMO]`, because OLD has no career mock
    data.

---

## 6. Build and workflow

```bash
npm install
docker compose up -d           # WordPress http://localhost:4600, MySQL :3310
npm run build:wp               # seeds → theme/data, React → theme/dist
# wp-admin: activate "Samudra Website", then Settings → Permalinks → Post name → Save
npm run wp:seed-demo           # optional demo portfolios/news/careers
npm run dev                    # Vite HMR, proxies /wp-json + /wp-content → :4600
npm run wp:reseed [keys…]      # push edited src/data/*.json into WordPress
npm run lint
```

Permalinks are saved from the browser (Ex4's note: wp-cli writes an empty
rewrite block).

---

## 7. Delivery phases

| Phase | Output |
|---|---|
| 0 | Scaffold: configs from Ex4 renamed to Samudra, compose ports, theme skeleton, images copied. `build:wp` green, WordPress up, theme active, permalinks set. |
| 1 | WordPress backend: `functions.php` (incl. slug-aware 404), `inc/post-types.php`, `inc/admin-sections.php`, REST. |
| 2 | 14 seed JSONs carrying OLD's content verbatim, plus `[TODO]` placeholders for Vision/Values/Awards. |
| 3 | React core: `main`, `App`, `theme`, `fonts`, `useSiteData`, `useNavigation`, `wpApi`. |
| 4 | Layout: Navbar (nav from `global`), Footer (offices from `global`). |
| 5 | Pages: Home → About (+6) → Services (category descriptions + deep link) → Portfolio detail → News (+detail) → Contact → Career → 404. |
| 6 | `wp:seed-demo` and `wp:reseed`. |
| 7 | Verification (below). |
| 8 | `README.md`, `TODO.md`, `theme/README.md`. |

**Verification**

- `npm run lint`, `npm run build` and `npm run build:wp` all clean.
  `php -l` on every theme file inside the container.
- **Visual parity:** a copy of OLD runs from the scratchpad (OLD itself is
  never modified) with its proxy pointed at `:4600`, against the same demo
  data. Every route is screenshotted at 390 / 768 / 1024 / 1440 / 1920 with
  Playwright and compared with the new build.
- REST returns all 14 sections. An admin save, ▲▼ reorder and Reset to Default
  each round-trip.
- Known routes and existing slugs return 200. Unknown paths and unknown slugs
  return 404.
- The category deep link from Home preselects the right chip and description.

---

## 8. Notes

- **Security:** `fonnte.txt` and `fonnte_config.php` (Fonnte WhatsApp API
  token and phone numbers) are committed in OLD's git history (commit
  `d674f7c`, remote `github.com/KenanyaKAP/samudra-web`). They are not carried
  over. If that repository is or ever was public, rotate the token.
- **Copy still lorem ipsum in OLD:** the 6 About brand descriptions and 2 of
  the 3 testimonials. They are seeded verbatim and listed in `TODO.md`.
- **Small data mismatch in OLD:** the HQ phone is `+622150813122` in
  `contactData.js` but `+6221 50813122` in the Footer. The seed uses the Footer
  formatting.
- **Git:** the root is not a git repository. Nothing will be initialised,
  committed or pushed unless you ask.
- Out of scope: image optimisation (57 MB as-is), SEO meta/sitemap, a contact
  form (OLD has none).

---

## 9. As-built deltas

Differences between this plan and what was actually shipped, and why.

| # | Planned | Shipped | Reason |
|---|---|---|---|
| 1 | `@fontsource/montserrat`, static weights 400–700 | **`@fontsource-variable/montserrat`** | OLD loaded the Montserrat *variable* font from Google Fonts (`wght@100..900`). The variable package is the same font, so glyphs render the same. |
| 2 | Compose project named after the folder | **`name: samudra-react`** in `compose.yml` | This machine already has `samudra-web_db_data` / `samudra-web_wordpress_data` volumes (2026-02-26) from an earlier install. The default project name would have reused them. They were left untouched. |
| 3 | `career` section = heading + intro | **+ `joinCard`** (image, title, paragraphs) | The "JOIN OUR TEAM" card was hard-coded inside `CareerCard.jsx`. It is editorial copy, so it moved to Site Content like everything else. |
| 4 | Ex4 admin renderer, adapted | Ex4 renderer **plus three fixes** | (a) Removing every row of a repeater no longer deletes the key: the stored value keeps `[]` and the admin keeps the repeater, its "+ Add" button and its row shape, all taken from the seed. (b) "+ Add" on a nested repeater (nav children, office phones) no longer collides with its parent's placeholder. (c) Rows added but left completely empty are dropped on save. |
| 5 | — | **HTML entities decoded** in titles, excerpts and category names | OLD rendered WordPress' encoded strings raw ("Interior Design &AMP; Build", titles wrapping because of `&amp;`). This is the only intentional visual difference from OLD. |
| 6 | — | Dead code from OLD removed in copied components | Unused state/effects in `TestimonialCarousel`, `HighlightedProjects`' commented-out card and its hooks, unused imports. No rendered output changed. |
| 7 | — | ESLint ignores `motion` in `no-unused-vars` | ESLint 9 core does not see JSX member usage (`<motion.div>`); OLD's lint had the same false positives. |
| 8 | 404 `document.title` | Restores the previous title on leave | Most pages never set a title (as in OLD), so the 404 title would otherwise stick after navigating away. |

### Verified

- `npm run lint`, `npm run build` and `npm run build:wp` clean. `php -l` clean
  on every theme file and both CLI scripts, inside the container.
- **Visual parity, OLD vs NEW**: a copy of OLD ran from the scratchpad against
  the same WordPress. 11 routes × 5 widths (390 / 768 / 1024 / 1440 / 1920),
  full-page screenshots under a shared virtual clock, compared per pixel:
  - every page height identical, except the portfolio detail whose title no
    longer wraps on `&amp;` (delta 5);
  - remaining differences ≤ 0.44 % of pixels: autoscroll positions, the
    entity fix, and sub-pixel antialiasing of single glyphs;
  - no horizontal overflow at any width.
- Production build served by WordPress at `:4600`: no console errors. The
  Services filter, the Home → `/services?category=…` deep link and the
  per-category descriptions work. The mobile drawer reads the nav from Site
  Content.
- Status codes: all 12 static routes and existing `/services/<slug>` /
  `/events/<slug>` → 200; unknown paths and unknown slugs → 404; path
  traversal under `/images/` → 400.
- REST: 14 sections, 4 categories (with descriptions), 12 portfolios, 9 news,
  3 careers.
- wp-admin: all 14 Site Content pages render without notices. Saving a nested
  child, reordering with ▲, emptying a repeater, dropping blank rows and Reset
  to Default all round-trip through REST to the front end. The Portfolio meta
  box gallery (remove one image) and description save correctly.
- `npm run wp:seed-demo` is idempotent (re-run leaves 12 / 9 / 3 / 1 media).
  `npm run wp:reseed` rejects unknown keys.

---

## 10. Redesign from `New Design.pdf` (2026-10-05)

The designer delivered `New Design.pdf` (one Illustrator page holding nine
1920 px desktop artboards: Home, About, Services, portfolio detail, People,
News, news detail, Request a Proposal, Career) and `New Design Assets/`
(raw PNG/JPG + the copy in .docx). Neither folder is committed.

### 10.1 Decisions

| Topic | Decision |
|---|---|
| Language | Still English only. The "EN" switch of the design is not shown. |
| Navigation | HOME, ABOUT, SERVICES, PEOPLE, NEWS, CONTACT US, CAREER + search. No dropdowns. |
| About | One page: CEO message, Vision & Mission, About Samudra (40 years), Strategic Alliance, Warehouse. The six sub-pages are gone; `/about/{history,company,vision,values,awards}` → 301 `/about`, `/about/management` → 301 `/people`. |
| People | New `/people`: Board of Directors, three directors full width, managers and branch managers as portraits cut per person out of the group shots (editable in Site Content → People), crew photo. |
| Home | Hero carousel (design slide + three earlier slides), About "Redefining Experiences", Service cards, News carousel, office map. Testimonials removed. |
| Services | Filter chips + category text + grid of **portfolio projects** (the design repeats the four category cards as filler). Cards are black-and-white until hovered (always colour on touch screens). |
| Details | Portfolio and news share one layout. Portfolio subtitle = category, news subtitle = date. Portfolio gallery as a grid + lightbox under the text. BACK / NEXT = neighbours in list order. |
| Forms | Request a Proposal (`/contact`) and Career Application (`/career`): fields and copy from the .docx specs (Scale, Budget, Date are free text). Stored in wp-admin with attachments + e-mail notification. Privacy link → new `/privacy-policy` (placeholder text). |
| Career | Cards with photo, location / type / level, closing date; only open positions are listed and offered in the form. APPLY scrolls to the form with that position selected. |
| WhatsApp | Floating "Tell us about your project" button on every page, shown once a number is set in Site Content → Global. |
| Search | Navbar search over News + Portfolios (`/wp/v2/search`). |
| Offices | Phone numbers from the design (Jakarta, Medan changed; no fax for Jakarta, Bali), "HP" line added, LinkedIn added. |
| Categories | "Special Project" (was "Special Projects"), "Tent Service". |
| Assets | WebP via `npm run assets:build` (sharp): backgrounds 2560 px at q92 (lower smoothed their grain), photos q88, graphics q90 with alpha. 211 MB of sources → ~5 MB. Unused images of the old design deleted (57 MB → 7.9 MB). |
| Demo data | `wp:seed-demo` now holds the design's 9 news, 4 positions and the Indonesia Pavilion project (+ OLD's 12 mock portfolios so every category has projects). |

### 10.2 Corrections to the design (applied)

1. The two detail artboards still show the old navbar; the new one is used everywhere.
2. The design swaps the texts of the Tent Service and Interior Design & Build cards; the correct texts are used.
3. Card buttons all read "MORE" (the design mixes READ MORE / MORE).
4. Leftover layers ignored: a tiny "Lorem ipsum" in the CEO block, a hidden "YOUR EXHIBITION PARTNER".
5. "e.g. Jhon" → "e.g. John".
6. The Career form shows the intro from the .docx; its button, consent and success texts come from the .docx (the design reused the proposal texts).
7. Office lines are formatted consistently: `Phone :`, `HP :`, `Fax :`, `Email :`.

### 10.3 As built

- **Responsive approach**: `src/utils/design.js` — `fluid(px, min)` is the
  design value at 1920 that scales with the viewport and stops at a minimum;
  `block(px)` centres a design-width block with gutters on small screens.
  Pages whose frames are positioned absolutely (About) only use that layout
  from 1200 px; below it the parts stack.
- **Forms backend** (`theme/inc/forms.php`): `POST samudra/v1/forms/{proposal,application}`,
  server-side validation (required, e-mail, URL, max lengths, dropdown values,
  file type by content + extension, 10 MB per file, 5 documents), honeypot +
  3-second minimum, 5 submissions / 10 min / IP. Private CPTs
  `proposal_request` / `job_application`; files in
  `uploads/samudra-forms/` (`Require all denied`), downloaded by admins via
  `admin-post.php`; deleted with the submission. Recipients in Site Content
  → Form Settings (option `samudra_form_settings`, not exposed over REST;
  empty → site admin e-mail). SMTP through `SAMUDRA_SMTP_*` constants or a
  plugin such as WP Mail SMTP.
- **Local Docker**: `mailpit` service (http://localhost:8025) receives all
  mail; `docker/php/uploads.ini` raises PHP's upload limits to 10 MB / 64 MB.
- **Upgrade step** `samudra_maybe_upgrade()` (schema v2): deletes the six old
  About options, renames the Special Projects category, flushes rewrites.
  Sections whose structure changed keep their old stored values, so an
  existing install must run `npm run wp:reseed` (or Reset to Default per
  section) once.
- **Fixes found while verifying**:
  - The CLI scripts ran as root, so the first media import created
    `wp-content/uploads` owned by root and every later upload (Media Library,
    form attachments) failed. They now run as `www-data`.
  - WordPress texturized titles (" - " → "–"), so titles differed from the
    design and from the Position dropdown values; `wptexturize` is removed
    from `the_title`.
  - The demo seeder stored `&amp;` in titles (kses runs without a user);
    it now disables kses.
  - The honeypot used MUI's `width: 1` (= 100%), adding blank space under
    the footer of both form pages.

### 10.4 Verified

- `npm run lint`, `npm run build`, `npm run build:wp`; `php -l` on every theme file.
- 1920 px: every page compared side by side with its artboard (`pdftoppm`
  render at 72 dpi = 1:1). Remaining differences: browser vs Illustrator
  glyph widths, images still missing from the assets folder, real content
  instead of the design's repeated sample cards.
- 390 / 768 / 1000 / 1200 / 1280 / 1366 px: no horizontal overflow; About,
  hero and quote marks fixed at the in-between widths.
- No failed requests (images, fonts, REST) on any page.
- Routes: new pages 200, unknown paths/slugs 404, six legacy URLs 301.
- Forms over HTTP and in a real browser: valid submissions stored with files,
  e-mail in Mailpit with Reply-To, field errors (required, e-mail, URL, wrong
  option, closed position, fake PDF, > 10 MB), honeypot, too-fast, rate limit
  (6th → 429), direct file URL → 403, admin download works, success panel
  scrolls into view.
- Career: a position past its closing date disappears from the list and the
  dropdown; APPLY selects the position and scrolls to the form.
- Search ("osaka" → one news + one project), BACK / NEXT order, WhatsApp link.
- wp-admin: Proposal Requests / Applications lists and detail, Form Settings
  (invalid addresses dropped), Career "Closes" column, People rows titled by
  name, `nameSide` dropdown.
