<script lang="ts">
	import { onMount } from 'svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import BoardCard from '$lib/components/BoardCard.svelte';
	import CreateBoardModal from '$lib/components/CreateBoardModal.svelte';
	import DeleteBoardModal from '$lib/components/DeleteBoardModal.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import { boardsStore, boards, boardsLoading, boardsError, hasBoards } from '$lib/stores/boards';
	import type { Board } from '$lib/types';

	let showCreateModal = $state(false);
	let showDeleteModal = $state(false);
	let boardToDelete: Board | null = $state(null);
	let deletedBoardName = $state<string | null>(null);

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

	function handleBoardDeleted(boardName: string) {
		deletedBoardName = boardName;
		setTimeout(() => (deletedBoardName = null), 3000);
	}

	async function handleRetryFetch() {
		await boardsStore.fetchBoards();
	}
</script>

<svelte:head>
	<title>Dashboard - Bingo Board</title>
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
						<h1 class="font-handwritten text-2xl font-bold" style="color: #2c2418;">BINGOAL</h1>
					</a>

					<div class="flex items-center gap-3">
					<button
						onclick={handleCreateBoard}
						class="font-handwritten flex items-center px-4 py-2 text-base font-semibold text-white transition-all active:scale-95"
						style="background: #3a5a9a; border-radius: 2px; border: 1px solid #2a4a8a; box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15);"
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
					<UserMenu />
				</div>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Page Header -->
			<div class="mb-8">
				<h2 class="font-handwritten text-4xl font-bold" style="color: #2c2418;">My Boards</h2>
				<p class="font-handwritten text-base mt-1" style="color: #8a7a60;">Create and manage your bingo boards</p>
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
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
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
						<div
							class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6"
						>
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
		onDeleted={handleBoardDeleted}
	/>

	<!-- Delete success toast -->
	{#if deletedBoardName}
		<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
			<div class="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
				<svg class="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				<span>"{deletedBoardName}" was deleted</span>
			</div>
		</div>
	{/if}
</AuthGuard>
