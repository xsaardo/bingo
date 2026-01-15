import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Validate environment variables
if (!PUBLIC_SUPABASE_URL) {
	throw new Error('PUBLIC_SUPABASE_URL is not set. Check your .env file.');
}

if (!PUBLIC_SUPABASE_ANON_KEY) {
	throw new Error('PUBLIC_SUPABASE_ANON_KEY is not set. Check your .env file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		// Persist auth state in localStorage
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	}
});

// Type definitions for our database
export interface Database {
	public: {
		Tables: {
			boards: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					size: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					size: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					size?: number;
					created_at?: string;
					updated_at?: string;
				};
			};
			goals: {
				Row: {
					id: string;
					board_id: string;
					position: number;
					title: string;
					notes: string;
					completed: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					board_id: string;
					position: number;
					title: string;
					notes?: string;
					completed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					board_id?: string;
					position?: number;
					title?: string;
					notes?: string;
					completed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
	};
}
