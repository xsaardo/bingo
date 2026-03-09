// ABOUTME: Unit tests for get_goals agent primitive and executeTool dispatcher
// ABOUTME: Mocks Supabase client — no real DB calls

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabaseClient before importing tools
vi.mock('$lib/supabaseClient', () => {
  const fromMock = vi.fn();
  return {
    supabase: {
      from: fromMock
    }
  };
});

import { getGoals, executeTool } from './tools';
import { supabase } from '$lib/supabaseClient';

// Helper to build a chainable Supabase query mock
interface QueryChain {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
}

function makeQueryChain(result: { data: unknown; error: unknown }): QueryChain {
  const chain = {} as QueryChain;
  const terminal = vi.fn().mockResolvedValue(result);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = terminal;
  chain.order = terminal;
  return chain;
}

describe('getGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('success path — returns goals with correct field mapping and defaults', async () => {
    const boardChain = makeQueryChain({ data: { id: 'board-1' }, error: null });
    const goalsChain = makeQueryChain({
      data: [
        {
          id: 'goal-1',
          position: 0,
          title: 'Run a marathon',
          notes: null,
          completed: false,
          started_at: null,
          completed_at: null,
          last_updated_at: null,
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          milestones: []
        }
      ],
      error: null
    });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(boardChain as any)
      .mockReturnValueOnce(goalsChain as any);

    const result = await getGoals({ board_id: 'board-1' });

    expect(result.board_id).toBe('board-1');
    expect(result.goals).toHaveLength(1);
    const goal = result.goals[0];
    expect(goal.id).toBe('goal-1');
    expect(goal.title).toBe('Run a marathon');
    expect(goal.notes).toBe('');
    expect(goal.startedAt).toBeNull();
    expect(goal.completedAt).toBeNull();
    expect(goal.lastUpdatedAt).toBe('2024-01-01T00:00:00Z');
    expect(goal.milestones).toEqual([]);
  });

  it('success path — maps non-null fields without overriding', async () => {
    const boardChain = makeQueryChain({ data: { id: 'board-1' }, error: null });
    const goalsChain = makeQueryChain({
      data: [
        {
          id: 'goal-2',
          position: 0,
          title: 'Get a job',
          notes: 'Apply everywhere',
          completed: true,
          started_at: '2024-02-01T00:00:00Z',
          completed_at: '2024-03-01T00:00:00Z',
          last_updated_at: '2024-03-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          milestones: []
        }
      ],
      error: null
    });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(boardChain as any)
      .mockReturnValueOnce(goalsChain as any);

    const result = await getGoals({ board_id: 'board-1' });
    const goal = result.goals[0];
    expect(goal.notes).toBe('Apply everywhere');
    expect(goal.startedAt).toBe('2024-02-01T00:00:00Z');
    expect(goal.completedAt).toBe('2024-03-01T00:00:00Z');
    expect(goal.lastUpdatedAt).toBe('2024-03-01T00:00:00Z');
  });

  it('board not found — Supabase returns error → throws "Board not found or access denied"', async () => {
    const boardChain = makeQueryChain({
      data: null,
      error: { message: 'Row not found' }
    });

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain as any);

    await expect(getGoals({ board_id: 'missing-board' })).rejects.toThrow(
      'Board not found or access denied: Row not found'
    );
  });

  it('board not found — Supabase returns no data and no error → throws "Board not found or access denied"', async () => {
    const boardChain = makeQueryChain({ data: null, error: null });

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain as any);

    await expect(getGoals({ board_id: 'missing-board' })).rejects.toThrow(
      'Board not found or access denied: no data returned'
    );
  });

  it('goals fetch failure — board lookup succeeds but goals query errors → throws "Failed to fetch goals"', async () => {
    const boardChain = makeQueryChain({ data: { id: 'board-1' }, error: null });
    const goalsChain = makeQueryChain({
      data: null,
      error: { message: 'DB connection error' }
    });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(boardChain as any)
      .mockReturnValueOnce(goalsChain as any);

    await expect(getGoals({ board_id: 'board-1' })).rejects.toThrow(
      'Failed to fetch goals: DB connection error'
    );
  });

  it('milestone sorting — milestones sorted ascending by position regardless of DB order', async () => {
    const boardChain = makeQueryChain({ data: { id: 'board-1' }, error: null });
    const goalsChain = makeQueryChain({
      data: [
        {
          id: 'goal-1',
          position: 0,
          title: 'Goal',
          notes: null,
          completed: false,
          started_at: null,
          completed_at: null,
          last_updated_at: null,
          updated_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          milestones: [
            {
              id: 'm3',
              title: 'Third',
              notes: null,
              completed: false,
              completed_at: null,
              created_at: '2024-01-01T00:00:00Z',
              position: 3
            },
            {
              id: 'm1',
              title: 'First',
              notes: null,
              completed: false,
              completed_at: null,
              created_at: '2024-01-01T00:00:00Z',
              position: 1
            },
            {
              id: 'm2',
              title: 'Second',
              notes: null,
              completed: false,
              completed_at: null,
              created_at: '2024-01-01T00:00:00Z',
              position: 2
            }
          ]
        }
      ],
      error: null
    });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(boardChain as any)
      .mockReturnValueOnce(goalsChain as any);

    const result = await getGoals({ board_id: 'board-1' });
    const milestones = result.goals[0].milestones;
    expect(milestones.map((m) => m.position)).toEqual([1, 2, 3]);
    expect(milestones.map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
  });

  it('empty goals — board with zero goals returns { board_id, goals: [] }', async () => {
    const boardChain = makeQueryChain({ data: { id: 'board-1' }, error: null });
    const goalsChain = makeQueryChain({ data: [], error: null });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(boardChain as any)
      .mockReturnValueOnce(goalsChain as any);

    const result = await getGoals({ board_id: 'board-1' });
    expect(result).toEqual({ board_id: 'board-1', goals: [] });
  });
});

describe('executeTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches get_goals to getGoals with the given input', async () => {
    const boardChain = makeQueryChain({ data: { id: 'board-42' }, error: null });
    const goalsChain = makeQueryChain({ data: [], error: null });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(boardChain as any)
      .mockReturnValueOnce(goalsChain as any);

    const result = await executeTool('get_goals', { board_id: 'board-42' });
    expect(result).toEqual({ board_id: 'board-42', goals: [] });
  });

  it('unknown tool name throws "Unknown tool: …"', async () => {
    await expect(executeTool('does_not_exist', {})).rejects.toThrow('Unknown tool: does_not_exist');
  });
});
