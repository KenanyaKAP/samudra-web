import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, "../src/data");
const destDir = path.resolve(__dirname, "../theme/data");

function copyJsonFiles() {
  console.log("Syncing JSON seed data from src/data to theme/data...");

  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Read source directory
  try {
    const files = fs.readdirSync(sourceDir);
    let copiedCount = 0;

    files.forEach((file) => {
      if (path.extname(file).toLowerCase() === ".json") {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
      }
    });

    console.log(`Successfully synced ${copiedCount} JSON files to theme/data.`);
  } catch (err) {
    console.error("Error copying JSON files:", err);
    process.exit(1);
  }
}

copyJsonFiles();
