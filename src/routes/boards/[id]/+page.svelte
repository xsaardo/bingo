<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import BingoBoard from '$lib/components/BingoBoard.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import { currentBoardStore, currentBoard, currentBoardLoading, currentBoardError } from '$lib/stores/currentBoard';

	const boardId = $derived($page.params.id!);

	const fonts = [
		{ name: 'Default', family: '' },
		{ name: 'Chocolate Muffin', family: 'Chocolate Muffin, cursive' },
		{ name: 'Inmyc', family: 'Inmyc, sans-serif' },
		{ name: 'Explosion', family: 'Explosion, display' },
		{ name: 'Eye Liner', family: 'Eye Liner, cursive' },
		{ name: 'Amusement', family: 'Amusement, display' },
		{ name: 'Walk The Walk', family: 'Walk The Walk, display' },
		{ name: 'Decker', family: 'Decker, sans-serif' },
		{ name: 'Duud', family: 'Duud, display' },
		{ name: 'Double Letters', family: 'Double Letters, display' },
		{ name: 'Please Explain', family: 'Please Explain, sans-serif' },
	];

	let selectedFont = $state('');

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
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<header class="bg-white border-b border-gray-200">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4 flex-1">
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
						<div class="flex-1">
							{#if $currentBoard}
								<h1 class="text-xl font-bold text-gray-900" style="font-family: {selectedFont || 'inherit'}">{$currentBoard.name}</h1>
								<p class="text-sm text-gray-500">
									{$currentBoard.size}×{$currentBoard.size} grid • {$currentBoard.goals.length} goals
									• {$currentBoard.goals.filter((g) => g.completed).length} completed
								</p>
							{:else}
								<div class="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
							{/if}
						</div>

						<!-- Font Selector -->
						<div class="flex items-center space-x-2">
							<label for="font-select" class="text-sm font-medium text-gray-700">Font:</label>
							<select
								id="font-select"
								bind:value={selectedFont}
								class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{#each fonts as font}
									<option value={font.family}>{font.name}</option>
								{/each}
							</select>
						</div>
					</div>

					<UserMenu />
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
				<div class="w-full mx-auto" style="max-width: min(56rem, calc(100vh - 12rem)); max-height: calc(100vh - 12rem);">
					<BingoBoard />
				</div>
			{/if}
		</main>
	</div>
</AuthGuard>
