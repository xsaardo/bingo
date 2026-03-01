/**
 * Agent Tool Execution API
 *
 * POST /api/agent
 *
 * Accepts a tool name and input, executes the corresponding agent primitive,
 * and returns the result. Requires an authenticated Supabase session.
 *
 * Request body:
 *   { tool: string; input: Record<string, unknown> }
 *
 * Response:
 *   200 { result: unknown }
 *   400 { error: string }
 *   401 { error: string }
 *   500 { error: string }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeTool, AGENT_TOOLS } from '$lib/agent/tools';
import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request }) => {
	// Require an authenticated session.
	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (!session) {
		return json({ error: 'Unauthorized: no active session' }, { status: 401 });
	}

	let body: { tool?: unknown; input?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { tool, input } = body;

	if (typeof tool !== 'string' || !tool) {
		return json({ error: '`tool` must be a non-empty string' }, { status: 400 });
	}

	if (typeof input !== 'object' || input === null || Array.isArray(input)) {
		return json({ error: '`input` must be a non-null object' }, { status: 400 });
	}

	try {
		const result = await executeTool(tool, input);
		return json({ result });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return json({ error: message }, { status: 500 });
	}
};

/**
 * GET /api/agent
 *
 * Returns the list of available agent tools in Claude tool-use API format.
 * Useful for introspection and for constructing Claude API requests.
 */
export const GET: RequestHandler = async () => {
	return json({ tools: AGENT_TOOLS });
};
