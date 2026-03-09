/**
 * SvelteKit server hooks — applied to every server-side request.
 *
 * Rate limiting strategy:
 *  - /api/*   routes: 60 requests per minute per IP
 *    (guards agent tool-execution endpoint from DoS / quota drain)
 *
 * Magic-link auth rate limiting is handled by Supabase directly (the send
 * call goes browser → Supabase API and never hits this server).
 * Configure limits in: Supabase Dashboard → Authentication → Rate Limits
 * See SECURITY.md for the recommended values.
 */

import { rateLimit, retryAfterSeconds } from '$lib/server/rateLimit';
import { error, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** Extract the best available client IP from common proxy headers. */
function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const ip = getClientIp(event.request);

  // Skip rate limiting in test environments to prevent throttling e2e tests
  const rateLimitingDisabled = env.DISABLE_RATE_LIMITING === 'true';
  if (rateLimitingDisabled) {
    return resolve(event);
  }

  // ── API routes: generous limit to prevent quota drain / DoS ─────────────
  if (pathname.startsWith('/api/')) {
    const allowed = rateLimit(`api:${ip}`, 60, 60_000);
    if (!allowed) {
      const retryAfter = retryAfterSeconds(`api:${ip}`, 60_000);
      throw error(429, `Too many requests. Please wait ${retryAfter}s and try again.`);
    }
  }

  return resolve(event);
};
