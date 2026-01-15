<script lang="ts">
	import { boardStore } from '$lib/stores/board.ts';
	import { saveBoard } from '$lib/utils/storage.ts';
	import type { BoardSize, Board, Goal } from '$lib/types.ts';

	const sizes: BoardSize[] = [3, 4, 5];

	function createBoard(size: BoardSize) {
		const totalSquares = size * size;
		const goals: Goal[] = Array.from({ length: totalSquares }, (_, i) => ({
			id: crypto.randomUUID(),
			title: '',
			notes: '',
			completed: false
		}));

		const board: Board = {
			id: crypto.randomUUID(),
			name: 'My Bingo Board',
			size,
			goals,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		boardStore.set(board);
		saveBoard(board);
	}
</script>

<div class="mb-8">
	<div class="text-center mb-4">
		<h2 class="text-xl font-semibold text-gray-700 mb-2">Choose Your Board Size</h2>
		<p class="text-gray-600">Select how many goals you want to track</p>
	</div>

	<div class="flex justify-center gap-4">
		{#each sizes as size}
			<button
				onclick={() => createBoard(size)}
				class="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-gray-700 hover:text-blue-600"
			>
				{size}×{size}
			</button>
		{/each}
	</div>
</div>
