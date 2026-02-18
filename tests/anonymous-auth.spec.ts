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
