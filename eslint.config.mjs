import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: globals.browser,
    },
    ignores: ["node_modules", "dist", "coverage", "infra", "mock-health-monitor"],
  },
  ...tseslint.configs.recommended.map((entry, index) => {
    // Only override the rule in one config layer
    if (index === tseslint.configs.recommended.length - 1) {
      return {
        ...entry,
        rules: {
          ...entry.rules,
          "@typescript-eslint/no-explicit-any": "off",
        },
      };
    }
    return entry;
  }),
]);
