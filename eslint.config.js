// ABOUTME: ESLint configuration for SvelteKit with TypeScript
// ABOUTME: Provides linting rules for JavaScript, TypeScript, and Svelte files
import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';

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
				// Browser globals
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				localStorage: 'readonly',
				sessionStorage: 'readonly',
				alert: 'readonly',
				crypto: 'readonly',
				// Node globals
				process: 'readonly',
				// TypeScript types (these are compile-time only, not runtime)
				HTMLElement: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLDivElement: 'readonly',
				MouseEvent: 'readonly',
				KeyboardEvent: 'readonly',
				SubmitEvent: 'readonly',
				Event: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': ts
		},
		rules: {
			...ts.configs.recommended.rules,
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
				// Browser globals
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				localStorage: 'readonly',
				sessionStorage: 'readonly',
				alert: 'readonly',
				crypto: 'readonly',
				// TypeScript types
				HTMLElement: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLDivElement: 'readonly',
				MouseEvent: 'readonly',
				KeyboardEvent: 'readonly',
				SubmitEvent: 'readonly',
				Event: 'readonly'
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
