import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

/**
 * Convert the designer's raw assets ("New Design Assets/", not committed)
 * into the WebP files the site uses (public/images/…, committed).
 *
 *   npm run assets:build              convert what changed
 *   npm run assets:build -- --force   reconvert everything
 *   npm run assets:build -- people    only outputs whose path contains "people"
 *
 * Sizes follow what each image is displayed at, never upscaled:
 *   - full-screen backgrounds and photos: 2560 px wide (sharp on 2K/retina)
 *   - card photos: 1200 px
 *   - transparent graphics: about 2× their displayed width, alpha kept
 *   - team portraits: cropped per person out of the group shots
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "New Design Assets");
const OUT = path.join(root, "public/images");

// Quality was picked by comparing 100% crops against the source: below 92 the
// grain and soft gradients of the section backgrounds visibly smooth out or
// band; photos hold up at 88.
const PHOTO = { quality: 88 };
const TEXTURE = { quality: 92 };
const GRAPHIC = { quality: 90, alphaQuality: 100 };

// Group portraits: [output name, left, top, width, height] in source pixels.
// Every crop in a sheet has the same size, so the people line up on the page.
const TEAM = {
  "PEOPLE/kru copy22.jpg": {
    width: 960,
    crops: [
      ["mohammad-nur-rizky", 1580, 780, 4200, 5250],
      ["naskah-astriadi", 6260, 940, 4200, 5250],
    ],
  },
  "PEOPLE/kru copy12.jpg": {
    width: 800,
    crops: [
      ["rahmat-anwar", 860, 300, 2600, 3250],
      ["hari-nugraha", 4060, 100, 2600, 3250],
      ["mauludin-imam-santoso", 7980, 150, 2600, 3250],
      ["khoirullah", 1900, 3150, 2600, 3250],
      ["t-soetarjani-setiabudi", 4340, 3980, 2600, 3250],
      ["anggit-purnomo", 6780, 3060, 2600, 3250],
    ],
  },
  "PEOPLE/kru copy3.jpg": {
    width: 800,
    crops: [
      // Gede stands close to Jeffry's arm, so his crop sits off-centre.
      ["jeffry-sulistyo", 784, 1280, 2560, 3200],
      ["gede-leo-satria-wijaya", 3450, 1240, 2560, 3200],
      ["harmaizon-dw", 5944, 1200, 2560, 3200],
      ["andi-eva-st", 8464, 1400, 2560, 3200],
    ],
  },
};

const JOBS = [
  // ── Home ──────────────────────────────────────────────────────────
  { src: "HOME/Asset 13@600x-8.png", out: "home/hero-osaka.webp", width: 2560 },
  // About and Service share one background image in the PDF, so the two
  // sections join without a seam. Both are cut from that image (extracted
  // with `pdftohtml -xml -zoom 1`) at their artboards, directly above each
  // other. Asset 22 is the same picture as the Service part, but Asset 14
  // sits ~412 pt below the About artboard (it repeats the top of Asset 22),
  // and the two exports do not meet without a visible line.
  {
    src: "HOME/About+Service background (from New Design.pdf).png",
    out: "home/about-bg-v2.webp",
    width: 2560,
    crop: { left: 1225, top: 236, width: 2661, height: 1497 },
    ...TEXTURE,
  },
  {
    src: "HOME/About+Service background (from New Design.pdf).png",
    out: "home/service-bg-v2.webp",
    width: 2560,
    crop: { left: 1225, top: 1733, width: 2661, height: 1497 },
    ...TEXTURE,
  },
  { src: "HOME/Asset 12@600x-8.png", out: "home/redefining-experiences.webp", width: 1440, ...GRAPHIC },
  { src: "HOME/Asset 16@600x-8.png", out: "home/news-bg.webp", width: 2560, ...TEXTURE },
  { src: "HOME/map copy2.png", out: "home/map.webp", width: 2560, ...TEXTURE },

  // ── Service cards (Home + the four categories) ────────────────────
  { src: "HOME/IMG_8328.JPG", out: "services/exhibition-construction.webp", width: 1200 },
  { src: "HOME/DSC00082.JPG", out: "services/special-project.webp", width: 1200 },
  { src: "HOME/Gemini_Generated_Image_wtsk5kwtsk5kwtsk.png", out: "services/tent-service.webp", width: 1200 },
  { src: "HOME/DSCF2310.jpg", out: "services/interior-design-build.webp", width: 1200 },

  // ── Contact / Career heroes ───────────────────────────────────────
  { src: "HOME/IMG_8328.JPG", out: "contact/hero.webp", width: 2560 },
  { src: "HOME/indonesia-hero-1920x1080.jpg", out: "career/hero.webp", width: 2560 },

  // ── About ─────────────────────────────────────────────────────────
  { src: "ABOUT/Asset 2@600x-8.png", out: "about/ceo.webp", width: 2560, ...TEXTURE },
  { src: "ABOUT/Asset 3@600x-8.png", out: "about/vision-bg.webp", width: 2560, ...TEXTURE },
  { src: "ABOUT/Asset 6@600x-8.png", out: "about/company-bg.webp", width: 2560, ...TEXTURE },
  { src: "ABOUT/Asset 7@600x-8.png", out: "about/40-years.webp", width: 720, ...GRAPHIC },
  { src: "ABOUT/Asset 8@600x-8.png", out: "about/ospi.webp", width: 720, ...GRAPHIC },
  { src: "ABOUT/Asset 9@600x-8.png", out: "about/roder-losberger.webp", width: 900, ...GRAPHIC },
  { src: "ABOUT/Asset 10@600x-8.png", out: "about/warehouse.webp", width: 2560 },

  // ── Demo content (npm run wp:seed-demo) ──────────────────────────
  { src: "HOME/DSCF3563.jpg", out: "demo/indonesia-pavilion.webp", width: 1920 },

  // ── People ────────────────────────────────────────────────────────
  { src: "PEOPLE/Bod 01R.jpg", out: "people/board.webp", width: 2560 },
  { src: "PEOPLE/Hariman ok.jpg", out: "people/hariman-t-zagloel.webp", width: 2560 },
  { src: "PEOPLE/Zen ok2.jpg", out: "people/zen-fuad-noor.webp", width: 2560 },
  { src: "PEOPLE/Frina ok2.jpg", out: "people/frina-bonita.webp", width: 2560 },
  { src: "PEOPLE/ALL Crew1.jpg", out: "people/crew.webp", width: 2560 },
  ...Object.entries(TEAM).flatMap(([src, sheet]) =>
    sheet.crops.map(([name, left, top, width, height]) => ({
      src,
      out: `people/team/${name}.webp`,
      width: sheet.width,
      crop: { left, top, width, height },
    })),
  ),
];

// ── Run ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const force = args.includes("--force");
const filters = args.filter((a) => !a.startsWith("--"));

if (!fs.existsSync(SRC)) {
  console.error(`\n✖ "${path.relative(root, SRC)}" is missing — nothing to convert.\n`);
  process.exit(1);
}

const kb = (bytes) => `${Math.round(bytes / 1024)} kB`.padStart(8);

let converted = 0;
let skipped = 0;
const missing = [];

for (const job of JOBS) {
  if (filters.length && !filters.some((f) => job.out.includes(f))) continue;

  const src = path.join(SRC, job.src);
  const out = path.join(OUT, job.out);
  if (!fs.existsSync(src)) {
    missing.push(job.src);
    continue;
  }
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) {
    skipped++;
    continue;
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });

  // The 16000×9000 artboard exports are over sharp's default pixel limit.
  let img = sharp(src, { limitInputPixels: false }).rotate();
  if (job.crop) img = img.extract(job.crop);
  const info = await img
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({
      quality: job.quality ?? PHOTO.quality,
      alphaQuality: job.alphaQuality ?? 100,
      // Keeps the brand red crisp: plain 4:2:0 subsampling smears red
      // edges against dark backgrounds.
      smartSubsample: true,
      effort: 6,
    })
    .toFile(out);

  converted++;
  console.log(
    `  ✓ ${job.out.padEnd(46)} ${`${info.width}×${info.height}`.padStart(10)} ${kb(info.size)}`,
  );
}

console.log(`\n${converted} converted, ${skipped} up to date.`);
if (missing.length) {
  console.log(`\nSource files not found (skipped):\n  - ${missing.join("\n  - ")}`);
}
