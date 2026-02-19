// ABOUTME: Tests for the welcome modal shown on empty boards
// ABOUTME: Verifies modal appears once, grid is visible, and localStorage tracking works

import { test, expect } from '@playwright/test';
import { deleteTestBoard } from './test-helpers';

test.describe('Welcome Modal on Empty Board', () => {
	let testBoardId: string;

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('shows welcome modal when board is first created and empty', async ({ page }) => {
		// Create a board from the landing page
		await page.goto('/');
		await page.waitForSelector('input[id="board-name"]');
		await page.fill('input[id="board-name"]', 'Test Empty Board');
		await page.click('button:has-text("Create 5×5 Board")');

		// Wait for navigation to board page
		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		testBoardId = page.url().split('/').pop()!;

		// Wait for board to load
		await page.waitForSelector('[data-testid="goal-square"]');

		// Verify welcome modal appears
		const welcomeModal = page.locator('[role="dialog"]', { hasText: 'Your board is ready!' });
		await expect(welcomeModal).toBeVisible();

		// Verify modal content
		await expect(welcomeModal).toContainText('You have a 5×5 grid with 25 squares ready to fill');
		await expect(welcomeModal).toContainText(
			'Click any square to add your first goal and start tracking your progress!'
		);
	});

	test('grid squares are visible when welcome modal is shown', async ({ page }) => {
		// Create a board from the landing page
		await page.goto('/');
		await page.fill('input[id="board-name"]', 'Grid Visibility Test');
		await page.click('button:has-text("Create 5×5 Board")');

		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		testBoardId = page.url().split('/').pop()!;

		// Wait for board to load
		await page.waitForSelector('[data-testid="goal-square"]');

		// Verify welcome modal is visible
		const welcomeModal = page.locator('[role="dialog"]', { hasText: 'Your board is ready!' });
		await expect(welcomeModal).toBeVisible();

		// Verify all 25 goal squares are visible (5x5 grid)
		const goalSquares = page.getByTestId('goal-square');
		await expect(goalSquares).toHaveCount(25);

		// Verify each square is visible and has the placeholder text
		const firstSquare = goalSquares.first();
		await expect(firstSquare).toBeVisible();
		await expect(firstSquare).toContainText('Click to add');
	});

	test('dismissing welcome modal saves to localStorage', async ({ page }) => {
		// Create a board
		await page.goto('/');
		await page.fill('input[id="board-name"]', 'LocalStorage Test');
		await page.click('button:has-text("Create 5×5 Board")');

		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		testBoardId = page.url().split('/').pop()!;
		await page.waitForSelector('[data-testid="goal-square"]');

		// Verify modal appears
		const welcomeModal = page.locator('[role="dialog"]', { hasText: 'Your board is ready!' });
		await expect(welcomeModal).toBeVisible();

		// Close the modal
		await page.click('button:has-text("Get Started")');

		// Verify modal is closed
		await expect(welcomeModal).not.toBeVisible();

		// Verify localStorage has the dismissed flag
		const storageKey = `welcome-modal-dismissed-${testBoardId}`;
		const isDismissed = await page.evaluate((key) => localStorage.getItem(key), storageKey);
		expect(isDismissed).toBe('true');
	});

	test('welcome modal does not appear after being dismissed once', async ({ page }) => {
		// Create a board
		await page.goto('/');
		await page.fill('input[id="board-name"]', 'No Repeat Test');
		await page.click('button:has-text("Create 5×5 Board")');

		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		testBoardId = page.url().split('/').pop()!;
		await page.waitForSelector('[data-testid="goal-square"]');

		// Close the welcome modal
		const welcomeModal = page.locator('[role="dialog"]', { hasText: 'Your board is ready!' });
		await expect(welcomeModal).toBeVisible();
		await page.click('button:has-text("Get Started")');
		await expect(welcomeModal).not.toBeVisible();

		// Reload the page
		await page.reload();
		await page.waitForSelector('[data-testid="goal-square"]');

		// Verify modal does NOT appear again
		await expect(welcomeModal).not.toBeVisible();

		// Grid should still be visible
		const goalSquares = page.getByTestId('goal-square');
		await expect(goalSquares.first()).toBeVisible();
	});

	test('welcome modal can be dismissed with Escape key', async ({ page }) => {
		// Create a board
		await page.goto('/');
		await page.fill('input[id="board-name"]', 'Escape Test');
		await page.click('button:has-text("Create 5×5 Board")');

		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		testBoardId = page.url().split('/').pop()!;
		await page.waitForSelector('[data-testid="goal-square"]');

		// Verify modal appears
		const welcomeModal = page.locator('[role="dialog"]', { hasText: 'Your board is ready!' });
		await expect(welcomeModal).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Verify modal is closed
		await expect(welcomeModal).not.toBeVisible();
	});

	test('welcome modal can be dismissed by clicking backdrop', async ({ page }) => {
		// Create a board
		await page.goto('/');
		await page.fill('input[id="board-name"]', 'Backdrop Test');
		await page.click('button:has-text("Create 5×5 Board")');

		await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
		testBoardId = page.url().split('/').pop()!;
		await page.waitForSelector('[data-testid="goal-square"]');

		// Verify modal appears
		const welcomeModal = page.locator('[role="dialog"]', { hasText: 'Your board is ready!' });
		await expect(welcomeModal).toBeVisible();

		// Click backdrop (the fixed overlay)
		const backdrop = page.locator('.fixed.inset-0').first();
		await backdrop.click({ position: { x: 10, y: 10 } });

		// Verify modal is closed
		await expect(welcomeModal).not.toBeVisible();
	});
});
