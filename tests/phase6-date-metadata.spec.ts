// ABOUTME: Integration tests for Phase 6 - DateMetadata component
// ABOUTME: Tests date display, conditional visibility, and relative time formatting in GoalModal

import { test, expect } from '@playwright/test';
import {
	createTestBoard,
	deleteTestBoard,
	openFirstGoalModal,
	closeModal,
	waitForAutoSave
} from './test-helpers';

test.describe('Phase 6: DateMetadata Component', () => {
	let testBoardId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page);
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('hides startedAt when goal has not been edited', async ({ page }) => {
		await openFirstGoalModal(page);

		const dateMetadata = page.getByTestId('date-metadata');
		await expect(dateMetadata).toBeVisible();

		// startedAt should not be shown for a new goal
		await expect(page.getByTestId('date-started')).not.toBeVisible();
	});

	test('hides completedAt when goal is not complete', async ({ page }) => {
		await openFirstGoalModal(page);

		const dateMetadata = page.getByTestId('date-metadata');
		await expect(dateMetadata).toBeVisible();

		// completedAt should not be shown for an incomplete goal
		await expect(page.getByTestId('date-completed')).not.toBeVisible();
	});

	test('always shows lastUpdatedAt', async ({ page }) => {
		await openFirstGoalModal(page);

		const lastUpdated = page.getByTestId('date-last-updated');
		await expect(lastUpdated).toBeVisible();
		await expect(lastUpdated).toContainText('Last updated');
	});

	test('shows startedAt after editing goal title', async ({ page }) => {
		await openFirstGoalModal(page);

		// Edit the title to trigger startedAt
		const titleInput = page.getByTestId('modal-title-input');
		await titleInput.fill('My Goal');
		await waitForAutoSave(page);

		// Close and reopen to see updated date metadata
		await closeModal(page);
		await waitForAutoSave(page);
		await openFirstGoalModal(page);

		const startedDate = page.getByTestId('date-started');
		await expect(startedDate).toBeVisible();
		await expect(startedDate).toContainText('Started');
	});

	test('shows completedAt after marking goal complete', async ({ page }) => {
		// Mark goal complete via the checkbox on the board
		await page.getByTestId('goal-square').first().getByTestId('goal-checkbox').click();
		await page.waitForTimeout(300);

		// Open modal to see date metadata
		await openFirstGoalModal(page);

		const completedDate = page.getByTestId('date-completed');
		await expect(completedDate).toBeVisible();
		await expect(completedDate).toContainText('Completed');
	});

	test('uses abbreviated relative time for lastUpdatedAt', async ({ page }) => {
		await openFirstGoalModal(page);

		const lastUpdated = page.getByTestId('date-last-updated');
		await expect(lastUpdated).toBeVisible();

		// Should contain abbreviated time like "Xm ago" or "less than 1m ago"
		const text = await lastUpdated.textContent();
		expect(text).toContain('ago');
		// Should NOT contain full words like "minutes" or "hours"
		expect(text).not.toMatch(/\bminutes?\b/);
		expect(text).not.toMatch(/\bhours?\b/);
	});

	test('formats startedAt as absolute date', async ({ page }) => {
		// Edit goal to set startedAt
		await openFirstGoalModal(page);
		const titleInput = page.getByTestId('modal-title-input');
		await titleInput.fill('Test Goal');
		await waitForAutoSave(page);
		await closeModal(page);
		await waitForAutoSave(page);

		// Reopen to see dates
		await openFirstGoalModal(page);

		const startedDate = page.getByTestId('date-started');
		await expect(startedDate).toBeVisible();

		// Should show a formatted date like "Feb 1, 2026"
		const text = await startedDate.textContent();
		expect(text).toMatch(/\w{3} \d{1,2}, \d{4}/);
	});
});
