/**
 * Migration utilities for moving localStorage data to Supabase
 */

import { boardsStore } from '$lib/stores/boards';
import type { Board } from '$lib/types';

const STORAGE_KEY = 'bingo-board';
const MIGRATION_COMPLETE_KEY = 'bingo-migration-complete';

/**
 * Check if there's a board in localStorage that needs migration
 */
export function hasLegacyBoard(): boolean {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		const migrationComplete = localStorage.getItem(MIGRATION_COMPLETE_KEY);

		// If migration already complete, no legacy board
		if (migrationComplete === 'true') {
			return false;
		}

		// Check if there's data in localStorage
		return !!data;
	} catch (error) {
		console.error('Error checking for legacy board:', error);
		return false;
	}
}

/**
 * Get the legacy board from localStorage
 */
export function getLegacyBoard(): Board | null {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		if (!data) return null;

		const board = JSON.parse(data) as Board;
		return board;
	} catch (error) {
		console.error('Error loading legacy board:', error);
		return null;
	}
}

/**
 * Migrate legacy board to Supabase
 */
export async function migrateLegacyBoard(): Promise<{ success: boolean; error?: string }> {
	try {
		const legacyBoard = getLegacyBoard();

		if (!legacyBoard) {
			return { success: false, error: 'No legacy board found' };
		}

		// Create the board in Supabase
		const result = await boardsStore.createBoard(
			legacyBoard.name || 'My Board',
			legacyBoard.size
		);

		if (!result.success) {
			return { success: false, error: result.error };
		}

		// Update the goals with the legacy data
		if (result.board) {
			// TODO: Implement goal data migration
			// For now, the board is created with empty goals
			// Users will need to re-enter their goals manually
		}

		// Mark migration as complete
		localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');

		// Optionally clear the old localStorage (keep as backup for now)
		// localStorage.removeItem(STORAGE_KEY);

		return { success: true };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Migration failed';
		return { success: false, error: errorMessage };
	}
}

/**
 * Skip migration (user declines)
 */
export function skipMigration() {
	localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
}

/**
 * Clear legacy data (after successful migration)
 */
export function clearLegacyData() {
	localStorage.removeItem(STORAGE_KEY);
	localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
}
