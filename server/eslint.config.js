// Minimal ESLint v9 config - only shows critical syntax errors, no warnings
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')

module.exports = [
  // Base JavaScript rules - only critical syntax errors
  {
    rules: {
      'no-unreachable': 'error', // Critical unreachable code
      'no-undef': 'off', // Allow undefined (Node.js globals)
    },
  },

  // TypeScript rules - only critical errors
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Only critical TypeScript errors
      '@typescript-eslint/no-duplicate-enum-values': 'error', // Critical duplicate enum values
    },
  },

  // Node.js globals
  {
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'writable',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.js',
      '!eslint.config.js',
      'tests/',
      '__tests__/',
      '*.test.ts',
      '*.test.js',
      '*.spec.ts',
      '*.spec.js',
      'jest.config.js',
      'jest.setup.js',
      'jest.globalSetup.js',
      'jest.globalTeardown.js',
      'coverage/',
    ],
  },
]
