<script lang="ts">
  import { currentBoardStore } from '$lib/stores/currentBoard';
  import { uiStore } from '$lib/stores/board';
  import { formatRelativeTime } from '$lib/utils/dates';
  import type { Goal } from '$lib/types';
  import CheckboxButton from './CheckboxButton.svelte';

  interface Props {
    goal: Goal;
    index: number;
    isInBingo?: boolean;
    boardSize: number;
    readonly?: boolean;
  }

  let { goal, index, isInBingo = false, boardSize, readonly = false }: Props = $props();

  // Calculate responsive text sizes based on board size.
  // em units allow font-size on an ancestor to scale all text proportionally.
  let titleTextClass = $derived(
    boardSize === 3
      ? 'text-[0.75em] sm:text-[0.875em] md:text-[1em] lg:text-[1.125em]'
      : boardSize === 4
        ? 'text-[0.625em] sm:text-[0.75em] md:text-[0.875em] lg:text-[1em]'
        : 'text-[0.5em] sm:text-[0.625em] md:text-[0.75em] lg:text-[0.875em]'
  );

  let placeholderTextClass = $derived(
    boardSize === 3
      ? 'text-[0.625em] sm:text-[0.75em] md:text-[0.875em]'
      : boardSize === 4
        ? 'text-[0.5em] sm:text-[0.625em] md:text-[0.75em]'
        : 'text-[0.4375em] sm:text-[0.5em] md:text-[0.625em]'
  );

  let checkboxSizeClass = $derived(
    boardSize === 3
      ? 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6'
      : boardSize === 4
        ? 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5'
        : 'w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4'
  );

  let checkmarkSizeClass = $derived(
    boardSize === 3
      ? 'w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3'
      : boardSize === 4
        ? 'w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3'
        : 'w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2'
  );

  let notesEmojiClass = $derived(
    boardSize === 3
      ? 'text-[0.625em] sm:text-[0.75em] md:text-[0.875em]'
      : boardSize === 4
        ? 'text-[0.5em] sm:text-[0.625em] md:text-[0.75em]'
        : 'text-[0.4375em] sm:text-[0.5em] md:text-[0.625em]'
  );

  let lastUpdatedText = $derived(
    goal.lastUpdatedAt ? formatRelativeTime(goal.lastUpdatedAt) : null
  );

  let timeTextSize = $derived(
    boardSize === 3 ? 'text-[0.625em]' : boardSize === 4 ? 'text-[0.625em]' : 'text-[0.5em]'
  );

  // Ignore rapid taps while a write is already in-flight.
  let toggling = false;

  async function toggleComplete() {
    if (toggling) return;
    toggling = true;
    try {
      await currentBoardStore.toggleComplete(goal.id);
    } finally {
      toggling = false;
    }
  }

  function selectGoal() {
    uiStore.selectGoal(index);
  }
</script>

<div
  data-testid="goal-square"
  data-completed={goal.completed ? 'true' : 'false'}
  role="button"
  tabindex="0"
  onclick={readonly ? undefined : selectGoal}
  onkeydown={readonly ? undefined : (e) => e.key === 'Enter' && selectGoal()}
  class="border-2 rounded-lg p-1 sm:p-2 md:p-3 lg:p-4 overflow-hidden transition-all duration-200 {readonly
    ? 'cursor-default'
    : 'cursor-pointer hover:shadow-md active:scale-95'} {isInBingo && goal.completed
    ? 'bingo-winner bg-yellow-50 border-yellow-500 shadow-lg ring-2 ring-yellow-400 ring-offset-2'
    : goal.completed
      ? 'bg-green-50 border-green-500'
      : readonly
        ? 'bg-white border-gray-200'
        : 'bg-white border-gray-300 hover:border-blue-400'}"
>
  <div class="h-full flex flex-col justify-between min-h-0">
    <div class="flex-1 flex items-center justify-center text-center px-1 overflow-hidden min-h-0">
      {#if goal.title}
        <p
          class="{titleTextClass} font-medium line-clamp-3 {goal.completed
            ? 'text-green-900'
            : 'text-gray-900'}"
        >
          {goal.title}
        </p>
      {:else if !readonly}
        <p class="{placeholderTextClass} text-gray-400 italic">Click to add</p>
      {/if}
    </div>

    <div class="flex items-center justify-between mt-0.5 sm:mt-1 flex-shrink-0">
      {#if !readonly}
        <CheckboxButton
          checked={goal.completed}
          onclick={(e) => {
            e.stopPropagation();
            toggleComplete();
          }}
          testid="goal-checkbox"
          class="{checkboxSizeClass} flex-shrink-0"
        />
      {:else if goal.completed}
        <svg
          class="{checkmarkSizeClass} text-green-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M5 13l4 4L19 7"
          />
        </svg>
      {:else}
        <span class="{checkboxSizeClass} flex-shrink-0"></span>
      {/if}
    </div>
  </div>
</div>

<style>
  @keyframes bingo-pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow:
        0 0 0 0 rgba(234, 179, 8, 0.4),
        0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    50% {
      transform: scale(1.04);
      box-shadow:
        0 0 0 6px rgba(234, 179, 8, 0.2),
        0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  }

  :global(.bingo-winner) {
    animation: bingo-pulse 1.5s ease-in-out infinite;
  }
</style>
