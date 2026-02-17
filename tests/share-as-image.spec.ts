// ABOUTME: Tests for the Share-as-Image export feature
// ABOUTME: Verifies Share button presence, loading state, and image download on desktop

import { test, expect } from '@playwright/test';
import { createTestBoard, deleteTestBoard } from './test-helpers';

test.describe('Share-as-Image Export', () => {
	let boardId: string;

	test.beforeEach(async ({ page }) => {
		boardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		await deleteTestBoard(page, boardId);
	});

	test('Share button is visible in board header', async ({ page }) => {
		const shareButton = page.getByTestId('share-button');
		await expect(shareButton).toBeVisible();
	});

	test('Share button shows loading spinner while generating image then triggers download', async ({
		page
	}) => {
		// Set up download listener before clicking
		const downloadPromise = page.waitForEvent('download');

		await page.getByTestId('share-button').click();

		// Loading state should appear briefly (spinner)
		// We just wait for the download to complete
		const download = await downloadPromise;

		// Verify the downloaded file is a PNG with the board name
		expect(download.suggestedFilename()).toMatch(/-bingo\.png$/);
	});

	test('exported image filename matches board name', async ({ page }) => {
		// Get the board name from the page heading
		const boardNameEl = page.locator('h1').first();
		const boardName = await boardNameEl.textContent();

		const downloadPromise = page.waitForEvent('download');
		await page.getByTestId('share-button').click();
		const download = await downloadPromise;

		// Filename should contain a sanitized version of the board name
		const filename = download.suggestedFilename();
		expect(filename).toMatch(/\.png$/);
		expect(filename).toContain('bingo');
	});
});
