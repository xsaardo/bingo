/**
 * Authentication utilities for Supabase magic link auth
 */

import { supabase } from '$lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface AuthResult {
	success: boolean;
	error?: string;
	user?: User | null;
}

/**
 * Send a magic link to the user's email
 * User will click the link to authenticate
 */
export async function sendMagicLink(email: string, redirectTo?: string): Promise<AuthResult> {
	try {
		// Use the current domain for the callback URL
		// This ensures preview branches redirect correctly
		const callbackUrl = redirectTo || `${window.location.origin}/auth/callback`;

		console.log('Sending magic link with redirect to:', callbackUrl);

		const { data, error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				// URL to redirect to after clicking magic link
				emailRedirectTo: callbackUrl,
				// Prevent automatic redirect to avoid issues
				shouldCreateUser: true
			}
		});

		if (error) {
			console.error('Magic link error:', error);
			return {
				success: false,
				error: error.message
			};
		}

		console.log('Magic link sent successfully to:', email);

		return {
			success: true,
			user: data.user
		};
	} catch (err) {
		console.error('Unexpected error sending magic link:', err);
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error occurred'
		};
	}
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
	try {
		const { error } = await supabase.auth.signOut();

		if (error) {
			return {
				success: false,
				error: error.message
			};
		}

		return {
			success: true
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error occurred'
		};
	}
}

/**
 * Get the current user session
 */
export async function getCurrentUser(): Promise<User | null> {
	try {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		return user;
	} catch (err) {
		console.error('Error getting current user:', err);
		return null;
	}
}

/**
 * Get the current session
 */
export async function getSession() {
	try {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		return session;
	} catch (err) {
		console.error('Error getting session:', err);
		return null;
	}
}

/**
 * Listen for auth state changes
 * Returns an unsubscribe function
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
	const {
		data: { subscription }
	} = supabase.auth.onAuthStateChange((_event, session) => {
		callback(session?.user ?? null);
	});

	// Return unsubscribe function
	return () => {
		subscription.unsubscribe();
	};
}
