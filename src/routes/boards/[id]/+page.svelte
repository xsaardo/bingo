<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import { boardsStore, boards } from '$lib/stores/boards';

	const boardId = $derived($page.params.id);
	let board = $derived($boards.find((b) => b.id === boardId));
	let loading = $state(true);

	// Fetch boards if not already loaded
	onMount(async () => {
		if ($boards.length === 0) {
			await boardsStore.fetchBoards();
		}
		loading = false;

		// If board not found after loading, redirect to dashboard
		if (!board) {
			setTimeout(() => {
				goto('/dashboard');
			}, 2000);
		}
	});
</script>

<svelte:head>
	<title>{board?.name || 'Board'} - Bingo Board</title>
</svelte:head>

<AuthGuard>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<header class="bg-white border-b border-gray-200">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<!-- Back Button -->
						<a
							href="/dashboard"
							class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
							title="Back to dashboard"
						>
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</a>

						<!-- Board Info -->
						<div>
							{#if board}
								<h1 class="text-xl font-bold text-gray-900">{board.name}</h1>
								<p class="text-sm text-gray-500">
									{board.size}×{board.size} grid • {board.goals.length} goals
								</p>
							{:else}
								<div class="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
							{/if}
						</div>
					</div>

					<UserMenu />
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{#if loading}
				<!-- Loading State -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
					<p class="text-gray-600">Loading board...</p>
				</div>
			{:else if !board}
				<!-- Board Not Found -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
					<div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
						<svg
							class="w-8 h-8 text-red-600"
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
					</div>
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Board Not Found</h2>
					<p class="text-gray-600 mb-6">
						This board doesn't exist or you don't have access to it.
					</p>
					<p class="text-sm text-gray-500">Redirecting to dashboard...</p>
				</div>
			{:else}
				<!-- Placeholder for Phase 4 -->
				<div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-8 mb-6">
					<div class="flex items-start">
						<div class="flex-shrink-0">
							<svg
								class="w-8 h-8 text-purple-600"
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
						<div class="ml-4 flex-1">
							<h3 class="text-xl font-semibold text-gray-900 mb-2">
								Coming in Phase 4! 🚀
							</h3>
							<p class="text-gray-700 mb-4">
								The individual board view will be fully functional in Phase 4. You'll be able to:
							</p>
							<ul class="space-y-2 text-sm text-gray-700">
								<li class="flex items-start">
									<svg
										class="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5"
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
									<span>View and edit goals in this board</span>
								</li>
								<li class="flex items-start">
									<svg
										class="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5"
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
									<span>Mark goals as complete</span>
								</li>
								<li class="flex items-start">
									<svg
										class="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5"
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
									<span>See bingo detection and celebration</span>
								</li>
								<li class="flex items-start">
									<svg
										class="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5"
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
									<span>All changes automatically synced to server</span>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<!-- Board Preview Card -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
					<h4 class="text-lg font-semibold text-gray-900 mb-4">Board Details</h4>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
						<div class="bg-gray-50 rounded-lg p-4">
							<p class="text-sm text-gray-600 mb-1">Board Size</p>
							<p class="text-2xl font-bold text-gray-900">
								{board.size}×{board.size}
							</p>
						</div>
						<div class="bg-gray-50 rounded-lg p-4">
							<p class="text-sm text-gray-600 mb-1">Total Goals</p>
							<p class="text-2xl font-bold text-gray-900">{board.goals.length}</p>
						</div>
						<div class="bg-gray-50 rounded-lg p-4">
							<p class="text-sm text-gray-600 mb-1">Completed</p>
							<p class="text-2xl font-bold text-green-600">
								{board.goals.filter((g) => g.completed).length}
							</p>
						</div>
						<div class="bg-gray-50 rounded-lg p-4">
							<p class="text-sm text-gray-600 mb-1">Progress</p>
							<p class="text-2xl font-bold text-blue-600">
								{Math.round((board.goals.filter((g) => g.completed).length / board.goals.length) * 100)}%
							</p>
						</div>
					</div>

					<div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
						<p class="text-sm text-blue-900">
							<strong>Phase 3 Complete!</strong> You can now create, view, and delete boards. The full
							board editor will be available in Phase 4.
						</p>
					</div>
				</div>
			{/if}
		</main>
	</div>
</AuthGuard>
