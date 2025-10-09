import globals from "globals";
import js from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    ignores: ["node_modules", "coverage", "dist", "build"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // ES6
      globals: {
        ...globals.node, // erlaubt require, module, etc.
      },
    },
    ...js.configs.recommended,
  },
  {
    // spezielle Regeln/Umgebung für Tests
    files: [
      "**/*.test.js",
      "**/*.spec.js",
      "**/__tests__/**/*.js" // 
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, // erlaubt describe, test, expect, etc.
      },
    },
  },
];