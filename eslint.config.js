import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginSecurity from "eslint-plugin-security";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "public/**",
      "dist/**",
      "build/**",
      "run/**",
      ".cache/**",
      ".vite/**",
      "tests/**",
      "**/__snapshots__/**",
      ".env",
      "*.log",
      ".vscode/**"
    ]
  },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  {
    // Register additional plugins so rules referenced via inline disables exist
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { security: pluginSecurity, sonarjs: pluginSonarjs, "react-hooks": pluginReactHooks }
  },
  {
    settings: {
      react: {
        version: "18.2"
      }
    }
  },
  // Node-specific files (build scripts, config files)
  {
    files: ["scripts/**", "**/*.cjs", "clear-db.js"],
    languageOptions: { globals: globals.node }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  // Project-specific rule overrides
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "ignoreRestSiblings": true }
      ],
      "react/prop-types": "off"
    }
  }
  ,
  // Tests: allow `any` in test files (many tests use helpers typed as any)
  {
    files: ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx", "src/test/**", "src/**/__tests__/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);

