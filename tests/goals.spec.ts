// ABOUTME: E2E tests for goal interactions on the board
// ABOUTME: Covers modal open/save/discard, title/notes persistence, completion, and bingo detection

import { test, expect } from '@playwright/test';
import {
  createTestBoard,
  deleteTestBoard,
  getFirstGoalId,
  getGoalData,
  openFirstGoalModal
} from './test-helpers';

let testBoardId: string;
let firstGoalId: string;

test.beforeEach(async ({ page }) => {
  testBoardId = await createTestBoard(page);
  firstGoalId = await getFirstGoalId(page, testBoardId);
});

test.afterEach(async ({ page }) => {
  await deleteTestBoard(page, testBoardId);
});

test.describe('Goal modal', () => {
  test('clicking a goal square opens the goal modal', async ({ page }) => {
    await openFirstGoalModal(page);
    await expect(page.getByTestId('goal-modal')).toBeVisible();
  });

  test('editing a goal title persists after page reload', async ({ page }) => {
    await openFirstGoalModal(page);
    await page.getByTestId('modal-title-input').fill('My Persistent Goal');
    await page.getByTestId('save-goal-button').click();
    await expect(page.getByTestId('goal-modal')).not.toBeVisible();

    // Reload the page
    await page.reload();
    await expect(page.getByTestId('goal-square').first()).toBeVisible();

    // Verify the title was saved
    const goal = await getGoalData(page, firstGoalId, 'title');
    expect(goal.title).toBe('My Persistent Goal');
  });

  test('editing goal notes persists after page reload', async ({ page }) => {
    await openFirstGoalModal(page);

    // Expand the modal to show notes
    const expandBtn = page.getByTestId('expand-modal-button');
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
    }

    // Type into the notes area (rich text editor)
    const notesEditor = page
      .getByTestId('goal-notes-editor')
      .or(page.locator('[contenteditable="true"]').first());
    if (await notesEditor.isVisible()) {
      await notesEditor.click();
      await notesEditor.fill('Important notes here');
    }

    await page.getByTestId('save-goal-button').click();
    await expect(page.getByTestId('goal-modal')).not.toBeVisible();

    await page.reload();
    await expect(page.getByTestId('goal-square').first()).toBeVisible();

    // Confirm persistence via DB
    const goal = await getGoalData(page, firstGoalId, 'notes');
    expect(goal?.notes).toBeTruthy();
  });

  test('Save button closes the modal', async ({ page }) => {
    await openFirstGoalModal(page);
    await page.getByTestId('save-goal-button').click();
    await expect(page.getByTestId('goal-modal')).not.toBeVisible();
  });

  test('closing modal without saving discards changes', async ({ page }) => {
    await openFirstGoalModal(page);
    await page.getByTestId('modal-title-input').fill('Unsaved Title');

    // Close without clicking Save
    await page.getByTestId('close-modal-button').click();

    // Title should not be saved
    const goal = await getGoalData(page, firstGoalId, 'title');
    expect(goal.title).toBe('');
  });

  test('Save button persists title even after toggling completion', async ({ page }) => {
    await openFirstGoalModal(page);

    // Type a title
    await page.getByTestId('modal-title-input').fill('My Goal Title');

    // Toggle the completion checkbox (this triggers a store update)
    await page.getByTestId('modal-checkbox').click();

    // Click Save and wait for modal to close (save completes before close)
    await page.getByTestId('save-goal-button').click();
    await expect(page.getByTestId('goal-modal')).not.toBeVisible();

    // Verify the title was saved to the database
    const goal = await getGoalData(page, firstGoalId, 'title, completed');
    expect(goal.title).toBe('My Goal Title');
    expect(goal.completed).toBe(true);
  });
});

test.describe('Goal completion', () => {
  test('toggling goal completion updates the checkbox state', async ({ page }) => {
    await openFirstGoalModal(page);

    const checkbox = page.getByTestId('modal-checkbox');
    const initialChecked = await checkbox.isChecked();

    await checkbox.click();
    await page.getByTestId('save-goal-button').click();
    await expect(page.getByTestId('goal-modal')).not.toBeVisible();

    const goal = await getGoalData(page, firstGoalId, 'completed');
    expect(goal.completed).toBe(!initialChecked);
  });

  test('can edit title and complete a goal', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Open sidebar for first goal
    await openFirstGoalModal(page);

    // Edit title
    await page.getByTestId('modal-title-input').fill('Test Goal Title');

    // Save and wait for modal to close
    await page.getByTestId('save-goal-button').click();
    await expect(page.getByTestId('goal-modal')).not.toBeVisible();

    // Verify title is displayed
    await expect(page.locator('text=Test Goal Title').first()).toBeVisible();

    // Toggle completion — watch for the PATCH response to confirm the update was persisted
    const completionResponse = page.waitForResponse(
      (resp) => resp.url().includes('/goals') && resp.request().method() === 'PATCH',
      { timeout: 5000 }
    );
    await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
    await completionResponse;

    // Verify completed state via data attribute
    const goalSquare = page.getByTestId('goal-square').first();
    await expect(goalSquare).toHaveAttribute('data-completed', 'true');

    // Verify no console errors occurred
    expect(consoleErrors).toHaveLength(0);
  });

  test('bingo confetti appears when a row is completed', async ({ page }) => {
    // For a row bingo we need to complete all goals in one row.
    // We'll complete the first N goals (row size) sequentially.
    const squares = page.getByTestId('goal-square');
    const count = await squares.count();
    // Determine grid size (3x3=9, 4x4=16, 5x5=25)
    const gridSize = Math.round(Math.sqrt(count));

    for (let i = 0; i < gridSize; i++) {
      await squares.nth(i).click();
      await expect(page.getByTestId('goal-modal')).toBeVisible();
      // Use click() instead of check() — checkbox is async/controlled; check() can't verify state change
      await page.getByTestId('modal-checkbox').click();
      await page.getByTestId('save-goal-button').click();
      await expect(page.getByTestId('goal-modal')).not.toBeVisible();
    }

    // Either a visual confetti element appeared, or the board shows a bingo indicator
    const confetti = page
      .locator('[data-testid="bingo-confetti"], [class*="confetti"], canvas')
      .first();
    const bingoIndicator = page
      .locator('[data-testid="bingo-indicator"], [class*="bingo"]')
      .first();
    const hasConfetti = (await confetti.count()) > 0;
    const hasBingoIndicator = (await bingoIndicator.count()) > 0;
    expect(hasConfetti || hasBingoIndicator).toBe(true);
  });
});
