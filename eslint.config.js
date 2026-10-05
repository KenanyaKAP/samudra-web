import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "theme/dist", "EXAMPLE-READ-ONLY*", "samudra-web-OLD"]),
  {
    files: ["vite.config.js", "scripts/**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // ESLint 9 core does not see JSX usage, so components (Capitalised)
      // and framer-motion's `motion` (used only as <motion.div>) would be
      // reported as unused.
      "no-unused-vars": ["error", { varsIgnorePattern: "^([A-Z_]|motion$)" }],
    },
  },
  {
    // Context files intentionally export a provider component alongside its
    // hook — that pairing is the point, and Fast Refresh copes fine here.
    files: ["src/hooks/**/*.jsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
