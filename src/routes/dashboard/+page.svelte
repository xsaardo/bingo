<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import AuthGuard from '$lib/components/AuthGuard.svelte';
  import UserMenu from '$lib/components/UserMenu.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import BoardCard from '$lib/components/BoardCard.svelte';
  import CreateBoardModal from '$lib/components/CreateBoardModal.svelte';
  import DeleteBoardModal from '$lib/components/DeleteBoardModal.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import { boardsStore, boards, boardsLoading, boardsError, hasBoards } from '$lib/stores/boards';
  import { isAnonymous } from '$lib/stores/auth';
  import ConversionPrompt from '$lib/components/ConversionPrompt.svelte';
  import type { Board } from '$lib/types';

  let showCreateModal = $state(false);
  let showCreateConversionPrompt = $state(false);
  let showDeleteModal = $state(false);
  let boardToDelete: Board | null = $state(null);

  // Fetch boards when component mounts
  onMount(() => {
    boardsStore.fetchBoards();
  });

  function handleCreateBoard() {
    if ($isAnonymous && $boards.length >= 1) {
      showCreateConversionPrompt = true;
      return;
    }
    showCreateModal = true;
  }

  function handleCreateConversionDismiss() {
    showCreateConversionPrompt = false;
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
    toast.success(`"${boardName}" was deleted`);
  }

  async function handleRetryFetch() {
    await boardsStore.fetchBoards();
  }
</script>

<svelte:head>
  <title>Dashboard - Bingo Board</title>
  <meta property="og:title" content="Dashboard — Bingoals" />
  <meta name="description" content="Manage all your Bingoals boards in one place." />
  <meta property="og:description" content="Manage all your Bingoals boards in one place." />
</svelte:head>

<AuthGuard>
  <div class="min-h-screen" style="background:#EDE8DF">
    <!-- Full-bleed chartreuse hero header -->
    <header class="hero-chartreuse">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <a href="/" class="flex items-center space-x-3">
            <Logo />
            <h1 class="text-xl font-bold tracking-tight uppercase" style="color:#1E2A1A">
              BINGOALS
            </h1>
          </a>

          <div class="flex items-center gap-3">
            <button
              onclick={handleCreateBoard}
              class="flex items-center px-4 py-2 text-sm font-bold rounded-full border-2 border-dashed transition-colors"
              style="background:#1E2A1A;color:#C8D400;border-color:#C8D400"
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
      <div
        class="mb-8 inline-block rounded-2xl px-5 py-3"
        style="background:#C8D400;border:2px solid #1E2A1A"
      >
        <h2 class="text-3xl font-bold uppercase tracking-tight" style="color:#1E2A1A">My Boards</h2>
        <p class="mt-1" style="color:#1E2A1A;opacity:0.75">Create and manage your bingo boards</p>
      </div>

      <!-- Error State -->
      {#if $boardsError}
        <div class="space-y-4 max-w-2xl mx-auto">
          <ErrorAlert error={$boardsError} />
          <div class="flex justify-center">
            <button onclick={handleRetryFetch} class="btn-retro"> Retry </button>
          </div>
        </div>
      {:else if $boardsLoading}
        <!-- Loading State -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
          {#each Array(3) as _}
            <div
              class="rounded-2xl border-2 p-6 animate-pulse"
              style="background:#EDE8DF;border-color:#1E2A1A"
            >
              <div class="h-6 rounded w-3/4 mb-4" style="background:#d8d2c8"></div>
              <div class="h-4 rounded w-1/2 mb-4" style="background:#d8d2c8"></div>
              <div class="h-2 rounded w-full mb-2" style="background:#d8d2c8"></div>
              <div class="h-4 rounded w-1/4" style="background:#d8d2c8"></div>
            </div>
          {/each}
        </div>
      {:else if !$hasBoards}
        <!-- Empty State -->
        <div class="card-organic p-12 text-center">
          <div class="max-w-md mx-auto">
            <div
              class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style="background:#C8D400;border:2px solid #1E2A1A"
            >
              <svg
                class="w-10 h-10"
                style="color:#1E2A1A"
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
            <h3 class="text-2xl font-bold mb-2 uppercase tracking-tight" style="color:#1E2A1A">
              No boards yet
            </h3>
            <p class="mb-6" style="color:#1E2A1A;opacity:0.7">
              Create your first bingo board to start tracking your goals and achievements!
            </p>
            <button onclick={handleCreateBoard} class="btn-retro inline-flex items-center">
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

  <!-- Conversion Prompt for anonymous second board creation -->
  <ConversionPrompt
    trigger="share"
    isOpen={showCreateConversionPrompt}
    onDismiss={handleCreateConversionDismiss}
  />
</AuthGuard>
