// ABOUTME: E2E tests for authentication flows
// ABOUTME: Covers anonymous access, sign-in prompts, magic link redirect, and logout

import { test, expect } from '@playwright/test';

// ── Anonymous user tests ───────────────────────────────────────────────────
test.describe('Anonymous user', () => {
	// Use the pre-created anonymous session to avoid hitting Supabase rate limits
	test.use({ storageState: 'tests/.auth/anon.json' });

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

	test('shows sign-in prompt in goal modal instead of notes/milestones', async ({ page }) => {
		await page.goto('/');

		// Wait for the board creation form
		await expect(page.locator('input#board-name')).toBeVisible({ timeout: 10000 });

		// Create a board
		await page.getByTestId('create-board-button').click();

		// Wait for board page to load
		await expect(page).toHaveURL(/\/boards\//, { timeout: 10000 });

		await expect(page.getByTestId('goal-square').first()).toBeVisible({ timeout: 10000 });

		// Open a goal modal
		await page.getByTestId('goal-square').first().click();
		await expect(page.getByTestId('goal-modal')).toBeVisible();

		// Modal is collapsed by default — sign-in prompt clipped to zero height by CSS grid animation
		await expect(page.getByTestId('sign-in-for-details')).not.toBeInViewport();

		// Expand the modal
		await page.getByTestId('expand-modal-button').click();

		// Notes editor and milestones should still be hidden for anonymous users
		await expect(page.getByTestId('goal-notes-section')).not.toBeVisible();
		await expect(page.getByTestId('goal-milestones-section')).not.toBeVisible();

		// Sign-in prompt should be visible in the expanded area
		await expect(page.getByTestId('sign-in-for-details')).toBeVisible();
	});

	test('revisiting the app redirects to existing board', async ({ page }) => {
		await page.goto('/');

		// Wait for the board creation form and create a board
		await expect(page.locator('input#board-name')).toBeVisible({ timeout: 10000 });
		await page.getByTestId('create-board-button').click();

		// Wait for board page to load and capture the URL
		await expect(page).toHaveURL(/\/boards\//, { timeout: 10000 });
		const boardUrl = page.url();

		// Navigate back to the welcome page
		await page.goto('/');

		// Should be auto-redirected back to the board
		await expect(page).toHaveURL(boardUrl, { timeout: 10000 });
	});

	test('board page does not show Home button for anonymous users', async ({ page }) => {
		await page.goto('/');

		// Wait for the board creation form and create a board
		await expect(page.locator('input#board-name')).toBeVisible({ timeout: 10000 });
		await page.getByTestId('create-board-button').click();

		// Wait for board page to load
		await expect(page).toHaveURL(/\/boards\//, { timeout: 10000 });

		// Home button should not be present for anonymous users
		await expect(page.getByRole('link', { name: 'Home' })).not.toBeVisible();
	});

	test('magic link redirect lands on dashboard or login after token processing', async ({
		page
	}) => {
		// Verifies /auth/confirm route handles the magic link params gracefully.
		// An invalid token should redirect to login; a valid one would go to /dashboard.
		await page.goto('/auth/confirm?token_hash=invalid&type=magiclink&next=/dashboard');
		await expect(page).toHaveURL(/\/(auth\/login|dashboard)/, { timeout: 10000 });
	});
});

// ── Authenticated user tests ───────────────────────────────────────────────
test.describe('Authenticated user', () => {
	test('logging out redirects to login or home page', async ({ page }) => {
		// Re-authenticate to get a fresh session per browser context.
		// All browsers share the same token from storageState; if one logs out
		// and invalidates that shared token, the others fail. Each browser
		// needs its own independent session.
		await page.goto('/auth/login');
		await page.waitForLoadState('networkidle');
		await page.evaluate(
			async ({ email, password }) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const { supabase } = await import('/src/lib/supabaseClient');
				await supabase.auth.signInWithPassword({ email, password });
			},
			{
				email: process.env.TEST_USER_EMAIL || 'test@example.com',
				password: process.env.TEST_USER_PASSWORD || 'test-password-123'
			}
		);

		await page.goto('/dashboard');
		await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

		// Find and click the user menu trigger
		await page.waitForSelector('[data-testid="user-menu-button"]', { timeout: 10000 });
		const userMenuTrigger = page.getByTestId('user-menu-button');
		await userMenuTrigger.click();

		// Click sign-out in the dropdown
		await page.getByRole('button', { name: /sign out|log out|logout/i }).click();

		// Confirm in the confirmation modal
		await page.getByRole('button', { name: /sign out|log out|logout/i }).click();

		// After logout should land on login or root
		await expect(page).toHaveURL(/\/(auth\/login|$)/, { timeout: 10000 });
	});
});
