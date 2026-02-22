<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import BingoBoard from '$lib/components/BingoBoard.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import {
		currentBoardStore,
		currentBoard,
		currentBoardLoading,
		currentBoardError
	} from '$lib/stores/currentBoard';

	const boardId = $derived($page.params.id!);

	// Load board when component mounts
	onMount(() => {
		currentBoardStore.loadBoard(boardId);

		// Cleanup when leaving
		return () => {
			currentBoardStore.clear();
		};
	});

	async function handleRetry() {
		await currentBoardStore.loadBoard(boardId);
	}
</script>

<svelte:head>
	<title>{$currentBoard?.name || 'Board'} - Bingo Board</title>
</svelte:head>

<AuthGuard>
	<div class="min-h-screen">
		<!-- Header -->
		<header class="bg-grey/50">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="relative flex items-center justify-between">
					<!-- Board Title (absolutely centered) -->
					<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
						{#if $currentBoard}
							<h1 class="text-3xl font-bold text-gray-900">
								{$currentBoard.name}
							</h1>
						{:else}
							<div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
						{/if}
					</div>

					<!-- Left placeholder -->
					<div></div>

					<!-- Right side: Dashboard button + User Menu -->
					<div class="flex items-center space-x-2">
						<a
							href="/dashboard"
							class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
						>
							Home
						</a>
						<UserMenu />
					</div>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
			{#if $currentBoardLoading}
				<!-- Loading State -->
				<div
					class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
					aria-busy="true"
				>
					<div
						class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"
						aria-label="Loading board"
					></div>
					<p class="text-gray-600">Loading board...</p>
				</div>
			{:else if $currentBoardError}
				<!-- Error State -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
					<div class="max-w-md mx-auto space-y-4">
						<ErrorAlert error={$currentBoardError} />
						<div class="flex justify-center space-x-3">
							<button
								onclick={handleRetry}
								class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
							>
								Retry
							</button>
							<a
								href="/dashboard"
								class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
							>
								Back to Dashboard
							</a>
						</div>
					</div>
				</div>
			{:else if $currentBoard}
				<!-- BingoBoard Component -->
				<div
					class="w-full mx-auto"
					style="max-width: min(56rem, calc(100vh - 8rem)); max-height: calc(100vh - 8rem);"
				>
					<BingoBoard />
				</div>
			{/if}
		</main>
	</div>
</AuthGuard>
