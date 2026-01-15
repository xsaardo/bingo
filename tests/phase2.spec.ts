import { test, expect } from '@playwright/test';

test.describe('Phase 2: State & Persistence', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage before each test
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('should create a 3x3 board', async ({ page }) => {
		await page.goto('/');

		// Click the 3x3 button
		await page.click('button:has-text("3×3")');

		// Verify 9 goal squares are created
		const squares = await page.locator('[role="button"]').count();
		expect(squares).toBe(9);
	});

	test('should create a 4x4 board', async ({ page }) => {
		await page.goto('/');

		// Click the 4x4 button
		await page.click('button:has-text("4×4")');

		// Verify 16 goal squares are created
		const squares = await page.locator('[role="button"]').count();
		expect(squares).toBe(16);
	});

	test('should create a 5x5 board', async ({ page }) => {
		await page.goto('/');

		// Click the 5x5 button
		await page.click('button:has-text("5×5")');

		// Verify 25 goal squares are created
		const squares = await page.locator('[role="button"]').count();
		expect(squares).toBe(25);
	});

	test('should edit goal title and notes', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');

		// Click the first goal square to open modal
		await page.locator('[role="button"]').first().click();

		// Wait for modal to appear
		await expect(page.locator('h2:has-text("Edit Goal")')).toBeVisible();

		// Enter title and notes
		await page.fill('#goal-title', 'Learn TypeScript');
		await page.fill('#goal-notes', 'Complete the official TypeScript tutorial');

		// Save the goal
		await page.click('button:has-text("Save")');

		// Verify the goal title is displayed
		await expect(page.locator('text=Learn TypeScript').first()).toBeVisible();
	});

	test('should toggle goal completion', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');

		// Add a goal first
		await page.locator('[role="button"]').first().click();
		await page.fill('#goal-title', 'Test Goal');
		await page.click('button:has-text("Save")');

		// Find and click the checkbox
		const checkbox = page.locator('[role="button"]').first().locator('button').first();
		await checkbox.click();

		// Verify the goal square has completed styling (green background)
		const goalSquare = page.locator('[role="button"]').first();
		await expect(goalSquare).toHaveClass(/bg-green-50/);
	});

	test('should persist board to localStorage', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');

		// Add a goal
		await page.locator('[role="button"]').first().click();
		await page.fill('#goal-title', 'Persistent Goal');
		await page.fill('#goal-notes', 'This should persist');
		await page.click('button:has-text("Save")');

		// Check localStorage
		const savedData = await page.evaluate(() => {
			return localStorage.getItem('bingo-board');
		});

		expect(savedData).toBeTruthy();
		const board = JSON.parse(savedData!);
		expect(board.size).toBe(3);
		expect(board.goals[0].title).toBe('Persistent Goal');
		expect(board.goals[0].notes).toBe('This should persist');
	});

	test('should load board from localStorage on refresh', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board with a goal
		await page.click('button:has-text("3×3")');
		await page.locator('[role="button"]').first().click();
		await page.fill('#goal-title', 'Reload Test');
		await page.click('button:has-text("Save")');

		// Reload the page
		await page.reload();

		// Verify the board is restored
		await expect(page.locator('text=Reload Test').first()).toBeVisible();
		const squares = await page.locator('[role="button"]').count();
		expect(squares).toBe(9);
	});

	test('should auto-save when completing a goal', async ({ page }) => {
		await page.goto('/');

		// Create a board and add a goal
		await page.click('button:has-text("3×3")');
		await page.locator('[role="button"]').first().click();
		await page.fill('#goal-title', 'Auto-save Test');
		await page.click('button:has-text("Save")');

		// Toggle completion
		const checkbox = page.locator('[role="button"]').first().locator('button').first();
		await checkbox.click();

		// Wait a bit for auto-save
		await page.waitForTimeout(100);

		// Check localStorage was updated with completed status
		const savedData = await page.evaluate(() => {
			return localStorage.getItem('bingo-board');
		});

		const board = JSON.parse(savedData!);
		expect(board.goals[0].completed).toBe(true);
	});

	test('should show notes indicator when goal has notes', async ({ page }) => {
		await page.goto('/');

		// Create a board
		await page.click('button:has-text("3×3")');

		// Add a goal with notes
		await page.locator('[role="button"]').first().click();
		await page.fill('#goal-title', 'Goal with Notes');
		await page.fill('#goal-notes', 'These are my notes');
		await page.click('button:has-text("Save")');

		// Verify notes indicator (📝) is visible
		const goalSquare = page.locator('[role="button"]').first();
		await expect(goalSquare.locator('text=📝')).toBeVisible();
	});

	test('should update goal and auto-save changes', async ({ page }) => {
		await page.goto('/');

		// Create a board with a goal
		await page.click('button:has-text("3×3")');
		await page.locator('[role="button"]').first().click();
		await page.fill('#goal-title', 'Original Title');
		await page.click('button:has-text("Save")');

		// Edit the goal
		await page.locator('text=Original Title').click();
		await page.fill('#goal-title', 'Updated Title');
		await page.fill('#goal-notes', 'Added notes');
		await page.click('button:has-text("Save")');

		// Verify changes are displayed
		await expect(page.locator('text=Updated Title').first()).toBeVisible();

		// Verify auto-save worked
		const savedData = await page.evaluate(() => {
			return localStorage.getItem('bingo-board');
		});

		const board = JSON.parse(savedData!);
		expect(board.goals[0].title).toBe('Updated Title');
		expect(board.goals[0].notes).toBe('Added notes');
	});
});
