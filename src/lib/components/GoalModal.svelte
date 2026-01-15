<script lang="ts">
	import { boardStore } from '$lib/stores/board.ts';
	import { saveBoard } from '$lib/utils/storage.ts';
	import type { Goal } from '$lib/types.ts';

	interface Props {
		goal: Goal;
		index: number;
		onClose: () => void;
	}

	let { goal, index, onClose }: Props = $props();
	let title = $state(goal.title);
	let notes = $state(goal.notes);

	function handleSave() {
		const currentBoard = $boardStore;
		if (!currentBoard) return;

		currentBoard.goals[index].title = title;
		currentBoard.goals[index].notes = notes;
		currentBoard.updatedAt = new Date().toISOString();

		boardStore.set(currentBoard);
		saveBoard(currentBoard);
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

<div
	onclick={handleBackdropClick}
	class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
>
	<div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-2xl font-bold text-gray-900">Edit Goal</h2>
			<button onclick={onClose} class="text-gray-500 hover:text-gray-700 text-2xl">
				×
			</button>
		</div>

		<div class="space-y-4">
			<div>
				<label for="goal-title" class="block text-sm font-medium text-gray-700 mb-1">
					Goal Title
				</label>
				<input
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
				class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
			>
				Cancel
			</button>
			<button
				onclick={handleSave}
				class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
			>
				Save
			</button>
		</div>
	</div>
</div>
