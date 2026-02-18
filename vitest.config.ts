// ABOUTME: Vitest configuration for unit tests
// ABOUTME: Separate from vite.config.ts to avoid TypeScript conflicts

import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
