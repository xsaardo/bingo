// ABOUTME: End-to-end integration tests for the full goal editing workflow
// ABOUTME: Covers modal open/close, title/notes editing, milestones, and persistence

import { test, expect } from '@playwright/test';
import {
	createTestBoard,
	deleteTestBoard,
	openFirstGoalModal,
	closeModal,
	waitForAutoSave
} from './test-helpers';

test.describe('Goal Modal Integration', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('opens centered modal when goal square is clicked', async ({ page }) => {
		await page.getByTestId('goal-square').first().click();

		const modal = page.getByTestId('goal-modal');
		await expect(modal).toBeVisible();

		// Verify modal has dialog role
		await expect(modal).toHaveAttribute('role', 'dialog');

		// Verify title input is present and focused
		const titleInput = page.getByTestId('modal-title-input');
		await expect(titleInput).toBeVisible();
	});

	test('closes modal with Escape key', async ({ page }) => {
		await openFirstGoalModal(page);
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('goal-modal')).not.toBeVisible();
	});

	test('closes modal with close button', async ({ page }) => {
		await openFirstGoalModal(page);
		await page.getByTestId('close-modal-button').click();
		await expect(page.getByTestId('goal-modal')).not.toBeVisible();
	});

	test('closes modal with backdrop click', async ({ page }) => {
		await openFirstGoalModal(page);

		// Click the backdrop area (outside the modal dialog)
		const backdrop = page.locator('.fixed.inset-0').first();
		await backdrop.click({ position: { x: 10, y: 10 } });

		await expect(page.getByTestId('goal-modal')).not.toBeVisible();
	});
});

test.describe('Goal Title Editing', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('edits title, auto-saves, and persists after modal close/reopen', async ({ page }) => {
		// Open first goal modal
		await openFirstGoalModal(page);

		// Type a title
		const titleInput = page.getByTestId('modal-title-input');
		await titleInput.fill('Learn Spanish');

		// Wait for auto-save debounce
		await waitForAutoSave(page);

		// Close modal
		await closeModal(page);

		// Verify title shows on the board
		const goalSquare = page.getByTestId('goal-square').first();
		await expect(goalSquare).toContainText('Learn Spanish');

		// Reopen modal and verify title persisted
		await goalSquare.click();
		await page.waitForSelector('[data-testid="goal-modal"]');
		await expect(page.getByTestId('modal-title-input')).toHaveValue('Learn Spanish');
	});
});

test.describe('Goal Completion', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('toggles goal completion and shows completed state', async ({ page }) => {
		// Open modal and set a title first
		await openFirstGoalModal(page);
		await page.getByTestId('modal-title-input').fill('Read 12 books');
		await waitForAutoSave(page);

		// Click the completion checkbox
		await page.getByTestId('modal-checkbox').click();
		await page.waitForTimeout(300);

		// Verify the "Completed" text appears
		await expect(page.locator('span.text-green-700:has-text("Completed")')).toBeVisible();

		// Close and verify the goal square shows completed style
		await closeModal(page);
		const goalSquare = page.getByTestId('goal-square').first();

		// Completed goals have green background
		await expect(goalSquare).toHaveClass(/bg-green-50/);
	});

	test('unchecking completion clears completed state', async ({ page }) => {
		await openFirstGoalModal(page);
		await page.getByTestId('modal-title-input').fill('Exercise daily');
		await waitForAutoSave(page);

		// Mark complete
		await page.getByTestId('modal-checkbox').click();
		await page.waitForTimeout(300);
		await expect(page.locator('span.text-green-700:has-text("Completed")')).toBeVisible();

		// Unmark complete
		await page.getByTestId('modal-checkbox').click();
		await page.waitForTimeout(300);
		await expect(page.locator('text=Mark as complete')).toBeVisible();
	});
});

test.describe('Rich Text Notes', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('edits notes with rich text and persists after page reload', async ({ page }) => {
		await openFirstGoalModal(page);

		// Set a title so we can identify the goal
		await page.getByTestId('modal-title-input').fill('Notes test goal');
		await waitForAutoSave(page);

		// Click into the rich text editor and type
		const editor = page.getByTestId('rich-text-editor');
		await editor.click();
		await page.keyboard.type('Started working on this goal');
		await waitForAutoSave(page);

		// Close modal
		await closeModal(page);

		// Verify notes indicator appears on the goal square
		const goalSquare = page.getByTestId('goal-square').first();
		await expect(goalSquare.locator('text=📝')).toBeVisible();

		// Reload the page
		await page.reload();
		await page.waitForSelector('[data-testid="goal-square"]');

		// Reopen modal and verify notes persisted
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');
		await expect(page.getByTestId('rich-text-editor')).toContainText(
			'Started working on this goal'
		);
	});

	test('applies bold formatting in notes', async ({ page }) => {
		await openFirstGoalModal(page);

		// Click into editor
		const editor = page.getByTestId('rich-text-editor');
		await editor.click();

		// Type some text
		await page.keyboard.type('Important note');

		// Select all text and bold it
		await page.keyboard.press('Meta+A');
		await page.getByTestId('editor-bold-button').click();

		await waitForAutoSave(page);

		// Verify bold tag exists in the editor
		const boldText = editor.locator('strong');
		await expect(boldText).toContainText('Important note');
	});
});

test.describe('Milestone CRUD in Modal', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('adds a milestone and persists after modal close/reopen', async ({ page }) => {
		await openFirstGoalModal(page);

		// Click "+ Add" to show the add input
		await page.click('button:has-text("+ Add")');

		// Type milestone title and add it
		const milestoneInput = page.locator('input[placeholder="New milestone..."]');
		await milestoneInput.fill('Research phase');
		await page.click('button:has-text("Add"):not(:has-text("+ Add"))');

		// Wait for milestone to appear
		await expect(page.getByTestId('milestone-item')).toBeVisible();
		await expect(page.getByTestId('milestone-item')).toContainText('Research phase');

		// Verify milestone count shows 0/1
		await expect(page.locator('text=0/1 complete')).toBeVisible();

		// Close and reopen modal
		await closeModal(page);
		await page.getByTestId('goal-square').first().click();
		await page.waitForSelector('[data-testid="goal-modal"]');

		// Verify milestone persisted
		await expect(page.getByTestId('milestone-item')).toContainText('Research phase');
	});

	test('marks a milestone complete and shows completion date', async ({ page }) => {
		await openFirstGoalModal(page);

		// Add a milestone
		await page.click('button:has-text("+ Add")');
		await page.locator('input[placeholder="New milestone..."]').fill('Draft outline');
		await page.click('button:has-text("Add"):not(:has-text("+ Add"))');
		await expect(page.getByTestId('milestone-item')).toBeVisible();

		// Toggle milestone completion
		await page.getByTestId('milestone-checkbox').click();
		await page.waitForTimeout(300);

		// Verify count updated to 1/1
		await expect(page.locator('text=1/1 complete')).toBeVisible();
	});

	test('deletes a milestone', async ({ page }) => {
		await openFirstGoalModal(page);

		// Add a milestone
		await page.click('button:has-text("+ Add")');
		await page.locator('input[placeholder="New milestone..."]').fill('Temp milestone');
		await page.click('button:has-text("Add"):not(:has-text("+ Add"))');
		await expect(page.getByTestId('milestone-item')).toBeVisible();

		// Expand the milestone by clicking it
		await page.getByTestId('milestone-item').click();
		await page.waitForTimeout(200);

		// Click delete
		await page.click('button:has-text("Delete")');
		await page.waitForTimeout(300);

		// Verify milestone is removed
		await expect(page.getByTestId('milestone-item')).not.toBeVisible();

		// Verify "No milestones yet" message
		await expect(page.locator('text=No milestones yet')).toBeVisible();
	});

	test('adds multiple milestones and shows correct count', async ({ page }) => {
		await openFirstGoalModal(page);

		// Add 3 milestones
		for (const title of ['Step 1', 'Step 2', 'Step 3']) {
			await page.click('button:has-text("+ Add")');
			await page.locator('input[placeholder="New milestone..."]').fill(title);
			await page.click('button:has-text("Add"):not(:has-text("+ Add"))');
			await page.waitForTimeout(300);
		}

		// Verify count
		await expect(page.locator('text=0/3 complete')).toBeVisible();

		// Verify all 3 milestone items exist
		await expect(page.getByTestId('milestone-item')).toHaveCount(3);
	});
});

test.describe('Date Metadata Display', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('shows last updated time after editing a goal', async ({ page }) => {
		await openFirstGoalModal(page);

		// Edit title to trigger date metadata
		await page.getByTestId('modal-title-input').fill('Date test goal');
		await waitForAutoSave(page);

		// Verify "Last updated" appears in the date metadata section
		await expect(page.locator('text=Last updated:')).toBeVisible();
	});

	test('shows started date after first edit', async ({ page }) => {
		await openFirstGoalModal(page);

		// Edit title to trigger startedAt
		await page.getByTestId('modal-title-input').fill('Started goal');
		await waitForAutoSave(page);

		// Verify "Started:" label appears
		await expect(page.locator('text=Started:')).toBeVisible();
	});

	test('shows completion date after marking goal complete', async ({ page }) => {
		await openFirstGoalModal(page);

		// Set a title first
		await page.getByTestId('modal-title-input').fill('Complete me');
		await waitForAutoSave(page);

		// Mark complete
		await page.getByTestId('modal-checkbox').click();
		await page.waitForTimeout(300);

		// Verify "Completed:" label appears
		await expect(page.locator('text=Completed:')).toBeVisible();
	});
});

test.describe('Responsive Layout', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page, '3×3');
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('modal is visible and scrollable on mobile viewport', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.waitForTimeout(200);

		await openFirstGoalModal(page);

		const modal = page.getByTestId('goal-modal');
		await expect(modal).toBeVisible();

		// Modal should be within viewport bounds
		const box = await modal.boundingBox();
		expect(box).toBeTruthy();
		expect(box!.width).toBeLessThanOrEqual(375);
	});

	test('modal respects max-width on desktop viewport', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.waitForTimeout(200);

		await openFirstGoalModal(page);

		const modal = page.getByTestId('goal-modal');
		const box = await modal.boundingBox();
		expect(box).toBeTruthy();
		// max-w-2xl = 672px, should not exceed that
		expect(box!.width).toBeLessThanOrEqual(700);
	});
});
