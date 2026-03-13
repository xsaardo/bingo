// ABOUTME: E2E tests for goal date tracking, display, and formatting
// ABOUTME: Covers startedAt/completedAt/lastUpdatedAt lifecycle, DateMetadata UI, and date utilities

import { test, expect } from '@playwright/test';
import { createTestBoard, deleteTestBoard, getFirstGoalId, getGoalData } from './test-helpers';

// ── Date formatting utility tests ──────────────────────────────────────────
// These tests call page.goto('/dashboard') directly and don't need a board.
test.describe('Date formatting utility', () => {
  test('formats minutes correctly', async ({ page }) => {
    await page.goto('/dashboard');
    const result = await page.evaluate(() => {
      // @ts-expect-error - Browser import path, works at runtime via Vite
      const dateUtils = import('/src/lib/utils/dates');
      return dateUtils.then((module) => {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        return module.formatRelativeTime(twoMinutesAgo);
      });
    });

    expect(result).toMatch(/2m ago/);
  });

  test('formats hours correctly', async ({ page }) => {
    await page.goto('/dashboard');
    const result = await page.evaluate(() => {
      // @ts-expect-error - Browser import path, works at runtime via Vite
      const dateUtils = import('/src/lib/utils/dates');
      return dateUtils.then((module) => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        return module.formatRelativeTime(oneHourAgo);
      });
    });

    expect(result).toMatch(/1h ago/);
  });

  test('formats days correctly', async ({ page }) => {
    await page.goto('/dashboard');
    const result = await page.evaluate(() => {
      // @ts-expect-error - Browser import path, works at runtime via Vite
      const dateUtils = import('/src/lib/utils/dates');
      return dateUtils.then((module) => {
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        return module.formatRelativeTime(fiveDaysAgo);
      });
    });

    expect(result).toMatch(/5d ago/);
  });

  test('formats months correctly', async ({ page }) => {
    await page.goto('/dashboard');
    const result = await page.evaluate(() => {
      // @ts-expect-error - Browser import path, works at runtime via Vite
      const dateUtils = import('/src/lib/utils/dates');
      return dateUtils.then((module) => {
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
        return module.formatRelativeTime(threeMonthsAgo);
      });
    });

    expect(result).toMatch(/3mo ago/);
  });

  test('handles seconds correctly', async ({ page }) => {
    await page.goto('/dashboard');
    const result = await page.evaluate(() => {
      // @ts-expect-error - Browser import path, works at runtime via Vite
      const dateUtils = import('/src/lib/utils/dates');
      return dateUtils.then((module) => {
        const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();
        return module.formatRelativeTime(tenSecondsAgo);
      });
    });

    // Should show "10s ago", NOT "less than am ago"
    expect(result).not.toContain('less than am ago');
    expect(result).toMatch(/\d+s ago/);
  });
});

// ── Date metadata UI component tests ──────────────────────────────────────
test.describe('Date metadata display', () => {
  let testBoardId: string;

  test.beforeEach(async ({ page }) => {
    testBoardId = await createTestBoard(page);
  });

  test.afterEach(async ({ page }) => {
    if (testBoardId) await deleteTestBoard(page, testBoardId);
  });

  test('shows lastUpdatedAt for new goals', async ({ page }) => {
    // Open and expand goal modal
    await page.getByTestId('goal-square').first().click();
    await page.waitForSelector('[data-testid="goal-modal"]');
    await page.getByTestId('expand-modal-button').click();

    // Check that last updated is visible
    const lastUpdatedText = await page.locator('text=Last updated:').textContent();
    expect(lastUpdatedText).toBeTruthy();
  });

  test('shows startedAt after first edit', async ({ page }) => {
    // Open and expand goal modal
    await page.getByTestId('goal-square').first().click();
    await page.waitForSelector('[data-testid="goal-modal"]');
    await page.getByTestId('expand-modal-button').click();

    // Initially, startedAt should not be visible
    const startedBefore = await page.locator('text=Started:').count();
    expect(startedBefore).toBe(0);

    // Edit title and save (saving sets startedAt on first edit)
    const titleInput = page.locator('input').first();
    await titleInput.fill('My Goal');
    // Wait for handleSave to finish and close the modal before reopening,
    // otherwise clearSelection() fires on the new modal after the Supabase call completes.
    await page.getByTestId('save-goal-button').click();
    await expect(page.getByTestId('goal-modal')).not.toBeVisible({ timeout: 10000 });

    // Reopen and expand modal to see updated data
    await page.getByTestId('goal-square').first().click();
    await page.waitForSelector('[data-testid="goal-modal"]');
    await page.getByTestId('expand-modal-button').click();

    // Now startedAt should be visible
    const startedAfter = await page.locator('text=Started:').count();
    expect(startedAfter).toBe(1);

    // Verify the date format (MMM d, yyyy)
    const startedText = await page
      .locator('text=Started:')
      .locator('..')
      .locator('.font-medium')
      .textContent();
    expect(startedText).toMatch(/\w+ \d{1,2}, \d{4}/);
  });

  test('shows completedAt when goal is completed', async ({ page }) => {
    // Mark goal as complete
    await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
    await page.waitForTimeout(300);

    // Open and expand goal modal
    await page.getByTestId('goal-square').first().click();
    await page.waitForSelector('[data-testid="goal-modal"]');
    await page.getByTestId('expand-modal-button').click();

    // CompletedAt should be visible
    const completedCount = await page.locator('text=Completed:').count();
    expect(completedCount).toBe(1);

    // Verify the date format and green color
    const completedText = await page
      .locator('text=Completed:')
      .locator('..')
      .locator('.font-medium')
      .textContent();
    expect(completedText).toMatch(/\w+ \d{1,2}, \d{4}/);

    // Check for green text color
    const completedElement = await page
      .locator('text=Completed:')
      .locator('..')
      .locator('.font-medium');
    const className = await completedElement.getAttribute('class');
    expect(className).toContain('text-green-600');
  });

  test('hides completedAt when goal is uncompleted', async ({ page }) => {
    // Mark goal as complete
    await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
    await page.waitForTimeout(300);

    // Open and expand goal modal
    await page.getByTestId('goal-square').first().click();
    await page.waitForSelector('[data-testid="goal-modal"]');
    await page.getByTestId('expand-modal-button').click();

    // CompletedAt should be visible
    let completedCount = await page.locator('text=Completed:').count();
    expect(completedCount).toBe(1);

    // Unmark as complete via the checkbox in the modal
    const modalCheckbox = page.locator('[data-testid="modal-checkbox"]');
    await modalCheckbox.click();
    await page.waitForTimeout(300);

    // Close modal by clicking the close button
    await page.locator('[data-testid="close-modal-button"]').click();
    await page.waitForTimeout(200);

    // Reopen and expand modal
    await page.getByTestId('goal-square').first().click();
    await page.waitForSelector('[data-testid="goal-modal"]');
    await page.getByTestId('expand-modal-button').click();

    // CompletedAt should not be visible
    completedCount = await page.locator('text=Completed:').count();
    expect(completedCount).toBe(0);
  });

  test('formats lastUpdatedAt as relative time', async ({ page }) => {
    // Open and expand goal modal
    await page.getByTestId('goal-square').first().click();
    await page.waitForSelector('[data-testid="goal-modal"]');
    await page.getByTestId('expand-modal-button').click();

    // Get the last updated text
    const lastUpdatedText = await page
      .locator('text=Last updated:')
      .locator('..')
      .locator('.font-medium')
      .textContent();

    // Should be in relative format (e.g., "10s ago", "2m ago", "1h ago")
    expect(lastUpdatedText).toMatch(/(s|m|h|d|mo|y) ago/);
  });
});

// ── Goal date tracking (DB-level) ──────────────────────────────────────────
test.describe('Goal date tracking', () => {
  let testBoardId: string;
  let firstGoalId: string;

  test.beforeEach(async ({ page }) => {
    testBoardId = await createTestBoard(page);
    firstGoalId = await getFirstGoalId(page, testBoardId);
  });

  test.afterEach(async ({ page }) => {
    if (testBoardId) await deleteTestBoard(page, testBoardId);
  });

  test('date fields persist after page reload', async ({ page }) => {
    const initialData = await getGoalData<{ last_updated_at: string }>(
      page,
      firstGoalId,
      'last_updated_at'
    );

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="goal-square"]');

    const afterReloadData = await getGoalData<{
      last_updated_at: string;
      started_at: string | null;
      completed_at: string | null;
    }>(page, firstGoalId, 'last_updated_at, started_at, completed_at');

    // Verify persistence
    expect(afterReloadData).toBeTruthy();
    expect(afterReloadData!.last_updated_at).toBe(initialData!.last_updated_at);
    expect(afterReloadData!.started_at).toBe(null);
    expect(afterReloadData!.completed_at).toBe(null);
  });

  test.describe('startedAt', () => {
    test('is null for new goals', async ({ page }) => {
      const goalData = await getGoalData<{ started_at: string | null }>(
        page,
        firstGoalId,
        'started_at'
      );
      expect(goalData?.started_at).toBe(null);
    });

    test('is set on first title save', async ({ page }) => {
      // Open goal modal and edit title
      await page.getByTestId('goal-square').first().click();
      await page.waitForSelector('[data-testid="goal-modal"]');

      const titleInput = page.getByTestId('modal-title-input');
      await titleInput.fill('My First Goal');

      // Save and wait for modal to close (confirms async save completed)
      await page.getByTestId('save-goal-button').click();
      await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

      const goalData = await getGoalData<{ started_at: string; title: string }>(
        page,
        firstGoalId,
        'started_at, title'
      );

      expect(goalData?.title).toBe('My First Goal');
      expect(goalData?.started_at).not.toBe(null);
      expect(typeof goalData?.started_at).toBe('string');

      // Verify it's a valid ISO 8601 date
      const startedDate = new Date(goalData!.started_at);
      expect(startedDate.toString()).not.toBe('Invalid Date');
    });

    test('is set on first notes save', async ({ page }) => {
      // Open and expand goal modal
      await page.getByTestId('goal-square').first().click();
      await page.waitForSelector('[data-testid="goal-modal"]');
      await page.getByTestId('expand-modal-button').click();
      // Wait for expand animation (200ms CSS transition) before interacting
      await page.waitForTimeout(300);

      // Type into notes (title left empty)
      const richTextEditor = page.getByTestId('rich-text-editor');
      await richTextEditor.click();
      await richTextEditor.pressSequentially('These are my notes');
      // Verify TipTap has processed the input before saving
      await expect(richTextEditor).toContainText('These are my notes');

      // Save and wait for modal to close (confirms async save completed)
      await page.getByTestId('save-goal-button').click();
      await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

      const goalData = await getGoalData<{ started_at: string; notes: string }>(
        page,
        firstGoalId,
        'started_at, notes'
      );

      expect(goalData?.notes).toContain('These are my notes');
      expect(goalData?.started_at).not.toBe(null);
    });

    test('does not change on subsequent saves', async ({ page }) => {
      // First save — sets startedAt
      await page.getByTestId('goal-square').first().click();
      await page.waitForSelector('[data-testid="goal-modal"]');

      const titleInput = page.getByTestId('modal-title-input');
      await titleInput.fill('Initial Title');

      await page.getByTestId('save-goal-button').click();
      await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

      const initialData = await getGoalData<{ started_at: string }>(
        page,
        firstGoalId,
        'started_at'
      );
      expect(initialData?.started_at).not.toBe(null);

      // Wait to ensure a subsequent timestamp would differ
      await page.waitForTimeout(100);

      // Second save — startedAt must not change
      await page.getByTestId('goal-square').first().click();
      await page.waitForSelector('[data-testid="goal-modal"]');

      await titleInput.clear();
      await titleInput.fill('Updated Title');

      await page.getByTestId('save-goal-button').click();
      await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

      const updatedData = await getGoalData<{ started_at: string }>(
        page,
        firstGoalId,
        'started_at'
      );
      expect(updatedData?.started_at).toBe(initialData?.started_at);
    });
  });

  test.describe('completedAt', () => {
    test('is set when goal is completed', async ({ page }) => {
      // Mark goal as complete
      await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
      await page.waitForTimeout(300);

      const goalData = await getGoalData<{ completed_at: string; completed: boolean }>(
        page,
        firstGoalId,
        'completed_at, completed'
      );

      expect(goalData?.completed).toBe(true);
      expect(goalData?.completed_at).not.toBe(null);
      expect(typeof goalData?.completed_at).toBe('string');

      // Verify it's a valid ISO 8601 date
      const completedDate = new Date(goalData!.completed_at);
      expect(completedDate.toString()).not.toBe('Invalid Date');
    });

    test('is cleared when goal is unchecked', async ({ page }) => {
      const checkbox = page.getByTestId('goal-square').first().getByTestId('goal-checkbox');

      // Complete the goal
      await checkbox.click();
      await page.waitForTimeout(300);

      let goalData = await getGoalData<{ completed_at: string | null; completed: boolean }>(
        page,
        firstGoalId,
        'completed_at, completed'
      );
      expect(goalData?.completed).toBe(true);
      expect(goalData?.completed_at).not.toBe(null);

      // Uncheck it
      await checkbox.click();
      await page.waitForTimeout(300);

      goalData = await getGoalData<{ completed_at: string | null; completed: boolean }>(
        page,
        firstGoalId,
        'completed_at, completed'
      );
      expect(goalData?.completed).toBe(false);
      expect(goalData?.completed_at).toBe(null);
    });

    test('is updated if goal is re-completed', async ({ page }) => {
      const checkbox = page.getByTestId('goal-square').first().getByTestId('goal-checkbox');

      // First completion
      await checkbox.click();
      await page.waitForTimeout(300);

      const firstData = await getGoalData<{ completed_at: string }>(
        page,
        firstGoalId,
        'completed_at'
      );
      expect(firstData?.completed_at).not.toBe(null);

      // Uncomplete it, wait, then re-complete
      await checkbox.click();
      await page.waitForTimeout(300);
      await page.waitForTimeout(100); // Ensure timestamp will differ
      await checkbox.click();
      await page.waitForTimeout(300);

      const secondData = await getGoalData<{ completed_at: string }>(
        page,
        firstGoalId,
        'completed_at'
      );
      expect(secondData?.completed_at).not.toBe(null);
      // The new completedAt should be different (later) than the first
      expect(secondData?.completed_at).not.toBe(firstData?.completed_at);
    });
  });

  test.describe('lastUpdatedAt', () => {
    test('updates on title save', async ({ page }) => {
      const initialData = await getGoalData<{ last_updated_at: string }>(
        page,
        firstGoalId,
        'last_updated_at'
      );

      // Wait to ensure time difference
      await page.waitForTimeout(100);

      // Edit and save title
      await page.getByTestId('goal-square').first().click();
      await page.waitForSelector('[data-testid="goal-modal"]');

      const titleInput = page.getByTestId('modal-title-input');
      await titleInput.fill('Changed Title');

      await page.getByTestId('save-goal-button').click();
      await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

      const updatedData = await getGoalData<{ last_updated_at: string }>(
        page,
        firstGoalId,
        'last_updated_at'
      );

      expect(updatedData?.last_updated_at).not.toBe(initialData?.last_updated_at);

      // Verify new timestamp is after initial
      const initialDate = new Date(initialData!.last_updated_at);
      const updatedDate = new Date(updatedData!.last_updated_at);
      expect(updatedDate.getTime()).toBeGreaterThan(initialDate.getTime());
    });

    test('updates on notes save', async ({ page }) => {
      const initialData = await getGoalData<{ last_updated_at: string }>(
        page,
        firstGoalId,
        'last_updated_at'
      );

      // Wait to ensure time difference
      await page.waitForTimeout(100);

      // Open and expand modal, then type in notes and save
      await page.getByTestId('goal-square').first().click();
      await page.waitForSelector('[data-testid="goal-modal"]');
      await page.getByTestId('expand-modal-button').click();
      // Wait for expand animation (200ms CSS transition) before interacting
      await page.waitForTimeout(300);

      const richTextEditor = page.getByTestId('rich-text-editor');
      await richTextEditor.click();
      await richTextEditor.pressSequentially('Updated notes');
      // Verify TipTap has processed the input before saving
      await expect(richTextEditor).toContainText('Updated notes');

      await page.getByTestId('save-goal-button').click();
      await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

      const updatedData = await getGoalData<{ last_updated_at: string }>(
        page,
        firstGoalId,
        'last_updated_at'
      );

      expect(updatedData?.last_updated_at).not.toBe(initialData?.last_updated_at);
    });

    test('updates on completion toggle', async ({ page }) => {
      const initialData = await getGoalData<{ last_updated_at: string }>(
        page,
        firstGoalId,
        'last_updated_at'
      );

      // Wait to ensure time difference
      await page.waitForTimeout(100);

      // Toggle completion
      await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
      await page.waitForTimeout(300);

      const updatedData = await getGoalData<{ last_updated_at: string }>(
        page,
        firstGoalId,
        'last_updated_at'
      );

      expect(updatedData?.last_updated_at).not.toBe(initialData?.last_updated_at);
    });
  });
});
