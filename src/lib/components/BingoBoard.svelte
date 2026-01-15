<script lang="ts">
	import { boardStore } from '$lib/stores/board';
	import GoalSquare from './GoalSquare.svelte';

	let board = $state($boardStore);

	$effect(() => {
		board = $boardStore;
	});
</script>

{#if board}
	<div class="bg-white rounded-lg shadow-lg p-6">
		<div
			class="grid gap-3"
			style="grid-template-columns: repeat({board.size}, minmax(0, 1fr));"
		>
			{#each board.goals as goal, index}
				<GoalSquare {goal} {index} />
			{/each}
		</div>
	</div>
{/if}
