<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  import AuthGuard from '$lib/components/AuthGuard.svelte';
  import UserMenu from '$lib/components/UserMenu.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import BingoBoard from '$lib/components/BingoBoard.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import ExportableBoard from '$lib/components/ExportableBoard.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import {
    currentBoardStore,
    currentBoard,
    currentBoardLoading,
    currentBoardError
  } from '$lib/stores/currentBoard';
  import { isAnonymous } from '$lib/stores/auth';
  import ConversionPrompt from '$lib/components/ConversionPrompt.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { FONT_REGISTRY, type Font } from '$lib/fonts';

  let exportElement: HTMLDivElement | undefined = $state();
  let showShareConversionPrompt = $state(false);
  let sharePopoverOpen = $state(false);

  const boardId = $derived($page.params.id!);

  let shareUrl = $derived($currentBoard ? `${$page.url.origin}/share/${$currentBoard.id}` : '');
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

  async function handleShare() {
    if (!$currentBoard) return;
    if ($isAnonymous) {
      showShareConversionPrompt = true;
      return;
    }
    if ($currentBoard.isPublic) {
      await currentBoardStore.setPublic(boardId, false);
      toast('Sharing disabled');
    } else {
      await currentBoardStore.setPublic(boardId, true);
      sharePopoverOpen = true;
    }
  }

  function handleShareConversionDismiss() {
    showShareConversionPrompt = false;
  }

  async function handleSelectFont(font: Font) {
    if (!$currentBoard) return;
    await currentBoardStore.setFont(boardId, font);
  }
</script>

<svelte:head>
  <title>{$currentBoard?.name || 'Board'} - Bingo Board</title>
</svelte:head>

<AuthGuard>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <a href="/" class="flex items-center space-x-3">
            <Logo />
            <span class="text-xl font-bold text-gray-900">BINGOALS</span>
          </a>

          <div class="flex items-center gap-3">
            {#if !$isAnonymous}
              <Button variant="ghost" href="/dashboard">My Boards</Button>
              <div class="h-5 w-px bg-gray-200"></div>
            {/if}

            {#if $currentBoard}
              {#if $currentBoard.isPublic}
                <Popover.Root bind:open={sharePopoverOpen}>
                  <Popover.Trigger>
                    {#snippet child({ props })}
                      <Button
                        {...props}
                        variant="ghost"
                        size="icon"
                        data-testid="share-button"
                        class="text-blue-600 bg-blue-50 hover:bg-blue-100"
                        title="Sharing on — view link"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </Button>
                    {/snippet}
                  </Popover.Trigger>
                  <Popover.Content class="w-80 bg-white" align="end">
                    <p class="text-sm font-medium mb-2">Share link</p>
                    <div class="flex gap-2">
                      <Input
                        data-testid="share-url"
                        readonly
                        value={shareUrl}
                        onclick={(e) => (e.target as HTMLInputElement).select()}
                        class="text-sm"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onclick={async () => {
                          await navigator.clipboard.writeText(shareUrl);
                          toast.success('Link copied');
                        }}
                        title="Copy link"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" class="mt-2 w-full text-gray-500" onclick={handleShare}>
                      Disable sharing
                    </Button>
                  </Popover.Content>
                </Popover.Root>
              {:else}
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="share-button"
                  onclick={handleShare}
                  class="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  title="Share board"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </Button>
              {/if}
              <!-- Font selector -->
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  {#snippet child({ props })}
                    <Button
                      {...props}
                      variant="ghost"
                      size="icon"
                      data-testid="font-button"
                      class={$currentBoard.font !== 'default'
                        ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                      title="Font"
                    >
                      <span class:font-chanellie={$currentBoard.font === 'chanellie'}>Aa</span>
                    </Button>
                  {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  {#each Object.entries(FONT_REGISTRY) as [key, { label }]}
                    <DropdownMenu.Item onclick={() => handleSelectFont(key as Font)}>
                      <span class:font-chanellie={key === 'chanellie'}>{label}</span>
                      {#if $currentBoard.font === key}
                        <svg
                          class="ml-auto w-4 h-4"
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
                      {/if}
                    </DropdownMenu.Item>
                  {/each}
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <ShareButton boardName={$currentBoard.name} {exportElement} />
            {/if}

            <UserMenu />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 min-h-0 flex flex-col items-center px-4 py-3 sm:py-4 overflow-hidden">
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
              <Button onclick={handleRetry}>Retry</Button>
              <Button variant="secondary" href="/dashboard">Back to Dashboard</Button>
            </div>
          </div>
        </div>
      {:else if $currentBoard}
        <!-- BingoBoard Component -->
        <div
          class="flex-1 min-h-0 w-full flex items-center justify-center"
          style="container-type: size;"
        >
          <div
            class:font-chanellie={$currentBoard.font === 'chanellie'}
            style="width: min(100cqh - 2rem, 100cqw, 56rem); height: min(100cqh - 2rem, 100cqw, 56rem);"
          >
            <BingoBoard />
          </div>
        </div>
      {/if}
    </main>
  </div>
  <!-- Off-screen export board — always rendered when board is loaded so html-to-image can capture it -->
  {#if $currentBoard}
    <ExportableBoard board={$currentBoard} bind:exportRef={exportElement} />
  {/if}

  <!-- Conversion Prompt for anonymous share attempt -->
  <ConversionPrompt
    trigger="share"
    isOpen={showShareConversionPrompt}
    onDismiss={handleShareConversionDismiss}
  />
</AuthGuard>
