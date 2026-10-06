import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(__dirname, "../..");
const SERVICE = "wordpress";

export function fail(msg, hint) {
  console.error(`\n✖ ${msg}`);
  if (hint) console.error(`  ${hint}`);
  process.exit(1);
}

/** src/data -> theme/data. theme/ is bind-mounted, so the container sees it at once. */
export function syncSeeds() {
  execFileSync("node", [path.join(root, "scripts/copy-data.js")], {
    stdio: "inherit",
    cwd: root,
  });
}

/**
 * Pipe a PHP file into the WordPress container's php over stdin. Nothing is
 * written into theme/, so these scripts can never ship to production or be
 * reached over HTTP.
 *
 * Runs as www-data, the web server's user: as root, the first media import
 * would create wp-content/uploads owned by root, and every later upload from
 * wp-admin or the site's forms would fail.
 */
export function runPhpInWordpress(phpFile, env = {}) {
  // `exec` against a stopped service gives a much less obvious error.
  const ps = spawnSync("docker", ["compose", "ps", "-q", SERVICE], {
    cwd: root,
    encoding: "utf8",
  });
  if (ps.error) {
    fail("Could not run `docker compose`.", "Is Docker installed and running?");
  }
  if (ps.status !== 0 || !ps.stdout.trim()) {
    fail(
      `The "${SERVICE}" service is not running.`,
      "Start it with: docker compose up -d",
    );
  }

  const envArgs = Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]);
  const run = spawnSync(
    "docker",
    ["compose", "exec", "-T", "-u", "www-data", ...envArgs, SERVICE, "php"],
    {
      cwd: root,
      input: fs.readFileSync(path.join(root, "scripts", phpFile)),
      stdio: ["pipe", "inherit", "inherit"],
    },
  );
  return run.status === 0;
}
