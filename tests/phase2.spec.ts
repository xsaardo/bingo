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

		// Wait for board to render and verify 9 goal squares are created
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
	});

	test('should create a 4x4 board', async ({ page }) => {
		await page.goto('/');

		// Click the 4x4 button
		await page.click('button:has-text("4×4")');

		// Wait for board to render and verify 16 goal squares are created
		await expect(page.getByTestId('goal-square')).toHaveCount(16);
	});

	test('should create a 5x5 board', async ({ page }) => {
		await page.goto('/');

		// Click the 5x5 button
		await page.click('button:has-text("5×5")');

		// Wait for board to render and verify 25 goal squares are created
		await expect(page.getByTestId('goal-square')).toHaveCount(25);
	});

	test('should edit goal title and notes', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');

		// Wait for board to render, then click the first goal square to open sidebar
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
		await page.getByTestId('goal-square').first().click();

		// Wait for sidebar to appear
		await expect(page.locator('h2:has-text("Goal Details")')).toBeVisible();

		// Enter title and notes
		await page.fill('#sidebar-goal-title', 'Learn TypeScript');
		await page.fill('#sidebar-goal-notes', 'Complete the official TypeScript tutorial');

		// Wait for auto-save (500ms debounce + buffer)
		await page.waitForTimeout(600);

		// Close sidebar
		await page.getByTestId('close-sidebar-button').click();

		// Verify the goal title is displayed
		await expect(page.locator('text=Learn TypeScript').first()).toBeVisible();
	});

	test('should toggle goal completion', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');

		// Wait for board to render, then add a goal first
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
		await page.getByTestId('goal-square').first().click();
		await page.fill('#sidebar-goal-title', 'Test Goal');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Close sidebar
		await page.getByTestId('close-sidebar-button').click();

		// Find and click the checkbox
		const checkbox = page.getByTestId('goal-square').first().getByTestId('goal-checkbox');
		await checkbox.click();

		// Verify the goal square has completed styling (green background)
		const goalSquare = page.getByTestId('goal-square').first();
		await expect(goalSquare).toHaveClass(/bg-green-50/);
	});

	test('should persist board to localStorage', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');

		// Wait for board to render, then add a goal
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
		await page.getByTestId('goal-square').first().click();
		await page.fill('#sidebar-goal-title', 'Persistent Goal');
		await page.fill('#sidebar-goal-notes', 'This should persist');

		// Wait for auto-save
		await page.waitForTimeout(600);

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
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
		await page.getByTestId('goal-square').first().click();
		await page.fill('#sidebar-goal-title', 'Reload Test');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Reload the page
		await page.reload();

		// Verify the board is restored
		await expect(page.locator('text=Reload Test').first()).toBeVisible();
		const squares = await page.getByTestId('goal-square').count();
		expect(squares).toBe(9);
	});

	test('should auto-save when completing a goal', async ({ page }) => {
		await page.goto('/');

		// Create a board and add a goal
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
		await page.getByTestId('goal-square').first().click();
		await page.fill('#sidebar-goal-title', 'Auto-save Test');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Close sidebar
		await page.getByTestId('close-sidebar-button').click();

		// Toggle completion
		const checkbox = page.getByTestId('goal-square').first().getByTestId('goal-checkbox');
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

		// Wait for board to render, then add a goal with notes
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
		await page.getByTestId('goal-square').first().click();
		await page.fill('#sidebar-goal-title', 'Goal with Notes');
		await page.fill('#sidebar-goal-notes', 'These are my notes');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Close sidebar
		await page.getByTestId('close-sidebar-button').click();

		// Verify notes indicator (📝) is visible
		const goalSquare = page.getByTestId('goal-square').first();
		await expect(goalSquare.locator('text=📝')).toBeVisible();
	});

	test('should update goal and auto-save changes', async ({ page }) => {
		await page.goto('/');

		// Create a board with a goal
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
		await page.getByTestId('goal-square').first().click();
		await page.fill('#sidebar-goal-title', 'Original Title');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Close sidebar
		await page.getByTestId('close-sidebar-button').click();

		// Edit the goal
		await page.locator('text=Original Title').click();

		// Clear and update the title
		await page.fill('#sidebar-goal-title', 'Updated Title');
		await page.fill('#sidebar-goal-notes', 'Added notes');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Close sidebar
		await page.getByTestId('close-sidebar-button').click();

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
