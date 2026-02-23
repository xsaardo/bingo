// ABOUTME: E2E tests for goal modal save behavior
// ABOUTME: Covers title/notes persistence when combined with other modal actions

import { test, expect } from '@playwright/test';
import {
	createTestBoard,
	deleteTestBoard,
	getFirstGoalId,
	getGoalData,
	openFirstGoalModal
} from './test-helpers';

let testBoardId: string;

test.beforeEach(async ({ page }) => {
	testBoardId = await createTestBoard(page);
});

test.afterEach(async ({ page }) => {
	await deleteTestBoard(page, testBoardId);
});

test('Save button closes the modal', async ({ page }) => {
	await openFirstGoalModal(page);
	await page.getByTestId('save-goal-button').click();
	await expect(page.getByTestId('goal-modal')).not.toBeVisible();
});

test('closing modal without saving discards changes', async ({ page }) => {
	const goalId = await getFirstGoalId(page, testBoardId);

	await openFirstGoalModal(page);
	await page.getByTestId('modal-title-input').fill('Unsaved Title');

	// Close without clicking Save
	await page.getByTestId('close-modal-button').click();

	// Title should not be saved
	const goal = await getGoalData(page, goalId, 'title');
	expect(goal.title).toBe('');
});

test('Save button persists title even after toggling completion', async ({ page }) => {
	const goalId = await getFirstGoalId(page, testBoardId);

	await openFirstGoalModal(page);

	// Type a title
	await page.getByTestId('modal-title-input').fill('My Goal Title');

	// Toggle the completion checkbox (this triggers a store update)
	await page.getByTestId('modal-checkbox').click();

	// Click Save and wait for modal to close (save completes before close)
	await page.getByTestId('save-goal-button').click();
	await expect(page.getByTestId('goal-modal')).not.toBeVisible();

	// Verify the title was saved to the database
	const goal = await getGoalData(page, goalId, 'title, completed');
	expect(goal.title).toBe('My Goal Title');
	expect(goal.completed).toBe(true);
});
