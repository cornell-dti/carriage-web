module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // project: ['./*/tsconfig.json'],
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['promise', '@typescript-eslint', 'import', 'react', 'react-hooks'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'linebreak-style': 'off',
    'object-curly-newline': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
