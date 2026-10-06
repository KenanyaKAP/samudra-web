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
projects (`EXAMPLE-READ-ONLY-4` + the CPT pattern of `EXAMPLE-READ-ONLY-2`),
redesigned from `New Design.pdf` (October 2026). See `PLAN.md` for the
decisions and the as-built notes (§10 for the redesign).

## Pages

| Route | Page | Content from |
|---|---|---|
| `/` | Home | Site Content → Home Page, latest News |
| `/about` | About: CEO message, Vision & Mission, About Samudra, Strategic Alliance, Warehouse | Site Content → About Page |
| `/people` | Board of Directors, managers, crew | Site Content → People Page |
| `/services` (`?category=<slug>`) | Services + portfolio filter | Site Content → Services Page, Portfolios, Portfolios → Categories |
| `/services/:slug` | Portfolio detail | Portfolios |
| `/events` | News & Event | News, Site Content → News Page |
| `/events/:slug` | News detail | News |
| `/contact` | Request a Proposal form | Site Content → Contact (Request a Proposal); submissions → Proposal Requests |
| `/career` | Open positions + Career Application form | Career, Site Content → Career Page; submissions → Applications |
| `/privacy-policy` | Privacy Policy (linked from both forms) | Site Content → Privacy Policy |
| anything else | 404 (real 404 status) | Site Content → 404 Page |

The old About sub-pages answer with a permanent redirect:
`/about/{history,company,vision,values,awards}` → `/about`,
`/about/management` → `/people`.

Every page also has the navbar search (News + Portfolios) and, once a number
is set in Site Content → Global → Whatsapp, the floating WhatsApp button.

## Local development

```bash
npm install

# Start WordPress (http://localhost:4600), MySQL (host port 3310) and
# Mailpit (http://localhost:8025 — catches every e-mail WordPress sends)
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
| **Site Content** | One page per section (Global, Home, About, People, Services, News, Contact, Career, Privacy Policy, 404). Text, images (Media Library picker), repeatable rows with ▲ ▼ reordering. In texts a blank line starts a new paragraph; in headings a line break is a new line on desktop. |
| **Site Content → Form Settings** | Who receives the e-mail for each form (comma-separated). Empty = the site admin address. |
| **Portfolios** | Projects on `/services`. Featured image = card photo; editor = the article on the detail page; meta box = card summary, main image and gallery. |
| **Portfolios → Categories** | The filter chips on `/services`. A category's **Description** is the text shown while it is selected. |
| **News** | Posts (`/events`). Featured image, excerpt (card text) and content. The newest post is the large card. |
| **Career** | Positions on `/career`: featured image, location, type, level, short description and closing date. A position disappears from the site (and from the form's dropdown) the day after it closes. |
| **Proposal Requests** / **Applications** | Every form submission with its answers and attachments (download buttons). Read-only; delete with Trash. |

Head office and branch offices are edited once under **Site Content → Global**
and appear in the footer of every page.

### Form e-mails

Submissions are always stored in wp-admin; the e-mail is a notification.
Locally every e-mail lands in Mailpit (http://localhost:8025). On a real
server, make sure WordPress can send mail: install a plugin such as
**WP Mail SMTP**, or define in `wp-config.php`:

```php
define('SAMUDRA_SMTP_HOST', 'smtp.example.com');
define('SAMUDRA_SMTP_PORT', 587);
define('SAMUDRA_SMTP_SECURE', 'tls');
define('SAMUDRA_SMTP_USER', '…');
define('SAMUDRA_SMTP_PASS', '…');
define('SAMUDRA_MAIL_FROM', 'no-reply@samudra.co.id');
```

Attachments are limited to 10 MB each; PHP on the server needs
`upload_max_filesize ≥ 10M` and `post_max_size ≥ 64M` (the local setup sets
them in `docker/php/uploads.ini`).

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
npm run wp:seed-demo              # 4 categories, 13 portfolios, 9 news, 4 careers
npm run wp:seed-demo -- --clean   # delete everything it created
```

The demo data is the sample content of `New Design.pdf` (news, open
positions, the Indonesia Pavilion project) plus OLD's mock portfolios. Every
item it creates is tagged, so `--clean` removes exactly those and nothing
else. Run `npm run build:wp` first: the images are imported into the Media
Library from `theme/dist/images`.

### Images

The designer's raw files live in `New Design Assets/` (not committed). The
WebP files the site uses are generated from them into `public/images/`:

```bash
npm run assets:build              # convert what changed
npm run assets:build -- --force   # everything
npm run assets:build -- people    # only outputs whose path contains "people"
```

The list of conversions (source, output, width, quality, crop) is the table
at the top of `scripts/convert-assets.mjs`; add a row there for a new asset.
Images replaced later through wp-admin go to the Media Library instead.

### Updating an existing install

After deploying a version whose seed structure changed (as the redesign
did), run `npm run wp:reseed` once — or **Reset to Default** on each Site
Content page — so the stored sections take the new shape.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Standalone static build into `dist/` |
| `npm run build:wp` | Copy seeds to `theme/data`, build React into `theme/dist` |
| `npm run lint` | ESLint |
| `npm run wp:reseed [keys…]` | Overwrite Site Content sections from `src/data` |
| `npm run wp:seed-demo [--clean]` | Create / remove demo content |
| `npm run assets:build [--force] [filter]` | Convert `New Design Assets/` into `public/images/*.webp` |

## Standalone static deploy (optional)

`compose.react.yml` + `Dockerfile` + `nginx.conf` build and serve the React app
as a static site behind nginx (no WordPress), configured via `.env` (`PORT`).
Site Content then comes from the bundled seeds only, Portfolios, News and
Career are empty, and the forms and search cannot work. See `.env.example`.
