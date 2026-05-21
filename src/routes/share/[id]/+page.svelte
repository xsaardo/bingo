<!-- ABOUTME: Public read-only view of a shared bingo board -->
<!-- ABOUTME: Server-loaded so crawlers see real board content; store is seeded on mount. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import BingoBoard from '$lib/components/BingoBoard.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import {
    currentBoardStore,
    currentBoard,
    currentBoardLoading,
    currentBoardError
  } from '$lib/stores/currentBoard';
  import { OG_IMAGE, SITE_URL, canonical } from '$lib/seo';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const title = $derived(`${data.board.name} — Bingoals`);
  const description = $derived(
    `${data.board.name}: a goal bingo board on Bingoals. ${data.board.completedCount} of ${data.board.totalCount} goals completed.`
  );
  const url = $derived(canonical(`/share/${data.board.id}`));

  const boardJsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: data.board.name,
      url,
      description,
      dateCreated: data.board.createdAt,
      dateModified: data.board.updatedAt,
      isAccessibleForFree: true,
      isPartOf: { '@type': 'WebSite', name: 'Bingoals', url: SITE_URL }
    })
  );

  onMount(() => {
    currentBoardStore.loadPublicBoard(data.board.id);

    return () => {
      currentBoardStore.clear();
    };
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={OG_IMAGE} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {@html `<script type="application/ld+json">${boardJsonLd}</script>`}
</svelte:head>

<div class="h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <a href="/" class="flex items-center space-x-3" aria-label="Bingoals home">
          <Logo />
          <span class="text-xl font-bold text-gray-900">BINGOALS</span>
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
    <!-- Server-rendered content for crawlers; hidden from sighted users (the interactive
         board renders below once the store is populated). -->
    <h1 class="sr-only">{data.board.name}</h1>
    <ul class="sr-only">
      {#each data.board.goals as goal}
        <li>{goal.title}{goal.completed ? ' — completed' : ''}</li>
      {/each}
    </ul>

    {#if $currentBoardLoading || (!$currentBoard && !$currentBoardError)}
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
      <div
        data-testid="share-error"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
      >
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
              Go to BINGOALS
            </a>
          </div>
        </div>
      </div>
    {:else if $currentBoard}
      <div
        class="flex-1 min-h-0 w-full flex items-start sm:items-center justify-center"
        style="container-type: size;"
      >
        <div style="width: min(100cqh - 8rem, 100cqw, 56rem);">
          <BingoBoard readonly={true} />
        </div>
      </div>
    {/if}
  </main>
</div>
