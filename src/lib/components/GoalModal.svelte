<script lang="ts">
	import { onMount } from 'svelte';
	import { currentBoardStore, currentBoardSaving } from '$lib/stores/currentBoard';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import type { Goal } from '$lib/types';

	interface Props {
		goal: Goal;
		index: number;
		onClose: () => void;
	}

	let { goal, index, onClose }: Props = $props();
	let title = $state(goal.title);
	let notes = $state(goal.notes);
	let error = $state<string | null>(null);
	let titleInput: HTMLInputElement;

	async function handleSave() {
		error = null;
		const result = await currentBoardStore.saveGoal(goal.id, title, notes);
		if (result.success) {
			onClose();
		} else {
			error = result.error || 'Failed to save goal. Please try again.';
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget && !$currentBoardSaving) {
			onClose();
		}
	}

	onMount(() => {
		// Auto-focus the title input when modal opens
		titleInput?.focus();
	});
</script>

<div
	onclick={handleBackdropClick}
	class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
>
	<div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-2xl font-bold text-gray-900">Edit Goal</h2>
			<button
				data-testid="close-modal-button"
				onclick={onClose}
				class="text-gray-500 hover:text-gray-700 text-2xl"
			>
				×
			</button>
		</div>

		<div class="space-y-4">
			{#if error}
				<ErrorAlert error={error} onDismiss={() => (error = null)} />
			{/if}

			<div>
				<label for="goal-title" class="block text-sm font-medium text-gray-700 mb-1">
					Goal Title
				</label>
				<input
					bind:this={titleInput}
					id="goal-title"
					type="text"
					bind:value={title}
					placeholder="Enter your goal..."
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<label for="goal-notes" class="block text-sm font-medium text-gray-700 mb-1">
					Progress Notes
				</label>
				<textarea
					id="goal-notes"
					bind:value={notes}
					placeholder="Track your progress here..."
					rows="5"
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
				></textarea>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button
				onclick={onClose}
				disabled={$currentBoardSaving}
				class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Cancel
			</button>
			<button
				onclick={handleSave}
				disabled={$currentBoardSaving}
				class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
			>
				{#if $currentBoardSaving}
					<svg
						class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
						aria-label="Saving goal"
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
