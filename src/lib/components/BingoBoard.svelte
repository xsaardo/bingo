<script lang="ts">
	import { currentBoard } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import { detectBingo, type BingoLine } from '$lib/utils/bingo';
	import GoalSquare from './GoalSquare.svelte';
	import GoalModal from './GoalModal.svelte';
	import Confetti from './Confetti.svelte';

	let bingoLines = $derived<BingoLine[]>($currentBoard ? detectBingo($currentBoard) : []);
	let hasBingo = $derived(bingoLines.length > 0);
	let bingoIndices = $derived(new Set(bingoLines.flatMap((line) => line.indices)));
</script>

{#if hasBingo}
	<Confetti />
{/if}

{#if $currentBoard}
	<div class="bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 relative h-full">
		<div
			class="grid gap-2 sm:gap-3 h-full"
			style="grid-template-columns: repeat({$currentBoard.size}, minmax(0, 1fr)); grid-template-rows: repeat({$currentBoard.size}, minmax(0, 1fr));"
		>
			{#each $currentBoard.goals as goal, index}
				<GoalSquare
					{goal}
					{index}
					isInBingo={bingoIndices.has(index)}
					boardSize={$currentBoard.size}
				/>
			{/each}
		</div>
	</div>
{/if}

<!-- Goal Modal -->
{#if $currentBoard && $uiStore.selectedGoalIndex !== null}
	<GoalModal
		goal={$currentBoard.goals[$uiStore.selectedGoalIndex]}
		index={$uiStore.selectedGoalIndex}
	/>
{/if}

