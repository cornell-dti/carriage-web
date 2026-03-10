const { defineConfig, globalIgnores } = require("eslint/config");

const globals = require("globals");

const { fixupConfigRules, fixupPluginRules } = require("@eslint/compat");

const tsParser = require("@typescript-eslint/parser");
const promise = require("eslint-plugin-promise");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const _import = require("eslint-plugin-import");
const react = require("eslint-plugin-react");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const sharedSettings = {
  react: {
    // Avoid "React version detect" warning in a monorepo root
    version: "18.0",
  },
  "import/parsers": {
    "@typescript-eslint/parser": [".ts", ".tsx"],
  },
  "import/resolver": {
    typescript: {
      alwaysTryTypes: true,
      project: [
        "./tsconfig.base.json",
        "./server/tsconfig.json",
        "./frontend/tsconfig.json",
        "./shared/tsconfig.json",
      ],
    },
    node: true,
  },
};

const sharedRules = {
  "import/extensions": [
    "error",
    "ignorePackages",
    { js: "never", jsx: "never", ts: "never", tsx: "never" },
  ],
  "linebreak-style": "off",

  // The codebase uses the React 17+ JSX runtime (no need for `import React`)
  "react/react-in-jsx-scope": "off",
  "react/jsx-uses-react": "off",

  // Keep CI green while we gradually clean up the repo.
  "no-empty": ["warn", { allowEmptyCatch: true }],
  "no-useless-assignment": "warn",
  "no-constant-binary-expression": "warn",
  "react/jsx-key": "warn",
  "preserve-caught-error": "warn",
  "react/prop-types": "off",
  "react/no-unescaped-entities": "off",
  "react/display-name": "off",
};

const tsRules = {
  // Keep CI green while we gradually clean up the repo.
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      args: "after-used",
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ],
  "@typescript-eslint/no-unused-expressions": [
    "warn",
    { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
  ],
  "@typescript-eslint/no-empty-object-type": "warn",
  "@typescript-eslint/ban-ts-comment": "warn",

  "@typescript-eslint/explicit-function-return-type": "off",
  "@typescript-eslint/explicit-module-boundary-types": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-empty-function": "off",
  "@typescript-eslint/no-non-null-assertion": "off",
};

module.exports = defineConfig([
  // JS / JSX
  {
    files: ["**/*.{js,jsx,cjs,mjs}"],
    ignores: ["eslint.config.js", ".eslintrc.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:import/errors",
        "plugin:import/warnings",
        "prettier",
      ),
    ),
    plugins: {
      promise,
      import: fixupPluginRules(_import),
      react: fixupPluginRules(react),
    },
    rules: sharedRules,
    settings: sharedSettings,
  },

  // TS / TSX
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {},
    },
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "prettier",
      ),
    ),
    plugins: {
      promise,
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      react: fixupPluginRules(react),
    },
    rules: { ...sharedRules, ...tsRules },
    settings: sharedSettings,
  },

  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/tests/**",
    "eslint.config.js",
    ".eslintrc.js",
  ]),
]);
