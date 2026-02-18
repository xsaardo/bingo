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
}

const initialState: AuthState = {
	user: null,
	loading: true,
	initialized: false
};

// Create the writable store
const authState = writable<AuthState>(initialState);

// Derived store for easy access to user
export const currentUser = derived(authState, ($authState) => $authState.user);

// Derived store to check if authenticated
export const isAuthenticated = derived(authState, ($authState) => !!$authState.user);

// Derived store to check if auth is loading TODO
export const isAuthLoading = derived(authState, ($authState) => $authState.loading);

// Derived store to check if auth is initialized
export const isAuthInitialized = derived(authState, ($authState) => $authState.initialized);

/**
 * Auth Store
 *
 * Main interface for authentication operations
 */
export const authStore = {
	subscribe: authState.subscribe,

	/**
	 * Initialize auth state
	 * Call this once on app startup (in root layout)
	 */
	async init() {
		try {
			// Check for existing session
			let user = await getCurrentUser();

			// If no existing session, create anonymous session
			if (!user) {
				const result = await signInAnonymously();
				user = result.success ? result.user ?? null : null;
			}

			authState.update((state) => ({
				...state,
				user,
				loading: false,
				initialized: true
			}));

			// Listen for auth state changes
			onAuthStateChange((user) => {
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
				initialized: true
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
