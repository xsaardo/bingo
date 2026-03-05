// ABOUTME: Integration tests for automatic date tracking on goals
// ABOUTME: Verifies startedAt, completedAt, and lastUpdatedAt are set correctly on user actions

import { test, expect } from '@playwright/test';

test.describe('Goal Date Tracking', () => {
	let testBoardId: string;
	let firstGoalId: string;

	// Create a fresh test board before each test
	test.beforeEach(async ({ page }) => {
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
		testBoardId = url.split('/').pop()!;

		// Wait for board to load and get first goal ID
		await page.waitForSelector('[data-testid="goal-square"]');

		firstGoalId = await page.evaluate(async (boardId) => {
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data } = await supabase
				.from('goals')
				.select('id')
				.eq('board_id', boardId)
				.limit(1)
				.single();

			return data?.id;
		}, testBoardId);
	});

	// Clean up test board after each test
	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await page.evaluate(async (boardId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				await supabase.from('boards').delete().eq('id', boardId);
			}, testBoardId);
		}
	});

	test.describe('startedAt', () => {
		test('is null for new goals', async ({ page }) => {
			const goalData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('started_at')
					.eq('id', goalId)
					.single();

				return data;
			}, firstGoalId);

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

			// Check startedAt is now set
			const goalData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('started_at, title')
					.eq('id', goalId)
					.single();

				return data;
			}, firstGoalId);

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

			// Check startedAt is now set and notes were saved
			const goalData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('started_at, notes')
					.eq('id', goalId)
					.single();

				return data;
			}, firstGoalId);

			expect(goalData?.notes).toContain('These are my notes');
			expect(goalData?.started_at).not.toBe(null);
		});

		test('does not change on subsequent saves', async ({ page }) => {
			// First save — sets startedAt
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');

			const titleInput = page.getByTestId('modal-title-input');
			await titleInput.fill('Initial Title');

			// Save and wait for modal to close (confirms async save completed)
			await page.getByTestId('save-goal-button').click();
			await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

			// Capture the startedAt set by the first save
			const initialStartedAt = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('started_at')
					.eq('id', goalId)
					.single();

				return data?.started_at;
			}, firstGoalId);

			expect(initialStartedAt).not.toBe(null);

			// Wait to ensure a subsequent timestamp would differ
			await page.waitForTimeout(100);

			// Second save — startedAt must not change
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');

			await titleInput.clear();
			await titleInput.fill('Updated Title');

			// Save and wait for modal to close (confirms async save completed)
			await page.getByTestId('save-goal-button').click();
			await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

			// Verify startedAt is unchanged
			const updatedStartedAt = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('started_at')
					.eq('id', goalId)
					.single();

				return data?.started_at;
			}, firstGoalId);

			expect(updatedStartedAt).toBe(initialStartedAt);
		});
	});

	test.describe('completedAt', () => {
		test('is set when goal is completed', async ({ page }) => {
			// Mark goal as complete
			await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
			await page.waitForTimeout(300);

			// Check completedAt is now set
			const goalData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('completed_at, completed')
					.eq('id', goalId)
					.single();

				return data;
			}, firstGoalId);

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

			// Verify it's completed
			let goalData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('completed_at, completed')
					.eq('id', goalId)
					.single();

				return data;
			}, firstGoalId);

			expect(goalData?.completed).toBe(true);
			expect(goalData?.completed_at).not.toBe(null);

			// Uncheck it
			await checkbox.click();
			await page.waitForTimeout(300);

			// Check completedAt is now null
			goalData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('completed_at, completed')
					.eq('id', goalId)
					.single();

				return data;
			}, firstGoalId);

			expect(goalData?.completed).toBe(false);
			expect(goalData?.completed_at).toBe(null);
		});

		test('is updated if goal is re-completed', async ({ page }) => {
			const checkbox = page.getByTestId('goal-square').first().getByTestId('goal-checkbox');

			// First completion
			await checkbox.click();
			await page.waitForTimeout(300);

			const firstCompletedAt = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('completed_at')
					.eq('id', goalId)
					.single();

				return data?.completed_at;
			}, firstGoalId);

			expect(firstCompletedAt).not.toBe(null);

			// Uncomplete it, wait, then re-complete
			await checkbox.click();
			await page.waitForTimeout(300);
			await page.waitForTimeout(100); // Ensure timestamp will differ
			await checkbox.click();
			await page.waitForTimeout(300);

			const secondCompletedAt = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('completed_at')
					.eq('id', goalId)
					.single();

				return data?.completed_at;
			}, firstGoalId);

			expect(secondCompletedAt).not.toBe(null);
			// The new completedAt should be different (later) than the first
			expect(secondCompletedAt).not.toBe(firstCompletedAt);
		});
	});

	test.describe('lastUpdatedAt', () => {
		test('updates on title save', async ({ page }) => {
			// Get initial lastUpdatedAt
			const initialLastUpdated = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('last_updated_at')
					.eq('id', goalId)
					.single();

				return data?.last_updated_at;
			}, firstGoalId);

			// Wait to ensure time difference
			await page.waitForTimeout(100);

			// Edit and save title
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');

			const titleInput = page.getByTestId('modal-title-input');
			await titleInput.fill('Changed Title');

			// Save and wait for modal to close (confirms async save completed)
			await page.getByTestId('save-goal-button').click();
			await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

			// Get updated lastUpdatedAt
			const updatedLastUpdated = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('last_updated_at')
					.eq('id', goalId)
					.single();

				return data?.last_updated_at;
			}, firstGoalId);

			expect(updatedLastUpdated).not.toBe(initialLastUpdated);

			// Verify new timestamp is after initial
			const initialDate = new Date(initialLastUpdated!);
			const updatedDate = new Date(updatedLastUpdated!);
			expect(updatedDate.getTime()).toBeGreaterThan(initialDate.getTime());
		});

		test('updates on notes save', async ({ page }) => {
			// Get initial lastUpdatedAt
			const initialLastUpdated = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('last_updated_at')
					.eq('id', goalId)
					.single();

				return data?.last_updated_at;
			}, firstGoalId);

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

			// Save and wait for modal to close (confirms async save completed)
			await page.getByTestId('save-goal-button').click();
			await page.waitForSelector('[data-testid="goal-modal"]', { state: 'hidden' });

			// Get updated lastUpdatedAt
			const updatedLastUpdated = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('last_updated_at')
					.eq('id', goalId)
					.single();

				return data?.last_updated_at;
			}, firstGoalId);

			expect(updatedLastUpdated).not.toBe(initialLastUpdated);
		});

		test('updates on completion toggle', async ({ page }) => {
			// Get initial lastUpdatedAt
			const initialLastUpdated = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('last_updated_at')
					.eq('id', goalId)
					.single();

				return data?.last_updated_at;
			}, firstGoalId);

			// Wait to ensure time difference
			await page.waitForTimeout(100);

			// Toggle completion
			await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
			await page.waitForTimeout(300);

			// Get updated lastUpdatedAt
			const updatedLastUpdated = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('goals')
					.select('last_updated_at')
					.eq('id', goalId)
					.single();

				return data?.last_updated_at;
			}, firstGoalId);

			expect(updatedLastUpdated).not.toBe(initialLastUpdated);
		});
	});
});
