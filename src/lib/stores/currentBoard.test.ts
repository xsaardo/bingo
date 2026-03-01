// ABOUTME: Unit tests for currentBoard store operations
// ABOUTME: Covers setPublic and loadPublicBoard behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';

// Mock supabase before importing the store
vi.mock('$lib/supabaseClient', () => ({
	supabase: {
		from: vi.fn()
	}
}));

import { currentBoardStore, currentBoard } from './currentBoard';
import { supabase } from '$lib/supabaseClient';

const mockBoard = {
	id: 'board-1',
	name: 'Test Board',
	size: 3,
	is_public: false,
	created_at: '2024-01-01T00:00:00Z',
	updated_at: '2024-01-01T00:00:00Z',
	goals: [
		{
			id: 'goal-1',
			position: 0,
			title: 'Goal 1',
			notes: '',
			completed: false,
			started_at: null,
			completed_at: null,
			last_updated_at: '2024-01-01T00:00:00Z',
			milestones: []
		}
	]
};

function mockFromChain(returnValue: any) {
	const chain = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue(returnValue),
		update: vi.fn().mockReturnThis()
	};
	vi.mocked(supabase.from).mockReturnValue(chain as any);
	return chain;
}

describe('currentBoardStore.setPublic()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		currentBoardStore.clear();
	});

	it('updates isPublic to true in local state', async () => {
		// Seed the store with a board
		const selectChain = mockFromChain({ data: mockBoard, error: null });
		await currentBoardStore.loadBoard('board-1');

		// Now set up mock for the update call
		const updateChain = {
			update: vi.fn().mockReturnThis(),
			eq: vi.fn().mockResolvedValue({ error: null })
		};
		vi.mocked(supabase.from).mockReturnValue(updateChain as any);

		await currentBoardStore.setPublic('board-1', true);

		expect(get(currentBoard)?.isPublic).toBe(true);
	});

	it('updates isPublic to false in local state', async () => {
		const publicBoard = { ...mockBoard, is_public: true };
		mockFromChain({ data: publicBoard, error: null });
		await currentBoardStore.loadBoard('board-1');

		const updateChain = {
			update: vi.fn().mockReturnThis(),
			eq: vi.fn().mockResolvedValue({ error: null })
		};
		vi.mocked(supabase.from).mockReturnValue(updateChain as any);

		await currentBoardStore.setPublic('board-1', false);

		expect(get(currentBoard)?.isPublic).toBe(false);
	});

	it('calls supabase update with correct values', async () => {
		mockFromChain({ data: mockBoard, error: null });
		await currentBoardStore.loadBoard('board-1');

		const eqMock = vi.fn().mockResolvedValue({ error: null });
		const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
		vi.mocked(supabase.from).mockReturnValue({ update: updateMock } as any);

		await currentBoardStore.setPublic('board-1', true);

		expect(updateMock).toHaveBeenCalledWith({ is_public: true });
		expect(eqMock).toHaveBeenCalledWith('id', 'board-1');
	});

	it('returns error result when supabase update fails', async () => {
		mockFromChain({ data: mockBoard, error: null });
		await currentBoardStore.loadBoard('board-1');

		const eqMock = vi.fn().mockResolvedValue({ error: { message: 'DB error' } });
		const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
		vi.mocked(supabase.from).mockReturnValue({ update: updateMock } as any);

		const result = await currentBoardStore.setPublic('board-1', true);

		expect(result.success).toBe(false);
		expect(result.error).toBe('DB error');
	});
});

describe('currentBoardStore.loadPublicBoard()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		currentBoardStore.clear();
	});

	it('loads a public board without milestones', async () => {
		const publicBoard = {
			...mockBoard,
			is_public: true,
			goals: mockBoard.goals.map((g) => ({ ...g }))
		};
		// loadPublicBoard doesn't select milestones, so goals have no milestones key
		const publicBoardNoMilestones = {
			...publicBoard,
			goals: publicBoard.goals.map(({ milestones: _m, ...g }) => g)
		};
		mockFromChain({ data: publicBoardNoMilestones, error: null });

		const result = await currentBoardStore.loadPublicBoard('board-1');

		expect(result.success).toBe(true);
		expect(get(currentBoard)?.isPublic).toBe(true);
		expect(get(currentBoard)?.goals[0].milestones).toEqual([]);
	});

	it('returns error when board is not found', async () => {
		mockFromChain({ data: null, error: { message: 'Not found' } });

		const result = await currentBoardStore.loadPublicBoard('nonexistent');

		expect(result.success).toBe(false);
	});
});
