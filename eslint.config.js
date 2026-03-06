// ABOUTME: ESLint configuration for SvelteKit with TypeScript
// ABOUTME: Provides linting rules for JavaScript, TypeScript, and Svelte files
import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';
import security from 'eslint-plugin-security';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': ts,
      security
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...security.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte']
      },
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      svelte
    },
    rules: {
      ...svelte.configs.recommended.rules,
      'no-unused-vars': 'off' // Disable base rule for Svelte files, rely on TypeScript rule
    }
  },
  {
    ignores: [
      '.svelte-kit/**',
      'build/**',
      'node_modules/**',
      '**/*.config.js',
      'playwright.config.ts'
    ]
  },
  prettier
];
