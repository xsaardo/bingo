<script lang="ts">
	import { authStore } from '$lib/stores/auth';

	let email = '';
	let loading = false;
	let success = false;
	let error = '';

	async function handleSubmit() {
		if (!email) {
			error = 'Please enter your email address';
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		loading = true;
		error = '';

		const result = await authStore.sendMagicLink(email);

		loading = false;

		if (result.success) {
			success = true;
		} else {
			error = result.error || 'Failed to send magic link. Please try again.';
		}
	}

	function resetForm() {
		success = false;
		error = '';
		email = '';
	}
</script>

{#if success}
	<!-- Success State -->
	<div class="space-y-6">
		<div class="text-center">
			<div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
				<svg
					class="w-8 h-8 text-green-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<h3 class="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
			<p class="text-gray-600 mb-1">We sent a magic link to:</p>
			<p class="text-gray-900 font-medium mb-4">{email}</p>
			<p class="text-sm text-gray-600">
				Click the link in the email to sign in. The link will expire in 1 hour.
			</p>
		</div>

		<button
			onclick={resetForm}
			class="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
		>
			Try a different email
		</button>
	</div>
{:else}
	<!-- Login Form -->
	<form
		on:submit|preventDefault={handleSubmit}
		class="space-y-4"
	>
		<div>
			<label
				for="email"
				class="block text-sm font-medium text-gray-700 mb-2"
			>
				Email address
			</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				placeholder="you@example.com"
				required
				disabled={loading}
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
			/>
		</div>

		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
				<svg
					class="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p class="text-sm text-red-800">{error}</p>
			</div>
		{/if}

		<button
			type="submit"
			disabled={loading}
			class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
		>
			{#if loading}
				<svg
					class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				Sending magic link...
			{:else}
				Send magic link
			{/if}
		</button>

		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-gray-200"></div>
			</div>
			<div class="relative flex justify-center text-sm">
				<span class="px-4 bg-white text-gray-500">How it works</span>
			</div>
		</div>

		<div class="space-y-2 text-sm text-gray-600">
			<div class="flex items-start">
				<svg
					class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
				<p>We'll send a magic link to your email</p>
			</div>
			<div class="flex items-start">
				<svg
					class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
					/>
				</svg>
				<p>Click the link to sign in instantly</p>
			</div>
			<div class="flex items-start">
				<svg
					class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<p>No password required</p>
			</div>
		</div>
	</form>
{/if}
