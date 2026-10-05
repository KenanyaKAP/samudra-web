import fs from "fs";
import path from "path";
import { fail, root, runPhpInWordpress, syncSeeds } from "./lib/wp-php.js";

/**
 * Push src/data/*.json into the running WordPress container.
 *
 * WordPress only seeds a section while its option is empty, so once a section
 * has been read even once, editing the JSON does nothing. This overwrites the
 * options outright, which is the same thing "Reset to Default" does in the
 * admin — no more `docker compose down -v` to pick up a content change.
 *
 *   npm run wp:reseed              all sections
 *   npm run wp:reseed -- home      just that one
 */

const keys = process.argv.slice(2).filter((a) => !a.startsWith("-"));

// Validate against the seed files before touching the container, so a typo
// fails immediately instead of halfway through.
const available = fs
  .readdirSync(path.join(root, "src/data"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => path.basename(f, ".json"));

const unknown = keys.filter((k) => !available.includes(k));
if (unknown.length) {
  fail(
    `Unknown section(s): ${unknown.join(", ")}`,
    `Available: ${available.join(", ")}`,
  );
}

console.log("");
syncSeeds();

console.log(
  keys.length
    ? `Reseeding ${keys.join(", ")} from src/data...`
    : "Reseeding all sections from src/data...",
);

if (!runPhpInWordpress("wp-reseed.php", { SAMUDRA_KEYS: keys.join(",") })) {
  fail("Reseed failed — see the output above.");
}

console.log(
  "\nDone. Any edits made in Site Content for those sections were replaced.\n",
);
