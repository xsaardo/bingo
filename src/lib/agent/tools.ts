/**
 * Agent Tool Layer
 *
 * Exposes app capabilities as Claude tool-use API primitives.
 * Each tool has a definition (for Claude's API) and a handler (for execution).
 *
 * Tool definitions follow the Claude tool-use API format:
 * https://docs.anthropic.com/en/docs/build-with-claude/tool-use
 */

import { supabase } from '$lib/supabaseClient';
import type { Goal, Milestone } from '$lib/types';

// ---------------------------------------------------------------------------
// Tool Definitions (Claude tool-use API format)
// ---------------------------------------------------------------------------

export interface ClaudeTool {
	name: string;
	description: string;
	input_schema: {
		type: 'object';
		properties: Record<string, unknown>;
		required?: string[];
	};
}

/**
 * get_goals — fetch all goals for a given board, authenticated to the current user.
 *
 * This is the first agent primitive in the tool layer and will be used by the
 * goal suggestions feature.
 */
export const GET_GOALS_TOOL: ClaudeTool = {
	name: 'get_goals',
	description:
		'Fetch and return all goals for a given bingo board. Only returns goals that belong to boards owned by the authenticated user. Goals include their title, notes, completion status, timestamps, and milestones.',
	input_schema: {
		type: 'object',
		properties: {
			board_id: {
				type: 'string',
				description: 'The UUID of the board whose goals should be fetched.'
			}
		},
		required: ['board_id']
	}
};

/** All registered agent tools, ready to pass to the Claude API. */
export const AGENT_TOOLS: ClaudeTool[] = [GET_GOALS_TOOL];

// ---------------------------------------------------------------------------
// Tool Handlers
// ---------------------------------------------------------------------------

export interface GetGoalsInput {
	board_id: string;
}

export interface GetGoalsResult {
	board_id: string;
	goals: Goal[];
}

/**
 * get_goals handler
 *
 * Fetches all goals for `board_id`, enforcing ownership through Supabase RLS
 * (the query runs with the caller's session, so only their own boards are
 * accessible). An explicit ownership check is also performed so that a clear
 * error is returned when the board doesn't exist or belongs to another user.
 *
 * @param input  Validated tool input containing `board_id`.
 * @returns      `{ board_id, goals }` on success; throws on error.
 */
export async function getGoals(input: GetGoalsInput): Promise<GetGoalsResult> {
	const { board_id } = input;

	// Verify the board exists and belongs to the authenticated user.
	// Supabase RLS will enforce this automatically, but a missing board row
	// produces a clearer error than an empty goals array.
	const { data: boardData, error: boardError } = await supabase
		.from('boards')
		.select('id')
		.eq('id', board_id)
		.single();

	if (boardError || !boardData) {
		throw new Error(
			`Board not found or access denied: ${boardError?.message ?? 'no data returned'}`
		);
	}

	// Fetch all goals for the board, ordered by position.
	const { data: goalsData, error: goalsError } = await supabase
		.from('goals')
		.select(
			`
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
		`
		)
		.eq('board_id', board_id)
		.order('position', { ascending: true });

	if (goalsError) {
		throw new Error(`Failed to fetch goals: ${goalsError.message}`);
	}

	const goals: Goal[] = (goalsData ?? []).map((g: any) => ({
		id: g.id,
		title: g.title,
		notes: g.notes ?? '',
		completed: g.completed,
		startedAt: g.started_at ?? null,
		completedAt: g.completed_at ?? null,
		lastUpdatedAt: g.last_updated_at ?? g.updated_at,
		milestones: ((g.milestones as any[]) ?? [])
			.sort((a: any, b: any) => a.position - b.position)
			.map(
				(m: any): Milestone => ({
					id: m.id,
					title: m.title,
					notes: m.notes ?? '',
					completed: m.completed,
					completedAt: m.completed_at ?? null,
					createdAt: m.created_at,
					position: m.position
				})
			)
	}));

	return { board_id, goals };
}

// ---------------------------------------------------------------------------
// Tool dispatcher — routes a tool_name + input to the correct handler.
// ---------------------------------------------------------------------------

/**
 * Execute a named tool with the given input.
 *
 * @param toolName  The `name` field from the Claude tool-use response.
 * @param input     The `input` field from the Claude tool-use response.
 * @returns         Tool result (shape depends on the tool).
 */
export async function executeTool(toolName: string, input: unknown): Promise<unknown> {
	switch (toolName) {
		case 'get_goals':
			return getGoals(input as GetGoalsInput);
		default:
			throw new Error(`Unknown tool: ${toolName}`);
	}
}
