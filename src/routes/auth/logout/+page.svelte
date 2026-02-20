<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	let status: 'loading' | 'success' | 'error' = 'loading';
	let errorMessage = '';

	onMount(async () => {
		try {
			const result = await authStore.logout();

			if (result.success) {
				status = 'success';
				// Redirect to login after short delay
				setTimeout(() => {
					goto('/auth/login');
				}, 1500);
			} else {
				throw new Error(result.error || 'Logout failed');
			}
		} catch (err) {
			status = 'error';
			errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
		}
	});
</script>

<svelte:head>
	<title>Signing Out - Bingo Board</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
		{#if status === 'loading'}
			<div class="space-y-4">
				<div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
				<h1 class="text-xl font-semibold text-gray-900">Signing you out...</h1>
				<p class="text-gray-600">Please wait</p>
			</div>
		{:else if status === 'success'}
			<div class="space-y-4">
				<div class="text-green-600">
					<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h1 class="text-xl font-semibold text-gray-900">Successfully signed out</h1>
				<p class="text-gray-600">Redirecting you to login...</p>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="text-red-600">
					<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h1 class="text-xl font-semibold text-gray-900">Error signing out</h1>
				<p class="text-red-600">{errorMessage}</p>
				<a
					href="/auth/login"
					class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
				>
					Go to login
				</a>
			</div>
		{/if}
	</div>
</div>
