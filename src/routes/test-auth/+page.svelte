<script lang="ts">
	import { onMount } from 'svelte';
	import { sendMagicLink, signOut, getCurrentUser, onAuthStateChange } from '$lib/utils/auth';
	import type { User } from '@supabase/supabase-js';

	let email = '';
	let user: User | null = null;
	let loading = false;
	let message = '';
	let messageType: 'success' | 'error' | 'info' = 'info';

	onMount(async () => {
		// Check if user is already logged in
		user = await getCurrentUser();

		// Listen for auth state changes
		const unsubscribe = onAuthStateChange((newUser) => {
			user = newUser;
			if (newUser) {
				showMessage(`Logged in as ${newUser.email}`, 'success');
			}
		});

		return () => {
			unsubscribe();
		};
	});

	async function handleSendMagicLink() {
		if (!email) {
			showMessage('Please enter an email address', 'error');
			return;
		}

		loading = true;
		const result = await sendMagicLink(email);
		loading = false;

		if (result.success) {
			showMessage(
				`Magic link sent to ${email}! Check your email and click the link to sign in.`,
				'success'
			);
		} else {
			showMessage(`Error: ${result.error}`, 'error');
		}
	}

	async function handleSignOut() {
		loading = true;
		const result = await signOut();
		loading = false;

		if (result.success) {
			user = null;
			showMessage('Signed out successfully', 'success');
		} else {
			showMessage(`Error: ${result.error}`, 'error');
		}
	}

	function showMessage(text: string, type: 'success' | 'error' | 'info') {
		message = text;
		messageType = type;
		setTimeout(() => {
			message = '';
		}, 5000);
	}
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
		<h1 class="text-2xl font-bold text-gray-900 mb-6">🔐 Auth Test Page</h1>

		{#if message}
			<div
				class="mb-4 p-4 rounded-lg {messageType === 'success'
					? 'bg-green-50 text-green-800'
					: messageType === 'error'
						? 'bg-red-50 text-red-800'
						: 'bg-blue-50 text-blue-800'}"
			>
				{message}
			</div>
		{/if}

		{#if user}
			<!-- Logged In State -->
			<div class="space-y-4">
				<div class="bg-green-50 border border-green-200 rounded-lg p-4">
					<p class="text-sm text-green-600 font-medium mb-1">✅ Authenticated</p>
					<p class="text-sm text-gray-700">
						<strong>Email:</strong>
						{user.email}
					</p>
					<p class="text-sm text-gray-700">
						<strong>User ID:</strong>
						{user.id}
					</p>
				</div>

				<button
					onclick={handleSignOut}
					disabled={loading}
					class="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
				>
					{loading ? 'Signing out...' : 'Sign Out'}
				</button>

				<div class="pt-4 border-t">
					<p class="text-sm text-gray-600 mb-2">✅ Phase 1 Complete! Authentication works.</p>
					<p class="text-sm text-gray-600">
						Next: Implement Phase 2 (Authentication UI for the main app)
					</p>
				</div>
			</div>
		{:else}
			<!-- Logged Out State -->
			<form
				onsubmit={(e) => { e.preventDefault(); handleSendMagicLink(e); }}
				class="space-y-4"
			>
				<div>
					<label
						for="email"
						class="block text-sm font-medium text-gray-700 mb-2"
					>
						Email Address
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
				>
					{loading ? 'Sending...' : 'Send Magic Link'}
				</button>

				<div class="text-sm text-gray-600 space-y-1">
					<p>📧 Enter your email to receive a magic link</p>
					<p>🔗 Click the link in your email to sign in</p>
					<p>🎉 No password needed!</p>
				</div>
			</form>
		{/if}

		<div class="mt-6 pt-6 border-t border-gray-200">
			<h2 class="text-sm font-semibold text-gray-900 mb-2">Testing Checklist:</h2>
			<ul class="text-sm text-gray-600 space-y-1">
				<li>✅ Supabase client installed</li>
				<li>✅ Environment variables configured</li>
				<li>✅ Database schema created</li>
				<li>✅ RLS policies enabled</li>
				<li class="{user ? 'text-green-600 font-medium' : ''}">
					{user ? '✅' : '⏳'} Magic link authentication
				</li>
			</ul>
		</div>

		<a
			href="/"
			class="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
		>
			← Back to main app
		</a>
	</div>
</div>
