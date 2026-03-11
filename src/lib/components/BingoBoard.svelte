<!-- ABOUTME: Interactive bingo board with goal squares, confetti, and ARIA announcements. -->
<!-- ABOUTME: Uses BoardLayout for the card structure and GoalSquare for each interactive cell. -->
<script lang="ts">
  import { currentBoard } from '$lib/stores/currentBoard';
  import { uiStore } from '$lib/stores/board';
  import { detectBingo, type BingoLine } from '$lib/utils/bingo';
  import GoalSquare from './GoalSquare.svelte';
  import GoalModal from './GoalModal.svelte';
  import Confetti from './Confetti.svelte';
  import BoardLayout from './BoardLayout.svelte';

  interface Props {
    readonly?: boolean;
  }

  let { readonly = false }: Props = $props();

  let bingoLines = $derived<BingoLine[]>($currentBoard ? detectBingo($currentBoard) : []);
  let hasBingo = $derived(bingoLines.length > 0);
  let bingoIndices = $derived(new Set(bingoLines.flatMap((line) => line.indices)));

  // ARIA live region announcement text
  let liveAnnouncement = $state('');

  // Track previous counts to detect changes (plain variables — not reactive state)
  let prevCompletedCount = 0;
  let prevBingoCount = 0;

  $effect(() => {
    const completedCount = $currentBoard?.goals.filter((g) => g.completed).length ?? 0;
    const currentBingoCount = bingoLines.length;

    // Announce goal completion (only when a goal is newly completed, not a new bingo)
    if (completedCount > prevCompletedCount && currentBingoCount <= prevBingoCount) {
      liveAnnouncement = 'Goal marked complete.';
    }

    // Announce newly detected bingo lines
    if (currentBingoCount > prevBingoCount) {
      const newLine = bingoLines[currentBingoCount - 1];
      let description: string;
      if (newLine.type === 'row') {
        description = `Row ${(newLine.index ?? 0) + 1}`;
      } else if (newLine.type === 'column') {
        description = `Column ${(newLine.index ?? 0) + 1}`;
      } else {
        description = 'Diagonal';
      }
      liveAnnouncement = `Bingo! ${description} complete.`;
    }

    prevCompletedCount = completedCount;
    prevBingoCount = currentBingoCount;
  });
</script>

{#if hasBingo}
  <Confetti />
{/if}

<!-- ARIA live region: announces goal completions and bingo events to screen readers -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  {liveAnnouncement}
</div>

{#if $currentBoard}
  <BoardLayout
    name={$currentBoard.name}
    size={$currentBoard.size}
    gridClass="grid gap-2 sm:gap-3 flex-1 min-h-0"
  >
    {#snippet cell(index)}
      <GoalSquare
        goal={$currentBoard.goals[index]}
        {index}
        isInBingo={bingoIndices.has(index)}
        boardSize={$currentBoard.size}
        {readonly}
      />
    {/snippet}
  </BoardLayout>
{/if}

<!-- Goal Modal — not shown in readonly mode -->
{#if !readonly && $currentBoard && $uiStore.selectedGoalIndex !== null}
  <GoalModal
    goal={$currentBoard.goals[$uiStore.selectedGoalIndex]}
    index={$uiStore.selectedGoalIndex}
  />
{/if}
