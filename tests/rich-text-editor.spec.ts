// ABOUTME: Tests for the RichTextEditor component using TipTap
// ABOUTME: Validates toolbar functionality, content management, and formatting persistence

import { test, expect } from '@playwright/test';
import {
	createTestBoard,
	deleteTestBoard,
	getFirstGoalId,
	openFirstGoalSidebar,
	closeSidebar,
	waitForAutoSave,
	getGoalData
} from './test-helpers';

test.describe('RichTextEditor Component', () => {
	let testBoardId: string;
	let firstGoalId: string;

	test.beforeEach(async ({ page }) => {
		testBoardId = await createTestBoard(page);
		firstGoalId = await getFirstGoalId(page, testBoardId);
	});

	test.afterEach(async ({ page }) => {
		if (testBoardId) {
			await deleteTestBoard(page, testBoardId);
		}
	});

	test('should render editor with toolbar buttons', async ({ page }) => {
		await openFirstGoalSidebar(page);

		// Verify all toolbar buttons are present
		const toolbarButtons = [
			'editor-bold-button',
			'editor-italic-button',
			'editor-underline-button',
			'editor-bullet-list-button',
			'editor-ordered-list-button',
			'editor-link-button'
		];

		for (const buttonId of toolbarButtons) {
			await expect(page.getByTestId(buttonId)).toBeVisible();
		}
	});

	test.describe('Formatting', () => {
		const formattingTests = [
			{ name: 'bold', button: 'editor-bold-button', tag: 'strong, b', text: 'Bold text' },
			{ name: 'italic', button: 'editor-italic-button', tag: 'em, i', text: 'Italic text' },
			{ name: 'underline', button: 'editor-underline-button', tag: 'u', text: 'Underline text' }
		];

		for (const { name, button, tag, text } of formattingTests) {
			test(`should apply ${name} formatting`, async ({ page }) => {
				await openFirstGoalSidebar(page);

				const editor = page.getByTestId('rich-text-editor');
				await editor.click();
				await editor.type(text);

				// Select all text (use Meta on Mac, Control on others)
				await page.keyboard.press('Meta+A');

				// Click formatting button
				await page.getByTestId(button).click();

				// Verify formatting is applied
				const formattedElement = editor.locator(tag);
				await expect(formattedElement).toBeVisible();
				await expect(formattedElement).toHaveText(text);
			});
		}
	});

	test.describe('Lists', () => {
		const listTests = [
			{ name: 'bullet list', button: 'editor-bullet-list-button', tag: 'ul li' },
			{ name: 'ordered list', button: 'editor-ordered-list-button', tag: 'ol li' }
		];

		for (const { name, button, tag } of listTests) {
			test(`should create ${name}`, async ({ page }) => {
				await openFirstGoalSidebar(page);

				const editor = page.getByTestId('rich-text-editor');
				await editor.click();
				// Type text first, then convert to list
				await page.keyboard.type('Item 1');
				await page.keyboard.press('Meta+A');
				await page.getByTestId(button).click();

				const listElement = editor.locator(tag);
				await expect(listElement).toBeVisible();
				await expect(listElement).toHaveText('Item 1');
			});
		}
	});

	test('should persist rich text formatting after close and reopen', async ({ page }) => {
		await openFirstGoalSidebar(page);

		// Add formatted text
		const editor = page.getByTestId('rich-text-editor');
		await editor.click();
		await editor.type('This is bold');
		await page.keyboard.press('Meta+A');
		await page.getByTestId('editor-bold-button').click();

		// Close sidebar to trigger save
		await closeSidebar(page);
		await waitForAutoSave(page);

		// Reopen sidebar
		await openFirstGoalSidebar(page);

		// Verify formatting persists
		const boldElement = page.getByTestId('rich-text-editor').locator('strong, b');
		await expect(boldElement).toBeVisible();
		await expect(boldElement).toHaveText('This is bold');
	});

	test('should persist rich text HTML to database', async ({ page }) => {
		await openFirstGoalSidebar(page);

		// Add formatted text
		const editor = page.getByTestId('rich-text-editor');
		await editor.click();
		await editor.type('Database test');
		await page.keyboard.press('Meta+A');
		await page.getByTestId('editor-bold-button').click();

		await closeSidebar(page);
		await waitForAutoSave(page);

		// Check database contains HTML
		const goalData = await getGoalData(page, firstGoalId, 'notes');
		expect(goalData?.notes).toContain('<strong>');
		expect(goalData?.notes).toContain('Database test');
	});

	test('should handle keyboard shortcuts for formatting', async ({ page }) => {
		await openFirstGoalSidebar(page);

		const editor = page.getByTestId('rich-text-editor');
		await editor.click();
		await editor.type('Keyboard shortcut');
		await page.keyboard.press('Meta+A');

		// Test Cmd+B for bold
		await page.keyboard.press('Meta+B');

		const boldElement = editor.locator('strong, b');
		await expect(boldElement).toBeVisible();
	});

	test('should show active state for formatting buttons', async ({ page }) => {
		await openFirstGoalSidebar(page);

		const editor = page.getByTestId('rich-text-editor');
		await editor.click();
		await editor.type('Text');
		await page.keyboard.press('Meta+A');
		await page.getByTestId('editor-bold-button').click();

		// Bold button should show active state
		await expect(page.getByTestId('editor-bold-button')).toHaveClass(/bg-gray-200/);
	});
});
