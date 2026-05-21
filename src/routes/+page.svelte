<script lang="ts">
  import { goto } from '$app/navigation';
  import { authError, authStore, isAnonymous, isAuthInitialized } from '$lib/stores/auth';
  import { boardsStore } from '$lib/stores/boards';
  import UserMenu from '$lib/components/UserMenu.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import { getAnonymousBoardId, saveAnonymousBoardId } from '$lib/utils/storage';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import {
    DEFAULT_DESCRIPTION,
    OG_IMAGE,
    canonical,
    webApplicationJsonLd,
    faqJsonLd
  } from '$lib/seo';

  const title = 'Bingoals — Turn your goals into a bingo board';
  const description = DEFAULT_DESCRIPTION;
  const url = canonical('/');

  const faqs = [
    {
      question: 'What is a goal bingo board?',
      answer:
        'A goal bingo board is a 5×5 grid where each square is a goal you want to accomplish. As you finish goals you check off squares, and completing a full row, column, or diagonal is a "bingo." It turns goal-tracking into a fun, visual game.'
    },
    {
      question: 'Is Bingoals free?',
      answer:
        'Yes. Bingoals is free to use, and you can start a board without creating an account. Sign in with email if you want to save multiple boards or access them across devices.'
    },
    {
      question: 'Can I share my goals with friends?',
      answer:
        'Yes. Every board has an optional public share link. Toggle sharing on and send the link — friends can view your board and cheer you on, but only you can edit it.'
    },
    {
      question: 'What should I put on my bingo board?',
      answer:
        'Anything you want to make progress on this year. Common categories: fitness milestones, books to read, places to travel, creative projects, financial goals, habits to build, skills to learn, and personal challenges.'
    }
  ];

  const appJsonLd = JSON.stringify(webApplicationJsonLd());
  const faqJsonLdString = JSON.stringify(faqJsonLd(faqs));

  let boardName = $state('My 2026 Goals');
  let creating = $state(false);
  let error = $state('');
  let nameInput = $state<HTMLInputElement | null>(null);
  let buttonWidth = $state(0);
  let buttonHeight = $state(0);

  // Redirect anonymous users who already have a board back to it
  $effect(() => {
    if ($isAuthInitialized && $isAnonymous) {
      const boardId = getAnonymousBoardId();
      if (boardId) {
        goto(`/boards/${boardId}`);
      }
    }
  });

  // Auto-select the placeholder text when input is focused
  function handleFocus(e: FocusEvent) {
    const input = e.target as HTMLInputElement;
    input.select();
  }

  async function handleCreateBoard() {
    creating = true;
    error = '';

    const result = await boardsStore.createBoard(boardName.trim() || 'My 2026 Goals', 5);
    creating = false;

    if (result.success && result.board) {
      if ($isAnonymous) {
        saveAnonymousBoardId(result.board.id);
      }
      goto(`/boards/${result.board.id}`);
    } else {
      error = result.error || 'Failed to create board';
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !creating) {
      handleCreateBoard();
    }
  }

  async function retryAuth() {
    await authStore.init();
  }
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
  {@html `<script type="application/ld+json">${appJsonLd}</script>`}
  {@html `<script type="application/ld+json">${faqJsonLdString}</script>`}
</svelte:head>

{#if $isAuthInitialized && $authError}
  <!-- Auth init failed -->
  <main class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p data-testid="auth-error-message" class="text-red-600 mb-4">{$authError}</p>
      <button
        data-testid="auth-retry-button"
        onclick={retryAuth}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  </main>
{:else}
  <!-- Landing page with inline board creation -->
  <!-- Rendered eagerly so search engines see the content; for returning
       anonymous users with an existing board the $effect above will
       redirect them once auth initializes on the client. -->
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <a href="/" class="flex items-center space-x-3" aria-label="Bingoals home">
            <Logo size="2.5rem" />
            <span class="text-xl font-bold text-gray-900">BINGOALS</span>
          </a>
          <div class="flex items-center gap-3">
            {#if !$isAnonymous}
              <a
                href="/dashboard"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                My Boards
              </a>
            {/if}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 flex items-center justify-center p-4">
      <div class="max-w-2xl w-full">
        <div
          class="text-center mb-8 inline-block bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3 w-full"
        >
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Turn your 2026 goals into a bingo board
          </h1>
          <p class="text-lg sm:text-xl text-gray-600">
            Track visually. Share progress. Celebrate bingos.
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div class="space-y-6">
            <!-- Board Name -->
            <div>
              <Label for="board-name" class="block mb-2">What's your board called?</Label>
              <Input
                bind:ref={nameInput}
                id="board-name"
                type="text"
                bind:value={boardName}
                onfocus={handleFocus}
                onkeydown={handleKeyDown}
                placeholder="My 2026 Goals"
                disabled={creating}
                class="w-full px-4 py-3 h-auto"
              />
            </div>

            <!-- Error Message -->
            {#if error}
              <div
                role="alert"
                class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start"
              >
                <svg
                  class="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p class="text-sm text-red-800">{error}</p>
              </div>
            {/if}

            <!-- Create Button -->
            <div
              class="relative wiggle-on-hover"
              bind:clientWidth={buttonWidth}
              bind:clientHeight={buttonHeight}
            >
              <button
                data-testid="create-board-button"
                onclick={handleCreateBoard}
                disabled={creating}
                class="w-full py-4 bg-white hover:bg-blue-50 text-blue-700 text-lg font-semibold rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {#if creating}
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating your 5×5 board...
                {:else}
                  Click here to get started!
                {/if}
              </button>
              {#if buttonWidth > 0}
                <svg
                  data-testid="hand-drawn-border"
                  class="absolute pointer-events-none"
                  style="top: -8px; left: -8px; overflow: visible;"
                  width={buttonWidth + 16}
                  height={buttonHeight + 16}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter
                      id="hand-drawn"
                      x="-4"
                      y="-4"
                      width={buttonWidth + 24}
                      height={buttonHeight + 24}
                      filterUnits="userSpaceOnUse"
                    >
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.025"
                        numOctaves="3"
                        result="noise"
                        seed="3"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="4"
                        xChannelSelector="R"
                        yChannelSelector="G"
                      />
                    </filter>
                  </defs>
                  <rect
                    x="5"
                    y="5"
                    width={buttonWidth + 6}
                    height={buttonHeight + 6}
                    fill="none"
                    stroke="#1d4ed8"
                    stroke-width="2.5"
                    rx="12"
                    filter="url(#hand-drawn)"
                  />
                </svg>
              {/if}
            </div>

            <p class="text-xs text-gray-500 text-center">
              No sign-up required. Your board is saved automatically.
            </p>
          </div>
        </div>

        <!-- Long-form content for SEO and clarity -->
        <section class="mt-16 space-y-12 text-gray-700">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">A goal tracker that feels like a game</h2>
            <p class="leading-relaxed">
              Most goal-setting apps look like spreadsheets. Bingoals turns your goals for the year
              into a 5×5 bingo board — 25 squares, one goal per square. Check off squares as you
              finish them, watch rows and columns light up, and chase that satisfying full-line
              bingo. It works as a yearly goal tracker, a new-year-resolution planner, a bucket
              list, a habit grid, or a fun visual to-do board for any 12-month stretch.
            </p>
          </div>

          <div class="grid sm:grid-cols-3 gap-4">
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <h3 class="font-bold text-gray-900 mb-2">Fast to set up</h3>
              <p class="text-sm leading-relaxed">
                Type 25 goals and you're done. No accounts, no onboarding wizard, no templates to
                pick. Get started in under two minutes.
              </p>
            </div>
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <h3 class="font-bold text-gray-900 mb-2">Visual progress</h3>
              <p class="text-sm leading-relaxed">
                See every goal at a glance. Filled squares show momentum; empty ones show what's
                next. Completed bingo lines are highlighted automatically.
              </p>
            </div>
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <h3 class="font-bold text-gray-900 mb-2">Share with friends</h3>
              <p class="text-sm leading-relaxed">
                Flip a public switch and send a link. Friends can view your board (read-only) and
                cheer you on. Hold each other accountable with a friendly nudge.
              </p>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">How a goal bingo board works</h2>
            <ol class="list-decimal list-inside space-y-3 leading-relaxed">
              <li><strong>Brainstorm 25 goals.</strong> Mix fitness, travel, creative projects, books to read, habits to build, financial milestones, and personal challenges.</li>
              <li><strong>Drop them into the board.</strong> Order doesn't matter — the grid is just a way to see everything together.</li>
              <li><strong>Check off squares as you finish.</strong> Add notes and sub-tasks for goals that need a plan.</li>
              <li><strong>Aim for bingos.</strong> Any full row, column, or diagonal gets highlighted. A blackout (all 25) is the ultimate goal.</li>
              <li><strong>Share your board.</strong> Optional public link lets friends follow along.</li>
            </ol>
            <p class="mt-4">
              Read more in our <a href="/how-it-works" class="text-blue-700 hover:underline font-medium">how it works</a> guide.
            </p>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
            <div class="space-y-6">
              {#each faqs as faq}
                <div>
                  <h3 class="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p class="text-sm leading-relaxed">{faq.answer}</p>
                </div>
              {/each}
            </div>
          </div>
        </section>
      </div>
    </main>
    <footer class="py-6 text-center text-sm text-gray-400 bg-white/70 backdrop-blur-sm">
      <p>
        © {new Date().getFullYear()} Bingoals &middot;
        <a href="/how-it-works" class="hover:text-gray-600 transition-colors">How it works</a>
        &middot;
        <a href="/about" class="hover:text-gray-600 transition-colors">About</a>
        &middot;
        <a href="/privacy" class="hover:text-gray-600 transition-colors">Privacy</a>
        &middot;
        <a href="/terms" class="hover:text-gray-600 transition-colors">Terms</a>
      </p>
    </footer>
  </div>
{/if}

<style>
  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(0deg);
    }
    20% {
      transform: rotate(-1.5deg);
    }
    50% {
      transform: rotate(1.5deg);
    }
    80% {
      transform: rotate(-0.8deg);
    }
  }

  .wiggle-on-hover:hover {
    animation: wiggle 0.35s ease-in-out;
  }
</style>
