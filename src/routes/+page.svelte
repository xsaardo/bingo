<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, isAuthInitialized } from '$lib/stores/auth';

	// Redirect based on auth status
	onMount(() => {
		// Wait for auth to initialize
		const unsubscribe = isAuthInitialized.subscribe((initialized) => {
			if (initialized) {
				if ($isAuthenticated) {
					// Redirect authenticated users to dashboard
					goto('/dashboard');
				} else {
					// Redirect unauthenticated users to login
					goto('/auth/login');
				}
			}
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
		<p class="text-gray-600">Loading...</p>
	</div>
</div>
