/**
 * Current Board Store
 *
 * Manages the state of a single board being viewed/edited.
 * Handles goal updates with Supabase persistence.
 */

import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { Board, Goal, Milestone } from '$lib/types';

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
			// Fetch the board with its goals and milestones
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
						updated_at,
						milestones (
							id,
							title,
							notes,
							completed,
							completed_at,
							created_at,
							position
						)
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
						milestones: (goal.milestones || [])
							.sort((a: any, b: any) => a.position - b.position)
							.map((milestone: any) => ({
								id: milestone.id,
								title: milestone.title,
								notes: milestone.notes || '',
								completed: milestone.completed,
								completedAt: milestone.completed_at || null,
								createdAt: milestone.created_at,
								position: milestone.position
							}))
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
			// Optimistically set lastUpdatedAt in local state (database trigger will set the actual value)
			const optimisticUpdates = {
				...updates,
				lastUpdatedAt: new Date().toISOString()
			};

			// Optimistic update
			currentBoardState.update((state) => {
				if (!state.board) return state;

				const updatedGoals = state.board.goals.map((goal) =>
					goal.id === goalId ? { ...goal, ...optimisticUpdates } : goal
				);

				return {
					...state,
					board: {
						...state.board,
						goals: updatedGoals
					}
				};
			});

			// Update in database - database trigger will handle last_updated_at automatically
			// Supabase filters out undefined values automatically
			const dbUpdates = {
				title: updates.title,
				notes: updates.notes,
				completed: updates.completed,
				started_at: updates.startedAt,
				completed_at: updates.completedAt
				// last_updated_at is set by database trigger, not sent from application
			};

			const { error } = await supabase.from('goals').update(dbUpdates).eq('id', goalId);

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
			completedAt: newCompleted ? new Date().toISOString() : null
			// lastUpdatedAt is set automatically by updateGoal
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

		// lastUpdatedAt is set automatically by updateGoal

		return await this.updateGoal(goalId, updates);
	},

	/**
	 * Add a new milestone to a goal
	 */
	async addMilestone(goalId: string, title: string) {
		try {
			// Get the current goal to determine next position
			let nextPosition = 0;
			const unsubscribe = currentBoardState.subscribe((state) => {
				const currentGoal = state.board?.goals.find((g) => g.id === goalId);
				if (currentGoal) {
					nextPosition = currentGoal.milestones.length;
				}
			});
			unsubscribe();

			const now = new Date().toISOString();

			// Insert milestone into database
			const { data: newMilestone, error } = await supabase
				.from('milestones')
				.insert({
					goal_id: goalId,
					title,
					notes: '',
					completed: false,
					completed_at: null,
					position: nextPosition,
					created_at: now
				})
				.select()
				.single();

			if (error) throw error;

			// Database trigger will automatically update parent goal's last_updated_at

			// Update local state
			currentBoardState.update((state) => {
				if (!state.board) return state;

				const updatedGoals = state.board.goals.map((goal) => {
					if (goal.id === goalId) {
						return {
							...goal,
							milestones: [
								...goal.milestones,
								{
									id: newMilestone.id,
									title: newMilestone.title,
									notes: newMilestone.notes || '',
									completed: newMilestone.completed,
									completedAt: newMilestone.completed_at || null,
									createdAt: newMilestone.created_at,
									position: newMilestone.position
								}
							],
							lastUpdatedAt: now
						};
					}
					return goal;
				});

				return {
					...state,
					board: {
						...state.board,
						goals: updatedGoals
					}
				};
			});

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to add milestone';
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Update a milestone
	 */
	async updateMilestone(goalId: string, milestoneId: string, updates: Partial<Milestone>) {
		currentBoardState.update((state) => ({ ...state, saving: true }));

		try {
			const now = new Date().toISOString();

			// Optimistic update - update local state first
			currentBoardState.update((state) => {
				if (!state.board) return state;

				const updatedGoals = state.board.goals.map((goal) => {
					if (goal.id === goalId) {
						const updatedMilestones = goal.milestones.map((milestone) =>
							milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
						);
						return {
							...goal,
							milestones: updatedMilestones,
							lastUpdatedAt: now
						};
					}
					return goal;
				});

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
			if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
			if (updates.position !== undefined) dbUpdates.position = updates.position;

			const { error } = await supabase.from('milestones').update(dbUpdates).eq('id', milestoneId);

			if (error) throw error;

			// Database trigger will automatically update parent goal's last_updated_at

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

			const errorMessage = error instanceof Error ? error.message : 'Failed to update milestone';
			currentBoardState.update((state) => ({ ...state, saving: false }));
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Toggle milestone completion status
	 */
	async toggleMilestoneComplete(goalId: string, milestoneId: string) {
		let currentCompleted = false;

		// Get current completion status
		currentBoardState.subscribe((state) => {
			const goal = state.board?.goals.find((g) => g.id === goalId);
			if (goal) {
				const milestone = goal.milestones.find((m) => m.id === milestoneId);
				if (milestone) {
					currentCompleted = milestone.completed;
				}
			}
		})();

		const newCompleted = !currentCompleted;
		const updates = {
			completed: newCompleted,
			completedAt: newCompleted ? new Date().toISOString() : null
		};

		return await this.updateMilestone(goalId, milestoneId, updates);
	},

	/**
	 * Delete a milestone
	 */
	async deleteMilestone(goalId: string, milestoneId: string) {
		try {
			const now = new Date().toISOString();

			// Delete from database
			const { error } = await supabase.from('milestones').delete().eq('id', milestoneId);

			if (error) throw error;

			// Database trigger will automatically update parent goal's last_updated_at

			// Update local state
			currentBoardState.update((state) => {
				if (!state.board) return state;

				const updatedGoals = state.board.goals.map((goal) => {
					if (goal.id === goalId) {
						const updatedMilestones = goal.milestones.filter((m) => m.id !== milestoneId);
						return {
							...goal,
							milestones: updatedMilestones,
							lastUpdatedAt: now
						};
					}
					return goal;
				});

				return {
					...state,
					board: {
						...state.board,
						goals: updatedGoals
					}
				};
			});

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete milestone';
			return { success: false, error: errorMessage };
		}
	},

	/**
	 * Reorder milestones
	 */
	async reorderMilestones(goalId: string, newOrder: string[]) {
		try {
			const now = new Date().toISOString();

			// Update positions in database with single batch upsert
			const updates = newOrder.map((milestoneId, index) => ({
				id: milestoneId,
				position: index
			}));

			const { error: upsertError } = await supabase
				.from('milestones')
				.upsert(updates, { onConflict: 'id' });

			if (upsertError) {
				throw new Error(`Failed to update milestone positions: ${upsertError.message}`);
			}

			// Database trigger will automatically update parent goal's last_updated_at

			// Update local state
			currentBoardState.update((state) => {
				if (!state.board) return state;

				const updatedGoals = state.board.goals.map((goal) => {
					if (goal.id === goalId) {
						const reorderedMilestones = newOrder
							.map((id) => goal.milestones.find((m) => m.id === id))
							.filter((m): m is Milestone => m !== undefined)
							.map((m, index) => ({ ...m, position: index }));

						return {
							...goal,
							milestones: reorderedMilestones,
							lastUpdatedAt: now
						};
					}
					return goal;
				});

				return {
					...state,
					board: {
						...state.board,
						goals: updatedGoals
					}
				};
			});

			return { success: true };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to reorder milestones';
			return { success: false, error: errorMessage };
		}
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
