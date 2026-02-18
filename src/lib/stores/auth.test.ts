// ABOUTME: Unit tests for the auth store initialization behavior
// ABOUTME: Covers error propagation when anonymous sign-in fails

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/utils/auth', () => ({
	getCurrentUser: vi.fn(),
	signInAnonymously: vi.fn(),
	signOut: vi.fn(),
	sendMagicLink: vi.fn(),
	onAuthStateChange: vi.fn(() => vi.fn())
}));

import { get } from 'svelte/store';
import { authStore, authError, isAuthenticated, isAuthInitialized } from './auth';
import * as authUtils from '$lib/utils/auth';

describe('authStore.init()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(authUtils.onAuthStateChange).mockReturnValue(vi.fn());
	});

	it('sets error state when anonymous sign-in fails', async () => {
		vi.mocked(authUtils.getCurrentUser).mockResolvedValue(null);
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
		vi.mocked(authUtils.getCurrentUser).mockResolvedValue(null);
		vi.mocked(authUtils.signInAnonymously).mockResolvedValue({
			success: false,
			error: 'Service unavailable'
		});

		await authStore.init();

		expect(authUtils.onAuthStateChange).not.toHaveBeenCalled();
	});

	it('clears error and sets user when sign-in succeeds', async () => {
		const mockUser = { id: 'anon-1', is_anonymous: true } as any;
		vi.mocked(authUtils.getCurrentUser).mockResolvedValue(null);
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
		vi.mocked(authUtils.getCurrentUser).mockResolvedValue(mockUser);

		await authStore.init();

		expect(authUtils.signInAnonymously).not.toHaveBeenCalled();
		expect(get(isAuthenticated)).toBe(true);
	});
});
