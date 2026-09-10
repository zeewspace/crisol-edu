import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  security.configs.recommended,
  {
    rules: {
      // edu- constraints: teachable limits for beginners
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-lines": ["warn", { max: 250, skipBlankLines: true, skipComments: true }],
      complexity: ["warn", 10],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "security/detect-object-injection": "off"
    }
  },
  globalIgnores([".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts", "coverage/**"])
]);

export default eslintConfig;
