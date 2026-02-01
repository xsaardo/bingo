// ABOUTME: Integration tests for Phase 2 - Data Model Updates
// ABOUTME: Tests new Goal fields (date metadata, milestones array) with Supabase persistence

import { test, expect } from '@playwright/test';

test.describe('Phase 2: Enhanced Data Model', () => {
	let testBoardId: string;

	// Create a fresh test board before each test
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

		// Click the Create Board button in the modal
		await page.click('button[type="submit"]:has-text("Create Board")');

		// Wait for modal to close (board created successfully)
		await page.waitForSelector('input[id="board-name"]', { state: 'hidden', timeout: 5000 });

		// Wait for the new board to appear in the list
		await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });

		// Click on the newly created board to open it
		await page.click(`text=${boardName}`);

		// Wait for navigation to board page
		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		const url = page.url();
		testBoardId = url.split('/').pop()!;

		// Wait for board to load
		await page.waitForSelector('[data-testid="goal-square"]');
	});

	// Clean up test board after each test
	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			// Delete the test board via Supabase
			await page.evaluate(async (boardId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				// Delete the board (goals and milestones will cascade delete)
				await supabase.from('boards').delete().eq('id', boardId);
			}, testBoardId);
		}
	});

	test('new goal has correct default date fields', async ({ page }) => {
		// Check via Supabase directly
		const goalStructure = await page.evaluate(async (boardId) => {
			// Use dynamic import with browser-compatible path
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data, error } = await supabase
				.from('goals')
				.select('*')
				.eq('board_id', boardId)
				.limit(1)
				.single();

			if (error || !data) {
				return { error: error?.message || 'No data' };
			}

			// Verify structure
			return {
				hasStartedAt: data.started_at === null, // Should be null initially
				hasCompletedAt: data.completed_at === null, // Should be null initially
				hasLastUpdatedAt: typeof data.last_updated_at === 'string', // Should exist
				// Note: milestones will be loaded separately in later phases
			};
		}, testBoardId);

		// Type guard to check for error
		if ('error' in goalStructure) {
			throw new Error(`Failed to fetch goal: ${goalStructure.error}`);
		}

		expect(goalStructure.hasStartedAt).toBe(true);
		expect(goalStructure.hasCompletedAt).toBe(true);
		expect(goalStructure.hasLastUpdatedAt).toBe(true);
	});

	test('date fields persist after page reload', async ({ page }) => {
		// Get initial lastUpdatedAt
		const initialData = await page.evaluate(async (boardId) => {
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data } = await supabase
				.from('goals')
				.select('last_updated_at')
				.eq('board_id', boardId)
				.limit(1)
				.single();

			return data?.last_updated_at;
		}, testBoardId);

		// Reload the page
		await page.reload();
		await page.waitForSelector('[data-testid="goal-square"]');

		// Get lastUpdatedAt after reload
		const afterReloadData = await page.evaluate(async (boardId) => {
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data } = await supabase
				.from('goals')
				.select('last_updated_at, started_at, completed_at')
				.eq('board_id', boardId)
				.limit(1)
				.single();

			return data;
		}, testBoardId);

		// Verify persistence
		expect(afterReloadData).toBeTruthy();
		expect(afterReloadData!.last_updated_at).toBe(initialData);
		expect(afterReloadData!.started_at).toBe(null);
		expect(afterReloadData!.completed_at).toBe(null);
	});

	test('goals load without errors with new data model', async ({ page }) => {
		// Monitor console for errors
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Verify board loaded correctly
		const goalCount = await page.getByTestId('goal-square').count();
		expect(goalCount).toBe(9); // 3x3 board

		// Verify no console errors
		expect(consoleErrors).toHaveLength(0);
	});

	test('can create, edit, and complete goals with new data model', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Open sidebar for first goal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Edit title
		const titleInput = page.locator('input').first();
		await titleInput.fill('Test Goal Title');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Close sidebar
		await page.keyboard.press('Escape');
		await page.waitForTimeout(200);

		// Verify title is displayed
		await expect(page.locator('text=Test Goal Title').first()).toBeVisible();

		// Toggle completion
		await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();

		// Wait for update
		await page.waitForTimeout(300);

		// Verify completed styling
		const goalSquare = page.getByTestId('goal-square').first();
		await expect(goalSquare).toHaveClass(/bg-green-50/);

		// Verify no console errors occurred
		expect(consoleErrors).toHaveLength(0);
	});
});

