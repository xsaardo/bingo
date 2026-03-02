// ABOUTME: E2E tests for authentication flows
// ABOUTME: Covers anonymous access, magic link redirect, and logout

import { test, expect } from '@playwright/test';

// ── Anonymous user tests ───────────────────────────────────────────────────
test.describe('Anonymous user', () => {
	// Use a clean (unauthenticated) browser context
	test.use({ storageState: { cookies: [], origins: [] } });

	test('sees the board creation page and can interact with goals', async ({ page }) => {
		await page.goto('/');

		// Landing page should be visible without redirect to login
		await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10000 });

		// Board creation form should be available
		await expect(page.locator('input#board-name')).toBeVisible({ timeout: 10000 });

		// Create a board without logging in
		await page.getByTestId('create-board-button').click();
		await expect(page).toHaveURL(/\/boards\//, { timeout: 10000 });

		// Goal squares should be visible and clickable
		await expect(page.getByTestId('goal-square').first()).toBeVisible({ timeout: 10000 });
		await page.getByTestId('goal-square').first().click();

		// Goal modal should open
		await expect(page.getByTestId('goal-modal')).toBeVisible({ timeout: 5000 });
	});

	test('magic link redirect lands on dashboard or login after token processing', async ({ page }) => {
		// Verifies /auth/confirm route handles the magic link params gracefully.
		// An invalid token should redirect to login; a valid one would go to /dashboard.
		await page.goto('/auth/confirm?token_hash=invalid&type=magiclink&next=/dashboard');
		await expect(page).toHaveURL(/\/(auth\/login|dashboard)/, { timeout: 10000 });
	});
});

// ── Authenticated user tests ───────────────────────────────────────────────
test.describe('Authenticated user', () => {
	test('logging out redirects to login or home page', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

		// Find and click the user menu trigger
		const userMenuTrigger = page
			.getByTestId('user-menu-button')
			.or(page.locator('[data-testid="user-menu"]'))
			.or(page.locator('button').filter({ hasText: /menu|account/i }).last());
		await userMenuTrigger.click();

		// Click sign-out
		await page.getByRole('button', { name: /sign out|log out|logout/i }).click();

		// After logout should land on login or root
		await expect(page).toHaveURL(/\/(auth\/login|$)/, { timeout: 10000 });
	});
});
