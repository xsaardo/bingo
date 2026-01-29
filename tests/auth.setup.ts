// ABOUTME: Playwright authentication setup for tests
// ABOUTME: Creates a persistent auth state so tests don't need to re-login

import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
	// Navigate to login page
	await page.goto('/auth/login');

	// Use Supabase password auth for testing (faster than magic link)
	await page.evaluate(async () => {
		// Dynamically import the supabase client
		const supabaseModule = await import('/src/lib/supabaseClient.ts');
		const { supabase } = supabaseModule;

		// Sign in with test account
		const { data, error } = await supabase.auth.signInWithPassword({
			email: process.env.TEST_USER_EMAIL || 'test@example.com',
			password: process.env.TEST_USER_PASSWORD || 'test-password-123'
		});

		if (error) {
			throw new Error(`Auth failed: ${error.message}`);
		}

		return data;
	});

	// Wait for redirect to dashboard (indicates successful login)
	await page.waitForURL('/dashboard', { timeout: 10000 });

	// Verify we're logged in by checking for user menu or create board button
	await expect(page.locator('text=Create Board')).toBeVisible({ timeout: 5000 });

	// Save authenticated state to file
	await page.context().storageState({ path: authFile });

	console.log('✓ Authentication setup complete');
});
