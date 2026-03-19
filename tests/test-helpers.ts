// ABOUTME: Shared test utilities for reducing duplication across test files
// ABOUTME: Provides board setup/teardown, Supabase queries, and common test actions

import { type Page, expect } from '@playwright/test';

/**
 * Creates a new test board and navigates to it
 * Returns the board ID for cleanup
 */
export async function createTestBoard(page: Page): Promise<string> {
  // Set up the response waiter before navigation so we don't miss the fast response.
  // fetchBoards() (called on dashboard mount) can return stale data that overwrites the
  // optimistic store update from createBoard() if both are in-flight simultaneously.
  // Awaiting the initial GET here ensures the mount fetch is done before we create.
  const initialFetch = page.waitForResponse(
    (resp) => resp.url().includes('/boards') && resp.request().method() === 'GET',
    { timeout: 10000 }
  );
  await page.goto('/dashboard');
  await initialFetch;

  // Create a new board
  await page.getByRole('button', { name: 'New Board' }).click();
  await expect(page.getByLabel('Board Name', { exact: false })).toBeVisible();

  const boardName = `Test Board ${Date.now()}`;
  await page.getByLabel('Board Name', { exact: false }).fill(boardName);

  // Set up waiter for the board creation POST request before clicking Create Board
  const createRequest = page.waitForResponse(
    (resp) => resp.url().includes('/boards') && resp.request().method() === 'POST',
    { timeout: 10000 }
  );

  // Click the Create Board button in the modal
  await page.getByRole('button', { name: 'Create Board' }).click();

  // Wait for the board creation to complete
  await createRequest;

  // Wait for the dialog to fully close before looking for the new board card
  await expect(page.getByRole('dialog')).not.toBeVisible();

  // Wait for the new board card to appear and click it
  await expect(page.getByRole('heading', { name: boardName })).toBeVisible();
  await page.getByRole('heading', { name: boardName }).click();

  // Wait for navigation to board page
  await page.waitForURL(/\/boards\/.+/, { timeout: 10000 });
  const url = page.url();
  const boardId = url.split('/').pop()!;

  // Wait for board to load
  await expect(page.getByTestId('goal-square').first()).toBeVisible();

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
  await expect(page.getByTestId('goal-modal')).toBeVisible();
  // Wait for the modal to be fully rendered and stable before returning.
  // The title input is a reliable "modal is ready" indicator — it's always
  // present and gets auto-focused, so waiting for it ensures the footer
  // (including expand-modal-button) is also fully mounted.
  await page.getByTestId('modal-title-input').waitFor({ state: 'visible' });
}

/**
 * Expands the goal modal to show notes, milestones, and date metadata
 */
export async function expandGoalModal(page: Page): Promise<void> {
  await page.getByTestId('expand-modal-button').click();
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
 * Wait for a goal PATCH request to complete (covers auto-save and checkbox updates)
 */
export async function waitForGoalPatch(page: Page): Promise<void> {
  await page.waitForResponse(
    (resp) => resp.url().includes('/goals') && resp.request().method() === 'PATCH',
    { timeout: 5000 }
  );
}

/**
 * Adds a milestone to the currently open (and expanded) goal modal
 */
export async function addMilestone(page: Page, title: string): Promise<void> {
  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  await page.getByPlaceholder('New milestone...').fill(title);
  const saveRequest = page.waitForResponse(
    (resp) => resp.url().includes('/milestones') && resp.request().method() === 'POST',
    { timeout: 5000 }
  );
  await page.getByRole('button', { name: 'Add', exact: true }).click();
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
