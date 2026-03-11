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
import { executeTool, AGENT_TOOLS } from '$lib/agent/tools';
import { supabase } from '$lib/supabaseClient';

/**
 * Extracts and validates the Bearer token from the Authorization header,
 * then verifies it with Supabase. Returns the authenticated user or null.
 *
 * Note: We use getUser() (server-to-server JWT validation) rather than
 * getSession() (which relies on localStorage and does not work in server
 * routes). Clients must include their access token in every request:
 *   Authorization: Bearer <supabase_access_token>
 */
async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export const POST: RequestHandler = async ({ request }) => {
  // Require an authenticated session via Bearer token.
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
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
    const result = await executeTool(tool, input as Record<string, unknown>, user.id);
    return json({ result });
  } catch (err) {
    // Do not leak internal error details to the client.
    console.error('[/api/agent] executeTool error:', err);
    return json({ error: 'An internal error occurred' }, { status: 500 });
  }
};

/**
 * GET /api/agent
 *
 * Returns the list of available agent tools in Claude tool-use API format.
 * Requires authentication to prevent information disclosure.
 */
export const GET: RequestHandler = async ({ request }) => {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  return json({ tools: AGENT_TOOLS });
};
