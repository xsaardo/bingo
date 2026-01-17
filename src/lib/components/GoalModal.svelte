<script lang="ts">
	import { currentBoardStore, currentBoardSaving } from '$lib/stores/currentBoard';
	import { currentTheme } from '$lib/stores/theme';
	import type { Goal } from '$lib/types';

	interface Props {
		goal: Goal;
		index: number;
		onClose: () => void;
	}

	let { goal, index, onClose }: Props = $props();
	let title = $state(goal.title);
	let notes = $state(goal.notes);
	let theme = $derived($currentTheme);

	// Update local state when goal changes
	$effect(() => {
		title = goal.title;
		notes = goal.notes;
	});

	async function handleSave() {
		const result = await currentBoardStore.saveGoal(goal.id, title, notes);
		if (result.success) {
			onClose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget && !$currentBoardSaving) {
			onClose();
		}
	}
</script>

<div
	onclick={handleBackdropClick}
	class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
>
	<div class="{theme.colors.cardBg} {theme.styles.borderRadius} {theme.styles.shadowLg} max-w-md w-full p-6 border-2 {theme.colors.cardBorder} {theme.fonts.body}">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-2xl {theme.fonts.heading} {theme.colors.text}">Edit Goal</h2>
			<button onclick={onClose} class="{theme.colors.textMuted} hover:{theme.colors.text} text-2xl">
				×
			</button>
		</div>

		<div class="space-y-4">
			<div>
				<label for="goal-title" class="block text-sm font-medium {theme.colors.text} mb-1">
					Goal Title
				</label>
				<input
					id="goal-title"
					type="text"
					bind:value={title}
					placeholder="Enter your goal..."
					class="w-full px-3 py-2 border-2 {theme.colors.squareBorder} {theme.styles.borderRadius} {theme.colors.squareDefault} {theme.colors.text} focus:outline-none focus:{theme.colors.squareBingoBorder}"
				/>
			</div>

			<div>
				<label for="goal-notes" class="block text-sm font-medium {theme.colors.text} mb-1">
					Progress Notes
				</label>
				<textarea
					id="goal-notes"
					bind:value={notes}
					placeholder="Track your progress here..."
					rows="5"
					class="w-full px-3 py-2 border-2 {theme.colors.squareBorder} {theme.styles.borderRadius} {theme.colors.squareDefault} {theme.colors.text} resize-none focus:outline-none focus:{theme.colors.squareBingoBorder}"
				></textarea>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button
				onclick={onClose}
				disabled={$currentBoardSaving}
				class="px-4 py-2 {theme.colors.buttonSecondary} {theme.colors.text} {theme.styles.borderRadius} {theme.colors.buttonSecondaryHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Cancel
			</button>
			<button
				onclick={handleSave}
				disabled={$currentBoardSaving}
				class="px-4 py-2 text-white {theme.colors.buttonPrimary} {theme.styles.borderRadius} {theme.colors.buttonPrimaryHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
			>
				{#if $currentBoardSaving}
					<svg
						class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					Saving...
				{:else}
					Save
				{/if}
			</button>
		</div>
	</div>
</div>
