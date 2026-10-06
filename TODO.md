# TODO / Known gaps

Ordered by how much they affect the delivered site.

## 1. Waiting for files or information

- [ ] **Images that are in the design but not in `New Design Assets/`**:
      the News & Event page background, the photos of most news posts, and
      the four career card photos. Until then the News page uses a dark-red
      gradient and those cards show a grey box. When they arrive: the
      background goes in *Site Content → News Page → Background Image*, the
      others as Featured Images of the posts / positions (or add them to
      `scripts/convert-assets.mjs` and the demo seeder).
- [ ] **WhatsApp number** — the floating "Chat with Samudra" button stays
      hidden until a number is set. → *Site Content → Global → Whatsapp*
- [ ] **Privacy Policy text** — seeded with `[TODO]` placeholder copy, and
      both forms link to it. → *Site Content → Privacy Policy*
- [ ] **Social links** — LinkedIn, Facebook, Instagram, YouTube point at the
      networks' home pages. → *Site Content → Global → Footer → Socials*
- [ ] **Form recipients** — notifications go to the WordPress admin address
      until set. → *Site Content → Form Settings*
- [ ] **Services "All" intro** — still the Special Projects paragraph (as in
      the design). → *Site Content → Services Page → Intro*

## 2. Before going live

- [ ] **E-mail delivery** on the production server: WP Mail SMTP plugin or the
      `SAMUDRA_SMTP_*` constants (see README → Form e-mails). Locally, mail
      only reaches Mailpit.
- [ ] **PHP upload limits** on the server: `upload_max_filesize ≥ 10M`,
      `post_max_size ≥ 64M`, or large attachments are refused.
- [ ] **Existing installs**: run `npm run wp:reseed` once after deploying the
      redesign (the section structure changed).
- [ ] **Demo content** — remove with `npm run wp:seed-demo -- --clean` before
      adding real portfolios, news and positions.
- [ ] **Odoo** — the Career .docx mentions forwarding proposal requests to
      Sales/Odoo. Not built: submissions are stored in wp-admin and e-mailed.
- [ ] **Marketing consent** — the .docx suggests an optional, separate
      checkbox if marketing e-mails are wanted. Not built.

## 3. Decisions for you

- [ ] **`npm audit`** reports vulnerabilities in production dependencies
      (axios, react-router, follow-redirects, form-data, …), inherited from
      OLD's lockfile. `npm audit fix` would update them within their semver
      ranges.
- [ ] **Fonnte token** — `fonnte.txt` / `fonnte_config.php` (WhatsApp API token
      and phone numbers) are committed in OLD's git history. They were not
      carried over. Rotate the token if that repository is or was public.
- [ ] **Old Docker volumes** — `samudra-web_db_data` and
      `samudra-web_wordpress_data` (created 2026-02-26) are still on this
      machine, unused. Delete them if they are no longer needed.
- [ ] **WordPress admin bar** covers the floating navbar for logged-in users
      on the front end (visitors are unaffected).

## 4. Nice to have

- [ ] The JS bundle is ~770 kB (~254 kB gzipped) in one chunk. Route-level
      `React.lazy()` splitting would cut first-load noticeably.
- [ ] The 12 brand logos and the three older hero slides are still PNG/JPG.
- [ ] Mobile and tablet layouts were derived from the desktop design (the PDF
      has desktop artboards only); worth a review by the designer.
- [ ] No automated tests. Lint, builds, PHP syntax, routes, REST, forms,
      admin screens and the design comparison were verified manually (see
      `PLAN.md` §10.4).
