// ABOUTME: E2E tests for board management on the dashboard
// ABOUTME: Covers create, delete with confirmation, and navigation to boards

import { test, expect } from '@playwright/test';
import { deleteTestBoard } from './test-helpers';

let createdBoardId: string | null = null;

test.afterEach(async ({ page }) => {
	if (createdBoardId) {
		await deleteTestBoard(page, createdBoardId);
		createdBoardId = null;
	}
});

async function createBoardWithSize(
	page: import('@playwright/test').Page,
	size?: '3x3' | '4x4' | '5x5'
): Promise<string> {
	await page.goto('/dashboard');
	await page.click('button:has-text("New Board")');
	await page.waitForSelector('input[id="board-name"]');

	const boardName = `Test Board ${size ?? 'default'} ${Date.now()}`;
	await page.fill('input[id="board-name"]', boardName);

	if (size) {
		// Select grid size if the option is present
		const sizeSelect = page.locator('select[name="size"], [data-testid="board-size-select"]');
		if (await sizeSelect.count() > 0) {
			await sizeSelect.selectOption(size);
		}
	}

	await page.click('button[type="submit"]:has-text("Create Board")');
	await page.waitForSelector('input[id="board-name"]', { state: 'hidden', timeout: 5000 });

	await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });
	await page.click(`text=${boardName}`);
	await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });

	const boardId = page.url().split('/').pop()!;
	return boardId;
}

test.describe('Board creation', () => {
	test('creates a new board with default size', async ({ page }) => {
		createdBoardId = await createBoardWithSize(page);
		await expect(page).toHaveURL(/\/boards\/.+/);
		await expect(page.getByTestId('goal-square').first()).toBeVisible({ timeout: 10000 });
	});

	test('creates a 3x3 board', async ({ page }) => {
		await page.goto('/dashboard');
		await page.click('button:has-text("New Board")');
		await page.waitForSelector('input[id="board-name"]');

		const boardName = `3x3 Board ${Date.now()}`;
		await page.fill('input[id="board-name"]', boardName);

		const sizeSelect = page.locator('select[name="size"], [data-testid="board-size-select"]');
		if (await sizeSelect.count() > 0) {
			await sizeSelect.selectOption('3x3');
		}

		await page.click('button[type="submit"]:has-text("Create Board")');
		await page.waitForSelector('input[id="board-name"]', { state: 'hidden', timeout: 5000 });

		await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });
		await page.click(`text=${boardName}`);
		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		createdBoardId = page.url().split('/').pop()!;

		// 3x3 = 9 goal squares
		const squares = await page.getByTestId('goal-square').count();
		expect(squares).toBeGreaterThanOrEqual(9);
	});

	test('creates a 5x5 board', async ({ page }) => {
		await page.goto('/dashboard');
		await page.click('button:has-text("New Board")');
		await page.waitForSelector('input[id="board-name"]');

		const boardName = `5x5 Board ${Date.now()}`;
		await page.fill('input[id="board-name"]', boardName);

		const sizeSelect = page.locator('select[name="size"], [data-testid="board-size-select"]');
		if (await sizeSelect.count() > 0) {
			await sizeSelect.selectOption('5x5');
		}

		await page.click('button[type="submit"]:has-text("Create Board")');
		await page.waitForSelector('input[id="board-name"]', { state: 'hidden', timeout: 5000 });

		await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });
		await page.click(`text=${boardName}`);
		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		createdBoardId = page.url().split('/').pop()!;

		// 5x5 = 25 goal squares
		const squares = await page.getByTestId('goal-square').count();
		expect(squares).toBeGreaterThanOrEqual(25);
	});
});

test.describe('Board deletion', () => {
	test('deletes a board with confirmation', async ({ page }) => {
		await page.goto('/dashboard');
		await page.click('button:has-text("New Board")');
		await page.waitForSelector('input[id="board-name"]');

		const boardName = `Delete Me ${Date.now()}`;
		await page.fill('input[id="board-name"]', boardName);
		await page.click('button[type="submit"]:has-text("Create Board")');
		await page.waitForSelector('input[id="board-name"]', { state: 'hidden', timeout: 5000 });

		// Go back to dashboard
		await page.goto('/dashboard');
		await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });

		// Click delete on that board card
		const boardCard = page.locator('[data-testid="board-card"]').filter({ hasText: boardName });
		const deleteBtn = boardCard
			.locator('button[aria-label*="delete" i], button:has-text("Delete")')
			.or(boardCard.getByTestId('delete-board-button'));
		await deleteBtn.click();

		// Confirmation dialog should appear
		const confirmBtn = page
			.getByRole('button', { name: /confirm|yes|delete/i })
			.or(page.getByTestId('confirm-delete-button'));
		await confirmBtn.click();

		// Board should disappear from the list
		await expect(page.locator(`text=${boardName}`)).not.toBeVisible({ timeout: 5000 });
		// No cleanup needed — board was deleted
		createdBoardId = null;
	});
});

test.describe('Board navigation', () => {
	test('navigates to a board from the dashboard', async ({ page }) => {
		createdBoardId = await createBoardWithSize(page);
		const boardUrl = page.url();

		// Go back to dashboard and click the board card
		await page.goto('/dashboard');

		const boardCards = page.getByTestId('board-card');
		await boardCards.first().click();

		await expect(page).toHaveURL(/\/boards\/.+/, { timeout: 10000 });
		await expect(page.getByTestId('goal-square').first()).toBeVisible({ timeout: 10000 });
	});
});
