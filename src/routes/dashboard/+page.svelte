<script lang="ts">
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import { currentUser } from '$lib/stores/auth';
</script>

<svelte:head>
	<title>Dashboard - Bingo Board</title>
</svelte:head>

<AuthGuard>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<header class="bg-white border-b border-gray-200">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
							<svg
								class="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
								/>
							</svg>
						</div>
						<h1 class="text-xl font-bold text-gray-900">Bingo Board</h1>
					</div>

					<UserMenu />
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Welcome Section -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome to your dashboard!</h2>
					<p class="text-gray-600 mb-1">You're successfully authenticated as:</p>
					<p class="text-lg font-semibold text-blue-600">{$currentUser?.email}</p>
				</div>
			</div>

			<!-- Phase 2 Complete Card -->
			<div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 mb-6">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<svg
							class="w-6 h-6 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div class="ml-3 flex-1">
						<h3 class="text-lg font-semibold text-gray-900 mb-2">Phase 2 Complete! 🎉</h3>
						<p class="text-sm text-gray-700 mb-4">
							Authentication UI is now fully functional. You can sign in, view protected routes,
							and sign out.
						</p>
						<div class="space-y-2">
							<div class="flex items-center text-sm text-gray-700">
								<svg
									class="w-5 h-5 text-green-600 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Magic link authentication working
							</div>
							<div class="flex items-center text-sm text-gray-700">
								<svg
									class="w-5 h-5 text-green-600 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Auth store managing global state
							</div>
							<div class="flex items-center text-sm text-gray-700">
								<svg
									class="w-5 h-5 text-green-600 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Protected routes with AuthGuard
							</div>
							<div class="flex items-center text-sm text-gray-700">
								<svg
									class="w-5 h-5 text-green-600 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								User menu with logout
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Next Steps Card -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">What's Next: Phase 3</h3>
				<p class="text-gray-700 mb-4">
					In Phase 3, we'll implement multi-board support with server sync:
				</p>
				<ul class="space-y-2 text-sm text-gray-700">
					<li class="flex items-start">
						<span class="text-blue-600 mr-2">•</span>
						<span>Board list showing all your boards</span>
					</li>
					<li class="flex items-start">
						<span class="text-blue-600 mr-2">•</span>
						<span>Create new boards with custom names</span>
					</li>
					<li class="flex items-start">
						<span class="text-blue-600 mr-2">•</span>
						<span>Delete boards you no longer need</span>
					</li>
					<li class="flex items-start">
						<span class="text-blue-600 mr-2">•</span>
						<span>Navigate to individual boards</span>
					</li>
					<li class="flex items-start">
						<span class="text-blue-600 mr-2">•</span>
						<span>Server-side persistence for all boards</span>
					</li>
				</ul>
			</div>

			<!-- Dev Links (only in development) -->
			{#if import.meta.env.DEV}
				<div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<h4 class="text-sm font-semibold text-yellow-900 mb-2">Development Tools:</h4>
					<div class="flex space-x-4 text-sm">
						<a href="/test-auth" class="text-blue-600 hover:text-blue-700">Test Auth Page</a>
						<a href="/" class="text-blue-600 hover:text-blue-700">Old Main Page</a>
					</div>
				</div>
			{/if}
		</main>
	</div>
</AuthGuard>
