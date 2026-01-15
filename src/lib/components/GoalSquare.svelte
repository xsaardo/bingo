<script lang="ts">
	import { boardStore } from '$lib/stores/board.ts';
	import { saveBoard } from '$lib/utils/storage.ts';
	import GoalModal from './GoalModal.svelte';
	import type { Goal } from '$lib/types.ts';

	interface Props {
		goal: Goal;
		index: number;
	}

	let { goal, index }: Props = $props();
	let showModal = $state(false);

	function toggleComplete(e: Event) {
		e.stopPropagation();
		const currentBoard = $boardStore;
		if (!currentBoard) return;

		currentBoard.goals[index].completed = !currentBoard.goals[index].completed;
		currentBoard.updatedAt = new Date().toISOString();

		boardStore.set(currentBoard);
		saveBoard(currentBoard);
	}

	function openModal() {
		showModal = true;
	}
</script>

<div
	role="button"
	tabindex="0"
	onclick={openModal}
	onkeydown={(e) => e.key === 'Enter' && openModal()}
	class="aspect-square border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md {goal.completed
		? 'bg-green-50 border-green-500'
		: 'bg-white border-gray-300 hover:border-blue-400'}"
>
	<div class="h-full flex flex-col justify-between">
		<div class="flex-1 flex items-center justify-center text-center">
			{#if goal.title}
				<p class="text-sm font-medium {goal.completed ? 'text-green-900' : 'text-gray-900'}">
					{goal.title}
				</p>
			{:else}
				<p class="text-xs text-gray-400 italic">Click to add goal</p>
			{/if}
		</div>

		<div class="flex items-center justify-between mt-2">
			<button
				onclick={toggleComplete}
				class="w-5 h-5 rounded border-2 flex items-center justify-center {goal.completed
					? 'bg-green-500 border-green-500'
					: 'border-gray-300 hover:border-green-500'}"
			>
				{#if goal.completed}
					<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>

			{#if goal.notes}
				<span class="text-xs text-gray-500">📝</span>
			{/if}
		</div>
	</div>
</div>

{#if showModal}
	<GoalModal {goal} {index} onClose={() => (showModal = false)} />
{/if}
