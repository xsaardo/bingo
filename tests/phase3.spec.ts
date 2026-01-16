import { test, expect } from '@playwright/test';

test.describe('Phase 3: Bingo Detection & Visual Feedback', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage before each test
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('should detect horizontal bingo (top row)', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Add and complete first three goals (top row)
		for (let i = 0; i < 3; i++) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			// Toggle completion
			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify BINGO banner appears
		await expect(page.locator('text=🎉 BINGO! 🎉')).toBeVisible();
		await expect(page.locator('text=You completed 1 line!')).toBeVisible();
	});

	test('should detect vertical bingo (first column)', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Add and complete first column (indices 0, 3, 6)
		const columnIndices = [0, 3, 6];
		for (const i of columnIndices) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify BINGO banner appears
		await expect(page.locator('text=🎉 BINGO! 🎉')).toBeVisible();
		await expect(page.locator('text=You completed 1 line!')).toBeVisible();
	});

	test('should detect diagonal bingo (top-left to bottom-right)', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Add and complete diagonal (indices 0, 4, 8)
		const diagonalIndices = [0, 4, 8];
		for (const i of diagonalIndices) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify BINGO banner appears
		await expect(page.locator('text=🎉 BINGO! 🎉')).toBeVisible();
	});

	test('should detect diagonal bingo (top-right to bottom-left)', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Add and complete diagonal (indices 2, 4, 6)
		const diagonalIndices = [2, 4, 6];
		for (const i of diagonalIndices) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify BINGO banner appears
		await expect(page.locator('text=🎉 BINGO! 🎉')).toBeVisible();
	});

	test('should highlight winning squares with yellow border', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Complete top row
		for (let i = 0; i < 3; i++) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify winning squares have yellow highlighting
		for (let i = 0; i < 3; i++) {
			const winningSquare = page.getByTestId('goal-square').nth(i);
			await expect(winningSquare).toHaveClass(/bg-yellow-50/);
			await expect(winningSquare).toHaveClass(/border-yellow-500/);
		}
	});

	test('should detect multiple bingos and update count', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Complete all squares
		for (let i = 0; i < 9; i++) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Should have multiple lines (3 rows + 3 columns + 2 diagonals = 8 lines)
		await expect(page.locator('text=You completed 8 lines!')).toBeVisible();
	});

	test('should remove bingo when uncompleting a goal', async ({ page }) => {
		await page.goto('/');

		// Create a 3x3 board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Complete top row
		for (let i = 0; i < 3; i++) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify BINGO appears
		await expect(page.locator('text=🎉 BINGO! 🎉')).toBeVisible();

		// Uncomplete one goal
		const checkbox = page.getByTestId('goal-square').first().getByTestId('goal-checkbox');
		await checkbox.click();

		// BINGO banner should disappear
		await expect(page.locator('text=🎉 BINGO! 🎉')).not.toBeVisible();
	});

	test('should work with 4x4 board', async ({ page }) => {
		await page.goto('/');

		// Create a 4x4 board
		await page.click('button:has-text("4×4")');
		await expect(page.getByTestId('goal-square')).toHaveCount(16);

		// Complete top row (indices 0-3)
		for (let i = 0; i < 4; i++) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify BINGO banner appears
		await expect(page.locator('text=🎉 BINGO! 🎉')).toBeVisible();
	});

	test('should work with 5x5 board', async ({ page }) => {
		await page.goto('/');

		// Create a 5x5 board
		await page.click('button:has-text("5×5")');
		await expect(page.getByTestId('goal-square')).toHaveCount(25);

		// Complete top row (indices 0-4)
		for (let i = 0; i < 5; i++) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#goal-title', `Goal ${i + 1}`);
			await page.click('button:has-text("Save")');

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify BINGO banner appears
		await expect(page.locator('text=🎉 BINGO! 🎉')).toBeVisible();
	});
});
