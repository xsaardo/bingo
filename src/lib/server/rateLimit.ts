/**
 * In-memory sliding-window rate limiter.
 *
 * Keyed by an arbitrary string (e.g. `auth:<ip>` or `api:<ip>`).
 * Uses a Map of timestamp arrays; old entries are pruned on each call so
 * memory usage stays bounded to active clients within the window.
 *
 * NOTE: This store is per-process. In a multi-instance / serverless deployment
 * you would replace this with a Redis-backed solution (e.g. Upstash).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

/**
 * Returns `true` if the request is allowed, `false` if rate-limited.
 *
 * @param key      Unique key identifying the caller (e.g. `"auth:1.2.3.4"`)
 * @param limit    Maximum number of requests allowed within `windowMs`
 * @param windowMs Sliding window in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    return false; // rate-limited
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return true; // allowed
}

/**
 * Returns the number of seconds until the oldest request in the window expires.
 * Useful for setting a `Retry-After` response header.
 */
export function retryAfterSeconds(key: string, windowMs: number): number {
  const entry = store.get(key);
  if (!entry || entry.timestamps.length === 0) return 0;
  const oldest = Math.min(...entry.timestamps);
  return Math.ceil((oldest + windowMs - Date.now()) / 1000);
}
