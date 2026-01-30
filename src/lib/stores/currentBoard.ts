/**
 * Current Board Store
 *
 * Manages the state of a single board being viewed/edited.
 * Handles goal updates with Supabase persistence.
 */

import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { Board, Goal } from '$lib/types';

interface CurrentBoardState {
	board: Board | null;
	loading: boolean;
	error: string | null;
	saving: boolean;
}

const initialState: CurrentBoardState = {
	board: null,
	loading: false,
	error: null,
	saving: false
};

const currentBoardState = writable<CurrentBoardState>(initialState);

// Derived store for just the board
export const currentBoard = derived(currentBoardState, ($state) => $state.board);

// Derived store for loading state
export const currentBoardLoading = derived(currentBoardState, ($state) => $state.loading);

// Derived store for saving state
export const currentBoardSaving = derived(currentBoardState, ($state) => $state.saving);

// Derived store for error
export const currentBoardError = derived(currentBoardState, ($state) => $state.error);

/**
 * Current Board Store API
 */
export const currentBoardStore = {
	subscribe: currentBoardState.subscribe,

	/**
	 * Load a board by ID
	 */
	async loadBoard(boardId: string) {
		currentBoardState.update((state) => ({ ...state, loading: true, error: null }));

		try {
			// Fetch the board with its goals
			const { data, error } = await supabase
				.from('boards')
				.select(
					`
					id,
					name,
					size,
					created_at,
					updated_at,
					goals (
						id,
						position,
						title,
						notes,
						completed,
						started_at,
						completed_at,
						last_updated_at,
						created_at,
						updated_at
					)
				`
				)
				.eq('id', boardId)
				.single();

			if (error) {
				throw error;
			}

			if (!data) {
				throw new Error('Board not found');
			}

			// Transform to Board type
			const board: Board = {
				id: data.id,
				name: data.name,
				size: data.size,
				goals: (data.goals || [])
					.sort((a: any, b: any) => a.position - b.position)
					.map((goal: any) => ({
						id: goal.id,
						title: goal.title,
						notes: goal.notes || '',
						completed: goal.completed,
						startedAt: goal.started_at || null,
						completedAt: goal.completed_at || null,
						lastUpdatedAt: goal.last_updated_at || new Date().toISOString(),
						milestones: [] // Will be populated when we implement milestone loading
					})),
				createdAt: data.created_at,
				updatedAt: data.updated_at
			};

			currentBoardState.set({
				board,
				loading: false,
				error: null,
				saving: false
			});

			return { success: true, board };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load board';
			currentBoardState.update((state) => ({
				...state,
				loading: false,
				error: errorMessage
			}));
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Update a specific goal
	 */
	async updateGoal(goalId: string, updates: Partial<Goal>) {
		currentBoardState.update((state) => ({ ...state, saving: true }));

		try {
			// Optimistic update
			currentBoardState.update((state) => {
				if (!state.board) return state;

				const updatedGoals = state.board.goals.map((goal) =>
					goal.id === goalId ? { ...goal, ...updates } : goal
				);

				return {
					...state,
					board: {
						...state.board,
						goals: updatedGoals
					}
				};
			});

			// Update in database
			const dbUpdates: any = {};
			if (updates.title !== undefined) dbUpdates.title = updates.title;
			if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
			if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
			if (updates.startedAt !== undefined) dbUpdates.started_at = updates.startedAt;
			if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
			if (updates.lastUpdatedAt !== undefined) dbUpdates.last_updated_at = updates.lastUpdatedAt;

			const { error } = await supabase
				.from('goals')
				.update(dbUpdates)
				.eq('id', goalId);

			if (error) {
				throw error;
			}

			currentBoardState.update((state) => ({ ...state, saving: false }));

			return { success: true };
		} catch (error) {
			// Revert optimistic update by reloading the board
			const state = currentBoardState;
			let boardId: string | undefined;
			state.subscribe((s) => {
				boardId = s.board?.id;
			})();

			if (boardId) {
				await this.loadBoard(boardId);
			}

			const errorMessage = error instanceof Error ? error.message : 'Failed to update goal';
			currentBoardState.update((state) => ({ ...state, saving: false }));
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Toggle goal completion status
	 */
	async toggleComplete(goalId: string) {
		let currentCompleted = false;

		// Get current completion status
		currentBoardState.subscribe((state) => {
			const goal = state.board?.goals.find((g) => g.id === goalId);
			if (goal) {
				currentCompleted = goal.completed;
			}
		})();

		const newCompleted = !currentCompleted;
		const updates: Partial<Goal> = {
			completed: newCompleted,
			// Set completedAt when marking complete, clear when unchecking
			completedAt: newCompleted ? new Date().toISOString() : null,
			// Always update lastUpdatedAt
			lastUpdatedAt: new Date().toISOString()
		};

		return await this.updateGoal(goalId, updates);
	},

	/**
	 * Update goal title and notes
	 */
	async saveGoal(goalId: string, title: string, notes: string) {
		const updates: Partial<Goal> = { title, notes };

		// Auto-set startedAt on first edit (if title or notes has content and startedAt is null)
		let shouldSetStartedAt = false;
		currentBoardState.subscribe((state) => {
			const goal = state.board?.goals.find((g) => g.id === goalId);
			if (goal && !goal.startedAt && (title || notes)) {
				shouldSetStartedAt = true;
			}
		})();

		if (shouldSetStartedAt) {
			updates.startedAt = new Date().toISOString();
		}

		// Always update lastUpdatedAt
		updates.lastUpdatedAt = new Date().toISOString();

		return await this.updateGoal(goalId, updates);
	},

	/**
	 * Clear the current board
	 */
	clear() {
		currentBoardState.set(initialState);
	},

	/**
	 * Clear error
	 */
	clearError() {
		currentBoardState.update((state) => ({ ...state, error: null }));
	}
};
