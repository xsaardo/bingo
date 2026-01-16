<script lang="ts">
	import { derived } from 'svelte/store';
	import { boardStore } from '$lib/stores/board';
	import { detectBingo, type BingoLine } from '$lib/utils/bingo';
	import GoalSquare from './GoalSquare.svelte';

	// Create derived stores for bingo detection
	const bingoLinesStore = derived(boardStore, ($board) =>
		$board ? detectBingo($board) : []
	);

	const hasBingoStore = derived(bingoLinesStore, ($bingoLines) =>
		$bingoLines.length > 0
	);

	const bingoIndicesStore = derived(bingoLinesStore, ($bingoLines) =>
		new Set($bingoLines.flatMap(line => line.indices))
	);
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

{#if $boardStore}
	<div class="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
		{#if $hasBingoStore}
			<div class="celebrate mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-100 to-green-100 border-2 border-yellow-500 rounded-lg text-center shadow-md">
				<p class="text-xl sm:text-2xl font-bold text-yellow-800">🎉 BINGO! 🎉</p>
				<p class="text-xs sm:text-sm text-yellow-700 mt-1">
					You completed {$bingoLinesStore.length} {$bingoLinesStore.length === 1 ? 'line' : 'lines'}!
				</p>
			</div>
		{/if}

		<div
			class="grid gap-2 sm:gap-3"
			style="grid-template-columns: repeat({$boardStore.size}, minmax(0, 1fr));"
		>
			{#each $boardStore.goals as goal, index}
				<GoalSquare {goal} {index} isInBingo={$bingoIndicesStore.has(index)} />
			{/each}
		</div>
	</div>
{:else}
	<div class="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-12 text-center">
		<div class="max-w-md mx-auto">
			<div class="text-6xl sm:text-7xl mb-4">🎯</div>
			<h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Ready to Start?</h3>
			<p class="text-sm sm:text-base text-gray-600 mb-4">
				Choose a board size above to create your New Year Goals Bingo board. Track your progress and celebrate when you complete a line!
			</p>
			<div class="text-left bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
				<p class="font-semibold mb-2">How it works:</p>
				<ul class="space-y-1 ml-4">
					<li>• Click a square to add a goal</li>
					<li>• Check the box when you complete it</li>
					<li>• Complete a row, column, or diagonal for BINGO!</li>
				</ul>
			</div>
		</div>
	</div>
{/if}
