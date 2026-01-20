<script lang="ts">
	import { currentBoardStore } from '$lib/stores/currentBoard';
	import GoalModal from './GoalModal.svelte';
	import type { Goal } from '$lib/types';

	interface Props {
		goal: Goal;
		index: number;
		isInBingo?: boolean;
	}

	let { goal, index, isInBingo = false }: Props = $props();
	let showModal = $state(false);

	async function toggleComplete(e: Event) {
		e.stopPropagation();
		await currentBoardStore.toggleComplete(goal.id);
	}

	function openModal() {
		showModal = true;
	}
</script>

<div
	data-testid="goal-square"
	role="button"
	tabindex="0"
	onclick={openModal}
	onkeydown={(e) => e.key === 'Enter' && openModal()}
	class="aspect-square border-2 rounded-lg p-2 sm:p-3 md:p-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 {isInBingo && goal.completed
		? 'bg-yellow-50 border-yellow-500 shadow-lg ring-2 ring-yellow-400 ring-offset-2'
		: goal.completed
			? 'bg-green-50 border-green-500'
			: 'bg-white border-gray-300 hover:border-blue-400'}"
>
	<div class="h-full flex flex-col justify-between">
		<div class="flex-1 flex items-center justify-center text-center px-1">
			{#if goal.title}
				<p class="text-xs sm:text-sm md:text-base font-medium break-words {goal.completed ? 'text-green-900' : 'text-gray-900'}">
					{goal.title}
				</p>
			{:else}
				<p class="text-[10px] sm:text-xs text-gray-400 italic">Click to add goal</p>
			{/if}
		</div>

		<div class="flex items-center justify-between mt-1 sm:mt-2">
			<button
				data-testid="goal-checkbox"
				onclick={toggleComplete}
				class="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all active:scale-90 {goal.completed
					? 'bg-green-500 border-green-500'
					: 'border-gray-300 hover:border-green-500'}"
			>
				{#if goal.completed}
					<svg class="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>

			{#if goal.notes}
				<span class="text-[10px] sm:text-xs text-gray-500">📝</span>
			{/if}
		</div>
	</div>
</div>

{#if showModal}
	<GoalModal {goal} {index} onClose={() => (showModal = false)} />
{/if}
