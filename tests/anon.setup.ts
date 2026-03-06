// ABOUTME: Playwright anonymous auth setup for tests
// ABOUTME: Creates a persistent anonymous session so tests reuse the JWT instead of triggering signInAnonymously() each time

import { test as setup, expect } from '@playwright/test';

const anonFile = 'tests/.auth/anon.json';

setup('create anonymous session', async ({ page }) => {
  // Navigate to the landing page which triggers signInAnonymously() once
  await page.goto('/');

  // Wait for auth to initialize — the board creation form appears when ready
  await expect(page.locator('input#board-name')).toBeVisible({ timeout: 15000 });

  // Save the anonymous session (JWT in localStorage, no board IDs)
  await page.context().storageState({ path: anonFile });

  console.log('✓ Anonymous session setup complete');
});
