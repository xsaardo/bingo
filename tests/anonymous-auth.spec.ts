// ABOUTME: E2E tests for anonymous authentication flow
// ABOUTME: Verifies new users get an anonymous session without needing to log in

import { test, expect } from '@playwright/test';

// Override stored auth state to simulate a brand-new visitor
test.use({ storageState: { cookies: [], origins: [] } });

test('new visitor gets an anonymous session and sees the landing page', async ({ page }) => {
	await page.goto('/');

	// Should NOT be redirected to the login page
	await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10000 });

	// The board creation form should be visible (auth succeeded, page rendered)
	await expect(page.locator('input#board-name')).toBeVisible({ timeout: 10000 });
});

test('anonymous user sees sign-in prompt instead of notes/milestones in goal modal', async ({ page }) => {
	await page.goto('/');

	// Wait for the board creation form
	await expect(page.locator('input#board-name')).toBeVisible({ timeout: 10000 });

	// Create a board
	await page.getByRole('button', { name: /Create 5×5 Board/ }).click();

	// Wait for board page to load
	await expect(page).toHaveURL(/\/boards\//, { timeout: 10000 });

	// Dismiss the welcome modal that appears for new boards
	await page.getByRole('button', { name: 'Get Started' }).click({ timeout: 10000 });

	await expect(page.getByTestId('goal-square').first()).toBeVisible({ timeout: 10000 });

	// Open a goal modal
	await page.getByTestId('goal-square').first().click();
	await expect(page.getByTestId('goal-modal')).toBeVisible();

	// Modal is collapsed by default — sign-in prompt not yet visible
	await expect(page.getByTestId('sign-in-for-details')).not.toBeVisible();

	// Expand the modal
	await page.getByTestId('expand-modal-button').click();

	// Notes editor and milestones should still be hidden for anonymous users
	await expect(page.getByTestId('goal-notes-section')).not.toBeVisible();
	await expect(page.getByTestId('goal-milestones-section')).not.toBeVisible();

	// Sign-in prompt should be visible in the expanded area
	await expect(page.getByTestId('sign-in-for-details')).toBeVisible();
});
