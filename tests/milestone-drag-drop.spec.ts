// ABOUTME: End-to-end tests for milestone drag-and-drop reordering
// ABOUTME: Tests DndContext integration and reorderMilestones functionality

import { test, expect } from '@playwright/test';

test.describe('Milestone Drag and Drop', () => {
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

	test('renders milestones in position order', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Add three milestones
		const titles = ['First Milestone', 'Second Milestone', 'Third Milestone'];
		for (const title of titles) {
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', title);
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);
		}

		// Get milestone elements
		const milestoneTexts = await page
			.locator('[data-drag-handle]')
			.locator('..')
			.locator('span')
			.nth(1)
			.allTextContents();

		// Verify order matches insertion order
		expect(milestoneTexts[0]).toContain('First Milestone');
		expect(milestoneTexts[1]).toContain('Second Milestone');
		expect(milestoneTexts[2]).toContain('Third Milestone');
	});

	test('allows dragging a milestone to a new position', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Add three milestones
		const titles = ['First', 'Second', 'Third'];
		for (const title of titles) {
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', title);
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);
		}

		// Get drag handles
		const firstHandle = page.locator('text=First').locator('..').locator('[data-drag-handle]');
		const thirdHandle = page.locator('text=Third').locator('..').locator('[data-drag-handle]');

		// Get bounding boxes
		const firstBox = await firstHandle.boundingBox();
		const thirdBox = await thirdHandle.boundingBox();

		if (!firstBox || !thirdBox) {
			throw new Error('Could not get bounding boxes for drag handles');
		}

		// Drag first milestone to third position
		await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(thirdBox.x + thirdBox.width / 2, thirdBox.y + thirdBox.height / 2, {
			steps: 10
		});
		await page.mouse.up();
		await page.waitForTimeout(500);

		// Verify new order in UI
		const milestoneTexts = await page
			.locator('[data-drag-handle]')
			.locator('..')
			.locator('span')
			.nth(1)
			.allTextContents();

		expect(milestoneTexts[0]).toContain('Second');
		expect(milestoneTexts[1]).toContain('Third');
		expect(milestoneTexts[2]).toContain('First');
	});

	test('persists new positions to database', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Add three milestones
		const titles = ['First', 'Second', 'Third'];
		for (const title of titles) {
			await page.click('text=+ Add');
			await page.fill('input[placeholder="New milestone..."]', title);
			await page.click('button.bg-blue-500:has-text("Add")');
			await page.waitForTimeout(300);
		}

		// Drag first to last position
		const firstHandle = page.locator('text=First').locator('..').locator('[data-drag-handle]');
		const thirdHandle = page.locator('text=Third').locator('..').locator('[data-drag-handle]');

		const firstBox = await firstHandle.boundingBox();
		const thirdBox = await thirdHandle.boundingBox();

		if (!firstBox || !thirdBox) {
			throw new Error('Could not get bounding boxes');
		}

		await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(thirdBox.x + thirdBox.width / 2, thirdBox.y + thirdBox.height / 2, {
			steps: 10
		});
		await page.mouse.up();
		await page.waitForTimeout(500);

		// Verify positions in database
		const milestoneData = await page.evaluate(async (goalId) => {
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data } = await supabase
				.from('milestones')
				.select('title, position')
				.eq('goal_id', goalId)
				.order('position', { ascending: true });

			return data;
		}, firstGoalId);

		expect(milestoneData).toHaveLength(3);
		expect(milestoneData![0].title).toBe('Second');
		expect(milestoneData![0].position).toBe(0);
		expect(milestoneData![1].title).toBe('Third');
		expect(milestoneData![1].position).toBe(1);
		expect(milestoneData![2].title).toBe('First');
		expect(milestoneData![2].position).toBe(2);
	});

	test('updates parent goal lastUpdatedAt on reorder', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Add two milestones
		await page.click('text=+ Add');
		await page.fill('input[placeholder="New milestone..."]', 'First');
		await page.click('button.bg-blue-500:has-text("Add")');
		await page.waitForTimeout(300);

		await page.click('text=+ Add');
		await page.fill('input[placeholder="New milestone..."]', 'Second');
		await page.click('button.bg-blue-500:has-text("Add")');
		await page.waitForTimeout(300);

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

		// Wait to ensure timestamp will differ
		await page.waitForTimeout(100);

		// Drag first to second position
		const firstHandle = page.locator('text=First').locator('..').locator('[data-drag-handle]');
		const secondHandle = page.locator('text=Second').locator('..').locator('[data-drag-handle]');

		const firstBox = await firstHandle.boundingBox();
		const secondBox = await secondHandle.boundingBox();

		if (!firstBox || !secondBox) {
			throw new Error('Could not get bounding boxes');
		}

		await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2, {
			steps: 10
		});
		await page.mouse.up();
		await page.waitForTimeout(500);

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

	test('handles drag with expanded milestones', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Add two milestones
		await page.click('text=+ Add');
		await page.fill('input[placeholder="New milestone..."]', 'First');
		await page.click('button.bg-blue-500:has-text("Add")');
		await page.waitForTimeout(300);

		await page.click('text=+ Add');
		await page.fill('input[placeholder="New milestone..."]', 'Second');
		await page.click('button.bg-blue-500:has-text("Add")');
		await page.waitForTimeout(300);

		// Expand first milestone
		await page.locator('text=First').locator('..').locator('button').last().click();
		await page.waitForTimeout(200);

		// Verify expanded (should have input field visible)
		const titleInput = await page.locator('input[placeholder="Milestone title..."]').count();
		expect(titleInput).toBeGreaterThan(0);

		// Drag expanded milestone to second position
		const firstHandle = page.locator('[data-drag-handle]').first();
		const secondHandle = page.locator('[data-drag-handle]').nth(1);

		const firstBox = await firstHandle.boundingBox();
		const secondBox = await secondHandle.boundingBox();

		if (!firstBox || !secondBox) {
			throw new Error('Could not get bounding boxes');
		}

		await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2, {
			steps: 10
		});
		await page.mouse.up();
		await page.waitForTimeout(500);

		// Verify milestone is still expanded and order changed
		const titleInputAfter = await page.locator('input[placeholder="Milestone title..."]').count();
		expect(titleInputAfter).toBeGreaterThan(0);

		// Verify order in database
		const milestoneData = await page.evaluate(async (goalId) => {
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data } = await supabase
				.from('milestones')
				.select('title, position')
				.eq('goal_id', goalId)
				.order('position', { ascending: true });

			return data;
		}, firstGoalId);

		expect(milestoneData![0].title).toBe('Second');
		expect(milestoneData![1].title).toBe('First');
	});

	test('does nothing when dropped in same position', async ({ page }) => {
		// Open goal modal
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Add two milestones
		await page.click('text=+ Add');
		await page.fill('input[placeholder="New milestone..."]', 'First');
		await page.click('button.bg-blue-500:has-text("Add")');
		await page.waitForTimeout(300);

		await page.click('text=+ Add');
		await page.fill('input[placeholder="New milestone..."]', 'Second');
		await page.click('button.bg-blue-500:has-text("Add")');
		await page.waitForTimeout(300);

		// Get initial positions
		const initialData = await page.evaluate(async (goalId) => {
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data } = await supabase
				.from('milestones')
				.select('title, position')
				.eq('goal_id', goalId)
				.order('position', { ascending: true });

			return data;
		}, firstGoalId);

		// Drag first milestone slightly but drop in same position
		const firstHandle = page.locator('[data-drag-handle]').first();
		const firstBox = await firstHandle.boundingBox();

		if (!firstBox) {
			throw new Error('Could not get bounding box');
		}

		await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(firstBox.x + firstBox.width / 2 + 5, firstBox.y + firstBox.height / 2);
		await page.mouse.up();
		await page.waitForTimeout(500);

		// Verify positions unchanged
		const finalData = await page.evaluate(async (goalId) => {
			// @ts-expect-error - Browser import path, works at runtime via Vite
			const supabaseModule = await import('/src/lib/supabaseClient');
			const { supabase } = supabaseModule;

			const { data } = await supabase
				.from('milestones')
				.select('title, position')
				.eq('goal_id', goalId)
				.order('position', { ascending: true });

			return data;
		}, firstGoalId);

		expect(finalData).toEqual(initialData);
	});
});
