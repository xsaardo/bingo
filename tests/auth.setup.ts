// ABOUTME: Playwright authentication setup for tests
// ABOUTME: Creates a persistent auth state so tests don't need to re-login

import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
	// Navigate to login page
	await page.goto('/auth/login');

	// Wait for the app's anonymous auth init to complete before signing in.
	// authStore.init() runs async in onMount and calls signInAnonymously(); if
	// signInWithPassword races ahead of it, the anonymous sign-in can overwrite
	// the password session and the redirect to /dashboard never fires.
	await page.waitForLoadState('networkidle');

	// Get credentials from Node.js environment
	const email = process.env.TEST_USER_EMAIL || 'test@example.com';
	const password = process.env.TEST_USER_PASSWORD || 'test-password-123';

	// Use Supabase password auth for testing (faster than magic link)
	await page.evaluate(
		async ({ email, password }) => {
			// Dynamically import the supabase client (use actual path for browser import)
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			// Sign in with test account
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) {
				throw new Error(`Auth failed: ${error.message}`);
			}

			return data;
		},
		{ email, password }
	);

	// Navigate to dashboard after signing in (the evaluate call sets the session
	// but doesn't trigger the app's redirect logic)
	await page.goto('/dashboard');
	await page.waitForURL('/dashboard', { timeout: 10000 });

	// Verify we're logged in by checking for the New Board button
	await expect(page.locator('button:has-text("New Board")')).toBeVisible({ timeout: 5000 });

	// Save authenticated state to file
	await page.context().storageState({ path: authFile });

	console.log('✓ Authentication setup complete');
});
