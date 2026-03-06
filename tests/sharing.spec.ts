// ABOUTME: E2E tests for the public board sharing feature
// ABOUTME: Covers enabling sharing, share URL, clipboard copy, public view readonly, and disabling sharing

import { test, expect } from '@playwright/test';
import { createTestBoard, deleteTestBoard } from './test-helpers';

let testBoardId: string;

test.beforeEach(async ({ page }) => {
  testBoardId = await createTestBoard(page);
});

test.afterEach(async ({ page }) => {
  // Disable sharing before deleting to avoid dangling public boards
  await page.evaluate(async (id) => {
    // @ts-expect-error - Browser import path
    const { supabase } = await import('/src/lib/supabaseClient');
    await supabase.from('boards').update({ is_public: false }).eq('id', id);
  }, testBoardId);
  await deleteTestBoard(page, testBoardId);
});

test.describe('Sharing toggle', () => {
  test('enabling sharing shows share URL in the header', async ({ page }) => {
    // Navigate to the board page
    await page.goto(`/boards/${testBoardId}`);
    await page.waitForSelector('[data-testid="goal-square"]');

    // Click the share button (toggles public on)
    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));
    await shareBtn.click();

    // Share URL input/text should appear
    const shareUrl = page
      .getByTestId('share-url')
      .or(page.locator('input[readonly][value*="/share/"]'));
    await expect(shareUrl.first()).toBeVisible({ timeout: 5000 });
  });

  test('copy button copies the correct share URL to clipboard', async ({
    page,
    context,
    browserName
  }) => {
    // Clipboard isolation only works reliably in Chromium; Firefox/WebKit use the system clipboard
    test.skip(browserName !== 'chromium', 'Clipboard API only reliably testable in Chromium');

    // Grant clipboard permissions for Chromium
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto(`/boards/${testBoardId}`);
    await page.waitForSelector('[data-testid="goal-square"]');

    // Enable sharing
    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));
    await shareBtn.click();

    // Wait for share state to reflect
    await page.waitForTimeout(500);

    // The share action may already copy the link automatically (per the code).
    // If there is an explicit copy button, click it.
    const copyBtn = page
      .getByTestId('copy-share-url')
      .or(page.locator('button[aria-label*="copy" i]'))
      .or(page.locator('button:has-text("Copy")'));
    if ((await copyBtn.count()) > 0) {
      await copyBtn.click();
    }

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain(`/share/${testBoardId}`);
  });

  test('disabling sharing makes /share/[id] return an error', async ({ page }) => {
    // First enable then disable sharing
    await page.goto(`/boards/${testBoardId}`);
    await page.waitForSelector('[data-testid="goal-square"]');

    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));

    // Enable
    await shareBtn.click();
    await page.waitForTimeout(300);

    // Disable (click again to toggle off)
    await shareBtn.click();
    await page.waitForTimeout(300);

    // Now visiting the share URL should show an error
    await page.goto(`/share/${testBoardId}`);
    const errorMsg = page
      .getByTestId('share-error')
      .or(page.locator('text=/not found|not available|private|error/i'));
    await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Public share view', () => {
  test('/share/[id] is accessible without login', async ({ page, context }) => {
    // Enable sharing first (requires auth)
    await page.goto(`/boards/${testBoardId}`);
    await page.waitForSelector('[data-testid="goal-square"]');
    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));
    await shareBtn.click();
    await page.waitForTimeout(300);

    // Now open an anonymous context
    const anonPage = await context.newPage();
    await anonPage.context().clearCookies();

    await anonPage.goto(`/share/${testBoardId}`);

    // Should NOT redirect to login
    await expect(anonPage).not.toHaveURL(/\/auth\/login/, { timeout: 10000 });

    // Board content should be visible
    await expect(anonPage.getByTestId('goal-square').first()).toBeVisible({ timeout: 10000 });

    await anonPage.close();
  });

  test('goal squares on the public view are not clickable (readonly)', async ({
    page,
    context
  }) => {
    // Enable sharing
    await page.goto(`/boards/${testBoardId}`);
    await page.waitForSelector('[data-testid="goal-square"]');
    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));
    await shareBtn.click();
    await page.waitForTimeout(300);

    // Open as anonymous user
    const anonPage = await context.newPage();
    await anonPage.goto(`/share/${testBoardId}`);
    await expect(anonPage.getByTestId('goal-square').first()).toBeVisible({ timeout: 10000 });

    // Click a goal square — modal should NOT open
    await anonPage.getByTestId('goal-square').first().click();
    const modal = anonPage.getByTestId('goal-modal');
    await anonPage.waitForTimeout(500);
    await expect(modal).not.toBeVisible();

    await anonPage.close();
  });
});
