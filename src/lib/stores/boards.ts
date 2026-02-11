/**
 * Boards Store
 *
 * Manages the list of boards for the current user.
 * Handles CRUD operations for boards stored in Supabase.
 */

import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { Board } from '$lib/types';

interface BoardsState {
	boards: Board[];
	loading: boolean;
	error: string | null;
}

const initialState: BoardsState = {
	boards: [],
	loading: false,
	error: null
};

const boardsState = writable<BoardsState>(initialState);

// Derived store to check if we have any boards
export const hasBoards = derived(boardsState, ($state) => $state.boards.length > 0);

// Derived store for just the boards array
export const boards = derived(boardsState, ($state) => $state.boards);

// Derived store for loading state
export const boardsLoading = derived(boardsState, ($state) => $state.loading);

// Derived store for error state
export const boardsError = derived(boardsState, ($state) => $state.error);

/**
 * Boards Store API
 */
export const boardsStore = {
	subscribe: boardsState.subscribe,

	/**
	 * Fetch all boards for the current user
	 */
	async fetchBoards() {
		boardsState.update((state) => ({ ...state, loading: true, error: null }));

		try {
			// Get current user from Supabase
			const {
				data: { user }
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error('User not authenticated');
			}

			// Fetch boards with their goals
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
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });

			if (error) {
				throw error;
			}

			// Transform the data to match our Board type
			const boards: Board[] = (data || []).map((board: any) => ({
				id: board.id,
				name: board.name,
				size: board.size,
				goals: (board.goals || [])
					.sort((a: any, b: any) => a.position - b.position)
					.map((goal: any) => ({
						id: goal.id,
						title: goal.title,
						notes: goal.notes || '',
						completed: goal.completed,
						startedAt: goal.started_at || null,
						completedAt: goal.completed_at || null,
						lastUpdatedAt: goal.last_updated_at || new Date().toISOString(),
						milestones: []
					})),
				createdAt: board.created_at,
				updatedAt: board.updated_at
			}));

			boardsState.set({
				boards,
				loading: false,
				error: null
			});

			return { success: true, boards };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch boards';
			boardsState.update((state) => ({
				...state,
				loading: false,
				error: errorMessage
			}));
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Create a new board
	 */
	async createBoard(name: string, size: number) {
		try {
			// Get current user
			const {
				data: { user }
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error('User not authenticated');
			}

			// Validate size
			if (![3, 4, 5].includes(size)) {
				throw new Error('Invalid board size. Must be 3, 4, or 5.');
			}

			// Create the board
			const { data: board, error: boardError } = await supabase
				.from('boards')
				.insert({
					user_id: user.id,
					name,
					size
				})
				.select()
				.single();

			if (boardError) {
				throw boardError;
			}

			// Create empty goals for the board
			const totalGoals = size * size;
			const goals = Array.from({ length: totalGoals }, (_, index) => ({
				board_id: board.id,
				position: index,
				title: '',
				notes: '',
				completed: false
			}));

			const { error: goalsError } = await supabase.from('goals').insert(goals);

			if (goalsError) {
				// If goals creation fails, delete the board to maintain consistency
				await supabase.from('boards').delete().eq('id', board.id);
				throw goalsError;
			}

			// Fetch the complete board with goals
			const { data: completeBoard, error: fetchError } = await supabase
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
				.eq('id', board.id)
				.single();

			if (fetchError) {
				throw fetchError;
			}

			// Transform to Board type
			const newBoard: Board = {
				id: completeBoard.id,
				name: completeBoard.name,
				size: completeBoard.size,
				goals: (completeBoard.goals || [])
					.sort((a: any, b: any) => a.position - b.position)
					.map((goal: any) => ({
						id: goal.id,
						title: goal.title,
						notes: goal.notes || '',
						completed: goal.completed,
						startedAt: goal.started_at || null,
						completedAt: goal.completed_at || null,
						lastUpdatedAt: goal.last_updated_at || new Date().toISOString(),
						milestones: []
					})),
				createdAt: completeBoard.created_at,
				updatedAt: completeBoard.updated_at
			};

			// Add to store
			boardsState.update((state) => ({
				...state,
				boards: [newBoard, ...state.boards]
			}));

			return { success: true, board: newBoard };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create board';
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Delete a board
	 */
	async deleteBoard(boardId: string) {
		try {
			// Delete the board (goals will be cascade deleted)
			const { error } = await supabase.from('boards').delete().eq('id', boardId);

			if (error) {
				throw error;
			}

			// Remove from store
			boardsState.update((state) => ({
				...state,
				boards: state.boards.filter((board) => board.id !== boardId)
			}));

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete board';
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Update board name
	 */
	async updateBoardName(boardId: string, name: string) {
		try {
			const { error } = await supabase.from('boards').update({ name }).eq('id', boardId);

			if (error) {
				throw error;
			}

			// Update in store
			boardsState.update((state) => ({
				...state,
				boards: state.boards.map((board) => (board.id === boardId ? { ...board, name } : board))
			}));

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update board name';
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Clear error
	 */
	clearError() {
		boardsState.update((state) => ({ ...state, error: null }));
	},

	/**
	 * Reset store to initial state
	 */
	reset() {
		boardsState.set(initialState);
	}
};
