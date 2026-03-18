// ABOUTME: Unit tests for the auth store initialization behavior
// ABOUTME: Covers error propagation when anonymous sign-in fails

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client — auth.getSession() is now used instead of getCurrentUser()
// to avoid a server round-trip race condition on first load.
vi.mock('$lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    }
  }
}));

vi.mock('$lib/utils/auth', () => ({
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
  sendMagicLink: vi.fn(),
  onAuthStateChange: vi.fn(() => vi.fn())
}));

import { get } from 'svelte/store';
import { authStore, authError, isAuthenticated, isAuthInitialized } from './auth';
import * as authUtils from '$lib/utils/auth';
import { supabase } from '$lib/supabaseClient';

describe('authStore.init()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authUtils.onAuthStateChange).mockReturnValue(vi.fn());
    // Default: no existing session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    } as any);
  });

  it('sets error state when anonymous sign-in fails', async () => {
    vi.mocked(authUtils.signInAnonymously).mockResolvedValue({
      success: false,
      error: 'Anonymous auth is disabled'
    });

    await authStore.init();

    expect(get(authError)).toBe('Anonymous auth is disabled');
    expect(get(isAuthenticated)).toBe(false);
    expect(get(isAuthInitialized)).toBe(true);
  });

  it('does not call onAuthStateChange when sign-in fails', async () => {
    vi.mocked(authUtils.signInAnonymously).mockResolvedValue({
      success: false,
      error: 'Service unavailable'
    });

    await authStore.init();

    expect(authUtils.onAuthStateChange).not.toHaveBeenCalled();
  });

  it('clears error and sets user when sign-in succeeds', async () => {
    const mockUser = { id: 'anon-1', is_anonymous: true } as any;
    vi.mocked(authUtils.signInAnonymously).mockResolvedValue({
      success: true,
      user: mockUser
    });

    await authStore.init();

    expect(get(authError)).toBeNull();
    expect(get(isAuthenticated)).toBe(true);
    expect(get(isAuthInitialized)).toBe(true);
  });

  it('uses existing session without calling signInAnonymously', async () => {
    const mockUser = { id: 'existing-user' } as any;
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    } as any);

    await authStore.init();

    expect(authUtils.signInAnonymously).not.toHaveBeenCalled();
    expect(get(isAuthenticated)).toBe(true);
  });
});
