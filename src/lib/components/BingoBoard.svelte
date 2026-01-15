<script lang="ts">
	import { boardStore } from '$lib/stores/board';
	import { detectBingo, type BingoLine } from '$lib/utils/bingo';
	import GoalSquare from './GoalSquare.svelte';

	let board = $state($boardStore);
	let bingoLines = $derived<BingoLine[]>(board ? detectBingo(board) : []);
	let hasBingo = $derived(bingoLines.length > 0);
	let bingoIndices = $derived(new Set(bingoLines.flatMap(line => line.indices)));

	$effect(() => {
		board = $boardStore;
	});
</script>

<style>
	@keyframes pulse-celebration {
		0%, 100% {
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

{#if board}
	<div class="bg-white rounded-lg shadow-lg p-6">
		{#if hasBingo}
			<div class="celebrate mb-4 p-4 bg-gradient-to-r from-yellow-100 to-green-100 border-2 border-yellow-500 rounded-lg text-center shadow-md">
				<p class="text-2xl font-bold text-yellow-800">🎉 BINGO! 🎉</p>
				<p class="text-sm text-yellow-700 mt-1">
					You completed {bingoLines.length} {bingoLines.length === 1 ? 'line' : 'lines'}!
				</p>
			</div>
		{/if}

		<div
			class="grid gap-3"
			style="grid-template-columns: repeat({board.size}, minmax(0, 1fr));"
		>
			{#each board.goals as goal, index}
				<GoalSquare {goal} {index} isInBingo={bingoIndices.has(index)} />
			{/each}
		</div>
	</div>
{/if}
