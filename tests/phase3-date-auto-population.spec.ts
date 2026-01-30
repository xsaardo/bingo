// ABOUTME: Integration tests for Phase 3 - Date Auto-Population Logic
// ABOUTME: Tests startedAt, completedAt, and lastUpdatedAt fields with automatic date tracking

import { test, expect } from '@playwright/test';

test.describe('Phase 3: Date Auto-Population Logic', () => {
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

		// Select 3x3 size
		const size3Button = page.locator('button').filter({ hasText: '3×3' });
		await size3Button.click();

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

	test.describe('startedAt auto-population', () => {
		test('should be null for new goals', async ({ page }) => {
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

		test('should set on first title edit', async ({ page }) => {
			// Open sidebar for first goal
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-sidebar"]');

			// Edit title
			const titleInput = page.locator('input').first();
			await titleInput.fill('My First Goal');

			// Wait for auto-save
			await page.waitForTimeout(600);

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

		test('should set on first notes edit', async ({ page }) => {
			// Open sidebar for first goal
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-sidebar"]');

			// Edit notes (skip title)
			const notesTextarea = page.locator('textarea').first();
			await notesTextarea.fill('These are my notes');

			// Wait for auto-save
			await page.waitForTimeout(600);

			// Check startedAt is now set
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

			expect(goalData?.notes).toBe('These are my notes');
			expect(goalData?.started_at).not.toBe(null);
		});

		test('should NOT change on subsequent edits', async ({ page }) => {
			// First edit - set title
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-sidebar"]');

			const titleInput = page.locator('input').first();
			await titleInput.fill('Initial Title');
			await page.waitForTimeout(600);

			// Get initial startedAt
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

			// Wait a bit to ensure time would be different
			await page.waitForTimeout(100);

			// Second edit - change title
			await titleInput.clear();
			await titleInput.fill('Updated Title');
			await page.waitForTimeout(600);

			// Get updated startedAt
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

			// startedAt should not have changed
			expect(updatedStartedAt).toBe(initialStartedAt);
		});
	});

	test.describe('completedAt auto-population', () => {
		test('should set when goal marked complete', async ({ page }) => {
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

		test('should clear when goal unchecked', async ({ page }) => {
			// First, complete the goal
			await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
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

			// Now uncheck it
			await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
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

		test('should update if goal re-completed', async ({ page }) => {
			// First completion
			await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
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

			// Uncomplete it
			await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
			await page.waitForTimeout(300);

			// Wait to ensure time difference
			await page.waitForTimeout(100);

			// Complete it again
			await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
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

	test.describe('lastUpdatedAt auto-population', () => {
		test('should update on title change', async ({ page }) => {
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

			// Edit title
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-sidebar"]');

			const titleInput = page.locator('input').first();
			await titleInput.fill('Changed Title');
			await page.waitForTimeout(600);

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

			// lastUpdatedAt should have changed
			expect(updatedLastUpdated).not.toBe(initialLastUpdated);

			// Verify new timestamp is after initial
			const initialDate = new Date(initialLastUpdated!);
			const updatedDate = new Date(updatedLastUpdated!);
			expect(updatedDate.getTime()).toBeGreaterThan(initialDate.getTime());
		});

		test('should update on notes change', async ({ page }) => {
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

			// Edit notes
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-sidebar"]');

			const notesTextarea = page.locator('textarea').first();
			await notesTextarea.fill('Updated notes');
			await page.waitForTimeout(600);

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

			// lastUpdatedAt should have changed
			expect(updatedLastUpdated).not.toBe(initialLastUpdated);
		});

		test('should update on completion toggle', async ({ page }) => {
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

			// lastUpdatedAt should have changed
			expect(updatedLastUpdated).not.toBe(initialLastUpdated);
		});
	});
});
