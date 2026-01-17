<script lang="ts">
	import { currentBoardStore } from '$lib/stores/currentBoard';
	import { currentTheme } from '$lib/stores/theme';
	import GoalModal from './GoalModal.svelte';
	import type { Goal } from '$lib/types';

	interface Props {
		goal: Goal;
		index: number;
		isInBingo?: boolean;
	}

	let { goal, index, isInBingo = false }: Props = $props();
	let showModal = $state(false);
	let theme = $derived($currentTheme);

	async function toggleComplete(e: Event) {
		e.stopPropagation();
		await currentBoardStore.toggleComplete(goal.id);
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
	class="aspect-square border-2 {theme.styles.borderRadius} p-4 cursor-pointer transition-all {theme.fonts.body} {isInBingo && goal.completed
		? `${theme.colors.squareBingo} ${theme.colors.squareBingoBorder} ${theme.styles.shadowLg} ring-2 ring-offset-2`
		: goal.completed
			? `${theme.colors.squareCompleted} ${theme.colors.squareCompletedBorder}`
			: `${theme.colors.squareDefault} ${theme.colors.squareBorder} ${theme.colors.squareHover}`}"
>
	<div class="h-full flex flex-col justify-between">
		<div class="flex-1 flex items-center justify-center text-center">
			{#if goal.title}
				<p class="text-sm font-medium {theme.colors.text}">
					{goal.title}
				</p>
			{:else}
				<p class="text-xs {theme.colors.textMuted} italic">Click to add goal</p>
			{/if}
		</div>

		<div class="flex items-center justify-between mt-2">
			<button
				onclick={toggleComplete}
				class="w-5 h-5 rounded border-2 flex items-center justify-center {goal.completed
					? `${theme.colors.squareCompletedBorder} ${theme.colors.squareCompleted}`
					: `${theme.colors.squareBorder} hover:${theme.colors.squareCompletedBorder}`}"
			>
				{#if goal.completed}
					<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>

			{#if goal.notes}
				<span class="text-xs {theme.colors.textMuted}">📝</span>
			{/if}
		</div>
	</div>
</div>

{#if showModal}
	<GoalModal {goal} {index} onClose={() => (showModal = false)} />
{/if}
