// ABOUTME: Integration tests for DateMetadata component
// ABOUTME: Tests date rendering, hiding null dates, and formatting

import { test, expect } from '@playwright/test';

test.describe('DateMetadata Component', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		await page.goto('/dashboard');

		// Create a new board
		await page.click('button:has-text("New Board")');
		await page.waitForSelector('input[id="board-name"]');

		const boardName = `Test Board ${Date.now()}`;
		await page.fill('input[id="board-name"]', boardName);

		// Select 3x3 size
		const size3Button = page.locator('button').filter({ hasText: '3×3' });
		await size3Button.click();

		// Click the Create Board button
		await page.click('button[type="submit"]:has-text("Create Board")');

		// Wait for modal to close
		await page.waitForSelector('input[id="board-name"]', { state: 'hidden', timeout: 5000 });

		// Wait for the new board to appear and click it
		await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });
		await page.click(`text=${boardName}`);

		// Wait for navigation to board page
		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		const url = page.url();
		testBoardId = url.split('/').pop()!;

		// Wait for board to load
		await page.waitForSelector('[data-testid="goal-square"]');
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await page.evaluate(async (boardId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				await supabase.from('boards').delete().eq('id', boardId);
			}, testBoardId);
		}
	});

	test('shows lastUpdatedAt for new goals', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Check that last updated is visible
		const lastUpdatedText = await page.locator('text=Last updated:').textContent();
		expect(lastUpdatedText).toBeTruthy();
	});

	test('shows startedAt after first edit', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Initially, startedAt should not be visible
		const startedBefore = await page.locator('text=Started:').count();
		expect(startedBefore).toBe(0);

		// Edit title
		const titleInput = page.locator('input').first();
		await titleInput.fill('My Goal');
		await page.waitForTimeout(600); // Wait for auto-save

		// Close modal to save and refresh data
		await page.locator('[data-testid="close-modal-button"]').click();
		await page.waitForTimeout(200);

		// Reopen modal to see updated data
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Now startedAt should be visible
		const startedAfter = await page.locator('text=Started:').count();
		expect(startedAfter).toBe(1);

		// Verify the date format (MMM d, yyyy)
		const startedText = await page
			.locator('text=Started:')
			.locator('..')
			.locator('.font-medium')
			.textContent();
		expect(startedText).toMatch(/\w+ \d{1,2}, \d{4}/);
	});

	test('shows completedAt when goal is completed', async ({ page }) => {
		// Mark goal as complete
		await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
		await page.waitForTimeout(300);

		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// CompletedAt should be visible
		const completedCount = await page.locator('text=Completed:').count();
		expect(completedCount).toBe(1);

		// Verify the date format and green color
		const completedText = await page
			.locator('text=Completed:')
			.locator('..')
			.locator('.font-medium')
			.textContent();
		expect(completedText).toMatch(/\w+ \d{1,2}, \d{4}/);

		// Check for green text color
		const completedElement = await page
			.locator('text=Completed:')
			.locator('..')
			.locator('.font-medium');
		const className = await completedElement.getAttribute('class');
		expect(className).toContain('text-green-600');
	});

	test('hides completedAt when goal is uncompleted', async ({ page }) => {
		// Mark goal as complete
		await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
		await page.waitForTimeout(300);

		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// CompletedAt should be visible
		let completedCount = await page.locator('text=Completed:').count();
		expect(completedCount).toBe(1);

		// Unmark as complete via the checkbox in the modal
		const modalCheckbox = page.locator('[data-testid="modal-checkbox"]');
		await modalCheckbox.click();
		await page.waitForTimeout(300);

		// Close modal by clicking the close button
		await page.locator('[data-testid="close-modal-button"]').click();
		await page.waitForTimeout(200);

		// Reopen modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// CompletedAt should not be visible
		completedCount = await page.locator('text=Completed:').count();
		expect(completedCount).toBe(0);
	});

	test('formats lastUpdatedAt as relative time', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Get the last updated text
		const lastUpdatedText = await page
			.locator('text=Last updated:')
			.locator('..')
			.locator('.font-medium')
			.textContent();

		// Should be in relative format (e.g., "2m ago", "1h ago")
		expect(lastUpdatedText).toMatch(/(m|h|d|mo) ago/);
	});
});
