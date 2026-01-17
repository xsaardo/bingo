<script lang="ts">
	import { onMount } from 'svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import ThemeSelector from '$lib/components/ThemeSelector.svelte';
	import BoardCard from '$lib/components/BoardCard.svelte';
	import CreateBoardModal from '$lib/components/CreateBoardModal.svelte';
	import DeleteBoardModal from '$lib/components/DeleteBoardModal.svelte';
	import MigrationPrompt from '$lib/components/MigrationPrompt.svelte';
	import { currentUser } from '$lib/stores/auth';
	import { currentTheme } from '$lib/stores/theme';
	import { boardsStore, boards, boardsLoading, hasBoards } from '$lib/stores/boards';
	import type { Board } from '$lib/types';

	let showCreateModal = $state(false);
	let showDeleteModal = $state(false);
	let boardToDelete: Board | null = $state(null);
	let theme = $derived($currentTheme);

	// Fetch boards when component mounts
	onMount(() => {
		boardsStore.fetchBoards();
	});

	function handleCreateBoard() {
		showCreateModal = true;
	}

	function handleCloseCreateModal() {
		showCreateModal = false;
	}

	function handleDeleteBoard(boardId: string) {
		const board = $boards.find((b) => b.id === boardId);
		if (board) {
			boardToDelete = board;
			showDeleteModal = true;
		}
	}

	function handleCloseDeleteModal() {
		showDeleteModal = false;
		boardToDelete = null;
	}

	function handleMigrationComplete() {
		// Refresh boards after migration
		boardsStore.fetchBoards();
	}
</script>

<svelte:head>
	<title>Dashboard - Bingo Board</title>
</svelte:head>

<AuthGuard>
	<div class="min-h-screen {theme.colors.background}">
		<!-- Header -->
		<header class="{theme.colors.cardBg} border-b-2 {theme.colors.cardBorder}">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div class="w-10 h-10 {theme.colors.buttonPrimary} {theme.styles.borderRadius} flex items-center justify-center">
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
						<h1 class="text-xl {theme.fonts.heading} {theme.colors.text}">Bingo Board</h1>
					</div>

					<div class="flex items-center space-x-4">
						<ThemeSelector />
						<UserMenu />
					</div>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Page Header -->
			<div class="flex items-center justify-between mb-8">
				<div>
					<h2 class="text-3xl {theme.fonts.heading} {theme.colors.text}">My Boards</h2>
					<p class="{theme.colors.textMuted} mt-1 {theme.fonts.body}">Create and manage your bingo boards</p>
				</div>
				<button
					onclick={handleCreateBoard}
					class="flex items-center px-4 py-2.5 {theme.colors.buttonPrimary} {theme.colors.buttonPrimaryHover} text-white font-medium {theme.styles.borderRadius} transition-colors {theme.styles.shadow} hover:{theme.styles.shadowLg} {theme.fonts.body}"
				>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					New Board
				</button>
			</div>

			<!-- Migration Prompt -->
			<MigrationPrompt onComplete={handleMigrationComplete} />

			<!-- Loading State -->
			{#if $boardsLoading}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each Array(3) as _}
						<div class="{theme.colors.cardBg} {theme.styles.borderRadius} {theme.styles.shadow} border-2 {theme.colors.cardBorder} p-6 animate-pulse">
							<div class="h-6 {theme.colors.squareCompleted} rounded w-3/4 mb-4"></div>
							<div class="h-4 {theme.colors.squareCompleted} rounded w-1/2 mb-4"></div>
							<div class="h-2 {theme.colors.squareCompleted} rounded w-full mb-2"></div>
							<div class="h-4 {theme.colors.squareCompleted} rounded w-1/4"></div>
						</div>
					{/each}
				</div>
			{:else if !$hasBoards}
				<!-- Empty State -->
				<div class="{theme.colors.cardBg} {theme.styles.borderRadius} {theme.styles.shadow} border-2 {theme.colors.cardBorder} p-12 text-center">
					<div class="max-w-md mx-auto">
						<div class="inline-flex items-center justify-center w-20 h-20 {theme.colors.squareCompleted} rounded-full mb-6">
							<svg
								class="w-10 h-10 {theme.colors.text}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
								/>
							</svg>
						</div>
						<h3 class="text-2xl {theme.fonts.heading} {theme.colors.text} mb-2">No boards yet</h3>
						<p class="{theme.colors.textMuted} mb-6 {theme.fonts.body}">
							Create your first bingo board to start tracking your goals and achievements!
						</p>
						<button
							onclick={handleCreateBoard}
							class="inline-flex items-center px-6 py-3 {theme.colors.buttonPrimary} {theme.colors.buttonPrimaryHover} text-white font-semibold {theme.styles.borderRadius} transition-colors {theme.styles.shadowLg} hover:shadow-2xl {theme.fonts.body}"
						>
							<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							Create Your First Board
						</button>
					</div>
				</div>
			{:else}
				<!-- Board Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each $boards as board (board.id)}
						<BoardCard {board} onDelete={handleDeleteBoard} />
					{/each}
				</div>
			{/if}
		</main>
	</div>

	<!-- Modals -->
	<CreateBoardModal isOpen={showCreateModal} onClose={handleCloseCreateModal} />
	<DeleteBoardModal
		isOpen={showDeleteModal}
		board={boardToDelete}
		onClose={handleCloseDeleteModal}
	/>
</AuthGuard>
