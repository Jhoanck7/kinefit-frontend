import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    plugins: {
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      prettier: prettierPlugin,
    },
    rules: {
      // Orden de imports/exports
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Higiene de imports
      "no-duplicate-imports": "error",
      "import/no-duplicates": ["error", { "prefer-inline": true }],
      "import/first": "error",
      "import/newline-after-import": ["error", { count: 1 }],
      "import/no-useless-path-segments": ["error", { noUselessIndex: true }],

      // Integración con Prettier
      "prettier/prettier": "error",

      // Se reemplaza por un sistema de toast (pendiente); mientras tanto
      // queda como deuda a limpiar, no bloquea el dev server ni el build.
      "no-console": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
