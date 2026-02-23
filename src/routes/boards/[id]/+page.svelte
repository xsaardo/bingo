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
	import { isAnonymous } from '$lib/stores/auth';

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
		<header class="bg-transparent">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<a href="/" class="flex items-center space-x-3">
						<div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
							<svg class="w-6 h-6" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect x="1" y="1" width="6" height="6" rx="1.5" fill="white"/>
								<polygon points="4,1.8 4.529,3.272 6.092,3.320 4.856,4.278 5.293,5.780 4,4.9 2.707,5.780 3.144,4.278 1.908,3.320 3.471,3.272" fill="#2563eb"/>
								<rect x="8" y="1" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="15" y="1" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="1" y="8" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="8" y="8" width="6" height="6" rx="1.5" fill="white"/>
								<polygon points="11,8.8 11.529,10.272 13.092,10.320 11.856,11.278 12.293,12.780 11,11.9 9.707,12.780 10.144,11.278 8.908,10.320 10.471,10.272" fill="#2563eb"/>
								<rect x="15" y="8" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="1" y="15" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="8" y="15" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="15" y="15" width="6" height="6" rx="1.5" fill="white"/>
								<polygon points="18,15.8 18.529,17.272 20.092,17.320 18.856,18.278 19.293,19.780 18,18.9 16.707,19.780 17.144,18.278 15.908,17.320 17.471,17.272" fill="#2563eb"/>
							</svg>
						</div>
						<span class="text-xl font-bold text-gray-900">BINGOAL</span>
					</a>

					<div class="flex items-center gap-3">
						{#if !$isAnonymous}
							<a
								href="/dashboard"
								class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
							>
								Home
							</a>
						{/if}
						<UserMenu />
					</div>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
			<!-- Board Title -->
			<div class="mb-4 text-center">
				{#if $currentBoard}
					<h1 class="text-3xl font-bold text-gray-900">{$currentBoard.name}</h1>
				{:else if !$currentBoardError}
					<div class="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
				{/if}
			</div>
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
