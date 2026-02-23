// ABOUTME: E2E tests for goal modal save behavior
// ABOUTME: Covers title/notes persistence when combined with other modal actions

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

test('Save button persists title even after toggling completion', async ({ page }) => {
	const goalId = await getFirstGoalId(page, testBoardId);

	await openFirstGoalModal(page);

	// Type a title
	await page.getByTestId('modal-title-input').fill('My Goal Title');

	// Toggle the completion checkbox (this triggers a store update)
	await page.getByTestId('modal-checkbox').click();

	// Click Save
	await page.getByTestId('save-goal-button').click();

	// Wait for save to complete
	await waitForAutoSave(page);

	// Verify the title was saved to the database
	const goal = await getGoalData(page, goalId, 'title, completed');
	expect(goal.title).toBe('My Goal Title');
	expect(goal.completed).toBe(true);
});
