<script lang="ts">
	import { currentBoardStore } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import type { Goal } from '$lib/types';

	interface Props {
		goal: Goal;
		index: number;
		isInBingo?: boolean;
		boardSize: number;
	}

	let { goal, index, isInBingo = false, boardSize }: Props = $props();

	// Calculate responsive text sizes based on board size
	let titleTextClass = $derived(
		boardSize === 3
			? 'text-xs sm:text-sm md:text-base lg:text-lg'
			: boardSize === 4
				? 'text-[10px] sm:text-xs md:text-sm lg:text-base'
				: 'text-[8px] sm:text-[10px] md:text-xs lg:text-sm'
	);

	let placeholderTextClass = $derived(
		boardSize === 3
			? 'text-[10px] sm:text-xs md:text-sm'
			: boardSize === 4
				? 'text-[8px] sm:text-[10px] md:text-xs'
				: 'text-[7px] sm:text-[8px] md:text-[10px]'
	);

	let checkboxSizeClass = $derived(
		boardSize === 3
			? 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6'
			: boardSize === 4
				? 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5'
				: 'w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4'
	);

	let checkmarkSizeClass = $derived(
		boardSize === 3
			? 'w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3'
			: boardSize === 4
				? 'w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3'
				: 'w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2'
	);

	let notesEmojiClass = $derived(
		boardSize === 3
			? 'text-[10px] sm:text-xs md:text-sm'
			: boardSize === 4
				? 'text-[8px] sm:text-[10px] md:text-xs'
				: 'text-[7px] sm:text-[8px] md:text-[10px]'
	);

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
				<p class="{titleTextClass} font-medium line-clamp-3 {goal.completed ? 'text-green-900' : 'text-gray-900'}">
					{goal.title}
				</p>
			{:else}
				<p class="{placeholderTextClass} text-gray-400 italic">Click to add</p>
			{/if}
		</div>

		<div class="flex items-center justify-between mt-0.5 sm:mt-1 flex-shrink-0">
			<button
				data-testid="goal-checkbox"
				onclick={toggleComplete}
				class="{checkboxSizeClass} rounded border-2 flex items-center justify-center transition-all active:scale-90 flex-shrink-0 {goal.completed
					? 'bg-green-500 border-green-500'
					: 'border-gray-300 hover:border-green-500'}"
			>
				{#if goal.completed}
					<svg class="{checkmarkSizeClass} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>

			{#if goal.notes}
				<span class="{notesEmojiClass} text-gray-500 flex-shrink-0">📝</span>
			{/if}
		</div>
	</div>
</div>
