import fs from "fs";
import path from "path";
import { fail, root, runPhpInWordpress } from "./lib/wp-php.js";

/**
 * Fill the running WordPress with demo content: the portfolio categories,
 * the 9 news posts, 4 open positions and the Indonesia Pavilion project of
 * New Design.pdf, plus OLD's 12 mock portfolios. Images are imported into
 * the Media Library from theme/dist/images.
 *
 *   npm run wp:seed-demo              create / update the demo content
 *   npm run wp:seed-demo -- --clean   delete everything it created
 *
 * Idempotent: re-running updates the same posts (matched by slug).
 */

const clean = process.argv.includes("--clean");

if (!clean && !fs.existsSync(path.join(root, "theme/dist/images"))) {
  fail(
    "theme/dist/images is missing, so there are no images to import.",
    "Run `npm run build:wp` first.",
  );
}

console.log(clean ? "\nRemoving demo content..." : "\nSeeding demo content...");

if (!runPhpInWordpress("wp-seed-demo.php", { SAMUDRA_DEMO_CLEAN: clean ? "1" : "0" })) {
  fail("Demo seeding failed — see the output above.");
}

console.log("\nDone.\n");
