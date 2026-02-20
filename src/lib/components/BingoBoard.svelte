<script lang="ts">
	import { currentBoard } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import { detectBingo, type BingoLine } from '$lib/utils/bingo';
	import GoalSquare from './GoalSquare.svelte';
	import GoalModal from './GoalModal.svelte';

	let bingoLines = $derived<BingoLine[]>($currentBoard ? detectBingo($currentBoard) : []);
	let hasBingo = $derived(bingoLines.length > 0);
	let bingoIndices = $derived(new Set(bingoLines.flatMap((line) => line.indices)));
</script>

{#if $currentBoard}
	<div class="bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 relative">
		{#if hasBingo}
			<div
				class="celebrate mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-100 to-green-100 border-2 border-yellow-500 rounded-lg text-center shadow-md"
			>
				<p class="text-xl sm:text-2xl font-bold text-yellow-800">🎉 BINGO! 🎉</p>
				<p class="text-xs sm:text-sm text-yellow-700 mt-1">
					You completed {bingoLines.length}
					{bingoLines.length === 1 ? 'line' : 'lines'}!
				</p>
			</div>
		{/if}

		<div
			class="grid gap-2 sm:gap-3"
			style="grid-template-columns: repeat({$currentBoard.size}, minmax(0, 1fr));"
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

<style>
	@keyframes pulse-celebration {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.02);
			opacity: 0.95;
		}
	}

	.celebrate {
		animation: pulse-celebration 2s ease-in-out infinite;
	}
</style>
