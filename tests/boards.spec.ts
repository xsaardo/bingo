// ABOUTME: E2E tests for board management on the dashboard
// ABOUTME: Covers create, delete with confirmation, navigation, and board load verification

import { test, expect } from '@playwright/test';
import { deleteTestBoard } from './test-helpers';

async function createBoardWithSize(
  page: import('@playwright/test').Page,
  size?: '4x4' | '5x5'
): Promise<string> {
  // Set up the response waiter before navigation — see createTestBoard for explanation.
  const initialFetch = page.waitForResponse(
    (resp) => resp.url().includes('/boards') && resp.request().method() === 'GET',
    { timeout: 10000 }
  );
  await page.goto('/dashboard');
  await initialFetch;
  await page.getByRole('button', { name: 'New Board' }).click();
  await expect(page.getByLabel('Board Name', { exact: false })).toBeVisible();

  const boardName = `Test Board ${size ?? 'default'} ${Date.now()}`;
  await page.getByLabel('Board Name', { exact: false }).fill(boardName);

  if (size) {
    // Select grid size if the option is present
    const sizeSelect = page.locator('select[name="size"], [data-testid="board-size-select"]');
    if ((await sizeSelect.count()) > 0) {
      await sizeSelect.selectOption(size);
    }
  }

  await page.getByRole('button', { name: 'Create Board' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();

  await expect(page.getByRole('heading', { name: boardName })).toBeVisible();
  await page.getByRole('heading', { name: boardName }).click();
  await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });

  const boardId = page.url().split('/').pop()!;
  return boardId;
}

test.describe('Board creation', () => {
  let boardId: string;

  test.afterEach(async ({ page }) => {
    if (boardId) await deleteTestBoard(page, boardId);
  });

  test('creates a new board with default size', async ({ page }) => {
    boardId = await createBoardWithSize(page);
    await expect(page).toHaveURL(/\/boards\/.+/);
    await expect(page.getByTestId('goal-square').first()).toBeVisible();
  });

  test('default board has 25 goal squares with no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    boardId = await createBoardWithSize(page);
    await expect(page.getByTestId('goal-square').first()).toBeVisible();
    const goalCount = await page.getByTestId('goal-square').count();
    expect(goalCount).toBe(25); // 5x5 board (default size)
    expect(consoleErrors).toHaveLength(0);
  });

  test('creates a 5x5 board', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'New Board' }).click();
    await expect(page.getByLabel('Board Name', { exact: false })).toBeVisible();

    const boardName = `5x5 Board ${Date.now()}`;
    await page.getByLabel('Board Name', { exact: false }).fill(boardName);

    const sizeSelect = page.locator('select[name="size"], [data-testid="board-size-select"]');
    if ((await sizeSelect.count()) > 0) {
      await sizeSelect.selectOption('5x5');
    }

    await page.getByRole('button', { name: 'Create Board' }).click();
    await expect(page.getByLabel('Board Name', { exact: false })).not.toBeVisible();

    await expect(page.getByText(boardName)).toBeVisible();
    await page.getByText(boardName).click();
    await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
    boardId = page.url().split('/').pop()!;

    // 5x5 = 25 goal squares
    await expect(page.getByTestId('goal-square').first()).toBeVisible();
    const squares = await page.getByTestId('goal-square').count();
    expect(squares).toBeGreaterThanOrEqual(25);
  });
});

test.describe('Board deletion', () => {
  test('deletes a board with confirmation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'New Board' }).click();
    await expect(page.getByLabel('Board Name', { exact: false })).toBeVisible();

    const boardName = `Delete Me ${Date.now()}`;
    await page.getByLabel('Board Name', { exact: false }).fill(boardName);
    await page.getByRole('button', { name: 'Create Board' }).click();
    await expect(page.getByLabel('Board Name', { exact: false })).not.toBeVisible();

    // Go back to dashboard
    await page.goto('/dashboard');
    await expect(page.getByText(boardName)).toBeVisible();

    // Click delete on that board card
    const boardCard = page.locator('[data-testid="board-card"]').filter({ hasText: boardName });
    const deleteBtn = boardCard
      .locator('button[aria-label*="delete" i], button:has-text("Delete")')
      .or(boardCard.getByTestId('delete-board-button'));
    await deleteBtn.click();

    // Confirmation dialog should appear
    await expect(page.getByTestId('confirm-delete-button')).toBeVisible();
    await page.getByTestId('confirm-delete-button').click();

    // Board card should disappear from the list
    await expect(page.getByTestId('board-card').filter({ hasText: boardName })).not.toBeVisible();
    // No cleanup needed — board was deleted
  });
});

test.describe('Board navigation', () => {
  let boardId: string;

  test.afterEach(async ({ page }) => {
    if (boardId) await deleteTestBoard(page, boardId);
  });

  test('navigates to a board from the dashboard', async ({ page }) => {
    boardId = await createBoardWithSize(page);

    // Go back to dashboard and click the board card
    await page.goto('/dashboard');

    const boardCards = page.getByTestId('board-card');
    await boardCards.first().click();

    await expect(page).toHaveURL(/\/boards\/.+/, { timeout: 10000 });
    await expect(page.getByTestId('goal-square').first()).toBeVisible();
  });
});
