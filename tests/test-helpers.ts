// ABOUTME: Shared test utilities for reducing duplication across test files
// ABOUTME: Provides board setup/teardown, Supabase queries, and common test actions

import type { Page } from '@playwright/test';

/**
 * Creates a new test board and navigates to it
 * Returns the board ID for cleanup
 */
export async function createTestBoard(page: Page): Promise<string> {
  await page.goto('/dashboard');

  // Create a new board
  await page.click('button:has-text("New Board")');
  await page.waitForSelector('input[id="board-name"]');

  const boardName = `Test Board ${Date.now()}`;
  await page.fill('input[id="board-name"]', boardName);

  // Click the Create Board button in the modal
  await page.click('button[type="submit"]:has-text("Create Board")');

  // Wait for modal to close
  await page.waitForSelector('input[id="board-name"]', { state: 'hidden', timeout: 5000 });

  // Wait for the new board to appear and click it
  await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });
  await page.click(`text=${boardName}`);

  // Wait for navigation to board page
  await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
  const url = page.url();
  const boardId = url.split('/').pop()!;

  // Wait for board to load
  await page.waitForSelector('[data-testid="goal-square"]');

  return boardId;
}

/**
 * Deletes a test board by ID
 */
export async function deleteTestBoard(page: Page, boardId: string): Promise<void> {
  await page.evaluate(async (id) => {
    // @ts-expect-error - Browser import path, works at runtime via Vite
    const supabaseModule = await import('/src/lib/supabaseClient');
    const { supabase } = supabaseModule;

    await supabase.from('boards').delete().eq('id', id);
  }, boardId);
}

/**
 * Gets the first goal ID for a board
 */
export async function getFirstGoalId(page: Page, boardId: string): Promise<string> {
  return await page.evaluate(async (id) => {
    // @ts-expect-error - Browser import path, works at runtime via Vite
    const supabaseModule = await import('/src/lib/supabaseClient');
    const { supabase } = supabaseModule;

    const { data } = await supabase.from('goals').select('id').eq('board_id', id).limit(1).single();

    return data?.id;
  }, boardId);
}

/**
 * Queries goal data from Supabase
 */
export async function getGoalData<T = any>(
  page: Page,
  goalId: string,
  fields: string = '*'
): Promise<T | null> {
  return await page.evaluate(
    async ({ id, selectFields }) => {
      // @ts-expect-error - Browser import path, works at runtime via Vite
      const supabaseModule = await import('/src/lib/supabaseClient');
      const { supabase } = supabaseModule;

      const { data, error } = await supabase
        .from('goals')
        .select(selectFields)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    { id: goalId, selectFields: fields }
  );
}

/**
 * Opens the modal for the first goal
 */
export async function openFirstGoalModal(page: Page): Promise<void> {
  await page.getByTestId('goal-square').first().click();
  await page.waitForSelector('[data-testid="goal-modal"]');
  // Wait for any in-flight network requests (e.g. a prior save) to settle so
  // Svelte's reactive graph finishes updating before we interact with the modal.
  await page.waitForLoadState('networkidle');
}

/**
 * Expands the goal modal to show notes, milestones, and date metadata
 *
 * Uses waitForFunction + evaluate to click atomically inside the browser,
 * avoiding the race where Svelte reactive re-renders detach the button between
 * Playwright's "resolve" and "click" steps (particularly after a save that
 * triggers an optimistic store update).
 */
export async function expandGoalModal(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const btn = document.querySelector<HTMLElement>('[data-testid="expand-modal-button"]');
    if (!btn) return false;
    btn.click();
    return true;
  });
}

/**
 * Closes the modal using Escape key and waits for it to fully disappear
 */
export async function closeModal(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page
    .getByTestId('goal-modal')
    .waitFor({ state: 'hidden', timeout: 5000 })
    .catch(() => {});
}

/**
 * Wait for auto-save to complete by watching for the debounced PATCH request to /goals
 */
export async function waitForAutoSave(page: Page): Promise<void> {
  await page.waitForResponse(
    (resp) => resp.url().includes('/goals') && resp.request().method() === 'PATCH',
    { timeout: 5000 }
  );
}

/**
 * Wait for checkbox update to complete by watching for the PATCH request to /goals
 */
export async function waitForCheckboxUpdate(page: Page): Promise<void> {
  await page.waitForResponse(
    (resp) => resp.url().includes('/goals') && resp.request().method() === 'PATCH',
    { timeout: 5000 }
  );
}

/**
 * Adds a milestone to the currently open (and expanded) goal modal
 */
export async function addMilestone(page: Page, title: string): Promise<void> {
  await page.click('text=+ Add');
  await page.fill('input[placeholder="New milestone..."]', title);
  const saveRequest = page.waitForResponse(
    (resp) => resp.url().includes('/milestones') && resp.request().method() === 'POST',
    { timeout: 5000 }
  );
  await page.click('button.bg-blue-500:has-text("Add")');
  await saveRequest;
}

/**
 * Returns all milestones for a goal, ordered by position
 */
export async function getMilestonesForGoal(
  page: Page,
  goalId: string,
  fields = '*'
): Promise<any[]> {
  return await page.evaluate(
    async ({ id, selectFields }) => {
      // @ts-expect-error - Browser import path, works at runtime via Vite
      const supabaseModule = await import('/src/lib/supabaseClient');
      const { supabase } = supabaseModule;

      const { data } = await supabase
        .from('milestones')
        .select(selectFields)
        .eq('goal_id', id)
        .order('position', { ascending: true });

      return data ?? [];
    },
    { id: goalId, selectFields: fields }
  );
}

/**
 * Returns a single milestone for a goal (first match)
 */
export async function getMilestoneForGoal(
  page: Page,
  goalId: string,
  fields = '*'
): Promise<any | null> {
  return await page.evaluate(
    async ({ id, selectFields }) => {
      // @ts-expect-error - Browser import path, works at runtime via Vite
      const supabaseModule = await import('/src/lib/supabaseClient');
      const { supabase } = supabaseModule;

      const { data } = await supabase
        .from('milestones')
        .select(selectFields)
        .eq('goal_id', id)
        .single();

      return data;
    },
    { id: goalId, selectFields: fields }
  );
}
