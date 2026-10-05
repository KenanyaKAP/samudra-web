# Samudra Website

Hybrid **WordPress + React** website for PT Samudra Dyan Praga — Your
Exhibition Partner.

- **Frontend**: React 19 + Vite + Material UI (source in `/src`).
- **WordPress theme**: `/theme` (`samudra-react`) serves the built React SPA
  from `theme/dist` and exposes all editable content over
  `/wp-json/samudra/v1/data`, plus Portfolios, News and Career positions over
  the standard `/wp-json/wp/v2/…` routes.
- **Database**: MySQL 8.0 in Docker.

This is a rebuild of `samudra-web-OLD/` on the architecture of the reference
projects (`EXAMPLE-READ-ONLY-4` + the CPT pattern of `EXAMPLE-READ-ONLY-2`).
The rendered site is pixel-identical to OLD; see `PLAN.md` for the decisions
and the as-built notes.

## Pages

| Route | Page | Content from |
|---|---|---|
| `/` | Home | Site Content → Home Page, latest News |
| `/about` | About (brand cards) | Site Content → About Page |
| `/about/history` | Samudra History | Site Content → About › History |
| `/about/company` | About Samudra | Site Content → About › About Samudra |
| `/about/vision` `/about/values` `/about/awards` | Vision & Mission, Core Values, Awards | Site Content → About › … |
| `/about/management` | Board of Management | Site Content → About › Board of Management |
| `/services` (`?category=<slug>`) | Services + portfolio filter | Site Content → Services Page, Portfolios, Portfolios → Categories |
| `/services/:slug` | Portfolio detail | Portfolios |
| `/events` | News & Event | News |
| `/events/:slug` | News detail | News |
| `/contact` | Contact | Site Content → Contact Page + Global (offices) |
| `/career` | Careers | Site Content → Career Page, Career |
| anything else | 404 (real 404 status) | Site Content → 404 Page |

## Local development

```bash
npm install

# Start WordPress (http://localhost:4600) + MySQL (host port 3310)
docker compose up -d

# Build the React app into the WP theme (run after every /src change
# you want visible inside WordPress)
npm run build:wp

# Or run the Vite dev server with HMR (proxies /wp-json + /wp-content to :4600)
npm run dev
```

The compose project is named `samudra-react` (see `compose.yml`), so its
containers and volumes are `samudra-react-*` / `samudra-react_*`. This machine
also has older `samudra-web_*` volumes; they are not used or touched.

### First-time WordPress setup

1. Open http://localhost:4600 and finish the WordPress installer.
2. Activate the **Samudra Website** theme (Appearance → Themes). This also
   creates the four default portfolio categories.
3. Open **Settings → Permalinks**, choose "Post name" and hit Save. Saving
   from the browser is what writes the `.htaccess` rewrite rules; wp-cli
   writes an empty block.
4. Optional: `npm run wp:seed-demo` for demo portfolios, news and careers.

The local install that was set up during the rebuild uses **admin /
samudra123** (local only).

## Editing content

| wp-admin menu | What it controls |
|---|---|
| **Site Content** | One page per section (Global, Home, About pages, Services, News, Contact, Career, 404). Text, images (Media Library picker), repeatable rows with ▲ ▼ reordering. |
| **Portfolios** | Projects on `/services`. Featured image = card cover; meta box = short description, hero image and gallery. |
| **Portfolios → Categories** | The filter chips on `/services`. A category's **Description** is the text shown while it is selected. |
| **News** | Posts (`/events`). Featured image, excerpt (card text) and content. |
| **Career** | Open positions on `/career` (type, location, description, Apply URL). |

Head office and branch offices are edited once under **Site Content → Global**
and appear in both the footer and the Contact page.

Sections fall back to the bundled seed content in `src/data/*.json` whenever
WordPress is unreachable, so the site never renders blank. Portfolios, News
and Career have no bundled fallback; they show their empty states instead.

> **`src/data/*.json` seeds each section only once.** On first load its
> contents are written to the `samudra_data_<section>` option, and from then on
> WordPress is the source of truth. Editing those JSON files will not change a
> section that has already been seeded. Change content in **Site Content**, or
> re-seed (below).

### Re-seeding from JSON

```bash
npm run wp:reseed              # every section
npm run wp:reseed -- home      # only these
```

This syncs `src/data` → `theme/data` and overwrites the `samudra_data_*`
options — the same thing the **Reset to Default** button does on each Site
Content page. **Edits made in Site Content for those sections are replaced.**
Requires `docker compose up -d`.

### Demo content

```bash
npm run wp:seed-demo              # 4 categories, 12 portfolios, 9 news, 3 careers
npm run wp:seed-demo -- --clean   # delete everything it created
```

The demo data is OLD's mock data. Every item it creates is tagged, so
`--clean` removes exactly those and nothing else. Run `npm run build:wp` first:
the images are imported into the Media Library from `theme/dist/images`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Standalone static build into `dist/` |
| `npm run build:wp` | Copy seeds to `theme/data`, build React into `theme/dist` |
| `npm run lint` | ESLint |
| `npm run wp:reseed [keys…]` | Overwrite Site Content sections from `src/data` |
| `npm run wp:seed-demo [--clean]` | Create / remove demo content |

## Standalone static deploy (optional)

`compose.react.yml` + `Dockerfile` + `nginx.conf` build and serve the React app
as a static site behind nginx (no WordPress), configured via `.env` (`PORT`).
Site Content then comes from the bundled seeds only, and Portfolios, News and
Career are empty. See `.env.example`.
