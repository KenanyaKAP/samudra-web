import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine if this is a WordPress build
const isWpBuild = process.env.WP_BUILD === "true";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],

  // WordPress build: output to theme/dist and use relative paths
  ...(isWpBuild && {
    base: "./",
    build: {
      outDir: path.resolve(__dirname, "theme/dist"),
      emptyOutDir: true,
      manifest: true, // Generate manifest.json for functions.php to read
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
      },
    },
  }),

  server: {
    allowedHosts: [
      "samudra.kenanya.my.id",
      "samudraweb.kenanya.my.id",
      "samudra.tridentdevstudio.com",
    ],
    proxy: {
      "/wp-json": {
        target: "http://localhost:4600",
        changeOrigin: true,
      },
      "/wp-content": {
        target: "http://localhost:4600",
        changeOrigin: true,
      },
    },
  },
});
