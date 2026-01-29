import { writable } from 'svelte/store';
import type { Board, Goal, BoardSize } from '$lib/types';
import { saveBoard, loadBoard } from '$lib/utils/storage';

function createBoardStore() {
	const { subscribe, set, update } = writable<Board | null>(null);

	return {
		subscribe,

		// Initialize the store with saved data
		init: () => {
			const savedBoard = loadBoard();
			if (savedBoard) {
				set(savedBoard);
			}
		},

		// Create a new board with the specified size
		createBoard: (size: BoardSize) => {
			const totalSquares = size * size;
			const now = new Date().toISOString();
			const goals: Goal[] = Array.from({ length: totalSquares }, (_, i) => ({
				id: crypto.randomUUID(),
				title: '',
				notes: '',
				completed: false,
				startedAt: null,
				completedAt: null,
				lastUpdatedAt: now,
				milestones: []
			}));

			const newBoard: Board = {
				id: crypto.randomUUID(),
				name: 'My Bingo Board',
				size,
				goals,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};

			set(newBoard);
		},

		// Update a specific goal
		updateGoal: (index: number, updates: Partial<Goal>) => {
			update(board => {
				if (!board) return board;

				const updatedBoard = {
					...board,
					goals: board.goals.map((goal, i) =>
						i === index ? { ...goal, ...updates } : goal
					),
					updatedAt: new Date().toISOString()
				};

				return updatedBoard;
			});
		},

		// Toggle goal completion status
		toggleComplete: (index: number) => {
			update(board => {
				if (!board) return board;

				const updatedBoard = {
					...board,
					goals: board.goals.map((goal, i) =>
						i === index ? { ...goal, completed: !goal.completed } : goal
					),
					updatedAt: new Date().toISOString()
				};

				return updatedBoard;
			});
		},

		// Direct set (for loading saved boards)
		set
	};
}

export const boardStore = createBoardStore();

// Auto-save: Subscribe to store changes and persist to localStorage
boardStore.subscribe(board => {
	if (board) {
		saveBoard(board);
	}
});

// UI state store for selected goal
function createUIStore() {
	const { subscribe, set } = writable<{ selectedGoalIndex: number | null }>({
		selectedGoalIndex: null
	});

	return {
		subscribe,
		selectGoal: (index: number | null) => {
			set({ selectedGoalIndex: index });
		},
		clearSelection: () => {
			set({ selectedGoalIndex: null });
		}
	};
}

export const uiStore = createUIStore();
