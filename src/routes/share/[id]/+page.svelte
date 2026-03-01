<!-- ABOUTME: Public read-only view of a shared bingo board -->
<!-- ABOUTME: Accessible without authentication via the board owner's share link -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import BingoBoard from '$lib/components/BingoBoard.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import {
		currentBoardStore,
		currentBoard,
		currentBoardLoading,
		currentBoardError
	} from '$lib/stores/currentBoard';

	const boardId = $derived($page.params.id!);

	onMount(() => {
		currentBoardStore.loadPublicBoard(boardId);

		return () => {
			currentBoardStore.clear();
		};
	});
</script>

<svelte:head>
	<title>{$currentBoard?.name || 'Shared Board'} - BINGOAL</title>
</svelte:head>

<div class="h-screen flex flex-col">
	<!-- Header -->
	<header class="bg-transparent">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center space-x-3">
					<Logo />
					<span class="text-xl font-bold text-gray-900">BINGOAL</span>
				</a>

				<a
					href="/"
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
				>
					Create your own
				</a>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 min-h-0 flex flex-col items-center px-4 py-3 sm:py-4 overflow-hidden">
		<!-- Board Title -->
		<div class="shrink-0 mb-2 sm:mb-3 text-center w-full">
			{#if $currentBoard}
				<h1 class="text-3xl font-bold text-gray-900">{$currentBoard.name}</h1>
				<p class="text-sm text-gray-500 mt-1">Shared board — view only</p>
			{:else if !$currentBoardError}
				<div class="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
			{/if}
		</div>

		{#if $currentBoardLoading}
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
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
				<div class="max-w-md mx-auto space-y-4">
					<ErrorAlert error={$currentBoardError} />
					<p class="text-sm text-gray-500 text-center">
						This board may not exist or sharing may have been disabled.
					</p>
					<div class="flex justify-center">
						<a
							href="/"
							class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
						>
							Go to BINGOAL
						</a>
					</div>
				</div>
			</div>
		{:else if $currentBoard}
			<div
				class="flex-1 min-h-0 w-full flex items-center justify-center"
				style="container-type: size;"
			>
				<div style="width: min(100cqh, 100cqw, 56rem); height: min(100cqh, 100cqw, 56rem);">
					<BingoBoard readonly={true} />
				</div>
			</div>
		{/if}
	</main>
</div>
