/**
 * Agent Tool Execution API
 *
 * POST /api/agent
 *
 * Accepts a tool name and input, executes the corresponding agent primitive,
 * and returns the result. Requires an authenticated Supabase session.
 *
 * Auth: Pass the Supabase access token as a Bearer token in the Authorization header.
 *   Authorization: Bearer <access_token>
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
// TODO(#99): Re-enable these imports when the agent feature is ready to ship.
// import { executeTool, AGENT_TOOLS } from '$lib/agent/tools';
// import { supabase } from '$lib/supabaseClient';

// ---------------------------------------------------------------------------
// FEATURE GATE: Agent API is not being released yet (see issue #99 / #22).
// Both handlers return 404 unconditionally so the endpoint is not reachable
// in production. The implementation below is preserved for future use.
// To re-enable: remove the early-return guards and restore the imports above.
// ---------------------------------------------------------------------------

/**
 * Extracts and validates the Bearer token from the Authorization header,
 * then verifies it with Supabase. Returns the authenticated user or null.
 *
 * Note: We use getUser() (server-to-server JWT validation) rather than
 * getSession() (which relies on localStorage and does not work in server
 * routes). Clients must include their access token in every request:
 *   Authorization: Bearer <supabase_access_token>
 */
// TODO(#99): Restore this function when re-enabling the agent feature.
// async function getAuthenticatedUser(request: Request) { ... }

export const POST: RequestHandler = async () => {
  // TODO(#99): Remove this guard when the agent feature is ready to ship.
  return json({ error: 'Not found' }, { status: 404 });

  // Original implementation preserved below for future use:
  // const user = await getAuthenticatedUser(request);
  // if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  // let body: { tool?: unknown; input?: unknown };
  // try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, { status: 400 }); }
  // const { tool, input } = body;
  // if (typeof tool !== 'string' || !tool) return json({ error: '`tool` must be a non-empty string' }, { status: 400 });
  // if (typeof input !== 'object' || input === null || Array.isArray(input)) return json({ error: '`input` must be a non-null object' }, { status: 400 });
  // try {
  //   const result = await executeTool(tool, input as Record<string, unknown>, user.id);
  //   return json({ result });
  // } catch (err) {
  //   console.error('[/api/agent] executeTool error:', err);
  //   return json({ error: 'An internal error occurred' }, { status: 500 });
  // }
};

/**
 * GET /api/agent
 *
 * Returns the list of available agent tools in Claude tool-use API format.
 * Requires authentication to prevent information disclosure.
 */
export const GET: RequestHandler = async () => {
  // TODO(#99): Remove this guard when the agent feature is ready to ship.
  return json({ error: 'Not found' }, { status: 404 });

  // Original implementation preserved below for future use:
  // const user = await getAuthenticatedUser(request);
  // if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  // return json({ tools: AGENT_TOOLS });
};
