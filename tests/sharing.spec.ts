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
    await expect(page.getByTestId('goal-square').first()).toBeVisible();

    // Click the share button (toggles public on)
    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));

    const shareResponse = page.waitForResponse(
      (resp) => resp.url().includes('/boards') && resp.request().method() === 'PATCH',
      { timeout: 5000 }
    );
    await shareBtn.click();
    await shareResponse;

    // Share URL input/text should appear
    const shareUrl = page
      .getByTestId('share-url')
      .or(page.locator('input[readonly][value*="/share/"]'));
    await expect(shareUrl.first()).toBeVisible();
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
    await expect(page.getByTestId('goal-square').first()).toBeVisible();

    // Enable sharing
    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));

    const shareResponse = page.waitForResponse(
      (resp) => resp.url().includes('/boards') && resp.request().method() === 'PATCH',
      { timeout: 5000 }
    );
    await shareBtn.click();
    await shareResponse;

    // Click the copy button in the popover (opened automatically after enabling sharing)
    const copyBtn = page.getByRole('button', { name: 'Copy link' });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain(`/share/${testBoardId}`);
  });

  test('disabling sharing makes /share/[id] return an error', async ({ page }) => {
    // First enable then disable sharing
    await page.goto(`/boards/${testBoardId}`);
    await expect(page.getByTestId('goal-square').first()).toBeVisible();

    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));

    // Enable
    let shareResponse = page.waitForResponse(
      (resp) => resp.url().includes('/boards') && resp.request().method() === 'PATCH',
      { timeout: 5000 }
    );
    await shareBtn.click();
    await shareResponse;

    // Disable via the "Disable sharing" button inside the popover (opened after enabling)
    shareResponse = page.waitForResponse(
      (resp) => resp.url().includes('/boards') && resp.request().method() === 'PATCH',
      { timeout: 5000 }
    );
    await page.getByRole('button', { name: 'Disable sharing' }).click();
    await shareResponse;

    // Now visiting the share URL should show an error
    await page.goto(`/share/${testBoardId}`);
    const errorMsg = page
      .getByTestId('share-error')
      .or(page.locator('text=/not found|not available|private|error/i'));
    await expect(errorMsg.first()).toBeVisible();
  });
});

test.describe('Public share view', () => {
  test('/share/[id] is accessible without login', async ({ page, context }) => {
    // Enable sharing first (requires auth)
    await page.goto(`/boards/${testBoardId}`);
    await expect(page.getByTestId('goal-square').first()).toBeVisible();
    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));

    const shareResponse = page.waitForResponse(
      (resp) => resp.url().includes('/boards') && resp.request().method() === 'PATCH',
      { timeout: 5000 }
    );
    await shareBtn.click();
    await shareResponse;

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
    await expect(page.getByTestId('goal-square').first()).toBeVisible();
    const shareBtn = page
      .getByTestId('share-button')
      .or(page.locator('button[aria-label*="share" i]'))
      .or(page.locator('button:has-text("Share")'));

    const shareResponse = page.waitForResponse(
      (resp) => resp.url().includes('/boards') && resp.request().method() === 'PATCH',
      { timeout: 5000 }
    );
    await shareBtn.click();
    await shareResponse;

    // Open as anonymous user
    const anonPage = await context.newPage();
    await anonPage.goto(`/share/${testBoardId}`);
    await expect(anonPage.getByTestId('goal-square').first()).toBeVisible({ timeout: 10000 });

    // Click a goal square — modal should NOT open
    await anonPage.getByTestId('goal-square').first().click();
    const modal = anonPage.getByTestId('goal-modal');
    await expect(modal).not.toBeVisible();

    await anonPage.close();
  });
});
