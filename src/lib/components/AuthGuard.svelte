<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { isAuthenticated, isAuthInitialized, isAuthLoading } from '$lib/stores/auth';

	// Optional: redirect URL if not authenticated (defaults to /auth/login)
	export let redirectTo = '/auth/login';

	// Optional: show loading state while checking auth
	export let showLoading = true;

	let shouldRender = false;

	onMount(() => {
		// Check auth state when component mounts
		checkAuth();
	});

	// Watch for auth state changes
	$: {
		if (browser && $isAuthInitialized) {
			checkAuth();
		}
	}

	function checkAuth() {
		if (!$isAuthInitialized) {
			// Auth not initialized yet, wait
			shouldRender = false;
			return;
		}

		if (!$isAuthenticated) {
			// Not authenticated, redirect to login
			goto(redirectTo);
			shouldRender = false;
		} else {
			// Authenticated, render children
			shouldRender = true;
		}
	}
</script>

{#if !$isAuthInitialized || $isAuthLoading}
	<!-- Loading state while checking auth -->
	{#if showLoading}
		<div class="min-h-screen flex items-center justify-center bg-gray-50">
			<div class="text-center">
				<div
					class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"
				></div>
				<p class="text-gray-600">Loading...</p>
			</div>
		</div>
	{/if}
{:else if shouldRender}
	<!-- Render protected content -->
	<slot />
{:else}
	<!-- Redirecting to login (don't render anything) -->
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<div class="text-center">
			<div
				class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"
			></div>
			<p class="text-gray-600">Redirecting to login...</p>
		</div>
	</div>
{/if}
