<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/auth';
	import MagicLinkForm from '$lib/components/MagicLinkForm.svelte';

	// Redirect to dashboard if already logged in
	onMount(() => {
		if ($isAuthenticated) {
			goto('/dashboard');
		}
	});

	// Also watch for auth state changes
	$: if ($isAuthenticated) {
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Sign In - Bingo Board</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
				<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
					/>
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to Bingo Board</h1>
			<p class="text-gray-600">Sign in to create and manage your bingo boards</p>
		</div>

		<!-- Login Form Card -->
		<div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
			<MagicLinkForm />
		</div>

		<!-- Footer -->
		<div class="mt-8 text-center">
			<p class="text-sm text-gray-600">
				New to Bingo Board? Don't worry, we'll create your account automatically when you sign in.
			</p>
		</div>

		<!-- Test Page Link (for development) -->
		{#if import.meta.env.DEV}
			<div class="mt-4 text-center">
				<a href="/test-auth" class="text-sm text-gray-500 hover:text-gray-700">
					Debug: Test Auth Page
				</a>
			</div>
		{/if}
	</div>
</div>
