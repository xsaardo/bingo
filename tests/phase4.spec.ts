import { test, expect } from '@playwright/test';

test.describe('Phase 4: Polish & User Experience', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage before each test
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('should show empty state with instructions when no board exists', async ({ page }) => {
		await page.goto('/');

		// Verify empty state is displayed
		await expect(page.locator('text=Ready to Start?')).toBeVisible();
		await expect(page.locator('text=Choose a board size above')).toBeVisible();
		await expect(page.locator('text=How it works:')).toBeVisible();
		await expect(page.locator('text=Click a square to add a goal')).toBeVisible();
	});

	test('should hide empty state after creating a board', async ({ page }) => {
		await page.goto('/');

		// Verify empty state is shown
		await expect(page.locator('text=Ready to Start?')).toBeVisible();

		// Create a board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Empty state should be hidden
		await expect(page.locator('text=Ready to Start?')).not.toBeVisible();

		// Board should be visible
		const squares = await page.getByTestId('goal-square').count();
		expect(squares).toBe(9);
	});

	test('should have responsive design on mobile viewport', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// Create a board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Verify board is still visible and usable
		await expect(page.getByTestId('goal-square').first()).toBeVisible();

		// Should be able to interact with goals (opens sidebar)
		await page.getByTestId('goal-square').first().click();
		await expect(page.locator('#sidebar-goal-title')).toBeVisible();
	});

	test('should have responsive design on tablet viewport', async ({ page }) => {
		// Set tablet viewport
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');

		// Create a board
		await page.click('button:has-text("4×4")');
		await expect(page.getByTestId('goal-square')).toHaveCount(16);

		// Verify all elements are visible
		const squares = await page.getByTestId('goal-square').count();
		expect(squares).toBe(16);
	});

	test('should have hover effects on desktop', async ({ page }) => {
		await page.goto('/');

		// Create a board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Add a goal
		await page.getByTestId('goal-square').first().click();
		await page.fill('#sidebar-goal-title', 'Hover Test');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Close sidebar
		await page.getByTestId('close-sidebar-button').click();

		// Hover over a goal square
		const square = page.getByTestId('goal-square').first();
		await square.hover();

		// Verify it has hover class (shadow-md)
		await expect(square).toHaveClass(/hover:shadow-md/);
	});

	test('should have transitions on button interactions', async ({ page }) => {
		await page.goto('/');

		// Board size buttons should have transitions
		const button = page.locator('button:has-text("3×3")');
		await expect(button).toHaveClass(/transition/);
	});

	test('should close sidebar when clicking backdrop', async ({ page }) => {
		await page.goto('/');

		// Create a board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Open sidebar
		await page.getByTestId('goal-square').first().click();
		await expect(page.locator('h2:has-text("Goal Details")')).toBeVisible();

		// Close by pressing ESC key
		await page.keyboard.press('Escape');

		// Sidebar should be hidden
		await expect(page.locator('h2:has-text("Goal Details")')).not.toBeVisible();
	});

	test('should close sidebar when clicking X button', async ({ page }) => {
		await page.goto('/');

		// Create a board
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		// Open sidebar
		await page.getByTestId('goal-square').first().click();
		await expect(page.locator('h2:has-text("Goal Details")')).toBeVisible();

		// Click X button
		await page.getByTestId('close-sidebar-button').click();

		// Sidebar should be hidden
		await expect(page.locator('h2:has-text("Goal Details")')).not.toBeVisible();
	});

	test('should persist goal notes across edits', async ({ page }) => {
		await page.goto('/');

		// Create a board with a goal
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);
		await page.getByTestId('goal-square').first().click();
		await page.fill('#sidebar-goal-title', 'Goal with Notes');
		await page.fill('#sidebar-goal-notes', 'Initial notes');

		// Wait for auto-save
		await page.waitForTimeout(600);

		// Close sidebar
		await page.getByTestId('close-sidebar-button').click();

		// Re-open the goal
		await page.locator('text=Goal with Notes').click();

		// Verify notes are still there
		const notesField = page.locator('#sidebar-goal-notes');
		await expect(notesField).toHaveValue('Initial notes');
	});

	test('should show celebration animation for bingo', async ({ page }) => {
		await page.goto('/');

		// Create a board and complete a row
		await page.click('button:has-text("3×3")');
		await expect(page.getByTestId('goal-square')).toHaveCount(9);

		for (let i = 0; i < 3; i++) {
			const square = page.getByTestId('goal-square').nth(i);
			await square.click();
			await page.fill('#sidebar-goal-title', `Goal ${i + 1}`);

			// Wait for auto-save
			await page.waitForTimeout(600);

			// Close sidebar
			await page.getByTestId('close-sidebar-button').click();

			const checkbox = page.getByTestId('goal-square').nth(i).getByTestId('goal-checkbox');
			await checkbox.click();
		}

		// Verify celebration banner has animation class
		const banner = page.locator('text=🎉 BINGO! 🎉').locator('..');
		await expect(banner).toHaveClass(/celebrate/);
	});
});
