// ABOUTME: Unit tests for the in-memory sliding-window rate limiter
// ABOUTME: Covers allow/block behaviour, window expiry, key isolation, and retry timing

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rateLimit, retryAfterSeconds, resetForTesting } from './rateLimit';

beforeEach(() => {
  vi.useFakeTimers();
  resetForTesting();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('rateLimit', () => {
  it('allows requests up to the limit', () => {
    expect(rateLimit('key', 3, 60_000)).toBe(true);
    expect(rateLimit('key', 3, 60_000)).toBe(true);
    expect(rateLimit('key', 3, 60_000)).toBe(true);
  });

  it('blocks the request that exceeds the limit', () => {
    rateLimit('key', 3, 60_000);
    rateLimit('key', 3, 60_000);
    rateLimit('key', 3, 60_000);
    expect(rateLimit('key', 3, 60_000)).toBe(false);
  });

  it('allows a new request once the oldest timestamp slides out of the window', () => {
    rateLimit('key', 3, 60_000);
    vi.advanceTimersByTime(30_000);
    rateLimit('key', 3, 60_000);
    rateLimit('key', 3, 60_000);

    // Window is full — should be blocked
    expect(rateLimit('key', 3, 60_000)).toBe(false);

    // Advance past the first timestamp (t=0 is now > 60s ago)
    vi.advanceTimersByTime(31_000);

    // First slot has expired, so a new request should be allowed
    expect(rateLimit('key', 3, 60_000)).toBe(true);
  });

  it('tracks different keys independently', () => {
    rateLimit('a', 1, 60_000);
    expect(rateLimit('a', 1, 60_000)).toBe(false);
    expect(rateLimit('b', 1, 60_000)).toBe(true);
  });
});

describe('retryAfterSeconds', () => {
  it('returns 0 when the key has no recorded requests', () => {
    expect(retryAfterSeconds('unknown', 60_000)).toBe(0);
  });

  it('returns the seconds until the oldest request expires', () => {
    rateLimit('key', 1, 60_000);
    vi.advanceTimersByTime(10_000);

    // 60s window started at t=0, now at t=10s → 50s remaining
    expect(retryAfterSeconds('key', 60_000)).toBe(50);
  });

  it('rounds up to the nearest second', () => {
    rateLimit('key', 1, 60_000);
    vi.advanceTimersByTime(10_500);

    // 49.5s remaining → rounds up to 50
    expect(retryAfterSeconds('key', 60_000)).toBe(50);
  });
});
