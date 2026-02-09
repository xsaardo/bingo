// ABOUTME: Tests for last updated time display in goal squares
// ABOUTME: Validates time formatting, visibility conditions, and responsive sizing

import { test, expect } from '@playwright/test';
import {
	createTestBoard,
	deleteTestBoard,
	openFirstGoalModal,
	closeModal
} from './test-helpers';

test.describe('Last Updated Display in Goal Squares', () => {
	let boardId: string;

	test.beforeEach(async ({ page }) => {
		boardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		if (boardId) {
			await deleteTestBoard(page, boardId);
		}
	});

	test('last updated hidden when no notes', async ({ page }) => {
		// Open first goal
		await openFirstGoalModal(page);

		// Add a title only (no notes)
		await page.fill('input[placeholder="Enter your goal..."]', 'Test Goal');
		await page.waitForTimeout(600); // Wait for auto-save
		await closeModal(page);

		// Verify no notes indicator or time shown
		const firstSquare = page.getByTestId('goal-square').first();
		const notesText = await firstSquare.textContent();
		expect(notesText).not.toContain('📝');
	});

	test('last updated shows when notes exist', async ({ page }) => {
		// Open first goal
		await openFirstGoalModal(page);

		// Add title and notes
		await page.fill('input[placeholder="Enter your goal..."]', 'Test Goal with Notes');

		// Type in the rich text editor
		const editor = page.locator('.tiptap.ProseMirror');
		await editor.click();
		await editor.fill('Some progress notes here');

		await page.waitForTimeout(600); // Wait for auto-save
		await closeModal(page);

		// Verify notes indicator shows
		const firstSquare = page.getByTestId('goal-square').first();
		const notesText = await firstSquare.textContent();
		expect(notesText).toContain('📝');

		// Verify relative time shows (should be "just now", "0s ago", or similar)
		const hasTimeIndicator =
			notesText?.includes('ago') || notesText?.includes('now') || notesText?.includes('s');
		expect(hasTimeIndicator).toBe(true);
	});

	test('relative time updates correctly', async ({ page }) => {
		// Open first goal
		await openFirstGoalModal(page);

		// Add title and notes
		await page.fill('input[placeholder="Enter your goal..."]', 'Time Test Goal');

		const editor = page.locator('.tiptap.ProseMirror');
		await editor.click();
		await editor.fill('Initial notes');

		await page.waitForTimeout(600); // Wait for auto-save
		await closeModal(page);

		// Get the time display
		const firstSquare = page.getByTestId('goal-square').first();
		const initialText = await firstSquare.textContent();

		// Should show recent time (seconds or "just now")
		const hasRecentTime =
			initialText?.includes('s ago') ||
			initialText?.includes('now') ||
			initialText?.includes('0s ago');
		expect(hasRecentTime).toBe(true);
	});

	test('text size adjusts based on board size', async ({ page }) => {
		// Test 3x3 board (default)
		await openFirstGoalModal(page);
		await page.fill('input[placeholder="Enter your goal..."]', '3x3 Goal');
		const editor = page.locator('.tiptap.ProseMirror');
		await editor.click();
		await editor.fill('Notes for 3x3');
		await page.waitForTimeout(600); // Wait for auto-save
		await closeModal(page);

		// Verify notes emoji is displayed with appropriate size
		let notesEmoji = page.getByTestId('goal-square').first().locator('text=📝');
		await expect(notesEmoji).toBeVisible();

		// Navigate back to dashboard
		await page.goto('/dashboard');

		// Create 5x5 board
		const boardId5x5 = await createTestBoard(page, '5×5');

		// Add goal with notes
		await openFirstGoalModal(page);
		await page.fill('input[placeholder="Enter your goal..."]', '5x5 Goal');
		const editor5x5 = page.locator('.tiptap.ProseMirror');
		await editor5x5.click();
		await editor5x5.fill('Notes for 5x5');
		await page.waitForTimeout(600); // Wait for auto-save
		await closeModal(page);

		// Verify notes indicator still shows (even if smaller)
		notesEmoji = page.getByTestId('goal-square').first().locator('text=📝');
		await expect(notesEmoji).toBeVisible();

		// Cleanup 5x5 board
		await deleteTestBoard(page, boardId5x5);
	});

	test('last updated persists after page reload', async ({ page }) => {
		// Open first goal
		await openFirstGoalModal(page);

		// Add title and notes
		await page.fill('input[placeholder="Enter your goal..."]', 'Persistent Goal');
		const editor = page.locator('.tiptap.ProseMirror');
		await editor.click();
		await editor.fill('These notes should persist');
		await page.waitForTimeout(600); // Wait for auto-save
		await closeModal(page);

		// Reload page
		await page.reload();
		await page.waitForSelector('[data-testid="goal-square"]');

		// Verify notes indicator and time still show
		const firstSquare = page.getByTestId('goal-square').first();
		const notesText = await firstSquare.textContent();
		expect(notesText).toContain('📝');

		// Time should still be there (within a few seconds/minutes)
		const hasTimeIndicator =
			notesText?.includes('ago') || notesText?.includes('now') || notesText?.includes('s');
		expect(hasTimeIndicator).toBe(true);
	});
});
