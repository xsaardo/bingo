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

// Valid UUIDs required by board_id UUID validation
const BOARD_UUID = '00000000-0000-0000-0000-000000000001';
const BOARD_UUID_2 = '00000000-0000-0000-0000-000000000042';
const MISSING_BOARD_UUID = '00000000-0000-0000-0000-000000000000';
const TEST_USER_ID = 'test-user-id';

// Helper to build a chainable Supabase query mock
function makeQueryChain(result: { data: any; error: any }) {
  const chain: any = {};
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
    const boardChain = makeQueryChain({ data: { id: BOARD_UUID }, error: null });
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

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain).mockReturnValueOnce(goalsChain);

    const result = await getGoals({ board_id: BOARD_UUID }, TEST_USER_ID);

    expect(result.board_id).toBe(BOARD_UUID);
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
    const boardChain = makeQueryChain({ data: { id: BOARD_UUID }, error: null });
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

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain).mockReturnValueOnce(goalsChain);

    const result = await getGoals({ board_id: BOARD_UUID }, TEST_USER_ID);
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

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain);

    await expect(getGoals({ board_id: MISSING_BOARD_UUID }, TEST_USER_ID)).rejects.toThrow(
      'Board not found or access denied'
    );
  });

  it('board not found — Supabase returns no data and no error → throws "Board not found or access denied"', async () => {
    const boardChain = makeQueryChain({ data: null, error: null });

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain);

    await expect(getGoals({ board_id: MISSING_BOARD_UUID }, TEST_USER_ID)).rejects.toThrow(
      'Board not found or access denied'
    );
  });

  it('goals fetch failure — board lookup succeeds but goals query errors → throws "Failed to fetch goals"', async () => {
    const boardChain = makeQueryChain({ data: { id: BOARD_UUID }, error: null });
    const goalsChain = makeQueryChain({
      data: null,
      error: { message: 'DB connection error' }
    });

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain).mockReturnValueOnce(goalsChain);

    await expect(getGoals({ board_id: BOARD_UUID }, TEST_USER_ID)).rejects.toThrow(
      'Failed to fetch goals'
    );
  });

  it('milestone sorting — milestones sorted ascending by position regardless of DB order', async () => {
    const boardChain = makeQueryChain({ data: { id: BOARD_UUID }, error: null });
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

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain).mockReturnValueOnce(goalsChain);

    const result = await getGoals({ board_id: BOARD_UUID }, TEST_USER_ID);
    const milestones = result.goals[0].milestones;
    expect(milestones.map((m) => m.position)).toEqual([1, 2, 3]);
    expect(milestones.map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
  });

  it('empty goals — board with zero goals returns { board_id, goals: [] }', async () => {
    const boardChain = makeQueryChain({ data: { id: BOARD_UUID }, error: null });
    const goalsChain = makeQueryChain({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain).mockReturnValueOnce(goalsChain);

    const result = await getGoals({ board_id: BOARD_UUID }, TEST_USER_ID);
    expect(result).toEqual({ board_id: BOARD_UUID, goals: [] });
  });
});

describe('executeTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches get_goals to getGoals with the given input', async () => {
    const boardChain = makeQueryChain({ data: { id: BOARD_UUID_2 }, error: null });
    const goalsChain = makeQueryChain({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValueOnce(boardChain).mockReturnValueOnce(goalsChain);

    const result = await executeTool('get_goals', { board_id: BOARD_UUID_2 }, TEST_USER_ID);
    expect(result).toEqual({ board_id: BOARD_UUID_2, goals: [] });
  });

  it('unknown tool name throws "Unknown tool: …"', async () => {
    await expect(executeTool('does_not_exist', {}, TEST_USER_ID)).rejects.toThrow(
      'Unknown or unsupported tool'
    );
  });
});
