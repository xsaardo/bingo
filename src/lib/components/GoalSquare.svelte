<script lang="ts">
	import { currentBoardStore } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import type { Goal } from '$lib/types';

	interface Props {
		goal: Goal;
		index: number;
		isInBingo?: boolean;
	}

	let { goal, index, isInBingo = false }: Props = $props();

	async function toggleComplete(e: Event) {
		e.stopPropagation();
		await currentBoardStore.toggleComplete(goal.id);
	}

	function selectGoal() {
		uiStore.selectGoal(index);
	}
</script>

<div
	data-testid="goal-square"
	role="button"
	tabindex="0"
	onclick={selectGoal}
	onkeydown={(e) => e.key === 'Enter' && selectGoal()}
	class="aspect-square border-2 rounded-lg p-1 sm:p-2 md:p-3 lg:p-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 overflow-hidden {isInBingo && goal.completed
		? 'bg-yellow-50 border-yellow-500 shadow-lg ring-2 ring-yellow-400 ring-offset-2'
		: goal.completed
			? 'bg-green-50 border-green-500'
			: 'bg-white border-gray-300 hover:border-blue-400'}"
>
	<div class="h-full flex flex-col justify-between min-h-0">
		<div class="flex-1 flex items-center justify-center text-center px-1 overflow-hidden min-h-0">
			{#if goal.title}
				<p class="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium line-clamp-3 {goal.completed ? 'text-green-900' : 'text-gray-900'}">
					{goal.title}
				</p>
			{:else}
				<p class="text-[8px] sm:text-[10px] md:text-xs text-gray-400 italic">Click to add</p>
			{/if}
		</div>

		<div class="flex items-center justify-between mt-0.5 sm:mt-1 flex-shrink-0">
			<button
				data-testid="goal-checkbox"
				onclick={toggleComplete}
				class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded border-2 flex items-center justify-center transition-all active:scale-90 flex-shrink-0 {goal.completed
					? 'bg-green-500 border-green-500'
					: 'border-gray-300 hover:border-green-500'}"
			>
				{#if goal.completed}
					<svg class="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>

			{#if goal.notes}
				<span class="text-[8px] sm:text-[10px] md:text-xs text-gray-500 flex-shrink-0">📝</span>
			{/if}
		</div>
	</div>
</div>
