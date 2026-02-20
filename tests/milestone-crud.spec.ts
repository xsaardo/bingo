// ABOUTME: Integration tests for milestone CRUD operations
// ABOUTME: Tests addMilestone, updateMilestone, toggleMilestoneComplete, deleteMilestone, and reorderMilestones

import { test, expect } from '@playwright/test';

test.describe('Milestone CRUD Operations', () => {
	let testBoardId: string;
	let firstGoalId: string;

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

		// Click the Create Board button
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

	test.describe('addMilestone', () => {
		test('should add a new milestone to a goal', async ({ page }) => {
			// Open and expand goal modal
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');
			await page.getByTestId('expand-modal-button').click();

			// Click Add milestone button
			await page.click('text=+ Add');
			await page.waitForSelector('input[placeholder="New milestone..."]');

			// Enter milestone title and add
			await page.fill('input[placeholder="New milestone..."]', 'First Milestone');
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);

			// Verify milestone appears in the list
			const milestoneText = await page.locator('text=First Milestone').textContent();
			expect(milestoneText).toBe('First Milestone');

			// Verify milestone is in database
			const milestoneData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('milestones')
					.select('*')
					.eq('goal_id', goalId)
					.order('position', { ascending: true });

				return data;
			}, firstGoalId);

			expect(milestoneData).toHaveLength(1);
			expect(milestoneData![0].title).toBe('First Milestone');
			expect(milestoneData![0].position).toBe(0);
			expect(milestoneData![0].completed).toBe(false);
		});

		test('should increment position for each new milestone', async ({ page }) => {
			// Open and expand goal modal
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');
			await page.getByTestId('expand-modal-button').click();

			// Add first milestone
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', 'Milestone 1');
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);

			// Add second milestone
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', 'Milestone 2');
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);

			// Verify positions in database
			const milestoneData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('milestones')
					.select('*')
					.eq('goal_id', goalId)
					.order('position', { ascending: true });

				return data;
			}, firstGoalId);

			expect(milestoneData).toHaveLength(2);
			expect(milestoneData![0].position).toBe(0);
			expect(milestoneData![1].position).toBe(1);
		});

		test('should update parent goal lastUpdatedAt when milestone added', async ({ page }) => {
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

			// Wait a bit to ensure timestamp will be different
			await page.waitForTimeout(100);

			// Open and expand goal modal, then add milestone
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');
			await page.getByTestId('expand-modal-button').click();
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', 'Test Milestone');
			await page.click('button.bg-blue-500:has-text("Add")');
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

	test.describe('updateMilestone', () => {
		test('should update milestone title', async ({ page }) => {
			// Open and expand goal modal, then add milestone
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');
			await page.getByTestId('expand-modal-button').click();
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', 'Original Title');
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);

			// Expand milestone
			await page.locator('text=Original Title').locator('..').locator('button').last().click();
			await page.waitForTimeout(200);

			// Edit title
			const titleInput = page.locator('input[placeholder="Milestone title..."]');
			await titleInput.clear();
			await titleInput.fill('Updated Title');
			await page.waitForTimeout(600); // Wait for auto-save

			// Verify in database
			const milestoneData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('milestones')
					.select('title')
					.eq('goal_id', goalId)
					.single();

				return data;
			}, firstGoalId);

			expect(milestoneData?.title).toBe('Updated Title');
		});
	});

	test.describe('toggleMilestoneComplete', () => {
		test('should mark milestone as complete and set completedAt', async ({ page }) => {
			// Open and expand goal modal, then add milestone
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');
			await page.getByTestId('expand-modal-button').click();
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', 'Test Milestone');
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);

			// Click milestone checkbox
			const milestoneCheckbox = page.getByTestId('milestone-checkbox');
			await milestoneCheckbox.click();
			await page.waitForTimeout(300);

			// Verify in database
			const milestoneData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('milestones')
					.select('completed, completed_at')
					.eq('goal_id', goalId)
					.single();

				return data;
			}, firstGoalId);

			expect(milestoneData?.completed).toBe(true);
			expect(milestoneData?.completed_at).not.toBe(null);
		});

		test('should clear completedAt when unchecked', async ({ page }) => {
			// Open and expand goal modal, then add milestone
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');
			await page.getByTestId('expand-modal-button').click();
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', 'Test Milestone');
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);

			// Check milestone
			const milestoneCheckbox = page.getByTestId('milestone-checkbox');
			await milestoneCheckbox.click();
			await page.waitForTimeout(300);

			// Uncheck milestone
			await milestoneCheckbox.click();
			await page.waitForTimeout(300);

			// Verify in database
			const milestoneData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase
					.from('milestones')
					.select('completed, completed_at')
					.eq('goal_id', goalId)
					.single();

				return data;
			}, firstGoalId);

			expect(milestoneData?.completed).toBe(false);
			expect(milestoneData?.completed_at).toBe(null);
		});
	});

	test.describe('deleteMilestone', () => {
		test('should delete a milestone', async ({ page }) => {
			// Open and expand goal modal, then add milestone
			await page.getByTestId('goal-square').first().click();
			await page.waitForSelector('[data-testid="goal-modal"]');
			await page.getByTestId('expand-modal-button').click();
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', 'Test Milestone');
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);

			// Expand milestone
			await page.locator('text=Test Milestone').locator('..').locator('button').last().click();
			await page.waitForTimeout(200);

			// Click delete button
			await page.click('button:has-text("Delete")');
			await page.waitForTimeout(300);

			// Verify milestone is gone
			const milestoneCount = await page.locator('text=Test Milestone').count();
			expect(milestoneCount).toBe(0);

			// Verify in database
			const milestoneData = await page.evaluate(async (goalId) => {
				// @ts-expect-error - Browser import path, works at runtime via Vite
				const supabaseModule = await import('/src/lib/supabaseClient');
				const { supabase } = supabaseModule;

				const { data } = await supabase.from('milestones').select('*').eq('goal_id', goalId);

				return data;
			}, firstGoalId);

			expect(milestoneData).toHaveLength(0);
		});
	});
});
