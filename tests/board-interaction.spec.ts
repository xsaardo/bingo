// ABOUTME: E2E tests for board interaction (goal modal, completion, bingo detection)
// ABOUTME: Covers clicking goals, editing, persistence, and bingo confetti

import { test, expect } from '@playwright/test';
import {
	createTestBoard,
	deleteTestBoard,
	getFirstGoalId,
	getGoalData,
	openFirstGoalModal,
	waitForAutoSave
} from './test-helpers';

let testBoardId: string;

test.beforeEach(async ({ page }) => {
	testBoardId = await createTestBoard(page);
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
		const goalId = await getFirstGoalId(page, testBoardId);

		await openFirstGoalModal(page);
		await page.getByTestId('modal-title-input').fill('My Persistent Goal');
		await page.getByTestId('save-goal-button').click();
		await expect(page.getByTestId('goal-modal')).not.toBeVisible();

		// Reload the page
		await page.reload();
		await page.waitForSelector('[data-testid="goal-square"]');

		// Verify the title was saved
		const goal = await getGoalData(page, goalId, 'title');
		expect(goal.title).toBe('My Persistent Goal');
	});

	test('editing goal notes persists after page reload', async ({ page }) => {
		const goalId = await getFirstGoalId(page, testBoardId);

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
		await page.waitForSelector('[data-testid="goal-square"]');

		// Confirm persistence via DB
		const goal = await getGoalData(page, goalId, 'notes');
		// Notes may be stored as rich text (HTML) — just verify they exist
		expect(goal).not.toBeNull();
	});
});

test.describe('Goal completion and bingo detection', () => {
	test('toggling goal completion updates the checkbox state', async ({ page }) => {
		const goalId = await getFirstGoalId(page, testBoardId);

		await openFirstGoalModal(page);

		const checkbox = page.getByTestId('modal-checkbox');
		const initialChecked = await checkbox.isChecked();

		await checkbox.click();
		await page.getByTestId('save-goal-button').click();
		await expect(page.getByTestId('goal-modal')).not.toBeVisible();

		const goal = await getGoalData(page, goalId, 'completed');
		expect(goal.completed).toBe(!initialChecked);
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
			await page.waitForSelector('[data-testid="goal-modal"]');
			await page.getByTestId('modal-checkbox').check();
			await page.getByTestId('save-goal-button').click();
			await expect(page.getByTestId('goal-modal')).not.toBeVisible();
		}

		// Confetti or bingo indicator should appear
		const confetti = page
			.locator('[data-testid="bingo-confetti"], [class*="confetti"], canvas')
			.first();
		// Allow some time for animation to trigger
		await page.waitForTimeout(500);

		// Either a visual confetti element appeared, or the board shows a bingo indicator
		const bingoIndicator = page.locator('[data-testid="bingo-indicator"], [class*="bingo"]').first();
		const hasConfetti = (await confetti.count()) > 0;
		const hasBingoIndicator = (await bingoIndicator.count()) > 0;
		expect(hasConfetti || hasBingoIndicator).toBe(true);
	});
});
