// ABOUTME: Shared test utilities for reducing duplication across test files
// ABOUTME: Provides board setup/teardown, Supabase queries, and common test actions

import type { Page } from '@playwright/test';

/**
 * Creates a new test board and navigates to it
 * Returns the board ID for cleanup
 */
export async function createTestBoard(page: Page, size: '3×3' | '4×4' | '5×5' = '3×3'): Promise<string> {
	await page.goto('/dashboard');

	// Create a new board
	await page.click('button:has-text("New Board")');
	await page.waitForSelector('input[id="board-name"]');

	const boardName = `Test Board ${Date.now()}`;
	await page.fill('input[id="board-name"]', boardName);

	// Select board size
	const sizeButton = page.locator('button').filter({ hasText: size });
	await sizeButton.click();

	// Click the Create Board button in the modal
	await page.click('button[type="submit"]:has-text("Create Board")');

	// Wait for modal to close
	await page.waitForSelector('input[id="board-name"]', { state: 'hidden', timeout: 5000 });

	// Wait for the new board to appear and click it
	await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });
	await page.click(`text=${boardName}`);

	// Wait for navigation to board page
	await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
	const url = page.url();
	const boardId = url.split('/').pop()!;

	// Wait for board to load
	await page.waitForSelector('[data-testid="goal-square"]');

	return boardId;
}

/**
 * Deletes a test board by ID
 */
export async function deleteTestBoard(page: Page, boardId: string): Promise<void> {
	await page.evaluate(async (id) => {
		// @ts-expect-error - Browser import path, works at runtime via Vite
		const supabaseModule = await import('/src/lib/supabaseClient');
		const { supabase } = supabaseModule;

		await supabase.from('boards').delete().eq('id', id);
	}, boardId);
}

/**
 * Gets the first goal ID for a board
 */
export async function getFirstGoalId(page: Page, boardId: string): Promise<string> {
	return await page.evaluate(async (id) => {
		// @ts-expect-error - Browser import path, works at runtime via Vite
		const supabaseModule = await import('/src/lib/supabaseClient');
		const { supabase } = supabaseModule;

		const { data } = await supabase.from('goals').select('id').eq('board_id', id).limit(1).single();

		return data?.id;
	}, boardId);
}

/**
 * Queries goal data from Supabase
 */
export async function getGoalData<T = any>(page: Page, goalId: string, fields: string = '*'): Promise<T | null> {
	return await page.evaluate(
		async ({ id, selectFields }) => {
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data, error } = await supabase.from('goals').select(selectFields).eq('id', id).single();

			if (error) {
				throw new Error(error.message);
			}

			return data;
		},
		{ id: goalId, selectFields: fields }
	);
}

/**
 * Opens the modal for the first goal
 */
export async function openFirstGoalModal(page: Page): Promise<void> {
	await page.getByTestId('goal-square').first().click();
	await page.waitForSelector('[data-testid="goal-modal"]');
}

/**
 * Closes the modal using Escape key
 */
export async function closeModal(page: Page): Promise<void> {
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
}

/**
 * Wait for auto-save to complete (default 600ms debounce)
 */
export async function waitForAutoSave(page: Page): Promise<void> {
	await page.waitForTimeout(600);
}

/**
 * Wait for checkbox update to complete
 */
export async function waitForCheckboxUpdate(page: Page): Promise<void> {
	await page.waitForTimeout(300);
}
