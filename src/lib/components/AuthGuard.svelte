<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { authError, authStore, isAuthenticated, isAuthInitialized, isAuthLoading } from '$lib/stores/auth';

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

		if ($authError) {
			// Auth init failed — show error UI, don't redirect
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

	async function retryAuth() {
		await authStore.init();
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
{:else if $authError}
	<!-- Auth init failed -->
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<div class="text-center">
			<p data-testid="auth-error-message" class="text-red-600 mb-4">{$authError}</p>
			<button
				data-testid="auth-retry-button"
				onclick={retryAuth}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				Try again
			</button>
		</div>
	</div>
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
