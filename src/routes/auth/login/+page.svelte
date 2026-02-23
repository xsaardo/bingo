<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, isAnonymous } from '$lib/stores/auth';
	import MagicLinkForm from '$lib/components/MagicLinkForm.svelte';
	import Logo from '$lib/components/Logo.svelte';

	// Redirect to dashboard if already logged in as a real user
	onMount(() => {
		if ($isAuthenticated && !$isAnonymous) {
			goto('/dashboard');
		}
	});

	// Also watch for auth state changes
	$: if ($isAuthenticated && !$isAnonymous) {
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Sign In - Bingoal</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="inline-flex mb-4">
				<Logo size="4rem" />
			</div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to BINGOAL</h1>
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
