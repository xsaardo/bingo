// ABOUTME: Unit tests for date formatting utility functions
// ABOUTME: Tests formatRelativeTime function for proper date formatting

import { test, expect } from '@playwright/test';

test.describe('Date Formatting Utilities', () => {
	test.describe('formatRelativeTime', () => {
		test('formats minutes correctly', async ({ page }) => {
			await page.goto('/dashboard');
			const result = await page.evaluate(() => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const dateUtils = import('/src/lib/utils/dates');
				return dateUtils.then((module) => {
					const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
					return module.formatRelativeTime(twoMinutesAgo);
				});
			});

			expect(result).toMatch(/2m ago/);
		});

		test('formats hours correctly', async ({ page }) => {
			await page.goto('/dashboard');
			const result = await page.evaluate(() => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const dateUtils = import('/src/lib/utils/dates');
				return dateUtils.then((module) => {
					const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
					return module.formatRelativeTime(oneHourAgo);
				});
			});

			expect(result).toMatch(/1h ago/);
		});

		test('formats days correctly', async ({ page }) => {
			await page.goto('/dashboard');
			const result = await page.evaluate(() => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const dateUtils = import('/src/lib/utils/dates');
				return dateUtils.then((module) => {
					const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
					return module.formatRelativeTime(fiveDaysAgo);
				});
			});

			expect(result).toMatch(/5d ago/);
		});

		test('formats months correctly', async ({ page }) => {
			await page.goto('/dashboard');
			const result = await page.evaluate(() => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const dateUtils = import('/src/lib/utils/dates');
				return dateUtils.then((module) => {
					const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
					return module.formatRelativeTime(threeMonthsAgo);
				});
			});

			expect(result).toMatch(/3mo ago/);
		});

		test('handles "less than a minute" case correctly', async ({ page }) => {
			await page.goto('/dashboard');
			const result = await page.evaluate(() => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const dateUtils = import('/src/lib/utils/dates');
				return dateUtils.then((module) => {
					const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();
					return module.formatRelativeTime(tenSecondsAgo);
				});
			});

			// Should show "10s ago", NOT "less than am ago"
			expect(result).not.toContain('less than am ago');
			expect(result).toMatch(/\d+s ago/);
		});
	});
});
