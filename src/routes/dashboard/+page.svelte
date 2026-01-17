<script lang="ts">
	import { onMount } from 'svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import BoardCard from '$lib/components/BoardCard.svelte';
	import CreateBoardModal from '$lib/components/CreateBoardModal.svelte';
	import DeleteBoardModal from '$lib/components/DeleteBoardModal.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import { currentUser } from '$lib/stores/auth';
	import { boardsStore, boards, boardsLoading, boardsError, hasBoards } from '$lib/stores/boards';
	import type { Board } from '$lib/types';

	let showCreateModal = $state(false);
	let showDeleteModal = $state(false);
	let boardToDelete: Board | null = $state(null);

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

	async function handleRetryFetch() {
		await boardsStore.fetchBoards();
	}
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
			<!-- Page Header -->
			<div class="flex items-center justify-between mb-8">
				<div>
					<h2 class="text-3xl font-bold text-gray-900">My Boards</h2>
					<p class="text-gray-600 mt-1">Create and manage your bingo boards</p>
				</div>
				<button
					onclick={handleCreateBoard}
					class="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
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

			<!-- Error State -->
			{#if $boardsError}
				<div class="space-y-4 max-w-2xl mx-auto">
					<ErrorAlert error={$boardsError} />
					<div class="flex justify-center">
						<button
							onclick={handleRetryFetch}
							class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
						>
							Retry
						</button>
					</div>
				</div>
			{:else if $boardsLoading}
				<!-- Loading State -->
				<div
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					aria-busy="true"
				>
					{#each Array(3) as _}
						<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
							<div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
							<div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
							<div class="h-2 bg-gray-200 rounded w-full mb-2"></div>
							<div class="h-4 bg-gray-200 rounded w-1/4"></div>
						</div>
					{/each}
				</div>
			{:else if !$hasBoards}
				<!-- Empty State -->
				<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
					<div class="max-w-md mx-auto">
						<div class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
							<svg
								class="w-10 h-10 text-blue-600"
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
						<h3 class="text-2xl font-bold text-gray-900 mb-2">No boards yet</h3>
						<p class="text-gray-600 mb-6">
							Create your first bingo board to start tracking your goals and achievements!
						</p>
						<button
							onclick={handleCreateBoard}
							class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
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
