/**
 * Authentication Store
 *
 * Manages global authentication state and provides auth-related functions.
 * Automatically syncs with Supabase auth state changes.
 */

import { writable, derived } from 'svelte/store';
import type { User } from '@supabase/supabase-js';
import {
	getCurrentUser,
	onAuthStateChange,
	sendMagicLink,
	signInAnonymously,
	signOut
} from '$lib/utils/auth';

interface AuthState {
	user: User | null;
	loading: boolean;
	initialized: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	loading: true,
	initialized: false,
	error: null
};

// Create the writable store
const authState = writable<AuthState>(initialState);

// Derived store for easy access to user
export const currentUser = derived(authState, ($authState) => $authState.user);

// Derived store to check if authenticated
export const isAuthenticated = derived(authState, ($authState) => !!$authState.user);

// Derived store to check if the current user is anonymous (no email)
export const isAnonymous = derived(authState, ($authState) => $authState.user?.is_anonymous === true);

// Derived store to check if auth is loading TODO
export const isAuthLoading = derived(authState, ($authState) => $authState.loading);

// authError must be derived before isAuthInitialized so its subscribers
// are notified first when authState updates both fields simultaneously
export const authError = derived(authState, ($authState) => $authState.error);

// Derived store to check if auth is initialized
export const isAuthInitialized = derived(authState, ($authState) => $authState.initialized);

// Holds the cleanup function for the active auth state listener
let cancelAuthListener: (() => void) | null = null;

/**
 * Auth Store
 *
 * Main interface for authentication operations
 */
export const authStore = {
	subscribe: authState.subscribe,

	/**
	 * Initialize auth state
	 * Call this once on app startup (in root layout), or again to retry after failure
	 */
	async init() {
		// Cancel any previous auth state listener before re-registering
		if (cancelAuthListener) {
			cancelAuthListener();
			cancelAuthListener = null;
		}

		authState.update((state) => ({
			...state,
			loading: true,
			initialized: false,
			error: null
		}));

		try {
			// Check for existing session
			let user = await getCurrentUser();

			// If no existing session, create anonymous session
			if (!user) {
				const result = await signInAnonymously();

				if (!result.success) {
					authState.update((state) => ({
						...state,
						user: null,
						loading: false,
						initialized: true,
						error: result.error ?? 'Failed to create session'
					}));
					return;
				}

				user = result.user ?? null;
			}

			authState.update((state) => ({
				...state,
				user,
				loading: false,
				initialized: true,
				error: null
			}));

			// Listen for auth state changes
			cancelAuthListener = onAuthStateChange((user) => {
				authState.update((state) => ({
					...state,
					user,
					loading: false
				}));
			});
		} catch (error) {
			console.error('Failed to initialize auth:', error);
			authState.update((state) => ({
				...state,
				user: null,
				loading: false,
				initialized: true,
				error: error instanceof Error ? error.message : 'Failed to initialize'
			}));
		}
	},

	/**
	 * Send magic link to user's email
	 */
	async sendMagicLink(email: string, redirectTo?: string) {
		return await sendMagicLink(email, redirectTo);
	},

	/**
	 * Sign out the current user
	 */
	async logout() {
		const result = await signOut();

		if (result.success) {
			authState.update((state) => ({
				...state,
				user: null
			}));
		}

		return result;
	},

	/**
	 * Manually set user (useful for testing or manual updates)
	 */
	setUser(user: User | null) {
		authState.update((state) => ({
			...state,
			user
		}));
	}
};
