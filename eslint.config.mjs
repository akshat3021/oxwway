import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/app/admin/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/components/*", "*/components/*", "../components/*", "../../components/*", "../../../components/*"],
          message: "Admin code must not import public components."
        }]
      }]
    }
  },
  {
    files: ["src/components/**", "src/app/**"],
    ignores: ["src/app/admin/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/app/admin/*", "*/admin/*", "../admin/*", "../../admin/*", "../../../admin/*"],
          message: "Public code must not import admin code."
        }]
      }]
    }
  }
]);

export default eslintConfig;
