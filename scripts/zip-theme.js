import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

/**
 * Package theme/ as samudra-react.zip, ready for
 * WordPress → Appearance → Themes → Add New → Upload Theme.
 *
 * Run through `npm run theme:zip`, which builds first. The archive holds a
 * single top-level "samudra-react/" folder, so WordPress installs it under the
 * same slug as the local Docker theme and an upload replaces the previous
 * version instead of creating "samudra-react-1".
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const themeDir = path.join(root, "theme");
const SLUG = "samudra-react";
const outFile = path.join(root, `${SLUG}.zip`);

const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

// A zip without the build is a theme that wp_die()s on every page.
for (const required of ["style.css", "index.php", "functions.php", "dist/.vite/manifest.json", "data/global.json"]) {
  if (!fs.existsSync(path.join(themeDir, required))) {
    fail(`theme/${required} is missing — run \`npm run theme:zip\` (it builds first).`);
  }
}

fs.rmSync(outFile, { force: true });

const output = fs.createWriteStream(outFile);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  const mb = (archive.pointer() / 1024 / 1024).toFixed(1);
  console.log(`\n✓ ${path.relative(root, outFile)} (${mb} MB)`);
  console.log("  Upload it in WordPress: Appearance → Themes → Add New → Upload Theme.\n");
});
archive.on("warning", (err) => console.warn(err));
archive.on("error", (err) => fail(err.message));

archive.pipe(output);
archive.glob("**/*", {
  cwd: themeDir,
  dot: true, // dist/.vite/manifest.json is how functions.php finds the bundle
  ignore: ["**/.DS_Store", "**/._*", "**/Thumbs.db"],
}, { prefix: `${SLUG}/` });
await archive.finalize();
